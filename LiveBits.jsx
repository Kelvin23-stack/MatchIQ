import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {I} from './Icon'
import {Btn} from './ui'
import {initials} from './intelHelpers'

export const TeamLogo=({t,s=40})=>{const [bad,setBad]=useState(false);return t&&t.logo&&!bad?<img src={t.logo} alt={`${t.name} logo`} loading="lazy" referrerPolicy="no-referrer" onError={()=>setBad(true)} className="object-contain shrink-0" style={{width:s,height:s}}/>:<span className="rounded-full grid place-items-center font-extrabold border border-line bg-bg2 text-mute shrink-0" style={{width:s,height:s,fontSize:s*.3}}>{initials((t&&t.name)||'?')}</span>};
export const PhotoAvatar=({src,name,s=56})=>{const [bad,setBad]=useState(false);return src&&!bad?<img src={src} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={()=>setBad(true)} className="rounded-full object-cover shrink-0 border border-line bg-bg2" style={{width:s,height:s}}/>:<span className="rounded-full grid place-items-center font-extrabold border border-line bg-bg2 text-mute shrink-0" style={{width:s,height:s,fontSize:s*.34}}>{initials(name||'?')}</span>};
export const fmtTime=ts=>ts?new Date(ts*1000).toLocaleString([], {weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'Time to be confirmed';
export const fmtClock=ts=>ts?new Date(ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'';
export const tzName=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return ''}};
const MSG={not_configured:'Live data is not set up on the server yet. Add HIGHLIGHTLY_API_KEY and HIGHLIGHTLY_LEAGUES on the server (see SETUP.md).',plan:'',quota:'The daily request quota for the API plan has been used. It resets at 00:00 UTC. Showing nothing rather than made-up numbers.',rate_limit:'The data provider is rate-limiting requests. Please wait a minute and retry.',auth:'The server could not authenticate with the data provider. Check HIGHLIGHTLY_API_KEY.',timeout:'The data provider took too long to respond.',network:'Could not reach the server. Check your connection.',bad_response:'',provider:'',bad_request:'',server_error:'Unexpected server error.'};
export const errText=e=>e?(MSG[e.code]||e.message):'';

export const PROVIDER='Highlightly';
export function DataBanner({s,label='Live data · '+PROVIDER}){
 const {nav}=useContext(Ctx);if(!s||(!s.updatedAt&&!s.error))return null;const q=s.meta&&s.meta.quota&&s.meta.quota.day&&s.meta.quota.day.remaining;
 return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mute mb-4"><span className="inline-flex items-center gap-1.5 border border-line rounded-full px-2.5 py-1"><span className={`w-1.5 h-1.5 rounded-full ${s.stale?'bg-amber-400':'bg-emerald-400'}`}/>{label}</span>
  {s.updatedAt&&<span>Updated {fmtClock(s.updatedAt)}{s.fromCache?' (cached, not real-time)':''}</span>}{q!=null&&<span>{q} API requests left today</span>}
  {s.stale&&s.error&&<span className="text-amber-400">Refresh failed: {errText(s.error)} Showing cached data.</span>}
  {s.meta&&s.meta.plan&&s.meta.plan.message&&<span className="text-amber-400">Plan notice: {s.meta.plan.message}</span>}
  <button onClick={s.reload} className="text-sky font-semibold hover:underline">Refresh</button></div>}

export function ErrorBox({e,retry}){const {nav}=useContext(Ctx);return <div className="rounded-2xl border border-red-400/30 bg-red-500/5 p-6 text-center"><div className="w-11 h-11 mx-auto rounded-full bg-red-500/10 text-red-400 grid place-items-center"><I n="alert" s={20}/></div><p className="font-bold mt-3">Could not load live data</p><p className="text-sm text-mute mt-1 max-w-lg mx-auto">{errText(e)}</p>
 <div className="flex flex-wrap justify-center gap-3 mt-4">{retry&&<Btn v="s" onClick={retry}>Retry</Btn>}<Btn v="s" onClick={()=>nav('settings')}>Data settings</Btn></div></div>}
export const Skeleton=({n=3,h='h-24'})=><div className="space-y-3 animate-pulse">{Array.from({length:n}).map((_,i)=><div key={i} className={`${h} rounded-2xl bg-card border border-line`}/>)}</div>;
// Wraps a useApi() result: skeleton while loading, error box on failure, banner + children otherwise.
export function Async({s,children,banner=true}){
 if(s.loading&&!s.data)return <Skeleton/>;
 if(s.error&&!s.data)return <ErrorBox e={s.error} retry={s.reload}/>;
 return <>{banner&&<DataBanner s={s}/>}{children}</>}
export function LiveStatus({st}){
 if(!st)return null;const e=st.elapsed!=null?`${st.elapsed}${st.extra?'+'+st.extra:''}'`:'';
 if(st.kind==='live')return <span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>LIVE{e?` · ${e}`:''}</span>;
 if(st.kind==='break')return <span className="text-[11px] font-bold text-amber-400 border border-amber-400/30 rounded-full px-2.5 py-1">{st.long||'Half-time'}</span>;
 if(st.kind==='finished')return <span className="text-[11px] font-bold text-mute border border-line rounded-full px-2.5 py-1">{st.short==='FT'?'FULL TIME':st.long.toUpperCase()}</span>;
 if(st.kind==='off')return <span className="text-[11px] font-bold text-amber-400 border border-amber-400/30 rounded-full px-2.5 py-1">{st.long||st.short}</span>;
 if(st.kind==='upcoming')return <span className="text-[11px] font-bold text-sky border border-sky/30 rounded-full px-2.5 py-1">{st.short==='TBD'?'Time TBC':'Upcoming'}</span>;
 return <span className="text-[11px] text-mute border border-line rounded-full px-2.5 py-1">{st.long||'Status unknown'}</span>}
