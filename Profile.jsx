import React,{useState,useContext} from 'react'
import {T,marketLines} from './data'
import {ME,flag,ini,HIST} from './compData'
import {rehydrate,verdict} from './liveMatch'
import {countryName} from './countries'
import {Ctx} from './context'
import {useAuth} from './AuthContext'
import {useSocial} from './SocialContext'
import {V} from './validation'
import {I} from './Icon'
import {Av,Crest,Btn,ClubBox} from './ui'
import {Field} from './Fields'
import {ClubPicker,LeaguePicker,CountryPicker} from './Pickers'
import {AvatarPicker} from './AvatarPicker'
import {ProfilePreview} from './ProfilePreview'
import {Badges} from './Badges'
import {levelInfo} from './compData'

const Stat=({l,v,c='',ic})=><div className="rounded-2xl bg-card border border-line p-4"><p className="text-xs text-mute flex items-center gap-1.5"><span className={c}><I n={ic} s={13}/></span>{l}</p><p className="text-2xl font-extrabold mt-2">{v}</p></div>;
const Acc=({title,value,children})=><details className="rounded-2xl border border-line bg-card group"><summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none"><span className="text-sm font-bold">{title}</span><span className="text-xs text-mute flex items-center gap-1.5 min-w-0 truncate">{value}<I n="right" s={14}/></span></summary><div className="p-4 pt-0">{children}</div></details>;

function Editor({onClose}){
 const {toast}=useContext(Ctx);const {user,update,taken}=useAuth();const {renameMe}=useSocial();const p=user.profile;
 const init={name:user.name,username:user.username,bio:p.bio||'',cc:p.country||'NG',club:p.club||'ARS',leagues:p.leagues||[],avatar:p.avatar||null};
 const [d,setD]=useState(init),[sub,setSub]=useState(false);const set=k=>v=>setD(x=>({...x,[k]:v}));
 const err={name:V.name(d.name),username:V.username(d.username)||(taken(d.username,user.id)?'That username is taken':''),bio:d.bio.length>160?'Bio is too long':''};
 const dirty=JSON.stringify(d)!==JSON.stringify(init);
 const save=()=>{setSub(true);if(err.name||err.username||err.bio)return;renameMe(user.username,d.username);update({name:d.name.trim(),username:d.username,profile:{bio:d.bio.trim(),country:d.cc,club:d.club,leagues:d.leagues,avatar:d.avatar}});toast('Profile updated');onClose()};
 return <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
  <div className="space-y-4">
   <div className="rounded-2xl border border-line bg-card p-5"><p className="text-sm font-bold mb-4">Avatar</p><AvatarPicker value={d.avatar} onChange={set('avatar')} name={d.name}/></div>
   <div className="rounded-2xl border border-line bg-card p-5 space-y-4"><Field label="Full name" value={d.name} onChange={e=>set('name')(e.target.value)} error={sub?err.name:''}/><Field label="Username" icon="star" value={d.username} onChange={e=>set('username')(e.target.value)} error={sub?err.username:''} maxLength={20}/><Field label="Bio" as="textarea" rows={3} value={d.bio} onChange={e=>set('bio')(e.target.value)} maxLength={160} hint={`${d.bio.length}/160`} error={sub?err.bio:''}/></div>
   <Acc title="Country" value={<>{flag(d.cc)} {countryName(d.cc)}</>}><CountryPicker value={d.cc} onChange={set('cc')}/></Acc>
   <Acc title="Favourite club" value={T[d.club][0]}><ClubPicker value={d.club} onChange={set('club')}/></Acc>
   <Acc title="Favourite leagues" value={`${d.leagues.length} selected`}><LeaguePicker value={d.leagues} onChange={set('leagues')}/></Acc>
   <div className="flex gap-3"><Btn v="s" onClick={onClose}>Cancel</Btn><Btn onClick={save} className={dirty?'':'opacity-40 pointer-events-none'}>Save changes</Btn>{dirty&&<button onClick={()=>setD(init)} className="text-sm text-mute hover:text-white px-2">Reset</button>}</div></div>
  <div className="lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-wider text-mute mb-3">Live preview</p><ProfilePreview d={d}/></div></div>}

