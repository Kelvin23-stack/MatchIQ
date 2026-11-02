import React,{useState,useEffect,useContext} from 'react'
import {motion} from 'framer-motion'
import {T} from './data'
import {Ctx} from './context'
import {I} from './Icon'
import {Crest,Btn} from './ui'

export function Modal(){
 const {modal,setModal,confirm}=useContext(Ctx);const[sel,setSel]=useState(null);
 useEffect(()=>setSel(null),[modal]);if(!modal)return null;const m=modal;
 const opts=[['H',T[m.h][0],m.h],['D','Draw',null],['A',T[m.a][0],m.a]];
 return <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/70 backdrop-blur-sm" onClick={()=>setModal(null)}>
  <motion.div initial={{opacity:0,y:30,scale:.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.25}} onClick={e=>e.stopPropagation()} className=" w-full sm:max-w-md bg-bg2 border border-line rounded-t-3xl sm:rounded-3xl p-6" style={{paddingBottom:'max(1.5rem,env(safe-area-inset-bottom))'}}>
   <div className="flex justify-between items-start mb-5"><div><p className="text-xs text-white font-semibold">{m.lg} · {m.t}</p><h3 className="text-xl font-extrabold mt-1">{T[m.h][0]} vs {T[m.a][0]}</h3></div><button onClick={()=>setModal(null)} className="text-mute hover:text-white"><I n="x"/></button></div>
   <p className="text-sm text-mute mb-3">Who takes it? Correct picks earn 50 pts.</p>
   <div className="grid grid-cols-3 gap-2">{opts.map(([k,l,c])=><button key={k} onClick={()=>setSel(k)} className={`rounded-2xl border p-3 flex flex-col items-center gap-2 transition ${sel===k?'border-lime bg-white/5':'border-line bg-card hover:border-white/25'}`}>{c?<Crest k={c} s={38}/>:<div className="w-[38px] h-[38px] rounded-full border border-line grid place-items-center text-mute font-bold">=</div>}<span className="text-xs font-semibold">{l}</span></button>)}</div>
   <Btn disabled={!sel} onClick={()=>confirm(m,sel)} className={`w-full mt-6 ${!sel?'opacity-40 pointer-events-none':''}`}><I n="check" s={16}/>Confirm prediction</Btn>
  </motion.div></div>;}


export function Toasts(){const{toasts}=useContext(Ctx);return <div className="fixed z-[60] right-4 left-4 sm:left-auto top-4 flex flex-col gap-2 sm:w-80" style={{top:'max(1rem,env(safe-area-inset-top))'}}>{toasts.map(t=><div key={t.id} className="slide flex gap-3 items-start bg-card border border-white/15 rounded-2xl p-3.5 shadow-xl"><div className="w-7 h-7 rounded-full bg-emerald-400 text-ink grid place-items-center shrink-0"><I n="check" s={14}/></div><p className="text-sm">{t.m}</p></div>)}</div>;}


