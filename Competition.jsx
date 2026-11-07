import React,{useState} from 'react'
import {I} from './Icon'
import {Leaderboard} from './Leaderboard'
import {Leagues} from './Leagues'
import {Badges} from './Badges'
import {XpCard,PointsXp,Streaks} from './Progress'
import {useSocial} from './SocialContext'
import {useEffect} from 'react'

const TABS=['Global','Weekly','Monthly','Friends','Private Leagues'];
const SECS=[['lb','Leaderboard'],['xp','Points & XP'],['st','Streaks'],['ac','Achievements']];
const H=({id,t,sub})=><div id={'c-'+id} className="mb-4 scroll-mt-24"><h2 className="text-xl sm:text-2xl font-extrabold">{t}</h2>{sub&&<p className="text-sm text-mute mt-1">{sub}</p>}</div>;

export function Competition({section}){
 const [tab,setTab]=useState('Global');const {openUser}=useSocial();
 useEffect(()=>{if(section)setTimeout(()=>document.getElementById('c-'+section)?.scrollIntoView({behavior:'smooth'}),200)},[section]);
 const go=id=>document.getElementById('c-'+id)?.scrollIntoView({behavior:'smooth'});
 return <div>
  <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-6 sm:p-9 mb-6"><div className="glow absolute inset-0 pointer-events-none"/>
   <h1 className="relative text-3xl sm:text-5xl font-extrabold tracking-tight">Prove Your Football Knowledge.</h1>
   <p className="relative text-mute mt-3 max-w-xl">Every prediction counts. Every point brings you closer to the top.</p></div>
  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">{SECS.map(([id,l])=><button key={id} onClick={()=>go(id)} className="whitespace-nowrap text-xs font-semibold text-mute border border-line rounded-full px-3.5 py-1.5 hover:text-white hover:border-white/30 transition">{l}</button>)}</div>
  <div className="grid xl:grid-cols-3 gap-6 items-start"><div id="c-lb" className="xl:col-span-2 min-w-0 scroll-mt-24">
   <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mb-5">{TABS.map(t=><button key={t} onClick={()=>setTab(t)} className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${tab===t?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{t}</button>)}</div>
   <div key={tab} className="slide">{tab==='Private Leagues'?<Leagues onUser={openUser}/>:<Leaderboard kind={tab.toLowerCase()} onUser={openUser}/>}</div></div>
   <div className="space-y-4 xl:sticky xl:top-24"><XpCard/><button onClick={()=>go('st')} className="w-full text-left rounded-2xl border border-flame/25 bg-gradient-to-br from-flame/15 to-card p-5 flex items-center gap-4 hover:border-flame/50 transition"><span className="flick text-flame"><I n="flame" s={34}/></span><div><p className="text-3xl font-extrabold leading-none">5</p><p className="text-xs text-mute mt-1">prediction streak · view details</p></div></button></div></div>
  <section className="mt-14"><H id="xp" t="Points & XP" sub="Points rank you against others. XP levels you up."/><PointsXp/></section>
  <section className="mt-14"><H id="st" t="Prediction streaks" sub="Back-to-back correct calls unlock milestone badges."/><Streaks/></section>
  <section className="mt-14 pb-4"><H id="ac" t="Achievements" sub="Tap a badge to see how to unlock it."/><Badges/></section>
 </div>}
