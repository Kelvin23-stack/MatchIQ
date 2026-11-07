import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {T} from './data'
import {rehydrate} from './liveMatch'
import {ME,ini,flag} from './compData'
import {userOf,lvl,ago,shareOut} from './socialData'
import {I} from './Icon'
import {Av,Crest} from './ui'
import {BadgeIcon} from './Badges'
import {Confirm} from './Confirm'
import {Sheet} from './Sheet'
import {PredictionShareCard} from './ShareModal'

export function CommentSection({post}){
 const {addComment,openUser}=useSocial();const [t,setT]=useState('');
 const sub=()=>{if(!t.trim())return;addComment(post.id,t.trim());setT('')};
 return <div className="mt-3 pt-3 border-t border-line">
  {post.comments.length?<div className="space-y-3 mb-3">{post.comments.map(c=><div key={c.id} className="flex gap-2.5"><button onClick={()=>openUser(c.user)} aria-label={`Open ${c.user}'s profile`}><Av t={ini(c.user)} s={28} me={c.user===ME.name}/></button><div className="rounded-2xl bg-bg2 border border-line px-3 py-2 min-w-0"><p className="text-xs font-bold">{c.user} <span className="text-mute font-normal">· {ago(c.at)}</span></p><p className="text-sm break-words">{c.text}</p></div></div>)}</div>:<p className="text-xs text-mute mb-3">No comments yet. Start the conversation.</p>}
  <div className="flex gap-2"><input value={t} onChange={e=>setT(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sub()} placeholder="Write a comment…" className="flex-1 min-w-0 rounded-xl bg-bg2 border border-line px-3.5 py-2.5 text-sm outline-none focus:border-white/40"/><button onClick={sub} className={`rounded-xl px-3.5 bg-lime text-ink transition ${t.trim()?'':'opacity-40 pointer-events-none'}`}><I n="send" s={16}/></button></div></div>}

const TAG={prediction:['Prediction','text-sky bg-sky/10 border-sky/25'],reaction:['Match reaction','text-flame bg-flame/10 border-flame/25'],achievement:['Achievement','text-gold bg-gold/10 border-gold/25'],general:['Discussion','text-mute bg-white/5 border-line']};
export function PostCard({post}){
 const {toggleLike,deletePost,sharePost,openUser}=useSocial();const {toast,setDetail}=useContext(Ctx);
 const [open,setOpen]=useState(false),[del,setDel]=useState(false),[view,setView]=useState(null);
 const u=userOf(post.user),liked=post.likes.includes(ME.name),m=post.match?rehydrate(post.match):null,tag=TAG[post.type]||TAG.general;
 const share=async()=>{const r=await shareOut(`${post.user} on MatchIQ: ${post.text}`,'MatchIQ post');sharePost(post.id);toast(r==='shared'?'Post shared':r==='copied'?'Post text copied to clipboard':'Could not share this post')};
 return <article className={`up rounded-2xl bg-card border border-line p-4 sm:p-5 ${post.fresh?"fresh":""}`}>
  <div className="flex items-start gap-3"><button onClick={()=>openUser(post.user)} aria-label={`Open ${post.user}'s profile`}><Av t={ini(post.user)} s={40} me={u.me}/></button>
   <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-x-2 gap-y-0.5"><button onClick={()=>openUser(post.user)} className="font-bold text-sm hover:underline">{post.user}</button><span className="text-[10px] font-bold text-mute border border-line rounded px-1.5 py-0.5">LV {lvl(u)}</span><span className="text-xs">{flag(u.cc)}</span></div><p className="text-xs text-mute">{ago(post.at)}</p></div>
   <span className={`hidden sm:inline text-[10px] font-bold border rounded-full px-2.5 py-1 ${tag[1]}`}>{tag[0]}</span>
   {post.user===ME.name&&<button onClick={()=>setDel(true)} title="Delete post" className="text-mute hover:text-red-400 p-1"><I n="trash" s={16}/></button>}</div>
  {post.text&&<p className="mt-3 text-[15px] leading-relaxed break-words">{post.text}</p>}
  {post.images&&post.images.length>0&&<div className={`mt-3 grid gap-1.5 rounded-2xl overflow-hidden ${post.images.length>1?'grid-cols-2':''}`}>{post.images.map((src,i)=><button key={i} onClick={()=>setView(src)} aria-label="View photo" className="block bg-bg2"><img src={src} alt={`Photo ${i+1} shared by ${post.user}`} className="w-full h-full max-h-80 object-cover"/></button>)}</div>}
  {post.badge&&<div className="mt-3 flex items-center gap-3 rounded-xl bg-bg2 border border-line p-3"><BadgeIcon icon={post.badge.icon} color={post.badge.color} s={44}/><div><p className="text-[10px] uppercase tracking-wider text-mute">Badge unlocked</p><p className="font-bold text-sm">{post.badge.name}</p></div></div>}
  {m&&!post.pred&&<button onClick={()=>setDetail(m)} className="mt-3 flex items-center gap-2 rounded-xl bg-bg2 border border-line px-3 py-2 text-xs font-semibold hover:border-white/25 transition"><Crest k={m.h} s={22}/>{T[m.h][0]} vs {T[m.a][0]}<Crest k={m.a} s={22}/><span className="text-mute font-normal ml-1">{m.st==='live'&&m.hasScore?`LIVE ${m.sc[0]}–${m.sc[1]}`:m.t}</span></button>}
  {m&&post.pred&&<div className="mt-3"><PredictionShareCard user={u} m={m} pred={post.pred} conf={post.pred.conf||75} compact/></div>}
  <div className="flex items-center gap-1 mt-4 -mx-2">
   <button onClick={()=>toggleLike(post.id)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition hover:bg-white/5 ${liked?'text-red-400':'text-mute'}`}><I n="heart" s={17} fill={liked}/>{post.likes.length}</button>
   <button onClick={()=>setOpen(!open)} className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition hover:bg-white/5 ${open?'text-white':'text-mute'}`}><I n="comment" s={17}/>{post.comments.length}</button>
   <button onClick={share} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-mute transition hover:bg-white/5 hover:text-white"><I n="share" s={17}/>{post.shares||''}</button></div>
  {open&&<CommentSection post={post}/>}
  {view&&<Sheet title="Photo" wide onClose={()=>setView(null)}><img src={view} alt={`Photo shared by ${post.user}`} className="w-full rounded-xl"/></Sheet>}
  {del&&<Confirm title="Delete this post?" body="This will remove your post and its comments from the feed." label="Delete" onConfirm={()=>deletePost(post.id)} onClose={()=>setDel(false)}/>}
 </article>}
