import React,{useContext,useState,useEffect} from 'react'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {T,marketLines} from './data'
import {api} from './footballApi'
import {normFixture} from './liveData'
import {toMatch,rehydrate,verdict} from './liveMatch'
import {I} from './Icon'
import {Crest,Btn} from './ui'
import {Sheet} from './Sheet'
import {StatusPill,LeagueBadge} from './MatchCard'

const Chip=({children})=><span className="text-[10px] font-semibold text-mute border border-line rounded-full px-2 py-0.5">{children}</span>;

export function PredictionHistory(){
 const {store,openPick,nav}=useContext(Ctx);const {openShare}=useSocial();const [sel,setSel]=useState(null);
 // Saved matches store a snapshot. For matches that should have kicked off but are not final, refresh the result (max 10, cached 5 min).
 const [fresh,setFresh]=useState({});
 const base=Object.values(store).filter(p=>p.m).map(p=>({m:rehydrate(fresh[p.m.id]||p.m),p})).sort((a,b)=>b.p.at-a.p.at);
 useEffect(()=>{let live=true;const need=base.filter(({m})=>m.st!=='ft'&&m.st!=='off'&&m.ts&&m.ts*1000<Date.now()).slice(0,10);
  need.forEach(({m})=>api('fixture',{id:m.id},{ttl:300000}).then(r=>{const fx=r.data&&r.data[0]&&normFixture(r.data[0]);if(live&&fx)setFresh(f=>({...f,[m.id]:{...toMatch(fx),teams:m.teams}}))}).catch(()=>{}));
  return()=>{live=false}},[Object.keys(store).join(',')]);
 const rows=base;
 const cur=sel&&rows.find(r=>r.m.id===sel);
 return <div><h2 className="font-bold text-lg mb-4">My predictions <span className="text-mute text-sm font-medium">({rows.length})</span></h2>
  {rows.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{rows.map(({m,p})=>{const L=marketLines(p,m);return <button key={m.id} onClick={()=>setSel(m.id)} aria-label={`Open prediction details: ${T[m.h][0]} vs ${T[m.a][0]}`} className="text-left rounded-2xl bg-card border border-line p-4 transition hover:border-white/30 hover:-translate-y-0.5">
   <div className="flex items-center justify-between gap-2 text-[11px] text-mute"><span className="flex items-center gap-1.5 min-w-0"><LeagueBadge lg={m.lg} s={18}/><span className="truncate">{m.lg}</span></span><StatusPill m={m}/></div>
   <div className="flex items-center gap-2.5 mt-3"><Crest k={m.h} s={34}/><span className="text-sm font-extrabold truncate">{T[m.h][0]}</span><span className="text-xs text-mute">{m.st==='upcoming'||!m.hasScore?'vs':`${m.sc[0]}–${m.sc[1]}`}</span><span className="text-sm font-extrabold truncate">{T[m.a][0]}</span><Crest k={m.a} s={34}/></div>
   <div className="flex flex-wrap gap-1.5 mt-3">{L.slice(0,3).map(([a])=><Chip key={a}>{a}</Chip>)}{L.length>3&&<Chip>+{L.length-3}</Chip>}</div>
   <p className="text-[11px] text-mute mt-3 flex items-center justify-between"><span>{L.length} market{L.length===1?'':'s'}</span><span className="text-sky font-bold">View details</span></p></button>})}</div>
  :<div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute">No predictions yet. Lock in your first pick from the Match Centre.<div className="mt-4"><Btn onClick={()=>nav('matches')}>Explore matches</Btn></div></div>}
  {cur&&(()=>{const {m,p}=cur,L=marketLines(p,m);return <Sheet title="Prediction details" onClose={()=>setSel(null)}>
   <div className="rounded-2xl border border-line bg-card p-4"><div className="flex items-center justify-between text-xs text-mute"><span>{m.lg} · {m.t}</span><StatusPill m={m}/></div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-4 text-center"><div className="flex flex-col items-center gap-2"><Crest k={m.h} s={48}/><span className="text-xs font-bold">{T[m.h][0]}</span></div><span className="text-2xl font-extrabold tabular-nums">{m.st==='upcoming'||!m.hasScore?'VS':`${m.sc[0]}–${m.sc[1]}`}</span><div className="flex flex-col items-center gap-2"><Crest k={m.a} s={48}/><span className="text-xs font-bold">{T[m.a][0]}</span></div></div></div>
   <p className="text-[10px] uppercase tracking-wider text-mute mt-5 mb-2">Your markets</p>
   <div className="rounded-2xl border border-line bg-card divide-y divide-line">{L.map(([a,b])=>{const v=verdict(m,p,a);return <div key={a} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="text-mute">{a}</span><span className="flex items-center gap-2 font-bold">{b}{v===true&&<span className="text-emerald-400"><I n="check" s={15}/></span>}{v===false&&<span className="text-red-400"><I n="x" s={15}/></span>}</span></div>})}</div>
   <p className="text-xs text-mute mt-3">{m.st==='upcoming'?'Predictions close at kickoff. You can edit until then.':m.st==='live'?'Match in progress. Predictions are locked.':'Match finished. Ticks show which markets landed (no points are awarded yet).'} Saved {new Date(p.at).toLocaleString([],{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}.</p>
   <div className="grid grid-cols-2 gap-3 mt-5"><Btn v="s" onClick={()=>{setSel(null);openShare({m,p})}}><I n="share" s={15}/>Share</Btn>{m.st==='upcoming'?<Btn onClick={()=>{setSel(null);openPick(m)}}><I n="edit" s={15}/>Edit prediction</Btn>:<Btn v="s" className="opacity-50 pointer-events-none"><I n="lock" s={15}/>Locked</Btn>}</div>
   <button onClick={()=>{setSel(null);nav('lmatch/'+m.id+'/overview')}} className="block mx-auto mt-4 text-sm font-semibold text-sky hover:underline">Open match page</button></Sheet>})()}</div>}
