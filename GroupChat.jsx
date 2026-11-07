import React,{useState,useEffect,useRef,useMemo,useContext} from 'react'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {ALL,ME,hash,ini} from './compData'
import {BOT_LINES,CLUB_LINES,clock} from './socialData'
import {teamName} from './intelHelpers'
import {compressImage} from './imageUtil'
import {I} from './Icon'
import {Av} from './ui'

const COL=['#34D399','#5AA9FF','#FF8A3D','#B388FF','#FF6FB5','#22D3EE','#F5C451','#FB7185'];
// WhatsApp-style group chat. Other members are simulated: messages arrive on a timer while this screen is open.
export function GroupChat({room,title,subtitle,lead,club,readOnly}){
 const {rooms,roomSend,roomPush,openUser}=useSocial();const {toast}=useContext(Ctx);
 const msgs=rooms[room]||[];const [t,setT]=useState(''),[typing,setTyping]=useState(null),[img,setImg]=useState(null);const box=useRef(),file=useRef();
 const pool=useMemo(()=>ALL.filter(u=>!u.me&&(!club||u.club===club||hash(u.name+room)%3===0)).map(u=>u.name).slice(0,14),[room,club]);
 const online=useMemo(()=>90+hash(room)%220,[room]);
 useEffect(()=>{let a=true,t1,t2;const loop=()=>{t1=setTimeout(()=>{if(!a)return;const who=pool[Math.floor(Math.random()*pool.length)];setTyping(who);t2=setTimeout(()=>{if(!a)return;setTyping(null);const lines=club?[...CLUB_LINES(teamName(club)),...BOT_LINES]:BOT_LINES;roomPush(room,{user:who,text:lines[Math.floor(Math.random()*lines.length)]});loop()},1500+Math.random()*1500)},5000+Math.random()*5000)};loop();return()=>{a=false;clearTimeout(t1);clearTimeout(t2)}},[room]);
 useEffect(()=>{if(box.current)box.current.scrollTop=box.current.scrollHeight},[msgs.length,typing]);
 const send=()=>{if(readOnly||(!t.trim()&&!img))return;roomSend(room,t.trim(),img||undefined);setT('');setImg(null)};
 const pickImg=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;try{setImg(await compressImage(f,800,.7))}catch(x){toast(x.message)}};
 return <div className="rounded-2xl border border-line bg-card overflow-hidden flex flex-col h-[calc(100dvh-15rem)] min-h-[440px] lg:h-[68vh]">
  <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-bg2">{lead}<div className="min-w-0 flex-1"><p className="font-extrabold truncate">{title}</p><p className="text-xs text-mute truncate">{typing?<span className="text-emerald-400">{typing} is typing…</span>:`${online} online · ${subtitle||'Demo group, other members are simulated'}`}</p></div>
   <div className="flex -space-x-2 shrink-0">{pool.slice(0,3).map(n=><span key={n} className="ring-2 ring-bg2 rounded-full"><Av t={ini(n)} s={26}/></span>)}</div></div>
  <div ref={box} className="chat-bg flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-2.5" aria-live="polite">
   <p className="mx-auto w-fit rounded-full bg-bg2 border border-line px-3 py-1 text-[11px] text-mute">Today</p>
   {msgs.map(m=>{const mine=m.user===ME.name,c=COL[hash(m.user)%COL.length];return <div key={m.id} className={`flex ${mine?'justify-end':'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-3 py-2 shadow-sm ${mine?'bg-lime text-ink rounded-tr-md':'bg-bg2 border border-line rounded-tl-md'}`}>
    {!mine&&<button onClick={()=>openUser(m.user)} className="text-xs font-bold hover:underline block" style={{color:c}}>{m.user}</button>}
    {m.img&&<img src={m.img} alt={`Photo shared by ${m.user}`} className="rounded-xl mt-1 mb-1 max-h-64 w-full object-cover"/>}
    {m.text&&<p className="text-sm break-words">{m.text}</p>}
    <p className={`text-[10px] mt-0.5 text-right flex items-center justify-end gap-1 ${mine?'text-ink/60':'text-mute'}`}>{clock(m.at)}{mine&&<span className="inline-flex -space-x-1.5 text-sky"><I n="check" s={11}/><I n="check" s={11}/></span>}</p></div></div>})}
   {typing&&<div className="flex"><div className="rounded-2xl rounded-tl-md bg-bg2 border border-line px-4 py-3 flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-mute animate-pulse" style={{animationDelay:i*.2+'s'}}/>)}</div></div>}</div>
  {img&&<div className="px-3 pt-2 border-t border-line bg-bg2 flex items-center gap-3"><img src={img} alt="Selected photo" className="h-14 w-14 rounded-lg object-cover"/><button onClick={()=>setImg(null)} className="text-xs text-mute hover:text-white">Remove</button></div>}
  {readOnly?<p className="p-4 text-center text-sm text-mute border-t border-line bg-bg2">Join this community to chat.</p>
  :<div className="flex items-center gap-2 p-3 border-t border-line bg-bg2"><input ref={file} type="file" accept="image/*" onChange={pickImg} className="hidden"/><button onClick={()=>file.current.click()} aria-label="Attach a photo" className="w-10 h-10 rounded-xl border border-line grid place-items-center text-mute hover:text-white shrink-0"><I n="image" s={18}/></button>
   <input value={t} onChange={e=>setT(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Message the group…" aria-label="Message" className="flex-1 min-w-0 rounded-xl bg-card border border-line px-4 py-3 text-sm outline-none focus:border-white/40"/>
   <button onClick={send} aria-label="Send" className={`rounded-xl px-4 py-3 bg-lime text-ink transition active:scale-95 ${t.trim()||img?'':'opacity-40 pointer-events-none'}`}><I n="send" s={17}/></button></div>}</div>}
