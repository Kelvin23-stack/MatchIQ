import React,{useState,useContext} from 'react'
import {FIXTURES,T,COMPETITIONS,DATE_FILTERS} from './data'
import {Ctx} from './context'
import {I} from './Icon'
import {Crest,Btn} from './ui'
import {MatchCard,LeagueBadge} from './MatchCard'
import {CommBar} from './MatchDetail'
import night from './stadium-night.jpg'
import crowd from './stadium-crowd.jpg'

const Chips=({items,v,set})=><div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">{items.map(x=><button key={x} onClick={()=>set(x)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold border transition ${v===x?'bg-lime text-ink border-lime':'border-line text-mute hover:text-white hover:border-white/25'}`}>{x}</button>)}</div>
const Section=({t,n,live,children,empty})=><section className="mt-10"><h2 className="flex items-center gap-3 font-bold text-lg mb-4">{live&&<span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"/>}{t}<span className="text-xs font-semibold text-mute bg-card border border-line rounded-full px-2 py-0.5">{n}</span></h2>{n?<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>:empty}</section>

export function MatchCentre(){
 const {openPick,setDetail,store}=useContext(Ctx);
 const [lg,setLg]=useState('All Matches'),[df,setDf]=useState('All');
 const pass=m=>(lg==='All Matches'||m.lg===lg)&&(df==='All'||(df==='Today'?m.day===0:df==='Tomorrow'?m.day===1:m.day>=0&&m.day<=6));
 const list=st=>FIXTURES.filter(m=>m.st===st&&pass(m)).sort((a,b)=>a.day-b.day||a.time.localeCompare(b.time));
 const live=list('live'),up=list('upcoming'),ft=list('ft').reverse(),derbies=FIXTURES.filter(x=>x.derby&&x.st==='upcoming'&&pass(x));
 const f=FIXTURES.find(m=>m.id===2),showF=pass(f);
 const Empty=({t})=><div className="rounded-2xl border border-dashed border-line p-8 text-center text-mute text-sm"><I n="empty" s={24} c="mx-auto mb-2"/>{t}<div><button onClick={()=>{setLg('All Matches');setDf('All')}} className="mt-3 text-sky font-bold text-xs hover:underline">Clear filters</button></div></div>;
 return <div>
  <div className="scope-dark relative overflow-hidden rounded-3xl border border-white/10 mb-6"><img src={night} alt="A floodlit football pitch at night" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-75"/><div className="absolute inset-0 bg-gradient-to-r from-[#080B0A] via-[#080B0A]/70 to-transparent"/><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080B0A]/90 to-transparent"/><div className="relative p-6 sm:p-10 sm:py-14"><h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Explore Matches</h1><p className="text-white/70 mt-3 max-w-md">Find your matches. Make your predictions. Earn your points.</p></div></div>
  <div className="space-y-3"><Chips items={COMPETITIONS} v={lg} set={setLg}/><Chips items={DATE_FILTERS} v={df} set={setDf}/></div>
  {showF&&<div onClick={()=>setDetail(f)} className="relative overflow-hidden cursor-pointer mt-8 rounded-3xl border border-red-500/30 bg-gradient-to-br from-card via-card to-bg2 p-5 sm:p-8 transition hover:border-white/25"><img src={crowd} alt="" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-20"/><div className="absolute inset-0 pointer-events-none" style={{background:'radial-gradient(70% 90% at 85% 0%,rgba(239,68,68,.25),transparent 70%)'}}/>
   <div className="relative flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#fff] rounded-full px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 shadow-[0_0_18px_-4px_rgba(239,68,68,.9)]"><span className="flick"><I n="flame" s={14}/></span>HOT MATCH{f.derby?` · ${f.derby}`:''}</span><span className="flex items-center gap-2 text-xs text-mute"><LeagueBadge lg={f.lg}/>{f.lg}</span></div>
   <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-6 text-center"><div className="flex flex-col items-center gap-3"><Crest k={f.h} s={76}/><span className="font-extrabold sm:text-xl">{T[f.h][0]}</span></div><div><p className="text-mute font-bold">VS</p><p className="text-xs text-mute mt-1">{f.t}</p></div><div className="flex flex-col items-center gap-3"><Crest k={f.a} s={76}/><span className="font-extrabold sm:text-xl">{T[f.a][0]}</span></div></div>
   <div className="relative max-w-md mx-auto mt-7"><p className="text-xs text-mute text-center mb-2">Community predictions</p><CommBar m={f}/></div>
   <div className="relative flex flex-col sm:flex-row gap-3 justify-center mt-7"><Btn onClick={e=>{e.stopPropagation();openPick(f)}}>{store[f.id]?'Edit prediction':'Predict this match'}<I n="arrow" s={16}/></Btn><Btn v="s" onClick={e=>{e.stopPropagation();setDetail(f)}}>Match details</Btn></div></div>}
  <Section t="Live now" live n={live.length} empty={<Empty t="No live matches for this filter."/>}>{live.map(m=><MatchCard key={m.id} m={m}/>)}</Section>
  <Section t="Derby matches" n={derbies.length} empty={<Empty t="No derbies for this filter."/>}>{derbies.map(x=><div key={x.id} className="relative pt-3"><span className="absolute top-0 left-4 z-10 rounded-full bg-red-600 text-[#fff] text-[10px] font-extrabold px-2.5 py-1 shadow">{x.derby}</span><MatchCard m={x}/></div>)}</Section>
  <Section t="Upcoming fixtures" n={up.length} empty={<Empty t="No upcoming fixtures for this filter."/>}>{up.map(m=><MatchCard key={m.id} m={m}/>)}</Section>
  <Section t="Recently completed" n={ft.length} empty={<Empty t="No completed matches for this filter."/>}>{ft.map(m=><MatchCard key={m.id} m={m}/>)}</Section>
 </div>}
