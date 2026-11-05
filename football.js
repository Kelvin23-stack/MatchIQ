// MatchIQ football data proxy. Runs ONLY on the server (Vercel Serverless Function, or the Vite dev middleware).
// The API-Football key is read from process.env.API_FOOTBALL_KEY and is never sent to the browser.
// Provider: https://www.api-football.com/documentation-v3  (base URL and header name: see docs)
const BASE='https://v3.football.api-sports.io';
const TIMEOUT_MS=8000;
const cache=new Map(); // best-effort, per server instance. The CDN (Cache-Control below) is the shared cache.

const env=()=>process.env;
const allowedLeagues=()=>(env().API_FOOTBALL_LEAGUES||'39').split(',').map(s=>s.trim()).filter(s=>/^\d{1,5}$/.test(s));
const defaultSeason=()=>{const s=env().API_FOOTBALL_SEASON;if(s&&/^\d{4}$/.test(s))return s;const d=new Date();return String(d.getUTCMonth()>=6?d.getUTCFullYear():d.getUTCFullYear()-1)};

class Bad extends Error{}
const int=(v,name,min=1,max=99999999)=>{if(!/^\d+$/.test(String(v??'')))throw new Bad(`${name} must be a whole number`);const n=Number(v);if(n<min||n>max)throw new Bad(`${name} is out of range`);return String(n)};
const opt=(v,fn)=>v===undefined||v===''?undefined:fn(v);
const league=v=>{const id=v===undefined||v===''?allowedLeagues()[0]:int(v,'league');if(!allowedLeagues().includes(id))throw new Bad('That competition is not enabled for this app');return id};
const season=v=>{const s=v===undefined||v===''?defaultSeason():String(v);if(!/^(19|20)\d{2}$/.test(s))throw new Bad('season must be a 4-digit year');return s};
const date=(v,name='date')=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(String(v)))throw new Bad(`${name} must be YYYY-MM-DD`);return String(v)};
const statuses=v=>{if(!/^[A-Z0-9]{1,5}(-[A-Z0-9]{1,5}){0,9}$/.test(String(v)))throw new Bad('status is invalid');return String(v)};
const tz=v=>{if(!/^[A-Za-z_]+(\/[A-Za-z_+\-0-9]+){0,2}$/.test(String(v))||String(v).length>40)throw new Bad('timezone is invalid');return String(v)};
const search=v=>{const s=String(v).trim();if(s.length<4||s.length>30||!/^[\p{L} .'\-]+$/u.test(s))throw new Bad('search needs 4-30 letters');return s};
const clean=o=>Object.fromEntries(Object.entries(o).filter(([,v])=>v!==undefined));
const fin=p=>p.final==='1';

// Whitelist of actions. Each returns the upstream path, validated query and a cache TTL (seconds).
const ACTIONS={
 status:()=>({path:'/status',q:{},ttl:60,sanitize:r=>{const x=Array.isArray(r)?r[0]:r;return{plan:x?.subscription?.plan??null,active:x?.subscription?.active??null,requests:x?.requests??null}}}),
 fixtures:p=>{const q={league:league(p.league),season:season(p.season),timezone:opt(p.tz,tz),status:opt(p.status,statuses)};let ttl=600;
  if(p.live!==undefined){q.live=allowedLeagues().join('-');delete q.season;ttl=45}
  else if(p.date){q.date=date(p.date);ttl=120}
  else if(p.from&&p.to){q.from=date(p.from,'from');q.to=date(p.to,'to');ttl=/FT/.test(p.status||'')?3600:600}
  else if(p.next){q.next=int(p.next,'next',1,50);delete q.season}
  else if(p.last){q.last=int(p.last,'last',1,50);delete q.season;if(p.team){q.team=int(p.team,'team');delete q.league}}
  else if(p.round){q.round=String(p.round).slice(0,40).replace(/[^A-Za-z0-9 \-]/g,'')}
  else throw new Bad('fixtures needs live, date, from+to, next, last or round');
  return{path:'/fixtures',q:clean(q),ttl}},
 fixture:p=>({path:'/fixtures',q:{id:int(p.id,'id'),...clean({timezone:opt(p.tz,tz)})},ttl:fin(p)?21600:60}),
 lineups:p=>({path:'/fixtures/lineups',q:{fixture:int(p.fixture,'fixture')},ttl:fin(p)?21600:300}),
 fixturePlayers:p=>({path:'/fixtures/players',q:{fixture:int(p.fixture,'fixture')},ttl:fin(p)?21600:120}),
 fixtureStats:p=>({path:'/fixtures/statistics',q:{fixture:int(p.fixture,'fixture')},ttl:fin(p)?21600:120}),
 events:p=>({path:'/fixtures/events',q:{fixture:int(p.fixture,'fixture')},ttl:fin(p)?21600:60}),
 standings:p=>({path:'/standings',q:{league:league(p.league),season:season(p.season)},ttl:900}),
 teams:p=>({path:'/teams',q:{league:league(p.league),season:season(p.season)},ttl:86400}),
 squad:p=>({path:'/players/squads',q:{team:int(p.team,'team')},ttl:21600}),
 teamStats:p=>({path:'/teams/statistics',q:{league:league(p.league),season:season(p.season),team:int(p.team,'team')},ttl:3600}),
 players:p=>{const q={season:season(p.season)};
  if(p.id)q.id=int(p.id,'id');
  else if(p.team){q.team=int(p.team,'team');q.page=opt(p.page,v=>int(v,'page',1,50))}
  else if(p.search){q.search=search(p.search);q.league=league(p.league)}
  else throw new Bad('players needs id, team or search');
  return{path:'/players',q:clean(q),ttl:3600}},
 topscorers:p=>({path:'/players/topscorers',q:{league:league(p.league),season:season(p.season)},ttl:3600}),
 topassists:p=>({path:'/players/topassists',q:{league:league(p.league),season:season(p.season)},ttl:3600})
};

function send(res,status,body,ttl){
 res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control',status===200&&ttl?`public, s-maxage=${ttl}, stale-while-revalidate=${ttl*2}`:'no-store');
 res.end(JSON.stringify(body));
}
const fail=(res,status,code,message)=>send(res,status,{ok:false,error:{code,message}});

// API-Football reports plan / quota / key problems inside a 200 response body, in an "errors" field.
function classify(errors){
 const e=Array.isArray(errors)?{}:errors||{};const keys=Object.keys(e);if(!keys.length)return null;
 const msg=String(Object.values(e)[0]).slice(0,240);
 if(keys.includes('rateLimit'))return{status:429,code:'rate_limit',message:'Too many requests per minute. Wait a moment and try again.'};
 if(keys.includes('requests'))return{status:429,code:'quota',message:'The daily request quota for this API plan has been used. It resets at 00:00 UTC.'};
 if(keys.includes('plan'))return{status:403,code:'plan',message:msg};
 if(keys.includes('token')||keys.includes('bug'))return{status:502,code:'auth',message:'The data provider rejected the server API key. Check API_FOOTBALL_KEY.'};
 return{status:502,code:'provider',message:msg};
}
const hdr=(h,n)=>{const v=h.get(n);return v==null?null:Number(v)};

export default async function handler(req,res){
 try{
  if(req.method!=='GET'&&req.method!=='HEAD')return fail(res,405,'method','GET only');
  const u=new URL(req.url||'/','http://localhost'),p=Object.fromEntries(u.searchParams),a=p.action;
  if(a==='config')return send(res,200,{ok:true,data:{configured:!!env().API_FOOTBALL_KEY,leagues:allowedLeagues(),defaultSeason:defaultSeason()},meta:{fetchedAt:new Date().toISOString()}},60);
  if(!Object.prototype.hasOwnProperty.call(ACTIONS,a))return fail(res,400,'bad_request','Unknown action');
  const key=env().API_FOOTBALL_KEY;
  if(!key)return fail(res,503,'not_configured','The football API key is not configured on the server (API_FOOTBALL_KEY).');
  let spec;try{spec=ACTIONS[a](p)}catch(e){if(e instanceof Bad)return fail(res,400,'bad_request',e.message);throw e}
  const url=BASE+spec.path+(Object.keys(spec.q).length?'?'+new URLSearchParams(spec.q):'');
  const hit=cache.get(url);
  if(hit&&hit.exp>Date.now())return send(res,200,{...hit.body,meta:{...hit.body.meta,cached:true}},spec.ttl);
  const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),TIMEOUT_MS);let r;
  try{r=await fetch(url,{headers:{'x-apisports-key':key,Accept:'application/json'},signal:ctrl.signal})}
  catch(e){return e&&e.name==='AbortError'?fail(res,504,'timeout','The data provider took too long to respond.'):fail(res,502,'provider','Could not reach the data provider.')}
  finally{clearTimeout(t)}
  if(r.status===429)return fail(res,429,'rate_limit','Too many requests. Wait a moment and try again.');
  if(!r.ok)return fail(res,502,'provider',`The data provider returned HTTP ${r.status}.`);
  let j;try{j=await r.json()}catch(e){return fail(res,502,'provider','The data provider returned an unreadable response.')}
  const c=classify(j.errors);if(c)return fail(res,c.status,c.code,c.message);
  const data=spec.sanitize?spec.sanitize(j.response):j.response;
  const meta={fetchedAt:new Date().toISOString(),ttl:spec.ttl,cached:false,quota:{day:{limit:hdr(r.headers,'x-ratelimit-requests-limit'),remaining:hdr(r.headers,'x-ratelimit-requests-remaining')},minute:{limit:hdr(r.headers,'x-ratelimit-limit'),remaining:hdr(r.headers,'x-ratelimit-remaining')}}};
  const body={ok:true,data,paging:j.paging||null,results:j.results??null,meta};
  cache.set(url,{exp:Date.now()+spec.ttl*1000,body});
  if(cache.size>300)cache.delete(cache.keys().next().value);
  return send(res,200,body,spec.ttl);
 }catch(e){return fail(res,500,'server_error','Unexpected server error.')}
}
