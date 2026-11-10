import React,{useState,useEffect} from 'react'
import {useSocial} from './SocialContext'
import {FeedTab} from './FeedTab'
import {FriendsTab} from './FriendsTab'
import {ClubsTab} from './ClubsTab'
import {DiscussTab} from './DiscussTab'
import {GroupChat} from './GroupChat'
import {I} from './Icon'

const TABS=[['Feed','Community Feed'],['Lounge','Fan Lounge'],['Friends','Friends'],['Clubs','Club Communities'],['Discussions','Match Discussions']];
const LoungeTab=()=><GroupChat room="lounge" title="MatchIQ Fan Lounge" lead={<span className="w-10 h-10 rounded-full bg-lime text-ink grid place-items-center shrink-0"><I n="users" s={18}/></span>}/>;
const Skeleton=()=><div className="space-y-4">{[0,1,2].map(i=><div key={i} className="rounded-2xl bg-card border border-line p-5 animate-pulse"><div className="flex gap-3"><div className="w-10 h-10 rounded-full bg-bg2"/><div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-bg2"/><div className="h-3 w-1/5 rounded bg-bg2"/></div></div><div className="h-3 w-4/5 rounded bg-bg2 mt-4"/><div className="h-3 w-3/5 rounded bg-bg2 mt-2"/></div>)}</div>;
export function Community(){
 const {commTab:tab,setCommTab,friends,unread}=useSocial();const [loading,setLoading]=useState(true);
 useEffect(()=>{setLoading(true);const t=setTimeout(()=>setLoading(false),450);return()=>clearTimeout(t)},[tab]);
 const badge={Friends:friends.incoming.length};
 const View={Feed:FeedTab,Friends:FriendsTab,Clubs:ClubsTab,Discussions:DiscussTab,Lounge:LoungeTab}[tab];
 return <div>
  <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6 sm:p-9 mb-6"><div className="glow absolute inset-0 pointer-events-none"/><h1 className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">Football Is Better Together.</h1><p className="relative text-mute mt-3 max-w-xl">Connect with fans, discuss matches, challenge friends and share your predictions.</p></div>
  <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mb-6">{TABS.map(([k,l])=><button key={k} onClick={()=>setCommTab(k)} className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition flex items-center gap-2 ${tab===k?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{l}{badge[k]>0&&<span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[#fff] text-[10px] font-bold grid place-items-center">{badge[k]}</span>}</button>)}</div>
  <div key={tab} className="slide">{loading?<Skeleton/>:<div className={tab==='Feed'||tab==='Lounge'?'max-w-2xl':''}><View/></div>}</div></div>}
