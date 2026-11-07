import React,{useState,useContext,useRef,useEffect} from 'react'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {T} from './data'
import {ME,ini} from './compData'
import {userOf,clock} from './socialData'
import {I} from './Icon'
import {Av,Crest,Btn} from './ui'
import {StatusPill} from './MatchCard'
import {PredictionShareCard} from './ShareModal'

const EMO=['⚽','🔥','👏','😮'];
export function MatchDiscussionRoom({m,onBack}){
 const {disc,discSend,discReact}=useSocial();const {store,openPick,toast}=useContext(Ctx);
 const tab='Chat',[t,setT]=useState(''),end=useRef();const msgs=disc[m.id]||[],live=m.st==='live';
 useEffect(()=>{if(tab==='Chat')end.current?.scrollIntoView({block:'end'})},[msgs.length,tab]);
 const sub=()=>{if(!t.trim())return;discSend(m.id,t.trim());setT('')};
 const mine=store[m.id],has=mine&&(mine.result||mine.score);
 const sharePred=()=>{if(!has){toast('Make a prediction first, then share it here');openPick(m);return}discSend(m.id,'Here is my call for this one.',{result:mine.result||(mine.score[0]>mine.score[1]?'H':mine.score[0]<mine.score[1]?'A':'D'),score:mine.score||null,conf:75});toast('Prediction shared in the room')};
 return <div>
  <button onClick={onBack} className="flex items-center gap-2 text-sm text-mute hover:text-white mb-4"><I n="back" s={16}/>All discussions</button>
  <div className="rounded-2xl border border-line bg-gradient-to-br from-card to-bg2 p-5">
   <div className="flex items-center justify-between mb-4"><StatusPill m={m}/><span className="text-xs text-mute">{msgs.length} message{msgs.length===1?'':'s'}</span></div>
   <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center"><div className="flex flex-col items-center gap-2"><Crest k={m.h} s={56}/><span className="font-bold text-sm">{T[m.h][0]}</span></div>{m.st==='upcoming'||!m.hasScore?<div><p className="text-mute font-bold text-sm">VS</p><p className="text-xs text-mute mt-1">{m.t}</p></div>:<span className={`text-4xl font-extrabold tabular-nums ${live?'text-white':''}`}>{m.sc[0]}<span className="text-mute mx-1">–</span>{m.sc[1]}</span>}<div className="flex flex-col items-center gap-2"><Crest k={m.a} s={56}/><span className="font-bold text-sm">{T[m.a][0]}</span></div></div></div>
  <div className="mt-4">
  {<div><div className="rounded-2xl bg-card border border-line p-4 max-h-[48vh] overflow-y-auto space-y-4">{msgs.length?msgs.map(x=><div key={x.id} className="flex gap-2.5"><Av t={ini(x.user)} s={32} me={x.user===ME.name}/><div className="min-w-0 flex-1"><p className="text-xs font-bold">{x.user} <span className="text-mute font-normal">· {clock(x.at)}</span></p><p className="text-sm break-words">{x.text}</p>
    {x.pred&&<div className="mt-2 max-w-xs"><PredictionShareCard user={userOf(x.user)} m={m} pred={x.pred} conf={x.pred.conf} compact/></div>}
    <div className="flex flex-wrap gap-1.5 mt-1.5">{EMO.map(e=>{const l=x.reacts[e]||[],on=l.includes(ME.name);return <button key={e} onClick={()=>discReact(m.id,x.id,e)} className={`text-xs rounded-full border px-2 py-0.5 transition hover:border-white/30 ${on?'border-white/40 bg-white/10':'border-line text-mute'} ${l.length||on?'':'opacity-60'}`}>{e}{l.length>0&&<span className="ml-1 font-semibold">{l.length}</span>}</button>})}</div></div></div>):<p className="text-sm text-mute text-center py-6">No messages yet. Start the conversation.</p>}<div ref={end}/></div>
   <div className="flex gap-2 mt-3"><input value={t} onChange={e=>setT(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sub()} placeholder="Join the discussion…" className="flex-1 min-w-0 rounded-xl bg-card border border-line px-4 py-3 text-sm outline-none focus:border-white/40"/><button onClick={sub} className={`rounded-xl px-4 bg-lime text-ink ${t.trim()?'':'opacity-40 pointer-events-none'}`}><I n="send" s={17}/></button></div>
   <Btn v="s" onClick={sharePred} className="mt-3 w-full sm:w-auto"><I n="share" s={15}/>{has?'Share my prediction':'Predict this match'}</Btn></div>}
  </div></div>}
