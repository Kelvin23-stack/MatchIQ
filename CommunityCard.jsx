import React from 'react'
import {T} from './data'
import {useSocial} from './SocialContext'
import {I} from './Icon'
import {Crest,Btn} from './ui'

export function CommunityCard({c,onOpen,onToggle}){
 const [code,name,desc,members]=c,{posts,joined}=useSocial(),on=joined.includes(code),recent=posts.filter(p=>p.club===code).slice(0,2);
 return <div onClick={()=>onOpen(code)} className="cursor-pointer rounded-2xl bg-card border border-line p-5 flex flex-col transition hover:border-white/25 hover:-translate-y-1">
  <div className="flex items-center gap-3"><Crest k={code} s={52}/><div className="min-w-0"><p className="font-bold truncate">{name}</p><p className="text-xs text-mute flex items-center gap-1"><I n="users" s={12}/>{(members+(on?1:0)).toLocaleString()} members</p></div></div>
  <p className="text-sm text-mute mt-3 leading-snug">{desc}</p>
  <div className="mt-3 space-y-1.5 flex-1">{recent.map(p=><p key={p.id} className="text-xs text-mute truncate border-l-2 pl-2" style={{borderColor:T[code][1]}}>{p.text}</p>)}</div>
  <button onClick={e=>{e.stopPropagation();onToggle(code)}} className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold transition active:scale-95 ${on?'border border-line text-white hover:border-red-400/50 hover:text-red-400':'bg-lime text-ink hover:brightness-110'}`}>{on?'Joined':'Join'}</button></div>}
