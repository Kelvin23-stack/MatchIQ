import React,{useState,useEffect,useContext,useMemo} from 'react'
import {motion,useScroll,useTransform,useSpring,useReducedMotion} from 'framer-motion'
import {Ctx} from './context'
import {useAuth} from './AuthContext'
import {T,LG} from './data'
import {useMatchDays,useNextMatches,dayStr} from './liveMatch'
import {Async} from './LiveBits'
import {board,flag,ini} from './compData'
import {SEED_POSTS,userOf} from './socialData'
import {I} from './Icon'
import {Crest,Av,Logo,Btn,Count} from './ui'
import {LeagueBadge} from './MatchCard'
import {BadgeIcon} from './Badges'
import night from './stadium-night.jpg'
import crowd from './stadium-crowd.jpg'

// Demonstration figures only. Replace with real statistics when the backend exists.
export const STATS=[['Football fans',48000,'+'],['Predictions made',1200000,''],['Prediction accuracy',76,'%']];
const NAV=[['Home','top'],['Matches','matches'],['How It Works','how'],['Leaderboard','board']];
const DAYS={Today:()=>dayStr(0),Tomorrow:()=>dayStr(1),Upcoming:null};
const FAQ=[['Is MatchIQ free to play?','Yes. MatchIQ uses virtual points only. There is no real-money gambling.'],['How are points calculated?','10 points for a correct result, 30 for an exact score (not added on top), and 5 for a correct special market such as Over/Under.'],['Can I play with friends?','Create a private league, share the invitation code, and compete on your own leaderboard.'],['Are the scores and fixtures real?','Not yet. Fixtures, live scores and statistics on this page are demonstration data until a football data provider is connected.'],['What are XP and levels?','Points rank you against others. XP is separate: it grows as you play and raises your level.']];
const smooth=id=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};

