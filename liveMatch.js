import {useState,useEffect,useMemo} from 'react'
import {api,useApi} from './footballApi'
import {normFixtures,normFixture,normLeague} from './liveData'
import {registerTeam,TEAM_REG} from './data'
import {useDataSettings} from './dataMode'
// Adapter: normalised provider fixture -> the "match" shape the MatchIQ UI components already use
// {id,h,a,lg,st:'upcoming'|'live'|'ft'|'off',sc:[h,a],min,t,venue,...}. Team codes are "T<id>" and registered for T[code] lookups.
export const teamCode=id=>'T'+id;
const fmtShort=ts=>ts?new Date(ts*1000).toLocaleString([], {weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'Time to be confirmed';
export function toMatch(fx){
 const h=teamCode(fx.home.id),a=teamCode(fx.away.id),k=fx.status.kind;
 registerTeam(h,{name:fx.home.name,logo:fx.home.logo});registerTeam(a,{name:fx.away.name,logo:fx.away.logo});
 return{id:fx.id,h,a,lg:fx.leagueName,lgId:fx.leagueId,lgLogo:fx.leagueLogo,country:fx.country,round:fx.round,kind:k,status:fx.status,
  st:k==='live'||k==='break'?'live':k==='finished'?'ft':k==='upcoming'?'upcoming':'off',
  sc:[fx.goals.home??0,fx.goals.away??0],hasScore:fx.goals.home!=null,min:fx.status.elapsed,ts:fx.timestamp,t:fmtShort(fx.timestamp),venue:fx.venue,city:fx.city}}
// What gets stored with a prediction / post so it still renders after a reload (no demo lookup table exists any more).
export const snap=m=>({id:m.id,h:m.h,a:m.a,lg:m.lg,lgId:m.lgId,lgLogo:m.lgLogo,country:m.country,kind:m.kind,status:m.status,st:m.st,sc:m.sc,hasScore:m.hasScore,min:m.min,ts:m.ts,t:m.t,venue:m.venue,teams:{[m.h]:regOf(m.h),[m.a]:regOf(m.a)}});
const regOf=c=>({name:(TEAM_REG[c]||{}).name,logo:(TEAM_REG[c]||{}).logo});
export const rehydrate=m=>{if(m&&m.teams)Object.entries(m.teams).forEach(([c,t])=>{if(t&&t.name)registerTeam(c,t)});return m};

export const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const dayStr=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};

export const useLeagueParam=()=>{const {league}=useDataSettings();return league?{league}:{}};
// {list:[match], ...useApi state}
export function useMatches(params,opts){const r=useApi('fixtures',params,opts);const list=useMemo(()=>normFixtures(r.data).map(toMatch),[r.data]);return{...r,list}}
export function useMatch(id,opts){const r=useApi('fixture',{id},{ttl:60000,...opts});const fx=r.data&&r.data[0]?normFixture(r.data[0]):null;return{...r,fx,match:fx?toMatch(fx):null}}
// Enabled competitions with their real names/logos from the provider (one cached request per id per day).
export function useLeagueList(){
 const cfg=useApi('config',{},{ttl:600000});const ids=(cfg.data&&cfg.data.leagues)||[];const key=ids.join(',');
 const [state,setState]=useState({loading:true,list:[],error:null});
 useEffect(()=>{if(!cfg.data){if(cfg.error)setState({loading:false,list:[],error:cfg.error});return}
  let live=true;setState(s=>({...s,loading:true}));
  Promise.allSettled(ids.map(id=>api('leagues',{id},{ttl:86400000}))).then(rs=>{if(!live)return;
   const list=rs.filter(r=>r.status==='fulfilled').map(r=>normLeague(Array.isArray(r.value.data)?r.value.data[0]:r.value.data)).filter(Boolean);
   const err=rs.find(r=>r.status==='rejected');setState({loading:false,list,error:list.length?null:err&&err.reason||null})});
  return()=>{live=false}},[key,!!cfg.data]);
 return state}
// Did a saved market land? Only meaningful for finished matches. No points are awarded here.
export const verdict=(m,p,k)=>{if(m.st!=='ft'||!m.hasScore)return null;const [h,a]=m.sc,g=h+a;
 if(k==='Match Result')return p.result===(h>a?'H':h<a?'A':'D');
 if(k==='Correct Score')return !!p.score&&p.score[0]===h&&p.score[1]===a;
 if(k==='Over/Under')return p.ou==='O15'?g>=2:p.ou==='O25'?g>=3:p.ou==='O35'?g>=4:g<=2;
 if(k==='Both Teams to Score')return p.btts===((h>0&&a>0)?'Y':'N');return null};

// Canonical competition id. Requests for the same day/competition must use identical parameters so they share one cache entry (Matches, Discussions, Overview and Landing).
// The selected competition wins, otherwise the first enabled one (the server default). Fetching waits until the server config is known so the parameter never changes mid-flight.
function useDefaultLeague(){const cfg=useApi('config',{},{ttl:600000});return{ready:!!cfg.data||!!cfg.error,first:(cfg.data&&cfg.data.leagues&&cfg.data.leagues[0])||''}}

// ---- multi-day loading -----------------------------------------------------------------------------------------------------------------
// Highlightly's /matches takes a single date, so ranges are built from per-day requests. Each day is cached (client + CDN), and a day that
// was already loaded (e.g. by the Today tab) is reused. Returns a useApi-compatible object plus `list` (adapter matches, sorted by kickoff).
const sortList=l=>[...l].sort((a,b)=>(a.ts||0)-(b.ts||0));
export function useMatchDays(dates,{ttl=300000,enabled=true,poll,live:liveFlag,leagues}={}){
 const {league,season}=useDataSettings();const {ready,first}=useDefaultLeague();const ls=leagues&&leagues.length?leagues:[league||first||''];const key=dates.join(',')+'|'+ls.join(',')+'|'+season+'|'+enabled+'|'+ready;
 const [s,setS]=useState({loading:enabled,data:null,error:null,stale:false,updatedAt:null,fromCache:false,meta:null,paging:null}),[n,setN]=useState(0);
 useEffect(()=>{if(!enabled){setS(x=>({...x,loading:false}));return}
  if(!ready)return;   // wait for the config so every request carries the canonical competition id
  let live=true;setS(x=>({...x,loading:true,error:null}));
  Promise.allSettled(dates.flatMap(d=>ls.map(l=>api('fixtures',{date:d,...(l?{league:l}:{}),...(liveFlag?{live:1}:{})},{ttl,force:n>0})))).then(rs=>{if(!live)return;
   const ok=rs.filter(r=>r.status==='fulfilled').map(r=>r.value);
   if(!ok.length){setS({loading:false,data:null,error:rs[0]&&rs[0].reason||null,stale:false,updatedAt:null,fromCache:false,meta:null,paging:null});return}
   const bad=rs.find(r=>r.status==='rejected'),stale=ok.some(r=>r.stale);
   setS({loading:false,data:ok.flatMap(r=>r.data||[]),error:bad?bad.reason:(ok.find(r=>r.error)||{}).error||null,stale:stale||!!bad,updatedAt:Math.min(...ok.map(r=>r.t)),fromCache:ok.every(r=>r.fromCache),meta:ok[ok.length-1].meta,paging:ok.some(r=>r.paging&&r.paging.truncated)?{truncated:true}:null})});
  return()=>{live=false}},[key,n]);
 useEffect(()=>{if(!poll||!enabled)return;const t=setInterval(()=>{if(!document.hidden)setN(x=>x+1)},poll);return()=>clearInterval(t)},[poll,enabled]);
 const list=useMemo(()=>sortList(normFixtures(s.data).map(toMatch)),[s.data]);
 return{...s,list,reload:()=>setN(x=>x+1)}}
// The next `count` upcoming matches: scans today, tomorrow, ... (max `maxDays` requests, each cached for an hour) and stops as soon as enough are found.
export function useNextMatches(count,{maxDays=7,enabled=true}={}){
 const {league,season}=useDataSettings();const {ready,first}=useDefaultLeague();const lg=league||first||'';const key=count+'|'+lg+'|'+season+'|'+enabled+'|'+ready;
 const [s,setS]=useState({loading:enabled,data:null,error:null,stale:false,updatedAt:null,fromCache:false,meta:null,list:[]}),[n,setN]=useState(0);
 useEffect(()=>{if(!enabled){setS(x=>({...x,loading:false}));return}
  if(!ready)return;
  let live=true;setS(x=>({...x,loading:true,error:null}));
  (async()=>{let out=[],err=null,stale=false,fromCache=true,last=null;
   for(let i=0;i<maxDays&&out.length<count;i++){let r;try{r=await api('fixtures',{date:dayStr(i),...(lg?{league:lg}:{})},{ttl:3600000,force:n>0&&i===0})}catch(e){err=e;break}
    last=r;stale=stale||!!r.stale;fromCache=fromCache&&!!r.fromCache;out=out.concat(sortList(normFixtures(r.data).map(toMatch)).filter(m=>m.st==='upcoming'))}
   if(!live)return;const list=out.slice(0,count);
   if(!last&&err)setS({loading:false,data:null,error:err,stale:false,updatedAt:null,fromCache:false,meta:null,list:[]});
   else setS({loading:false,data:list,list,error:err,stale:stale||!!err,updatedAt:last&&last.t,fromCache,meta:last&&last.meta})})();
  return()=>{live=false}},[key,n]);
 return{...s,reload:()=>setN(x=>x+1)}}

// Saved matches (favourites, predictions) are snapshots. For ones that should have kicked off but are not final, fetch the current state
// (max 10 matches, each cached for 5 minutes) and return the list with fresher entries swapped in.
export function useRefreshed(list){
 const [fresh,setFresh]=useState({});const key=list.map(m=>m.id).join(',');
 useEffect(()=>{let live=true;const need=list.filter(m=>m.st!=='ft'&&m.st!=='off'&&m.ts&&m.ts*1000<Date.now()).slice(0,10);
  need.forEach(m=>api('fixture',{id:m.id},{ttl:300000}).then(r=>{const fx=r.data&&r.data[0]&&normFixture(r.data[0]);if(live&&fx)setFresh(f=>({...f,[m.id]:{...toMatch(fx),teams:m.teams}}))}).catch(()=>{}));
  return()=>{live=false}},[key]);
 return list.map(m=>fresh[m.id]||m)}
