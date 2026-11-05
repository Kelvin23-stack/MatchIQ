import {useState,useEffect,useCallback,useRef} from 'react'
import {getSeason,useDataSettings} from './dataMode'
// Client data layer. The browser only ever talks to /api/football (our own server). No provider key exists here.
export class ApiError extends Error{constructor(code,message,status){super(message);this.code=code;this.status=status}}
const mem=new Map(),inflight=new Map();let cooldownUntil=0;
const SK='miq.api.';
const readS=k=>{try{return JSON.parse(sessionStorage.getItem(SK+k))}catch(e){return null}};
const writeS=(k,v)=>{try{sessionStorage.setItem(SK+k,JSON.stringify(v))}catch(e){/* storage full: memory cache still works */}};
const SEASONAL=['fixtures','standings','teams','teamStats','players','topscorers','topassists'];
export const browserTz=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return ''}};
const TZ_ACTIONS=['fixtures','fixture'];

// api(action, params, {ttl, force}) -> {data, paging, meta, t, fromCache, stale, error?}
// One request per distinct query (in-flight de-duplication + cache). Failed requests are NOT retried automatically.
export async function api(action,params={},{ttl=120000,force=false}={}){
 const p={...params};
 if(SEASONAL.includes(action)&&p.season===undefined&&getSeason())p.season=getSeason();
 if(TZ_ACTIONS.includes(action)&&p.tz===undefined&&browserTz())p.tz=browserTz();
 const q=new URLSearchParams({action});Object.entries(p).sort().forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')q.set(k,String(v))});
 const key=q.toString();
 let c=mem.get(key);if(!c){c=readS(key);if(c)mem.set(key,c)}
 if(c&&!force&&Date.now()-c.t<ttl)return{...c,fromCache:true,stale:false};
 if(Date.now()<cooldownUntil){const e=new ApiError('rate_limit','Request limit reached. Please wait before trying again.',429);if(c)return{...c,fromCache:true,stale:true,error:e};throw e}
 if(inflight.has(key))return inflight.get(key);
 const run=(async()=>{
  const ctrl=new AbortController(),to=setTimeout(()=>ctrl.abort(),15000);
  try{
   const r=await fetch('/api/football?'+key,{signal:ctrl.signal});let j;
   try{j=await r.json()}catch(e){throw new ApiError('bad_response',r.status===404?'The /api/football endpoint was not found. Is the server function deployed?':'The server returned an unexpected response.',r.status)}
   if(!j.ok)throw new ApiError(j.error&&j.error.code||'provider',j.error&&j.error.message||'Request failed',r.status);
   const rec={t:Date.now(),data:j.data,paging:j.paging||null,meta:j.meta||null};mem.set(key,rec);writeS(key,rec);return{...rec,fromCache:false,stale:false};
  }catch(e){
   const err=e.name==='AbortError'?new ApiError('timeout','The request timed out.',504):e instanceof ApiError?e:new ApiError('network','Could not reach the server. Check your connection.');
   if(err.code==='rate_limit')cooldownUntil=Date.now()+60000;if(err.code==='quota')cooldownUntil=Date.now()+600000;
   if(c)return{...c,fromCache:true,stale:true,error:err};throw err;
  }finally{clearTimeout(to);inflight.delete(key)}
 })();
 inflight.set(key,run);return run}

// React hook: {loading,data,error,stale,updatedAt,fromCache,meta,paging,reload}
export function useApi(action,params,{enabled=true,ttl,poll}={}){
 const {season}=useDataSettings();
 const [s,setS]=useState({loading:enabled,data:null,error:null,stale:false,updatedAt:null,fromCache:false});
 const k=JSON.stringify([action,params,enabled,season]),n=useRef(0);
 const load=useCallback((force=false)=>{
  if(!enabled){setS(x=>({...x,loading:false}));return}
  const id=++n.current;setS(x=>({...x,loading:true,error:null}));
  api(action,params,{ttl,force}).then(r=>{if(id===n.current)setS({loading:false,data:r.data,paging:r.paging,meta:r.meta,error:r.error||null,stale:!!r.stale,updatedAt:r.t,fromCache:!!r.fromCache})}).catch(e=>{if(id===n.current)setS({loading:false,data:null,error:e,stale:false,updatedAt:null,fromCache:false})})
 },[k]);
 useEffect(()=>{load()},[load]);
 useEffect(()=>{if(!poll||!enabled)return;const t=setInterval(()=>{if(!document.hidden)load(true)},poll);return()=>clearInterval(t)},[load,poll,enabled]);
 return{...s,reload:()=>load(true)}}
