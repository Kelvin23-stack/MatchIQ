import React from 'react'
import {useSocial} from './SocialContext'
import {T} from './data'
import {ini,flag} from './compData'
import {userOf,online,lvl} from './socialData'
import {Av,Crest,Btn} from './ui'

export const OnlineAv=({u,s=44})=><div className="relative shrink-0"><Av t={ini(u.name)} s={s} me={u.me}/><span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${online(u)?'bg-emerald-400':'bg-[#5b665e]'}`}/></div>;
export function UserCard({u,children}){const {openUser}=useSocial();return <div className="rounded-2xl bg-card border border-line p-4 flex flex-col gap-4 transition hover:border-white/25">
 <button onClick={()=>openUser(u.name)} aria-label={`Open ${u.name}'s profile`} className="flex items-center gap-3 text-left"><OnlineAv u={u}/><div className="min-w-0"><p className="font-bold text-sm truncate">{u.name} <span className="font-normal">{flag(u.cc)}</span></p><p className="text-xs text-mute">{online(u)?'Online now':'Offline'} · LV {lvl(u)}</p></div></button>
 <div className="flex items-center justify-between text-xs text-mute"><span className="flex items-center gap-1.5"><Crest k={u.club} s={20}/>{T[u.club][0]}</span><span><b className="text-gold">{u.points.toLocaleString()}</b> pts</span></div>
 <div className="flex gap-2">{children}</div></div>}
export function FriendRequestCard({u,onAccept,onReject}){return <UserCard u={u}><Btn onClick={onAccept} className="flex-1 !py-2.5">Accept</Btn><Btn v="s" onClick={onReject} className="flex-1 !py-2.5">Reject</Btn></UserCard>}
