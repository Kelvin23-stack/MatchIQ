import React,{useState,useEffect,useRef} from 'react'
import {useSocial} from './SocialContext'
import {T} from './data'
import {ini} from './compData'
import {userOf,online,clock,ago,lvl} from './socialData'
import {I} from './Icon'
import {Crest,Btn} from './ui'
import {OnlineAv} from './UserCards'

export const MessageBubble=({m})=><div className={`flex ${m.from==='me'?'justify-end':'justify-start'}`}><div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${m.from==='me'?'bg-lime text-ink rounded-br-md':'bg-bg2 border border-line rounded-bl-md'}`}><p className="text-sm break-words">{m.text}</p><p className={`text-[10px] mt-0.5 text-right ${m.from==='me'?'text-ink/60':'text-mute'}`}>{clock(m.at)}</p></div></div>;

export function ConversationList({items,active,onSelect}){
 const [q,setQ]=useState('');const list=items.filter(i=>i.name.toLowerCase().includes(q.toLowerCase()));
 return <div className="flex flex-col min-h-0 h-full border-r border-line"><div className="p-3 border-b border-line"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={15}/></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search conversations" className="w-full rounded-xl bg-bg2 border border-line pl-9 pr-3 py-2.5 text-sm outline-none focus:border-white/40"/></div></div>
  <div className="flex-1 overflow-y-auto divide-y divide-line">{list.length?list.map(i=><button key={i.name} onClick={()=>onSelect(i.name)} className={`w-full text-left flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.04] ${active===i.name?'bg-white/[0.07]':''}`}><OnlineAv u={userOf(i.name)} s={42}/><div className="flex-1 min-w-0"><div className="flex justify-between gap-2"><p className="text-sm font-bold truncate">{i.name}</p>{i.last&&<span className="text-[10px] text-mute whitespace-nowrap">{ago(i.last.at)}</span>}</div><p className={`text-xs truncate ${i.unread?'text-white font-semibold':'text-mute'}`}>{i.last?(i.last.from==='me'?'You: ':'')+i.last.text:'Start a conversation'}</p></div>{i.unread>0&&<span className="min-w-[20px] h-5 px-1.5 rounded-full bg-lime text-ink text-[11px] font-extrabold grid place-items-center">{i.unread}</span>}</button>):<p className="p-6 text-center text-sm text-mute">No conversations found.</p>}</div></div>}

export function ChatWindow({name,onBack}){
 const {convos,send,typing,openConvo,openUser}=useSocial();const u=userOf(name),msgs=convos[name]||[];const [t,setT]=useState(''),end=useRef();
 useEffect(()=>{openConvo(name)},[name]);
 useEffect(()=>{end.current?.scrollIntoView({behavior:'smooth',block:'end'})},[msgs.length,typing]);
 const sub=()=>{if(!t.trim())return;send(name,t.trim());setT('')};
 return <div className="flex flex-col min-h-0 h-full overflow-hidden" style={{paddingTop:'env(safe-area-inset-top,0px)'}}>
  <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-line"><button onClick={onBack} aria-label="Back to conversations" className="text-mute hover:text-white p-1"><I n="back"/></button><button onClick={()=>openUser(name)} aria-label={`Open ${name}'s profile`} className="flex items-center gap-3 min-w-0 flex-1 text-left"><OnlineAv u={u} s={38}/><span className="min-w-0"><span className="block font-bold text-sm truncate">{name}</span><span className="block text-[11px] text-mute">{typing===name?<span className="text-emerald-400">typing…</span>:online(u)?'Online · tap for profile':'Offline · tap for profile'}</span></span></button></div>
  <p className="text-[11px] text-mute text-center py-1.5 bg-white/[0.03] border-b border-line">Demo chat. Replies are simulated and nothing is sent to real users.</p>
  <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-2">{msgs.length?msgs.map(m=><MessageBubble key={m.id} m={m}/>):<div className="h-full grid place-items-center text-center text-mute"><div><div className="w-14 h-14 mx-auto rounded-2xl bg-card border border-line grid place-items-center mb-3"><I n="comment" s={24}/></div><p className="font-semibold text-white">No messages yet</p><p className="text-sm mt-1">Say hello to {name} and talk football.</p></div></div>}
   {typing===name&&<div className="flex"><div className="rounded-2xl rounded-bl-md bg-bg2 border border-line px-4 py-3 flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-mute animate-pulse" style={{animationDelay:i*.2+'s'}}/>)}</div></div>}<div ref={end}/></div>
  <div className="flex gap-2 p-3 border-t border-line" style={{paddingBottom:'max(.75rem,env(safe-area-inset-bottom))'}}><input value={t} onChange={e=>setT(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sub()} placeholder={`Message ${name}…`} className="flex-1 min-w-0 rounded-xl bg-bg2 border border-line px-4 py-3 text-sm outline-none focus:border-white/40"/><button onClick={sub} className={`rounded-xl px-4 bg-lime text-ink transition active:scale-95 ${t.trim()?'':'opacity-40 pointer-events-none'}`}><I n="send" s={17}/></button></div></div>}

export function ChatInfo({name}){const u=userOf(name),{openTab}=useSocial();return <aside className="hidden xl:block min-h-0 border-l border-line p-5 text-center overflow-y-auto"><div className="flex justify-center"><OnlineAv u={u} s={72}/></div><p className="font-extrabold mt-3">{name}</p><p className="text-xs text-mute">{online(u)?'Online now':'Offline'} · Level {lvl(u)}</p>
 <div className="mt-4 flex items-center justify-center gap-2 text-sm text-mute"><Crest k={u.club} s={24}/>{T[u.club][0]}</div>
 <div className="grid grid-cols-2 gap-2 mt-5">{[['Points',u.points.toLocaleString(),'text-gold'],['Accuracy',u.acc+'%','text-emerald-400'],['Streak',u.streak,'text-flame'],['Level',lvl(u),'']].map(([a,b,c])=><div key={a} className="rounded-xl bg-bg2 border border-line p-3"><p className="text-[10px] text-mute">{a}</p><p className={`font-extrabold ${c}`}>{b}</p></div>)}</div>
 <Btn v="s" onClick={()=>openTab('Feed')} className="w-full mt-4">Back to feed</Btn></aside>}