function Reveal({children,delay=0,className='',y=26}){const r=useReducedMotion();if(r)return <div className={className}>{children}</div>;return <motion.div className={className} initial={{opacity:0,y}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-60px'}} transition={{duration:.6,delay,ease:[.2,.7,.2,1]}}>{children}</motion.div>}
const Eyebrow=({children,c='text-lime'})=><p className={`text-xs font-extrabold uppercase tracking-[.18em] ${c}`}>{children}</p>;
const Demo=({children='Demo data'})=><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-mute border border-line rounded-full px-2.5 py-1"><I n="info" s={11}/>{children}</span>;

function MiniStat({className='',children,delay=0}){return <div style={{animationDelay:delay+'s'}} className={`flt rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl p-3 sm:p-4 shadow-2xl ${className}`}>{children}</div>}

function Hero({start,go}){
 const {openPick}=useContext(Ctx);const reduce=useReducedMotion();const {scrollY}=useScroll();const y=useTransform(scrollY,[0,700],[0,reduce?0:120]);const [pick,setPick]=useState('H');const up=useNextMatches(1),m=up.list[0];
 return <section id="top" className="scope-dark relative overflow-hidden">
  <motion.img src={night} alt="A floodlit football stadium at night" fetchPriority="high" decoding="async" style={{y}} className="absolute inset-x-0 top-0 w-full h-[118%] object-cover opacity-70"/>
  <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-bg/10"/><div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-bg/50"/>
  <div className="relative max-w-6xl mx-auto px-5 pt-12 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
   <div className="up">
    <Eyebrow>YOUR GAME. YOUR PREDICTIONS.</Eyebrow>
    <h1 className="mt-5 text-4xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.04] tracking-tight">Your Football <span className="text-lime">Knowledge.</span> Your Time to <span className="text-lime">Shine.</span></h1>
    <p className="mt-5 text-lg text-white/70 max-w-lg">Predict the biggest matches, build unstoppable streaks, and compete with football fans around the world.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Btn onClick={start}>Start Predicting<I n="arrow" s={16}/></Btn><Btn v="s" onClick={()=>go('matches')}>Explore Matches</Btn></div>
    <div className="mt-10 grid grid-cols-3 gap-4 max-w-md border-t border-white/10 pt-6">{STATS.map(([l,n,s])=><div key={l}><p className="text-2xl sm:text-3xl font-extrabold tabular-nums"><Count to={n} suffix={s}/></p><p className="text-xs text-white/60 mt-1">{l}</p></div>)}</div>
    <p className="text-[11px] text-white/40 mt-3">Demonstration statistics.</p></div>
   <div className="relative lg:h-[500px]">
    <div className="relative lg:absolute lg:left-2 lg:right-6 lg:top-14 rounded-3xl border border-white/10 bg-card/85 backdrop-blur-xl p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
     {m?<><div className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-white/70"><LeagueBadge lg={m.lg}/>{m.lg}</span><span className="flex items-center gap-1.5 text-white/60"><I n="clock" s={12}/>{m.t}</span></div>
     <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-5 text-center"><div className="flex flex-col items-center gap-2"><Crest k={m.h} s={60}/><span className="font-bold text-sm">{T[m.h][0]}</span></div><span className="text-white/50 font-bold">VS</span><div className="flex flex-col items-center gap-2"><Crest k={m.a} s={60}/><span className="font-bold text-sm">{T[m.a][0]}</span></div></div>
     <div className="grid grid-cols-3 gap-2 mt-5" role="group" aria-label="Pick a result">{[['H','Home Win'],['D','Draw'],['A','Away Win']].map(([k,l])=><button key={k} aria-pressed={pick===k} onClick={()=>setPick(k)} className={`rounded-xl border py-2.5 text-xs font-bold transition active:scale-95 ${pick===k?'bg-lime text-ink border-lime':'border-white/15 bg-white/5 hover:border-white/40'}`}>{l}</button>)}</div>
     <Btn onClick={()=>openPick(m)} className="w-full mt-4 !py-2.5">Lock in prediction</Btn></>:<p className="text-center text-sm text-white/60 py-10">{up.loading?'Loading the next fixture…':'Upcoming fixtures from the data provider appear here.'}</p>}</div>
    <div className="mt-3 grid grid-cols-3 gap-2 lg:mt-0 lg:contents">
     <MiniStat className="lg:absolute lg:right-0 lg:top-0"><p className="text-[11px] text-white/60">Accuracy</p><p className="text-2xl font-extrabold text-emerald-400">76%</p><div className="h-1 rounded-full bg-white/10 mt-1.5"><div className="h-full w-3/4 rounded-full bg-emerald-400"/></div></MiniStat>
     <MiniStat delay={-2} className="lg:absolute lg:left-0 lg:bottom-4"><p className="text-[11px] text-white/60 flex items-center gap-1"><span className="text-flame"><I n="flame" s={12}/></span>Streak</p><p className="text-2xl font-extrabold text-flame">5</p><p className="text-[10px] text-white/50">in a row</p></MiniStat>
     <MiniStat delay={-4} className="lg:absolute lg:right-3 lg:bottom-0"><p className="text-[11px] text-white/60 flex items-center gap-1"><span className="text-gold"><I n="trophy" s={12}/></span>Rank</p><p className="text-2xl font-extrabold">#12</p><p className="text-[10px] text-emerald-400 flex items-center gap-0.5"><I n="up" s={11}/>2 places</p></MiniStat></div>
   </div></div></section>}

function Ticker(){const items=Object.keys(LG);const row=[...items,...items].map((l,i)=><span key={i} className="flex items-center gap-2.5 text-sm font-semibold text-mute whitespace-nowrap px-6"><LeagueBadge lg={l} s={22}/>{l}<span className="text-line">•</span></span>);
 return <div className="border-y border-line bg-bg2 overflow-hidden py-3.5" aria-hidden="true"><div className="marq flex">{row}{row}</div></div>}

function FixtureCard({m,pick,onPick,onLock}){return <div className="rounded-2xl border border-line bg-card overflow-hidden flex flex-col transition hover:border-white/25 hover:-translate-y-1">
 <div className="px-4 pt-4 pb-4" style={{background:`linear-gradient(135deg,${T[m.h][1]}24,transparent 55%,${T[m.a][1]}24)`}}>
  <div className="flex items-center justify-between text-[11px] text-mute"><span className="flex items-center gap-1.5 min-w-0"><LeagueBadge lg={m.lg} s={20}/><span className="truncate">{m.lg}</span></span><span className="font-bold text-sky">Upcoming</span></div>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-4 text-center"><div className="flex flex-col items-center gap-2 min-w-0"><Crest k={m.h} s={48}/><span className="text-xs font-bold leading-tight">{T[m.h][0]}</span></div><span className="text-[10px] font-bold text-mute">VS</span><div className="flex flex-col items-center gap-2 min-w-0"><Crest k={m.a} s={48}/><span className="text-xs font-bold leading-tight">{T[m.a][0]}</span></div></div>
  <p className="text-center text-xs text-mute mt-3 flex items-center justify-center gap-1.5"><I n="clock" s={12}/>{m.t}</p></div>
 <div className="p-4 pt-3 mt-auto"><div className="grid grid-cols-3 gap-1.5" role="group" aria-label={`Pick a result for ${T[m.h][0]} vs ${T[m.a][0]}`}>{[['H','Home Win',m.h],['D','Draw','X'],['A','Away Win',m.a]].map(([k,l,c])=><button key={k} aria-pressed={pick===k} onClick={()=>onPick(k)} className={`rounded-xl border py-2 text-[11px] font-bold leading-tight transition active:scale-95 ${pick===k?'bg-lime text-ink border-lime':'border-line bg-bg2 hover:border-white/40'}`}><span className="block text-[9px] opacity-60">{c}</span>{l}</button>)}</div>
  <button onClick={onLock} className={`mt-2.5 w-full rounded-xl py-2.5 text-xs font-bold transition ${pick?'bg-white/10 border border-white/20 hover:bg-white/15':'text-mute hover:text-white border border-transparent'}`}>{pick?'Lock in prediction':'Explore more markets'}</button></div></div>}

function Matches(){
 const {openPick}=useContext(Ctx);const [tab,setTab]=useState('Today'),[picks,setPicks]=useState({});
 const day=DAYS[tab],byDay=useMatchDays(day?[day()]:[],{enabled:!!day,ttl:300000}),next=useNextMatches(4,{enabled:!day}),r=day?byDay:next,list=r.list.filter(m=>m.st==='upcoming').slice(0,4);
 return <section id="matches" className="max-w-6xl mx-auto px-5 py-20">
  <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"><div><Eyebrow>Featured fixtures</Eyebrow><h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3">Big Matches. <span className="text-mute">Bigger Predictions.</span></h2></div>
   <div role="tablist" aria-label="Matchday" className="inline-flex self-start md:self-auto rounded-full border border-line bg-card p-1">{Object.keys(DAYS).map(d=><button key={d} role="tab" aria-selected={tab===d} onClick={()=>setTab(d)} className={`rounded-full px-4 sm:px-5 py-2 text-sm font-bold transition ${tab===d?'bg-lime text-ink':'text-mute hover:text-white'}`}>{d}</button>)}</div></Reveal>
  <motion.div key={tab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.35}} className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{r.loading&&!r.data?<p className="col-span-full text-center text-mute py-12">Loading fixtures…</p>:r.error&&!r.data?<p className="col-span-full text-center text-mute py-12">Fixtures could not be loaded right now.</p>:list.length?list.map(m=><FixtureCard key={m.id} m={m} pick={picks[m.id]} onPick={k=>setPicks(p=>({...p,[m.id]:p[m.id]===k?undefined:k}))} onLock={()=>openPick(m)}/>):<p className="col-span-full text-center text-mute py-12">No fixtures for this day.</p>}</motion.div></section>}

function Live(){
 const {setDetail,nav}=useContext(Ctx);const lr=useMatchDays([dayStr(0)],{live:true,ttl:45000,poll:60000}),liveList=lr.list.filter(m=>m.st==='live').slice(0,3);
 return <section className="scope-dark relative overflow-hidden border-y border-line">
  <img src={crowd} alt="A packed stadium crowd cheering under the floodlights" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-40"/>
  <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/60 to-bg"/>
  <div className="relative max-w-6xl mx-auto px-5 py-20">
   <Reveal className="flex flex-wrap items-center justify-between gap-4 mb-8"><div><Eyebrow c="text-red-400">Live match centre</Eyebrow><h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3">The Game Is On.</h2></div></Reveal>
   <div className="grid lg:grid-cols-3 gap-4">{liveList.map((m,i)=>{return <Reveal key={m.id} delay={i*.1}><div className="rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl p-5">
    <div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>LIVE{m.min!=null?` · ${m.min}'`:''}</span><span className="text-white/60">{m.lg}</span></div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 mt-5 text-center"><div className="flex flex-col items-center gap-2"><Crest k={m.h} s={46}/><span className="text-xs font-bold">{T[m.h][0]}</span></div><span className="text-3xl font-extrabold tabular-nums">{m.hasScore?m.sc[0]:'–'}<span className="text-white/40 mx-1">–</span>{m.hasScore?m.sc[1]:'–'}</span><div className="flex flex-col items-center gap-2"><Crest k={m.a} s={46}/><span className="text-xs font-bold">{T[m.a][0]}</span></div></div>
    <Btn v="s" onClick={()=>setDetail(m)} className="w-full mt-5 !py-2.5">View Match</Btn></div></Reveal>})}{!liveList.length&&<div className="lg:col-span-3 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-xl p-8 text-center text-white/70"><p className="font-bold text-white">{lr.loading&&!lr.data?'Checking live matches…':'No matches are live right now.'}</p><Btn v="s" onClick={()=>nav('matches')} className="mt-4">See fixtures</Btn></div>}</div></div></section>}

function Bento(){
 const tile='rounded-3xl border border-line p-6 overflow-hidden relative';
 return <section className="max-w-6xl mx-auto px-5 py-20">
  <Reveal className="max-w-2xl mb-10"><Eyebrow c="text-sky">Built for matchday</Eyebrow><h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3">Everything you need to play bold.</h2></Reveal>
  <div className="grid md:grid-cols-6 gap-4">
   <Reveal className="md:col-span-3"><div className={`${tile} h-full bg-gradient-to-br from-sky/10 to-card`}><p className="font-extrabold text-lg">Four prediction markets</p><p className="text-sm text-mute mt-1 max-w-xs">Result, exact score, Over/Under and Both Teams to Score on every match.</p>
    <div className="flex flex-wrap gap-2 mt-5">{['Match Result','Correct Score','Over 2.5','Both Teams to Score'].map((x,i)=><span key={x} className={`rounded-full border px-3.5 py-1.5 text-xs font-bold ${i===1?'bg-lime text-ink border-lime':'border-line bg-bg2'}`}>{x}</span>)}</div></div></Reveal>
   <Reveal delay={.08} className="md:col-span-3"><div className={`${tile} h-full bg-gradient-to-br from-flame/10 to-card`}><div className="flex items-center gap-3"><span className="flick text-flame"><I n="flame" s={30}/></span><p className="font-extrabold text-lg">Streaks that pay off</p></div><p className="text-sm text-mute mt-2 max-w-xs">Chain correct picks to unlock Hot Starter, On Fire and Prediction Machine.</p>
    <div className="flex gap-1.5 mt-5">{[1,1,1,1,1,0,0,0].map((x,i)=><span key={i} className={`h-8 flex-1 rounded-lg grid place-items-center text-[10px] font-bold ${x?'bg-flame text-ink':'bg-bg2 border border-line text-mute'}`}>{x?<I n="check" s={13}/>:i+1}</span>)}</div></div></Reveal>
   <Reveal delay={.04} className="md:col-span-2"><div className={`${tile} h-full`}><p className="font-extrabold">Private leagues</p><p className="text-sm text-mute mt-1">Invite friends with a code.</p><div className="flex -space-x-2 mt-5">{['KB','SX','TT','D9','AM'].map(x=><span key={x} className="ring-2 ring-card rounded-full"><Av t={x} s={34}/></span>)}</div><span className="inline-block mt-4 rounded-lg border border-dashed border-line px-3 py-1.5 text-sm font-extrabold tracking-widest">MIQ-7K4P2</span></div></Reveal>
   <Reveal delay={.1} className="md:col-span-2"><div className={`${tile} h-full flex items-center gap-4`}><div className="w-20 h-20 rounded-full grid place-items-center shrink-0" style={{background:'conic-gradient(#5AA9FF 62%,rgb(var(--line)) 0)'}}><div className="w-[68px] h-[68px] rounded-full bg-card grid place-items-center"><div className="text-center"><p className="text-[9px] text-mute leading-none">LEVEL</p><p className="text-2xl font-extrabold leading-tight">8</p></div></div></div><div><p className="font-extrabold">XP and levels</p><p className="text-sm text-mute mt-1">Points rank you. XP levels you up.</p></div></div></Reveal>
   <Reveal delay={.16} className="md:col-span-2"><div className={`${tile} h-full`}><p className="font-extrabold">Match rooms</p><p className="text-sm text-mute mt-1">Talk it out as it happens.</p><div className="mt-4 space-y-2"><div className="max-w-[85%] rounded-2xl rounded-bl-md bg-bg2 border border-line px-3 py-2 text-xs">What a finish. 2–2 incoming?</div><div className="max-w-[80%] ml-auto rounded-2xl rounded-br-md bg-lime text-ink px-3 py-2 text-xs font-semibold">Called it at half time.</div></div></div></Reveal></div></section>}

function How(){
 const steps=[['ball','Pick Your Matches','Browse fixtures from the top leagues.','#5AA9FF'],['target','Make Your Predictions','Choose results, scores and markets.','#B388FF'],['bolt','Earn Points and XP','Every correct call counts.','#F5C451'],['trophy','Climb the Leaderboard','Rise from your friends to the world.','#FF8A3D']];
 return <section id="how" className="bg-bg2 border-y border-line"><div className="max-w-6xl mx-auto px-5 py-20">
  <Reveal className="text-center max-w-xl mx-auto mb-14"><Eyebrow>How it works</Eyebrow><h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3">Four steps to glory.</h2></Reveal>
  <div className="relative grid md:grid-cols-4 gap-10 md:gap-6">
   <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-line"><motion.div className="h-full bg-lime origin-left" initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:1.4,ease:'easeOut'}}/></div>
   {steps.map(([ic,t,d,c],i)=><Reveal key={t} delay={i*.12} className="relative text-center"><div className="mx-auto w-14 h-14 rounded-2xl grid place-items-center relative z-10 border" style={{background:`color-mix(in srgb,${c} 16%,rgb(var(--bg2)))`,borderColor:c+'66',color:c}}><I n={ic} s={24}/></div><p className="text-[11px] font-extrabold tracking-widest text-mute mt-4">0{i+1}</p><h3 className="font-extrabold mt-1">{t}</h3><p className="text-sm text-mute mt-1.5 max-w-[14rem] mx-auto">{d}</p></Reveal>)}</div></div></section>}

const MED=['#F5C451','#C7CDD4','#CD7F32'];
function Board(){
 const {nav}=useContext(Ctx);const top=useMemo(()=>board('global').slice(0,3),[]);
 return <section id="board" className="max-w-6xl mx-auto px-5 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
  <Reveal><Eyebrow c="text-gold">Leaderboard</Eyebrow><h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3">Your Knowledge Deserves a Ranking.</h2><p className="text-mute mt-4 max-w-md">Global, weekly, monthly and friends-only tables keep every matchday meaningful.</p>
   <div className="mt-8 rounded-2xl border border-line bg-card p-5 max-w-md"><div className="flex items-center gap-4"><BadgeIcon icon="cpu" color="#22D3EE" s={60}/><div><p className="font-extrabold">Prediction Machine</p><p className="text-xs text-mute">10 correct predictions in a row</p></div></div>
    <div className="mt-4 h-2 rounded-full bg-bg2 overflow-hidden"><motion.div className="h-full rounded-full" style={{background:'#22D3EE'}} initial={{width:0}} whileInView={{width:'70%'}} viewport={{once:true}} transition={{duration:1.1}}/></div>
    <div className="flex justify-between text-[11px] text-mute mt-2"><span>7 / 10 · sample progress</span><span>Next: Football Oracle (20)</span></div></div>
   <Btn className="mt-8" onClick={()=>nav('competition')}>View Leaderboard<I n="arrow" s={16}/></Btn></Reveal>
  <Reveal delay={.1}><div className="rounded-3xl border border-line bg-card overflow-hidden">{top.map((u,i)=><div key={u.name} className={`flex items-center gap-4 px-5 ${i===0?'py-6':'py-4'} ${i?'border-t border-line':''}`} style={i===0?{background:`linear-gradient(90deg,${MED[0]}22,transparent 70%)`}:{}}>
   <span className="w-8 grid place-items-center font-extrabold" style={{color:MED[i]}}>{i===0?<I n="crown" s={22}/>:i+1}</span><Av t={ini(u.name)} s={i===0?52:42}/>
   <div className="flex-1 min-w-0"><p className={`font-bold truncate ${i===0?'text-lg':''}`}>{u.name} <span className="font-normal text-sm">{flag(u.cc)}</span></p><p className="text-xs text-mute">{u.acc}% accuracy</p></div>
   <div className="text-right"><p className={`font-extrabold tabular-nums ${i===0?'text-2xl':'text-lg'}`} style={{color:MED[i]}}>{u.points.toLocaleString()}</p><p className="text-[10px] uppercase tracking-wider text-mute">points</p></div></div>)}
   <div className="px-5 py-3 text-[11px] text-mute border-t border-line bg-bg2">Sample players and scores</div></div></Reveal></section>}

function Community(){
 const {nav}=useContext(Ctx);const posts=['p2','p5','p7'].map(id=>SEED_POSTS.find(p=>p.id===id));
 return <section className="bg-bg2 border-y border-line"><div className="max-w-6xl mx-auto px-5 py-20">
  <Reveal className="max-w-2xl mb-12"><Eyebrow c="text-violet-400">Community</Eyebrow><h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3">Your Club. Your People. Your Predictions.</h2></Reveal>
  <div className="grid md:grid-cols-3 gap-5 items-start">{posts.map((p,i)=>{const u=userOf(p.user);return <Reveal key={p.id} delay={i*.1} className={i===1?'md:mt-10':''}><article className="rounded-2xl border border-line bg-card p-5 transition hover:border-white/25">
   <div className="flex items-center gap-3"><Av t={ini(p.user)} s={40}/><div className="min-w-0"><p className="font-bold text-sm truncate">{p.user}</p><p className="text-xs text-mute flex items-center gap-1.5"><Crest k={u.club} s={16}/>{T[u.club][0]} fan</p></div></div>
   <p className="mt-4 text-[15px] leading-relaxed">{p.text}</p>
   <div className="flex items-center gap-5 mt-5 text-xs text-mute"><span className="flex items-center gap-1.5"><span className="text-red-400"><I n="heart" s={14} fill/></span>{p.likes.length}</span><span className="flex items-center gap-1.5"><I n="comment" s={14}/>{p.comments.length}</span><span className="flex items-center gap-1.5"><I n="share" s={14}/>{p.shares}</span></div></article></Reveal>})}</div>
  <Reveal className="mt-10 flex flex-wrap items-center gap-4"><Btn v="s" onClick={()=>nav('community')}>Explore Community<I n="arrow" s={16}/></Btn><Demo>Sample posts</Demo></Reveal></div></section>}

function Faq(){
 const [open,setOpen]=useState(0);
 return <section className="max-w-3xl mx-auto px-5 py-20"><Reveal className="text-center mb-10"><Eyebrow c="text-mute">FAQ</Eyebrow><h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">Good questions.</h2></Reveal>
  <div className="rounded-2xl border border-line bg-card divide-y divide-line">{FAQ.map(([q,a],i)=><div key={q}><button aria-expanded={open===i} onClick={()=>setOpen(open===i?-1:i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-sm sm:text-base hover:bg-white/[0.03] transition">{q}<span className={`shrink-0 text-mute transition-transform ${open===i?'rotate-180':''}`}><I n="down" s={18}/></span></button><div className={`grid transition-all duration-300 ${open===i?'grid-rows-[1fr]':'grid-rows-[0fr]'}`}><div className="overflow-hidden"><p className="px-5 pb-5 text-sm text-mute">{a}</p></div></div></div>)}</div></section>}

function Cta({start}){return <section className="max-w-6xl mx-auto px-5 pb-20"><div className="scope-dark relative overflow-hidden rounded-3xl border border-white/10 text-center px-6 py-20 sm:py-28">
 <img src={crowd} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-50"/><div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-bg/70 to-bg/95"/><div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[280px] rounded-full bg-emerald-400/20 blur-3xl"/>
 <Reveal className="relative"><h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">Ready to Prove You Know Football?</h2><p className="text-white/70 mt-4">Join the competition. Make every prediction count.</p><Btn onClick={start} className="mt-8 !px-8 !py-3.5">Get Started with MatchIQ<I n="arrow" s={16}/></Btn></Reveal></div></section>}

function Footer({nav,go,toast}){
 const cols=[['Product',[['Matches',()=>go('matches')],['How It Works',()=>go('how')],['Leaderboard',()=>nav('competition')],['Competition',()=>nav('competition')]]],['Community',[['Community feed',()=>nav('community')],['Club communities',()=>nav('community')],['Match discussions',()=>nav('community')],['Messages',()=>nav('messages')]]],['Account',[['Create account',()=>nav('signup')],['Log in',()=>nav('login')],['Profile',()=>nav('profile')],['Settings',()=>nav('settings')]]]];
 return <footer className="border-t border-line bg-bg2"><div className="max-w-6xl mx-auto px-5 py-12 grid md:grid-cols-[1.4fr_repeat(3,1fr)] gap-10"><div><Logo/><p className="text-sm text-mute mt-4 max-w-xs">The football prediction platform for fans who know the game. Predict Smart. Play Bold.</p></div>
  {cols.map(([t,ls])=><div key={t}><p className="text-xs font-extrabold uppercase tracking-widest text-mute">{t}</p><ul className="mt-4 space-y-2.5">{ls.map(([l,fn])=><li key={l}><button onClick={fn} className="text-sm hover:text-lime transition">{l}</button></li>)}</ul></div>)}</div>
  <div className="border-t border-line"><div className="max-w-6xl mx-auto px-5 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-mute"><p>© 2026 MatchIQ. All rights reserved.</p><p>Virtual points only. Demonstration data in this prototype.</p></div></div></footer>}

export function Landing(){
 const {nav,toast}=useContext(Ctx);const {user}=useAuth();const [open,setOpen]=useState(false),[active,setActive]=useState('top'),[showTop,setShowTop]=useState(false);
 const start=()=>nav(user?(user.onboarded?'overview':'onboarding'):'signup');const go=id=>{setOpen(false);smooth(id)};
 const {scrollYProgress}=useScroll();const sx=useSpring(scrollYProgress,{stiffness:120,damping:30});
 useEffect(()=>{const els=NAV.map(n=>document.getElementById(n[1])).filter(Boolean);const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)setActive(e.target.id)}),{rootMargin:'-45% 0px -50% 0px'});els.forEach(e=>io.observe(e));const sc=()=>setShowTop(scrollY>900);addEventListener('scroll',sc,{passive:true});return()=>{io.disconnect();removeEventListener('scroll',sc)}},[]);
 return <div className="relative">
  <motion.div style={{scaleX:sx}} className="fixed top-0 inset-x-0 h-0.5 origin-left bg-lime z-[60]"/>
  <header className="sticky top-0 z-40 bg-bg/60 backdrop-blur-xl border-b border-white/10" style={{paddingTop:'env(safe-area-inset-top,0px)'}}>
   <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between"><button onClick={()=>go('top')} aria-label="MatchIQ home"><Logo/></button>
    <nav className="hidden md:flex items-center gap-1" aria-label="Primary">{NAV.map(([l,id])=><button key={l} onClick={()=>go(id)} aria-current={active===id?'page':undefined} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active===id?'bg-white/10 text-white':'text-mute hover:text-white hover:bg-white/5'}`}>{l}</button>)}</nav>
    <div className="hidden md:flex items-center gap-2"><button onClick={()=>nav(user?'overview':'login')} className="text-sm font-semibold px-3 py-1.5 rounded-full text-mute hover:text-white transition">{user?'Dashboard':'Login'}</button>{!user&&<Btn onClick={start} className="!py-2 !px-4">Get Started</Btn>}</div>
    <button className="md:hidden p-2 -mr-2" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}><I n={open?'x':'menu'} s={24}/></button></div>
   {open&&<div className="md:hidden pop border-t border-white/10 px-5 py-4 flex flex-col gap-1 bg-bg2/95 backdrop-blur-xl">{NAV.map(([l,id])=><button key={l} className={`text-left rounded-xl px-3 py-3 font-semibold ${active===id?'bg-white/10':'text-mute'}`} onClick={()=>go(id)}>{l}</button>)}<div className="grid grid-cols-2 gap-3 mt-3"><Btn v="s" onClick={()=>nav(user?'overview':'login')}>{user?'Dashboard':'Login'}</Btn>{!user&&<Btn onClick={start}>Get Started</Btn>}</div></div>}
  </header>
  <Hero start={start} go={go}/><Ticker/><Matches/><Live/><Bento/><How/><Board/><Community/><Faq/><Cta start={start}/><Footer nav={nav} go={go} toast={toast}/>
  {showTop&&<button onClick={()=>go('top')} aria-label="Back to top" className="pop fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full border border-white/15 bg-bg2/70 backdrop-blur-xl grid place-items-center hover:border-white/40 transition"><I n="up" s={18}/></button>}
 </div>}
