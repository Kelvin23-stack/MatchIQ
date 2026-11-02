import React,{useContext} from 'react'
import {motion} from 'framer-motion'
import {T,marketLines} from './data'
import {Ctx} from './context'
import {I} from './Icon'
import {Crest,Btn} from './ui'
import {LeagueBadge,StatusPill} from './MatchCard'

export const CommBar=({m})=>{const c=m.comm;return <div>
 <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5"><div style={{width:c.H+'%'}} className="bg-sky"/><div style={{width:c.D+'%'}} className="bg-[#5b665e]"/><div style={{width:c.A+'%'}} className="bg-white/80"/></div>
 <div className="flex justify-between text-xs mt-2 text-mute"><span><b className="text-sky">{c.H}%</b> {m.h}</span><span><b className="text-white">{c.D}%</b> Draw</span><span><b className="text-white">{c.A}%</b> {m.a}</span></div></div>}
const Row=({l,v})=>{const t=v[0]+v[1];return <div className="mb-3"><div className="flex justify-between text-sm font-bold tabular-nums"><span>{v[0]}{l==='Possession'?'%':''}</span><span className="text-xs text-mute font-medium">{l}</span><span>{v[1]}{l==='Possession'?'%':''}</span></div><div className="flex h-1.5 mt-1.5 gap-0.5 rounded-full overflow-hidden"><div className="bg-sky" style={{width:v[0]/t*100+'%'}}/><div className="bg-white/25 flex-1"/></div></div>}
const Pct=({l,v})=><div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-mute">{l}</span><span className="font-bold">{v}%</span></div><div className="h-1.5 rounded-full bg-bg2"><div className="h-full rounded-full bg-sky" style={{width:v+'%'}}/></div></div>

export function MatchDetail(){
 const {detail:m,setDetail,openPick,store,nav}=useContext(Ctx);if(!m)return null;
 const p=store[m.id],lines=p?marketLines(p,m):[],s=m.stats;
 return <div className="fixed inset-0 z-40 grid place-items-end sm:place-items-center bg-black/70 backdrop-blur-sm" onClick={()=>setDetail(null)}>
  <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.25}} onClick={e=>e.stopPropagation()} className="w-full sm:max-w-2xl max-h-[94vh] overflow-y-auto bg-bg2 border border-line rounded-t-3xl sm:rounded-3xl" style={{paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
   <div className="relative p-5 sm:p-7 border-b border-line"><div className="glow absolute inset-0 pointer-events-none"/>
    <div className="relative flex justify-between items-center"><span className="flex items-center gap-2 text-xs font-semibold text-mute"><LeagueBadge lg={m.lg}/>{m.lg}</span><div className="flex items-center gap-3"><StatusPill m={m}/><button onClick={()=>setDetail(null)} className="text-mute hover:text-white"><I n="x"/></button></div></div>
    <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-6 text-center">
     <div className="flex flex-col items-center gap-3"><Crest k={m.h} s={72}/><span className="font-bold text-sm sm:text-base">{T[m.h][0]}</span></div>
     {m.st==='upcoming'?<span className="text-mute font-bold">VS</span>:<span className="text-4xl font-extrabold tabular-nums">{m.sc[0]}<span className="text-mute mx-1">–</span>{m.sc[1]}</span>}
     <div className="flex flex-col items-center gap-3"><Crest k={m.a} s={72}/><span className="font-bold text-sm sm:text-base">{T[m.a][0]}</span></div></div>
    <div className="relative flex flex-wrap justify-center gap-x-5 gap-y-1 mt-5 text-xs text-mute"><span className="flex items-center gap-1.5"><I n="clock" s={13}/>{m.t}</span><span className="flex items-center gap-1.5"><I n="pin" s={13}/>{m.venue}</span><button onClick={()=>{setDetail(null);nav('match/'+m.id+'/overview')}} className="flex items-center gap-1.5 font-bold text-white hover:underline"><I n="arrow" s={13}/>Full match page</button></div></div>
   <div className="p-5 sm:p-7 grid sm:grid-cols-2 gap-6">
    <div><h4 className="font-bold mb-4">{m.st==='upcoming'?'Season averages':'Match statistics'}</h4><Row l="Possession" v={s.poss}/><Row l="Shots" v={s.shots}/><Row l="Shots on target" v={s.sot}/><Row l="Corners" v={s.corners}/></div>
    <div><h4 className="font-bold mb-4">Community predictions</h4><CommBar m={m}/><div className="mt-5"><Pct l="Over 2.5 goals" v={m.comm.o25}/><Pct l="Both teams to score" v={m.comm.btts}/></div></div>
   </div>
   <div className="px-5 sm:px-7 pb-6"><h4 className="font-bold mb-3">Prediction markets</h4>
    <div className="flex flex-wrap gap-2 mb-4">{['Match Result','Correct Score','Over/Under','Both Teams to Score'].map(x=><span key={x} className="text-xs font-semibold text-mute border border-line rounded-full px-3 py-1.5">{x}</span>)}</div>
    {lines.length>0&&<div className="rounded-xl bg-emerald-400/10 border border-emerald-400/30 p-3 mb-4 text-sm">{lines.map(([a,b])=><div key={a} className="flex justify-between py-0.5"><span className="text-mute">{a}</span><span className="font-bold text-emerald-400">{b}</span></div>)}</div>}
    {m.st==='upcoming'?<Btn className="w-full" onClick={()=>{setDetail(null);openPick(m)}}>{p?'Edit prediction':'Predict this match'}</Btn>:<div className="flex items-center justify-center gap-2 rounded-xl bg-card border border-line py-3 text-sm text-mute"><I n="lock" s={14}/>Predictions closed at kickoff</div>}
   </div>
  </motion.div></div>}
