import React,{useState,useContext} from 'react'
import {createPortal} from 'react-dom'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {ago,CAT,NMETA} from './socialData'
import {I} from './Icon'

export function NotificationItem({n,onClick}){const [ic,col]=NMETA[n.type];return <button onClick={onClick} className={`w-full text-left flex items-start gap-3 px-4 py-3 transition hover:bg-white/[0.04] ${n.read?'':'bg-white/[0.04]'}`}><span className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{background:col+'1f',color:col}}><I n={ic} s={16}/></span><span className="flex-1 min-w-0"><span className={`block text-sm leading-snug ${n.read?'text-mute':'text-white font-semibold'}`}>{n.text}</span><span className="text-[11px] text-mute">{CAT[n.type]} · {ago(n.at)}</span></span>{!n.read&&<span className="w-2 h-2 rounded-full bg-sky mt-2 shrink-0"/>}</button>}

export function NotificationBell(){
 const {notifs,markAll,markRead,openTab}=useSocial();const {nav}=useContext(Ctx);const [open,setOpen]=useState(false),[cat,setCat]=useState('All');
 const un=notifs.filter(n=>!n.read).length,list=notifs.filter(n=>cat==='All'||CAT[n.type]===cat);
 const click=n=>{markRead(n.id);setOpen(false);({friend_request:()=>openTab('Friends'),like:()=>openTab('Feed'),comment:()=>openTab('Feed'),challenge:()=>openTab('Messages'),correct:()=>nav('competition'),badge:()=>nav('competition'),match_soon:()=>nav('matches')})[n.type]()};
 return <><button onClick={()=>setOpen(!open)} className="relative w-9 h-9 rounded-full bg-white/10 backdrop-blur border border-white/15 grid place-items-center text-mute hover:text-white transition"><I n="bell" s={16}/>{un>0&&<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[#fff] text-[10px] font-bold grid place-items-center">{un}</span>}</button>
 {open&&createPortal(<><div className="fixed inset-0 z-[55]" onClick={()=>setOpen(false)}/><div className="pop fixed z-[56] inset-x-3 sm:inset-x-auto sm:right-8 sm:w-[24rem] rounded-2xl bg-bg2 border border-line shadow-2xl overflow-hidden" style={{top:'calc(4.25rem + env(safe-area-inset-top,0px))'}}>
  <div className="flex items-center justify-between px-4 py-3 border-b border-line"><p className="font-bold">Notifications</p><button onClick={markAll} className={`text-xs font-semibold text-sky hover:underline ${un?'':'opacity-40 pointer-events-none'}`}>Mark all as read</button></div>
  <div className="flex gap-1.5 px-3 py-2 border-b border-line overflow-x-auto no-scrollbar">{['All','Social','Predictions','Matches'].map(c=><button key={c} onClick={()=>setCat(c)} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold border transition ${cat===c?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`}>{c}</button>)}</div>
  <div className="max-h-[60vh] overflow-y-auto divide-y divide-line">{list.length?list.map(n=><NotificationItem key={n.id} n={n} onClick={()=>click(n)}/>):<p className="p-8 text-center text-sm text-mute">Nothing here yet.</p>}</div></div></>,document.body)}</>}
