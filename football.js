// MatchIQ football data proxy for the Highlightly Football API (https://highlightly.net/documentation/football).
// Runs ONLY on the server (Vercel Serverless Function, or the Vite dev middleware). The key is read from
// process.env.HIGHLIGHTLY_API_KEY and is never sent to the browser. Auth: header `x-rapidapi-key` on the direct
// Highlightly base URL (the `x-rapidapi-host` header is only for RapidAPI, which this app does not use).
const BASE='https://soccer.highlightly.net';
const TIMEOUT_MS=8000,MAX_PAGES=5;
const cache=new Map(); // best-effort, per server instance. The CDN (Cache-Control below) is the shared cache.

const env=()=>process.env;
// Competition ids come from the environment only. They are looked up with the provider (GET /leagues), never guessed here.
const leagueTokens=()=>(env().HIGHLIGHTLY_LEAGUES||'').split(/[,;\s]+/).map(s=>s.trim().replace(/^['"]|['"]$/g,'')).filter(Boolean);
const allowedLeagues=()=>[...new Set(leagueTokens().filter(s=>/^\d{1,15}$/.test(s)))];
const defaultSeason=()=>{const s=env().HIGHLIGHTLY_SEASON;if(s&&/^\d{4}$/.test(s))return s;const d=new Date();return String(d.getUTCMonth()>=6?d.getUTCFullYear():d.getUTCFullYear()-1)};
const todayUTC=()=>new Date().toISOString().slice(0,10);

class Bad extends Error{}
const int=(v,name,min=1,max=Number.MAX_SAFE_INTEGER)=>{if(!/^\d+$/.test(String(v??'')))throw new Bad(`${name} must be a whole number`);const n=Number(v);if(n<min||n>max)throw new Bad(`${name} is out of range`);return String(n)};
const opt=(v,fn)=>v===undefined||v===''?undefined:fn(v);
const league=v=>{const ids=allowedLeagues();if(!ids.length)throw new Bad(leagueTokens().length?'HIGHLIGHTLY_LEAGUES is set but has no valid numeric ids. Use the numeric ids from Highlightly, separated by commas.':'No competitions are enabled. Set HIGHLIGHTLY_LEAGUES on the server.');const id=v===undefined||v===''?ids[0]:int(v,'league');if(!ids.includes(id))throw new Bad('That competition is not enabled for this app');return id};
const season=v=>{const s=v===undefined||v===''?defaultSeason():String(v);if(!/^(19|20)\d{2}$/.test(s))throw new Bad('season must be a 4-digit year');return s};
const date=(v,name='date')=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))throw new Bad(`${name} must be YYYY-MM-DD`);return String(v)};
const tz=v=>{if(!/^[A-Za-z_]+(\/[A-Za-z_+\-0-9]+){0,2}$/.test(String(v))||String(v).length>40)throw new Bad('timezone is invalid');return String(v)};
const search=v=>{const s=String(v).trim();if(s.length<3||s.length>40||!/^[\p{L} .'\-]+$/u.test(s))throw new Bad('search needs 3-40 letters');return s};
const clean=o=>Object.fromEntries(Object.entries(o).filter(([,v])=>v!==undefined));
const fin=p=>p.final==='1';
const matchTtl=p=>{if(p.live==='1')return 45;const d=p.date;const t=todayUTC();return d<t?21600:d===t?300:3600};

// Whitelist of actions. Each returns the upstream path, validated query, cache TTL (seconds) and optional flags.
const ACTIONS={
 // Highlightly has no /status endpoint: a 1-item leagues call reads the plan tier and the quota headers.
 status:()=>({path:'/leagues',q:{limit:'1'},ttl:60,sanitize:(j,h)=>({plan:j&&j.plan&&j.plan.tier||null,message:j&&j.plan&&j.plan.message||null,requests:{limit:hdr(h,'x-ratelimit-requests-limit'),remaining:hdr(h,'x-ratelimit-requests-remaining')}})}),
 // Matches for ONE competition on ONE date. Pages are merged server-side until pagination.totalCount is reached.
 fixtures:p=>{if(!p.date)throw new Bad('fixtures needs a date (YYYY-MM-DD)');return{path:'/matches',q:clean({leagueId:league(p.league),date:date(p.date),timezone:opt(p.tz,tz),season:opt(p.season,season)}),ttl:matchTtl(p),paged:true}},
 // Match detail: includes events, team statistics and top players inline (one request instead of three).
 fixture:p=>({path:'/matches/'+int(p.id,'id'),q:{},ttl:fin(p)?21600:60}),
 lineups:p=>({path:'/lineups/'+int(p.fixture,'fixture'),q:{},ttl:fin(p)?21600:300}),
 standings:p=>({path:'/standings',q:{leagueId:league(p.league),season:season(p.season)},ttl:3600}),
 leagues:p=>({path:'/leagues/'+league(p.id),q:{},ttl:86400}),
 players:p=>({path:'/players',q:clean({name:search(p.name),limit:opt(p.limit,v=>int(v,'limit',1,100)),offset:opt(p.offset,v=>int(v,'offset',0,100000))}),ttl:1800}),
 player:p=>({path:'/players/'+int(p.id,'id'),q:{},ttl:86400}),
 playerStats:p=>({path:'/players/'+int(p.id,'id')+'/statistics',q:{},ttl:86400})
};

function send(res,status,body,ttl){
 res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control',status===200&&ttl?`public, s-maxage=${ttl}, stale-while-revalidate=${ttl*2}`:'no-store');
 res.end(JSON.stringify(body));
}
const fail=(res,status,code,message)=>send(res,status,{ok:false,error:{code,message}});
const hdr=(h,n)=>{const v=h&&h.get?h.get(n):null;return v==null||v===''?null:Number(v)};
const msgOf=j=>String(j&&(Array.isArray(j.message)?j.message.join('; '):j.message)||'').slice(0,240);

// Map a non-2xx upstream reply to the error codes the browser understands (see LiveBits.errText).
function classify(status,j,h){
 const m=msgOf(j);
 if(status===401||status===403)return{status:status===403?403:502,code:status===403?'plan':'auth',message:status===403?(m||'Your Highlightly plan does not include this data.'):'The data provider rejected the server API key. Check HIGHLIGHTLY_API_KEY.'};
 if(status===429)return hdr(h,'x-ratelimit-requests-remaining')===0?{status:429,code:'quota',message:'The daily request quota for this API plan has been used. It resets at 00:00 UTC.'}:{status:429,code:'rate_limit',message:'Too many requests. Wait a moment and try again.'};
 if(status===400)return{status:400,code:'bad_request',message:m||'The data provider rejected the request.'};
 if(status===404)return{status:404,code:'not_found',message:m||'Not found at the data provider.'};
 return{status:502,code:'provider',message:m||`The data provider returned HTTP ${status}.`};
}

async function upstream(url,key){
 const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),TIMEOUT_MS);
 try{return await fetch(url,{headers:{'x-rapidapi-key':key,Accept:'application/json'},signal:ctrl.signal})}finally{clearTimeout(t)}
}

export default async function handler(req,res){
 try{
  if(req.method!=='GET'&&req.method!=='HEAD')return fail(res,405,'method','GET only');
  const u=new URL(req.url||'/','http://localhost'),p=Object.fromEntries(u.searchParams),a=p.action;
  if(a==='config')return send(res,200,{ok:true,data:{configured:!!env().HIGHLIGHTLY_API_KEY,leagues:allowedLeagues(),leaguesRejected:leagueTokens().filter(s=>!/^\d{1,15}$/.test(s)).slice(0,10),defaultSeason:defaultSeason()},meta:{fetchedAt:new Date().toISOString()}},60);
  if(!Object.prototype.hasOwnProperty.call(ACTIONS,a))return fail(res,400,'bad_request','Unknown action');
  const key=env().HIGHLIGHTLY_API_KEY;
  if(!key)return fail(res,503,'not_configured','The football API key is not configured on the server (HIGHLIGHTLY_API_KEY).');
  let spec;try{spec=ACTIONS[a](p)}catch(e){if(e instanceof Bad)return fail(res,400,'bad_request',e.message);throw e}
  const qs=o=>Object.keys(o).length?'?'+new URLSearchParams(o):'';
  const url=BASE+spec.path+qs(spec.q);
  const hit=cache.get(url);
  if(hit&&hit.exp>Date.now())return send(res,200,{...hit.body,meta:{...hit.body.meta,cached:true}},spec.ttl);
  let r,j,items=null,pag=null,plan=null,calls=0;
  const get=async u2=>{calls++;let x;try{x=await upstream(u2,key)}catch(e){return{err:e&&e.name==='AbortError'?['timeout',504,'The data provider took too long to respond.']:['provider',502,'Could not reach the data provider.']}}
   let body=null;try{body=await x.json()}catch(e){}
   return{x,body}};
  let g=await get(url);
  if(g.err)return fail(res,g.err[1],g.err[0],g.err[2]);
  r=g.x;j=g.body;
  if(!r.ok){const c=classify(r.status,j,r.headers);return fail(res,c.status,c.code,c.message)}
  if(j===null)return fail(res,502,'provider','The data provider returned an unreadable response.');
  const isList=!Array.isArray(j)&&Array.isArray(j.data)&&j.pagination;
  if(isList){items=j.data;pag=j.pagination;plan=j.plan||null;
   // Merge further pages only for actions that ask for it, and only as far as the provider says there are more results.
   if(spec.paged){let pages=1;while(items.length<(pag.totalCount||0)&&pages<MAX_PAGES){const g2=await get(url+(url.includes('?')?'&':'?')+'offset='+items.length);if(g2.err||!g2.x.ok||!g2.body||!Array.isArray(g2.body.data)||!g2.body.data.length)break;items=items.concat(g2.body.data);pages++;r=g2.x}
    pag={...pag,returned:items.length,truncated:items.length<(pag.totalCount||0)}}}
  const raw=isList?items:j;
  const data=spec.sanitize?spec.sanitize(j,r.headers):raw;
  const meta={fetchedAt:new Date().toISOString(),ttl:spec.ttl,cached:false,upstreamCalls:calls,plan,quota:{day:{limit:hdr(r.headers,'x-ratelimit-requests-limit'),remaining:hdr(r.headers,'x-ratelimit-requests-remaining')}}};
  const body={ok:true,data,paging:pag,meta};
  cache.set(url,{exp:Date.now()+spec.ttl*1000,body});
  if(cache.size>300)cache.delete(cache.keys().next().value);
  return send(res,200,body,spec.ttl);
 }catch(e){return fail(res,500,'server_error','Unexpected server error.')}
}
