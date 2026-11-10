import React,{useState,useContext} from 'react'
import {motion} from 'framer-motion'
import {Ctx} from './context'
import {useAuth} from './AuthContext'
import {useStored} from './hooks'
import {V} from './validation'
import {I} from './Icon'
import {Btn,LogoMark} from './ui'
import {Field} from './Fields'
import {ClubPicker,LeaguePicker,CountryPicker} from './Pickers'
import {AvatarPicker} from './AvatarPicker'
import {ProfilePreview} from './ProfilePreview'

const STEPS=['Welcome','Club','Leagues','Country','Interests','Profile'];
const INTERESTS=[['target','Match predictions','Call results and scores','#5AA9FF'],['comment','Football discussions','Debate with fans worldwide','#B388FF'],['trophy','Fantasy-style competitions','Private leagues with friends','#F5C451'],['medal','Leaderboards','Climb the global rankings','#FF8A3D'],['users','Club communities','Join your club’s fans','#34D399'],['cpu','Match statistics','Dig into the numbers','#22D3EE']];
const HEAD=[null,['Pick your favourite club','We will tailor your matches and community around it.'],['Which leagues do you follow?','Select as many as you like.'],['Where are you playing from?','Your flag appears on leaderboards.'],['What do you love about football?','Choose everything that interests you.'],['Make it yours','Add an avatar, username and a short bio.']];

