import React,{useState} from 'react'
import {useSocial} from './SocialContext'
import {CLUBS} from './socialData'
import {I} from './Icon'
import {Crest} from './ui'
import {CommunityCard} from './CommunityCard'
import {Confirm} from './Confirm'
import {FeedTab} from './FeedTab'
import {GroupChat} from './GroupChat'

export function ClubsTab(){
 const {joined,joinClub,leaveClub}=useSocial();const [open,setOpen]=useState(null),[lv,setLv]=useState(null),[ct,setCt]=useState('Posts');
 const toggle=c=>joined.includes(c)?setLv(c):joinClub(c);
 const club=open&&CLUBS.find(c=>c[0]===open),on=open&&joined.includes(open);
 return <div>
  {club?<div><button onClick={()=>setOpen(null)} className="flex items-center gap-2 text-sm text-mute hover:text-white mb-4"><I n="back" s={16}/>All communities</button>
   <div className="rounded-2xl border border-line bg-gradient-to-br from-card to-bg2 p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-5"><Crest k={club[0]} s={64}/><div className="flex-1 min-w-0"><h2 className="text-xl font-extrabold">{club[1]} Community</h2><p className="text-sm text-mute mt-1">{club[2]}</p><p className="text-xs text-mute mt-2">{(club[3]+(on?1:0)).toLocaleString()} members</p></div>
    <button onClick={()=>toggle(open)} className={`rounded-xl px-6 py-2.5 text-sm font-bold transition active:scale-95 ${on?'border border-line hover:border-red-400/50 hover:text-red-400':'bg-lime text-ink hover:brightness-110'}`}>{on?'Joined':'Join'}</button></div>
   <div role="tablist" className="flex gap-1 border-b border-line mb-5">{['Posts','Group chat'].map(x=><button key={x} role="tab" aria-selected={ct===x} onClick={()=>setCt(x)} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${ct===x?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{x}</button>)}</div>
   {ct==='Group chat'?<GroupChat key={open} room={open} club={open} readOnly={!on} title={club[1]+' group'} lead={<Crest k={open} s={40}/>}/>:on?<FeedTab club={open}/>:<><div className="rounded-xl bg-white/5 border border-line px-4 py-3 text-sm text-mute mb-4">Join this community to post. You can read the discussions below.</div><FeedTab club={open} readOnly/></>}</div>
  :<><p className="text-sm text-mute mb-5">{joined.length} joined · open a community to see its discussions.</p><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{CLUBS.map(c=><CommunityCard key={c[0]} c={c} onOpen={setOpen} onToggle={toggle}/>)}</div></>}
  {lv&&<Confirm title="Leave this community?" body="Its posts will disappear from your main feed. You can rejoin at any time." label="Leave" onConfirm={()=>leaveClub(lv)} onClose={()=>setLv(null)}/>}</div>}
