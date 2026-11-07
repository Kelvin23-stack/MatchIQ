import React,{useContext} from 'react'
import {Ctx} from './context'
import {I} from './Icon'
export function Toasts(){const{toasts}=useContext(Ctx);return <div className="fixed z-[60] right-4 left-4 sm:left-auto top-4 flex flex-col gap-2 sm:w-80" style={{top:'max(1rem,env(safe-area-inset-top))'}}>{toasts.map(t=><div key={t.id} className="slide flex gap-3 items-start bg-card border border-white/15 rounded-2xl p-3.5 shadow-xl"><div className="w-7 h-7 rounded-full bg-emerald-400 text-ink grid place-items-center shrink-0"><I n="check" s={14}/></div><p className="text-sm">{t.m}</p></div>)}</div>;}