export function Onboarding(){
 const {toast,nav}=useContext(Ctx);const {user,update,taken}=useAuth();const p=user.profile;
 const [step,setStep]=useStored('matchiq.onboardStep',0);const s=Math.min(step,6);
 const [d,setD]=useState({club:p.club||'',leagues:p.leagues||[],cc:p.country||'',interests:p.interests||[],bio:p.bio||'',avatar:p.avatar||null,username:user.username}),[uErr,setUErr]=useState('');
 const set=k=>v=>setD(x=>({...x,[k]:v}));
 const save=patch=>update({profile:patch});
 const next=()=>{
  if(s===1)save({club:d.club});if(s===2)save({leagues:d.leagues});if(s===3)save({country:d.cc});if(s===4)save({interests:d.interests});
  if(s===5){const e=V.username(d.username)||(taken(d.username,user.id)?'That username is taken':'');if(e){setUErr(e);return}update({username:d.username,profile:{bio:d.bio.trim(),avatar:d.avatar}})}
  setStep(s+1)};
 const finish=()=>{update({onboarded:true});try{localStorage.removeItem('matchiq.onboardStep')}catch(e){}toast('Welcome to MatchIQ!');nav('overview')};
 const canNext=s===1?!!d.club:s===3?!!d.cc:true,skippable=[1,2,3,4].includes(s);
 const first=user.name.split(' ')[0];
 return <div className="min-h-screen flex flex-col relative overflow-hidden"><div className="glow absolute inset-0 pointer-events-none"/>
  <header className="relative px-5 sm:px-10 pt-5" style={{paddingTop:'max(1.25rem,env(safe-area-inset-top))'}}>
   {s<6&&<><div className="flex gap-1.5 max-w-3xl mx-auto">{STEPS.map((x,i)=><div key={x} className="h-1.5 flex-1 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full bg-lime transition-all duration-500" style={{width:i<s?'100%':i===s?'55%':'0%'}}/></div>)}</div>
   <p className="max-w-3xl mx-auto mt-3 text-xs text-mute font-semibold">Step {s+1} of {STEPS.length} · {STEPS[s]}</p></>}</header>
  <main className="relative flex-1 px-5 sm:px-10 py-8"><div key={s} className="slide max-w-3xl mx-auto">
   {s===0&&<div className="text-center py-10 sm:py-16"><motion.div initial={{scale:.6,rotate:-8}} animate={{scale:1,rotate:0}} transition={{type:'spring',stiffness:200,damping:14}} className="w-fit mx-auto"><LogoMark s={84}/></motion.div>
    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mt-8">Welcome to MatchIQ.</h1><p className="text-mute text-lg mt-4">Let’s personalise your football experience.</p><p className="text-sm text-mute mt-2">Nice to meet you, {first}. It takes about a minute.</p></div>}
   {s>=1&&s<=5&&<><h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{HEAD[s][0]}</h1><p className="text-mute mt-2 mb-7">{HEAD[s][1]}</p></>}
   {s===1&&<ClubPicker value={d.club} onChange={set('club')}/>}
   {s===2&&<LeaguePicker value={d.leagues} onChange={set('leagues')}/>}
   {s===3&&<CountryPicker value={d.cc} onChange={set('cc')}/>}
   {s===4&&<div className="grid sm:grid-cols-2 gap-3">{INTERESTS.map(([ic,t,sub,c])=>{const on=d.interests.includes(t);return <button key={t} onClick={()=>set('interests')(on?d.interests.filter(x=>x!==t):[...d.interests,t])} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[.98] ${on?'border-lime bg-white/5':'border-line bg-card hover:border-white/30'}`}><span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{background:c+'22',color:c}}><I n={ic} s={20}/></span><span className="flex-1"><span className="block font-bold text-sm">{t}</span><span className="text-xs text-mute">{sub}</span></span>{on&&<span className="w-5 h-5 rounded-full bg-lime text-ink grid place-items-center"><I n="check" s={12}/></span>}</button>})}</div>}
   {s===5&&<div className="grid md:grid-cols-[1fr_300px] gap-6"><div className="space-y-5"><AvatarPicker value={d.avatar} onChange={set('avatar')} name={user.name}/>
     <Field label="Username" icon="star" value={d.username} onChange={e=>{set('username')(e.target.value);setUErr('')}} error={uErr} maxLength={20}/>
     <Field label="Short bio" as="textarea" rows={3} maxLength={160} value={d.bio} onChange={e=>set('bio')(e.target.value)} placeholder="Gooner since 2004. Always backing the underdog." hint={`${d.bio.length}/160`}/></div>
     <div><p className="text-xs font-bold uppercase tracking-wider text-mute mb-3">Live preview</p><ProfilePreview d={{name:user.name,username:d.username,bio:d.bio,club:d.club,cc:d.cc,leagues:d.leagues,avatar:d.avatar}}/></div></div>}
   {s===6&&<div className="text-center py-10 sm:py-16"><motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:240,damping:15}} className="w-24 h-24 mx-auto rounded-full bg-emerald-400 text-ink grid place-items-center"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><motion.path d="M20 6 9 17l-5-5" initial={{pathLength:0}} animate={{pathLength:1}} transition={{delay:.3,duration:.5}}/></svg></motion.div>
    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-8">You’re all set. Welcome to MatchIQ!</h1><p className="text-mute mt-4">Your profile is ready. Time to make your first prediction.</p></div>}
  </div></main>
  <footer className="relative border-t border-line bg-bg/80 backdrop-blur-xl px-5 sm:px-10 py-4" style={{paddingBottom:'max(1rem,env(safe-area-inset-bottom))'}}><div className="max-w-3xl mx-auto flex items-center gap-3">
   {s>0&&s<6&&<Btn v="s" onClick={()=>setStep(s-1)} className="!px-4"><I n="back" s={16}/>Back</Btn>}
   <div className="flex-1"/>
   {skippable&&<button onClick={()=>setStep(s+1)} className="text-sm text-mute hover:text-white px-2">Skip</button>}
   {s<6?<Btn onClick={next} className={canNext?'':'opacity-40 pointer-events-none'}>{s===0?'Get started':s===5?'Finish':'Continue'}<I n="arrow" s={16}/></Btn>:<Btn onClick={finish} className="w-full sm:w-auto">Enter MatchIQ<I n="arrow" s={16}/></Btn>}</div></footer></div>}
