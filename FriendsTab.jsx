import React,{useState} from 'react'
import {useSocial} from './SocialContext'
import {ALL} from './compData'
import {I} from './Icon'
import {Btn} from './ui'
import {UserCard,FriendRequestCard} from './UserCards'
import {Confirm} from './Confirm'

const SUB=['My Friends','Requests','Suggested','Find Friends'];
export function FriendsTab(){
 const {friends,sendReq,cancel,accept,reject,remove,openChat}=useSocial();const [sub,setSub]=useState('My Friends'),[q,setQ]=useState(''),[rm,setRm]=useState(null);
 const others=ALL.filter(u=>!u.me),st=n=>friends.friends.includes(n)?'friend':friends.incoming.includes(n)?'in':friends.sent.includes(n)?'sent':'none',s=q.trim().toLowerCase();
 const lists={'My Friends':others.filter(u=>st(u.name)==='friend'&&u.name.toLowerCase().includes(s)),'Requests':others.filter(u=>st(u.name)==='in'),'Suggested':others.filter(u=>st(u.name)==='none').slice(0,6),'Find Friends':others.filter(u=>u.name.toLowerCase().includes(s))};
 const list=lists[sub];
 const act=u=>({friend:<><Btn onClick={()=>openChat(u.name)} className="flex-1 !py-2.5"><I n="comment" s={14}/>Message</Btn><Btn v="s" onClick={()=>setRm(u.name)} className="!py-2.5 !px-3" title="Remove friend"><I n="usermin" s={15}/></Btn></>,
  in:<><Btn onClick={()=>accept(u.name)} className="flex-1 !py-2.5">Accept</Btn><Btn v="s" onClick={()=>reject(u.name)} className="flex-1 !py-2.5">Reject</Btn></>,
  sent:<Btn v="s" onClick={()=>cancel(u.name)} className="flex-1 !py-2.5">Pending · Cancel</Btn>,
  none:<Btn onClick={()=>sendReq(u.name)} className="flex-1 !py-2.5"><I n="userplus" s={15}/>Add friend</Btn>})[st(u.name)];
 return <div>
  <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mb-5">{SUB.map(x=><button key={x} onClick={()=>{setSub(x);setQ('')}} className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition flex items-center gap-2 ${sub===x?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{x}{x==='Requests'&&friends.incoming.length>0&&<span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[#fff] text-[10px] font-bold grid place-items-center">{friends.incoming.length}</span>}</button>)}</div>
  {(sub==='My Friends'||sub==='Find Friends')&&<div className="relative mb-5 max-w-md"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute"><I n="search" s={16}/></span><input value={q} onChange={e=>setQ(e.target.value)} placeholder={sub==='Find Friends'?'Search all MatchIQ players…':'Search your friends…'} className="w-full rounded-xl bg-card border border-line pl-10 pr-4 py-3 text-sm outline-none focus:border-white/40"/></div>}
  {list.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{list.map(u=>sub==='Requests'?<FriendRequestCard key={u.name} u={u} onAccept={()=>accept(u.name)} onReject={()=>reject(u.name)}/>:<UserCard key={u.name} u={u}>{act(u)}</UserCard>)}</div>
  :<div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute text-sm"><I n="users" s={26} c="mx-auto mb-2"/>{sub==='Requests'?'No pending friend requests.':sub==='My Friends'?'No friends match. Try Suggested or Find Friends.':'No players found.'}</div>}
  {rm&&<Confirm title={`Remove ${rm}?`} body="You will no longer see them in your friends list. You can send a new request later." label="Remove friend" onConfirm={()=>remove(rm)} onClose={()=>setRm(null)}/>}</div>}
