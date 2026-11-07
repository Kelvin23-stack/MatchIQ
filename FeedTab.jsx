import React,{useState,useContext,useEffect} from 'react'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {T} from './data'
import {rehydrate} from './liveMatch'
import {deriveRes} from './socialData'
import {compressImage} from './imageUtil'
import {I} from './Icon'
import {Btn} from './ui'
import {PostCard} from './PostCard'

export function Composer({club}){
 const {post}=useSocial();const {store}=useContext(Ctx);
 const [t,setT]=useState(''),[mid,setMid]=useState(''),[att,setAtt]=useState(false),[imgs,setImgs]=useState([]),[err,setErr]=useState('');const fileRef=React.useRef();
 const pick=async e=>{const fs=[...e.target.files].slice(0,4-imgs.length);e.target.value='';try{const out=await Promise.all(fs.map(f=>compressImage(f,900,.72)));setImgs(x=>[...x,...out].slice(0,4));setErr('')}catch(x){setErr(x.message)}};
 const mine=Object.values(store).map(p=>p.m&&rehydrate(p.m)).filter(Boolean),m=mid&&mine.find(x=>String(x.id)===String(mid)),sp=m&&store[m.id]&&(store[m.id].result||store[m.id].score)?store[m.id]:null;
 const submit=()=>{if(!t.trim()&&!imgs.length)return;const pred=att&&sp?{result:sp.result||deriveRes(sp.score),score:sp.score||null,conf:75}:undefined;post({text:t.trim(),images:imgs.length?imgs:undefined,club,matchId:m?m.id:undefined,match:m||undefined,pred,type:pred?'prediction':m?'reaction':'general'});setT('');setMid('');setAtt(false);setImgs([])};
 return <div className="rounded-2xl bg-card border border-line p-4">
  <textarea value={t} maxLength={280} onChange={e=>setT(e.target.value)} rows={2} placeholder={club?'Start a discussion with this community…':'Share a take, a prediction or a reaction…'} className="w-full resize-none bg-transparent outline-none text-[15px] placeholder:text-mute"/>
  <div className="flex flex-wrap items-center gap-2 mt-2 pt-3 border-t border-line">
   <select value={mid} onChange={e=>{setMid(e.target.value);setAtt(false)}} className="rounded-lg bg-bg2 border border-line px-2.5 py-2 text-xs outline-none max-w-[11rem]"><option value="">Attach a predicted match</option>{mine.map(f=><option key={f.id} value={f.id}>{T[f.h][0]} vs {T[f.a][0]}</option>)}</select>
   {m&&(sp?<button onClick={()=>setAtt(!att)} className={`rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${att?'border-lime bg-lime text-ink':'border-line text-mute hover:text-white'}`}>{att?'Prediction attached':'Attach my prediction'}</button>:<span className="text-[11px] text-mute">No prediction saved for this match</span>)}
   <span className="ml-auto text-[11px] text-mute">{t.length}/280</span><Btn onClick={submit} className={`!py-2 !px-4 ${t.trim()||imgs.length?'':'opacity-40 pointer-events-none'}`}>Post</Btn></div></div>}

const F=['All','Predictions','Reactions','Achievements','Discussion'],TY={Predictions:'prediction',Reactions:'reaction',Achievements:'achievement',Discussion:'general'};
export function FeedTab({club,readOnly}){
 const {posts,joined,botPost}=useSocial();
 useEffect(()=>{if(club)return;let n=0;const id=setInterval(()=>{if(n++<6)botPost()},38000);return()=>clearInterval(id)},[club]);const [f,setF]=useState('All'),[q,setQ]=useState('');
 const list=posts.filter(p=>club?p.club===club:(!p.club||joined.includes(p.club))).filter(p=>f==='All'||p.type===TY[f]).filter(p=>!q.trim()||(p.text+p.user).toLowerCase().includes(q.trim().toLowerCase()));
 return <div className="space-y-4">{!readOnly&&<Composer club={club}/>}
  <div className="flex flex-col sm:flex-row gap-3"><div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">{F.map(x=><button key={x} onClick={()=>setF(x)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${f===x?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`}>{x}</button>)}</div>
   <div className="relative sm:w-56"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={14}/></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search posts" className="w-full rounded-full bg-card border border-line pl-9 pr-3 py-2 text-xs outline-none focus:border-white/40"/></div></div>
  {list.length?list.map(p=><PostCard key={p.id} post={p}/>):<div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute text-sm"><I n="empty" s={26} c="mx-auto mb-2"/>No posts match your filters yet.</div>}</div>}
