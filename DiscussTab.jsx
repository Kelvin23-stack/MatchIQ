import React,{useState} from 'react'
import {useSocial} from './SocialContext'
import {T} from './data'
import {Crest} from './ui'
import {I} from './Icon'
import {StatusPill} from './MatchCard'
import {MatchDiscussionRoom} from './MatchDiscussionRoom'
import {useMatches,useLeagueParam,dayStr} from './liveMatch'
import {CompetitionChips} from './LiveMatches'
import {Async} from './LiveBits'
import {Empty} from './PlayerBits'

const F=['All','Live','Upcoming','Completed'],MAPF={Live:'live',Upcoming:'upcoming',Completed:'ft'},ORD={live:0,upcoming:1,ft:2,off:3};
// Discussion rooms exist for today's real matches (same request as Match Centre, so it is served from cache).
export function DiscussTab(){
 const {disc}=useSocial();const lp=useLeagueParam();const [f,setF]=useState('All'),[open,setOpen]=useState(null);
 const r=useMatches({date:dayStr(0),...lp},{ttl:300000});
 if(open)return <MatchDiscussionRoom m={open} onBack={()=>setOpen(null)}/>;
 const list=r.list.filter(m=>f==='All'||m.st===MAPF[f]).sort((a,b)=>ORD[a.st]-ORD[b.st]||(a.ts||0)-(b.ts||0));
 return <div><CompetitionChips/><div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">{F.map(x=><button key={x} onClick={()=>setF(x)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${f===x?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white'}`}>{x}</button>)}</div>
  <Async s={r} banner={false}>{list.length?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{list.map(m=><button key={m.id} onClick={()=>setOpen(m)} className="text-left rounded-2xl bg-card border border-line p-4 transition hover:border-white/25 hover:-translate-y-1">
   <div className="flex items-center justify-between mb-3 text-xs text-mute"><span className="truncate">{m.lg}</span><StatusPill m={m}/></div>
   <div className="flex items-center gap-3"><Crest k={m.h} s={38}/><div className="flex-1 min-w-0 text-sm font-bold leading-tight">{T[m.h][0]}<br/>{T[m.a][0]}</div><Crest k={m.a} s={38}/>{m.st!=='upcoming'&&m.hasScore&&<span className="text-xl font-extrabold tabular-nums">{m.sc[0]}–{m.sc[1]}</span>}</div>
   <p className="mt-3 text-xs text-mute flex items-center gap-1.5"><I n="comment" s={13}/>{(disc[m.id]||[]).length} messages · open the room</p></button>)}</div>:<Empty title="No matches today" body="Discussion rooms open for the matches the data provider lists today."/>}</Async></div>}
