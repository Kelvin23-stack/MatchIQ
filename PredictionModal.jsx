import React,{useState,useEffect,useContext} from 'react'
import {motion} from 'framer-motion'
import {T,OU,marketLines,conflicts} from './data'
import {Ctx} from './context'
import {I} from './Icon'
import {Crest,Btn} from './ui'
import {LeagueBadge} from './MatchCard'
import {useSocial} from './SocialContext'

const Opt=({on,onClick,children})=><button onClick={onClick} className={`rounded-xl border px-3 py-3 text-sm font-bold transition active:scale-95 ${on?'border-lime bg-lime text-ink shadow-[0_6px_24px_-10px_rgba(163,255,18,.7)]':'border-line bg-card hover:border-white/25'}`}>{children}</button>
const Sec=({n,t,children})=><div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-mute mb-2"><span className="text-white">{n}</span> · {t}</p>{children}</div>

export function PredictionModal(){
 const {modal:m,setModal,store,save}=useContext(Ctx);
 const {openShare}=useSocial();
 const [sel,setSel]=useState({}),[done,setDone]=useState(false);
 useEffect(()=>{const e=m&&store[m.id];setSel(e?{result:e.result,score:e.score,ou:e.ou,btts:e.btts}:{});setDone(false)},[m?.id]);
 if(!m)return null;
 const set=(k,v)=>setSel(s=>({...s,[k]:s[k]===v?undefined:v}));
 const bump=(i,d)=>setSel(s=>{const sc=[...(s.score||[0,0])];sc[i]=Math.max(0,Math.min(9,sc[i]+d));return{...s,score:sc}});
 const clean=Object.fromEntries(Object.entries(sel).filter(([,v])=>v!=null));
 const lines=marketLines(clean,m),edit=!!store[m.id],open=m.st==='upcoming';
 const go=()=>{if(!open||!lines.length)return;save(m,clean,edit);setDone(true)};
 const sc=sel.score;
 return <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/70 backdrop-blur-sm" onClick={()=>setModal(null)}>
  <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.25}} onClick={e=>e.stopPropagation()} className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-bg2 border border-line rounded-t-3xl sm:rounded-3xl p-5 sm:p-6" style={{paddingBottom:'max(1.25rem,env(safe-area-inset-bottom))'}}>
   <div className="flex justify-between items-start"><span className="flex items-center gap-2 text-xs font-semibold text-mute"><LeagueBadge lg={m.lg}/>{m.lg} · {m.t}</span><button onClick={()=>setModal(null)} className="text-mute hover:text-white"><I n="x"/></button></div>
   {done?<div className="text-center py-8">
     <div className="relative w-24 h-24 mx-auto"><motion.span className="absolute inset-0 rounded-full border-2 border-emerald-400" initial={{scale:.6,opacity:.9}} animate={{scale:1.7,opacity:0}} transition={{duration:1,repeat:1}}/>
      <motion.div className="relative w-24 h-24 rounded-full bg-emerald-400 grid place-items-center" initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:260,damping:16}}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#080B0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><motion.path d="M20 6 9 17l-5-5" initial={{pathLength:0}} animate={{pathLength:1}} transition={{delay:.25,duration:.45}}/></svg></motion.div></div>
     <h3 className="text-2xl font-extrabold mt-6">{edit?'Prediction updated':'Prediction locked in'}</h3>
     <p className="text-mute text-sm mt-1">{T[m.h][0]} vs {T[m.a][0]}</p>
     <div className="mt-5 rounded-2xl bg-card border border-line divide-y divide-line text-left">{lines.map(([a,b])=><div key={a} className="flex justify-between px-4 py-2.5 text-sm"><span className="text-mute">{a}</span><span className="font-bold text-white">{b}</span></div>)}</div>
     <div className="grid grid-cols-2 gap-3 mt-6"><Btn v="s" onClick={()=>setDone(false)}>Edit again</Btn><Btn v="s" onClick={()=>{setModal(null);openShare({m,p:clean})}}><I n="share" s={15}/>Share</Btn></div><Btn className="w-full mt-3" onClick={()=>setModal(null)}>Done</Btn></div>
   :<>
   <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-5 text-center"><div className="flex flex-col items-center gap-2"><Crest k={m.h} s={52}/><span className="text-sm font-bold">{T[m.h][0]}</span></div><span className="text-mute text-xs font-bold">VS</span><div className="flex flex-col items-center gap-2"><Crest k={m.a} s={52}/><span className="text-sm font-bold">{T[m.a][0]}</span></div></div>
   <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-mute"><I n="clock" s={14}/>{open?`Predictions close at kickoff · ${m.t}`:'Predictions are closed for this match'}</div>
   {open?<>
   <Sec n="A" t="Match Result"><div className="grid grid-cols-3 gap-2">{[['H',T[m.h][0]],['D','Draw'],['A',T[m.a][0]]].map(([k,l])=><Opt key={k} on={sel.result===k} onClick={()=>set('result',k)}><span className="block truncate text-xs sm:text-sm">{k==='D'?l:l+' win'}</span></Opt>)}</div></Sec>
   <Sec n="B" t="Correct Score"><div className="flex items-center justify-center gap-4 sm:gap-6">{[0,1].map(i=><div key={i} className={`flex-1 rounded-2xl border p-3 text-center transition ${sc?'border-lime bg-white/5':'border-line bg-card'}`}><p className="text-[11px] text-mute truncate">{T[i?m.a:m.h][0]}</p>
     <div className="flex items-center justify-between mt-2"><button onClick={()=>bump(i,-1)} className="w-8 h-8 rounded-lg border border-line grid place-items-center hover:border-white/25"><I n="minus" s={14}/></button><span className="text-3xl font-extrabold tabular-nums">{sc?sc[i]:'–'}</span><button onClick={()=>bump(i,1)} className="w-8 h-8 rounded-lg border border-line grid place-items-center hover:border-white/25"><I n="plus" s={14}/></button></div></div>)}</div>
     {sc&&<button onClick={()=>set('score',sc)} className="block mx-auto mt-2 text-xs text-mute hover:text-white">Clear score</button>}</Sec>
   <Sec n="C" t="Over / Under"><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{Object.entries(OU).map(([k,l])=><Opt key={k} on={sel.ou===k} onClick={()=>set('ou',k)}>{l}</Opt>)}</div></Sec>
   <Sec n="D" t="Both Teams to Score"><div className="grid grid-cols-2 gap-2">{[['Y','Yes'],['N','No']].map(([k,l])=><Opt key={k} on={sel.btts===k} onClick={()=>set('btts',k)}>{l}</Opt>)}</div></Sec>
   <div className="mt-6 rounded-2xl bg-card border border-line p-4"><p className="text-xs font-bold uppercase tracking-wider text-mute mb-2">Prediction summary</p>
    {lines.length?lines.map(([a,b])=><div key={a} className="flex justify-between py-1.5 text-sm"><span className="text-mute">{a}</span><span className="font-bold text-white">{b}</span></div>):<p className="text-sm text-mute">Select at least one market above.</p>}
    {conflicts(clean)&&<p className="mt-2 text-xs text-amber-400">Heads up: your correct score doesn't match your other picks.</p>}</div>
   <Btn onClick={go} className={`w-full mt-4 ${lines.length?'':'opacity-40 pointer-events-none'}`}><I n="check" s={16}/>{edit?'Update prediction':'Confirm Prediction'}</Btn>
   </>:<p className="text-center text-mute text-sm py-10">This match has already kicked off.</p>}
   </>}
  </motion.div></div>}
