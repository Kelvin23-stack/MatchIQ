import React,{useContext} from 'react'
import {T,LG,marketLines} from './data'
import {Ctx} from './context'
import {I} from './Icon'
import {Crest,Btn} from './ui'

export const LeagueBadge=({lg,s=22})=>{const[c,col]=LG[lg]||['?','#A3FF12'];return <span className="inline-grid place-items-center rounded-md font-extrabold border shrink-0" style={{width:s+(c.length>2?6:0),height:s,fontSize:s*.36,color:col,borderColor:col+'55',background:col+'18'}}>{c}</span>}
export const StatusPill=({m})=>m.st==='live'
 ?<span className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>LIVE · {m.min}'</span>
 :m.st==='ft'?<span className="text-[11px] font-bold text-mute border border-line rounded-full px-2.5 py-1">FULL TIME</span>
 :<span className="flex items-center gap-1.5 text-xs text-mute"><I n="clock" s={12}/>{m.t}</span>
export const resultText=m=>m.sc[0]>m.sc[1]?T[m.h][0]+' won':m.sc[0]<m.sc[1]?T[m.a][0]+' won':'Draw'

export function MatchCard({m,compact}){
 const {store,openPick,setDetail}=useContext(Ctx);const p=store[m.id],lines=p?marketLines(p,m):[];
 const act=e=>{e.stopPropagation();openPick(m)};
 return <div onClick={()=>setDetail(m)} className="cursor-pointer rounded-2xl bg-gradient-to-b from-card to-bg2 border border-line p-4 sm:p-5 transition duration-300 hover:border-white/25 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(163,255,18,.35)]">
  <div className="flex items-center justify-between gap-2 mb-4"><span className="flex items-center gap-2 min-w-0 text-xs font-semibold text-mute"><LeagueBadge lg={m.lg}/><span className="truncate">{m.lg}</span>{m.derby&&<span className="text-[9px] font-extrabold text-red-400 border border-red-400/40 rounded px-1.5 py-0.5 shrink-0">DERBY</span>}</span><StatusPill m={m}/></div>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
   <div className="flex flex-col items-center gap-2 text-center min-w-0"><Crest k={m.h} s={compact?44:52}/><span className="text-sm font-semibold leading-tight">{T[m.h][0]}</span></div>
   {m.st==='upcoming'?<span className="text-mute text-xs font-bold px-1">VS</span>:<span className={`text-2xl font-extrabold tabular-nums px-1 ${m.st==='live'?'text-white':''}`}>{m.sc[0]}<span className="text-mute mx-1">–</span>{m.sc[1]}</span>}
   <div className="flex flex-col items-center gap-2 text-center min-w-0"><Crest k={m.a} s={compact?44:52}/><span className="text-sm font-semibold leading-tight">{T[m.a][0]}</span></div>
  </div>
  {m.st==='upcoming'&&<div className="flex flex-wrap justify-center gap-1.5 mt-4">{['Result','Score','Over/Under','BTTS'].map(x=><span key={x} className="text-[10px] font-semibold text-mute border border-line rounded-full px-2 py-0.5">{x}</span>)}</div>}
  {m.st==='ft'&&<p className="text-center text-xs text-mute mt-4">Result: <span className="text-white font-semibold">{resultText(m)}</span></p>}
  {m.st==='upcoming'
   ?(p?<div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/30 px-3 py-2.5 text-sm"><span className="flex items-center gap-2 text-emerald-400 font-semibold min-w-0"><I n="check" s={14}/><span className="truncate">{lines.length} market{lines.length>1?'s':''} predicted</span></span><button onClick={act} className="text-xs text-mute hover:text-white">Edit</button></div>
     :<Btn onClick={act} className="w-full mt-4">Predict</Btn>)
   :<div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-bg2 border border-line py-2.5 text-xs text-mute"><I n="lock" s={13}/>{p?`Your ${lines.length} pick${lines.length>1?'s':''} · closed`:'Predictions closed'}</div>}
 </div>}