export function Profile(){
 const {user}=useAuth();const {store}=useContext(Ctx);const mine=Object.values(store).filter(p=>p.m).sort((a,b)=>b.at-a.at).slice(0,5);const [edit,setEdit]=useState(false);const L=levelInfo(ME.xp),club=T[ME.club];
 return <div className="space-y-8">
  <div className="relative overflow-hidden rounded-3xl border border-line" style={{background:`linear-gradient(135deg,${club[1]}33,rgb(var(--card)) 55%,rgb(var(--bg2)))`}}>
   <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none overflow-hidden" style={{background:`repeating-linear-gradient(90deg,${club[1]}38 0 16px,transparent 16px 32px)`,WebkitMaskImage:'linear-gradient(270deg,#000,transparent)',maskImage:'linear-gradient(270deg,#000,transparent)'}}><span className="absolute right-5 bottom-2 text-5xl sm:text-7xl font-black tracking-tighter uppercase" style={{color:club[1],opacity:.35}}>{club[0].split(' ').pop()}</span></div>
   <div className="relative p-6 sm:p-9 flex flex-col sm:flex-row sm:items-center gap-5"><div className="rounded-full p-1 w-fit" style={{boxShadow:`0 0 0 2px ${club[1]}`}}><Av t={ini(ME.full)} s={84} me/></div>
    <div className="flex-1 min-w-0"><h1 className="text-2xl sm:text-3xl font-extrabold break-words">{ME.full}</h1>
     <p className="text-sm text-mute mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"><span>@{ME.name}</span><span>{flag(ME.cc)} {countryName(ME.cc)}</span><span className="flex items-center gap-2"><ClubBox k={ME.club} s={20}/>{club[0]} fan</span></p>
     {ME.bio&&<p className="text-sm mt-3 max-w-xl break-words">{ME.bio}</p>}
     <div className="mt-4 max-w-sm"><div className="flex justify-between text-xs mb-1.5"><span className="font-bold">Level {L.level} · {L.title}</span><span className="text-mute">{ME.xp.toLocaleString()} / {L.nxt.toLocaleString()} XP</span></div><div className="h-2 rounded-full bg-black/30 overflow-hidden"><div className="h-full rounded-full bg-sky" style={{width:L.pct+'%'}}/></div></div></div>
    {!edit&&<Btn v="s" onClick={()=>setEdit(true)} className="self-start"><I n="edit" s={15}/>Edit profile</Btn>}</div></div>
  {edit&&<section><h2 className="font-bold text-lg mb-4">Edit profile</h2><Editor onClose={()=>setEdit(false)}/></section>}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"><Stat l="Total points" v={ME.points.toLocaleString()} ic="trophy" c="text-gold"/><Stat l="Accuracy" v={ME.acc+'%'} ic="check" c="text-emerald-400"/><Stat l="Current streak" v={ME.streak} ic="flame" c="text-flame"/><Stat l="Longest streak" v={ME.longest} ic="bolt" c="text-sky"/></div>
  <p className="text-[11px] text-mute -mt-5">Points, accuracy, streaks and competition history are placeholders until Phase 2. Recent predictions are your real saved picks.</p>
  <section><h2 className="font-bold text-lg mb-4">Achievements</h2><Badges compact/></section>
  <div className="grid lg:grid-cols-2 gap-6">
   <section><h2 className="font-bold text-lg mb-4">Recent predictions</h2>{mine.length?<div className="rounded-2xl bg-card border border-line divide-y divide-line">{mine.map(p=>{const m=rehydrate(p.m),L=marketLines(p,m),v=L.map(([k])=>verdict(m,p,k)),done=m.st==='ft'&&m.hasScore,ok=done&&v.some(x=>x===true);return <div key={m.id} className="flex items-center gap-3 px-4 py-3"><div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${!done?'bg-white/5 text-mute':ok?'bg-emerald-400/10 text-emerald-400':'bg-red-500/10 text-red-400'}`}><I n={!done?'clock':ok?'check':'x'} s={14}/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{T[m.h][0]} vs {T[m.a][0]}</p><p className="text-xs text-mute">{L.map(l=>l[1]).join(' · ')}</p></div><span className="text-xs font-bold text-mute">{done?`${m.sc[0]}–${m.sc[1]}`:m.st==='live'?'Live':'Pending'}</span></div>})}</div>:<div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-mute">No predictions yet. Lock in a pick from Matches.</div>}</section>
   <section><h2 className="font-bold text-lg mb-4">Competition history</h2><div className="rounded-2xl bg-card border border-line divide-y divide-line">{HIST.map(r=><div key={r[0]+r[2]} className="flex items-center gap-3 px-4 py-3"><div className="w-8 h-8 rounded-full bg-gold/10 text-gold grid place-items-center shrink-0"><I n="medal" s={14}/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{r[0]}</p><p className="text-xs text-mute">{r[2]}</p></div><span className="text-sm font-bold">{r[1]}</span></div>)}</div></section></div></div>}
