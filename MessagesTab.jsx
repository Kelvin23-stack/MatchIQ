import React,{useState,useEffect} from 'react'
import {createPortal} from 'react-dom'
import {useSocial} from './SocialContext'
import {I} from './Icon'
import {ConversationList,ChatWindow} from './Chat'

const useMobile=()=>{const q='(max-width:1023px)';const [m,setM]=useState(()=>matchMedia(q).matches);useEffect(()=>{const mq=matchMedia(q),f=()=>setM(mq.matches);mq.addEventListener('change',f);return()=>mq.removeEventListener('change',f)},[]);return m};
export function MessagesTab(){
 const {convos,friends,unread,chatWith,clearChat}=useSocial();const [active,setActive]=useState(null),mobile=useMobile();
 useEffect(()=>{if(chatWith){setActive(chatWith);clearChat()}},[chatWith]);
 const names=[...new Set([...Object.keys(convos),...friends.friends])];
 const items=names.map(n=>{const l=(convos[n]||[]).slice(-1)[0];return{name:n,last:l,unread:unread[n]||0}}).sort((a,b)=>(b.last?.at||0)-(a.last?.at||0));
 const chat=active&&<ChatWindow name={active} onBack={()=>setActive(null)}/>;
 return active
  ?(mobile?createPortal(<div className="fixed inset-0 z-[60] bg-bg text-white">{chat}</div>,document.body):<div className="rounded-2xl border border-line bg-card overflow-hidden h-[calc(100vh-9rem)] min-h-[480px]">{chat}</div>)
  :<div className="rounded-2xl border border-line bg-card overflow-hidden max-w-3xl h-[calc(100dvh-13rem)] lg:h-[70vh]"><ConversationList items={items} active={active} onSelect={setActive}/></div>}
