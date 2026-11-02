import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {useAuth} from './AuthContext'
import {T} from './data'
import {flag} from './compData'
import {countryName} from './countries'
import {V,hasErrors} from './validation'
import {I} from './Icon'
import {Btn} from './ui'
import {Sheet} from './Sheet'
import {Field,PasswordField,Strength,Toggle} from './Fields'
import {ClubPicker,LeaguePicker,CountryPicker} from './Pickers'
import {Confirm} from './Confirm'

const SECS=[['account','Account'],['appearance','Appearance'],['notifications','Notifications'],['privacy','Privacy'],['preferences','Preferences'],['actions','Account actions']];
const Card=({id,title,sub,children})=><section id={'s-'+id} className="scroll-mt-24"><h2 className="text-lg font-extrabold">{title}</h2>{sub&&<p className="text-sm text-mute mt-0.5">{sub}</p>}<div className="mt-4 rounded-2xl bg-card border border-line p-5">{children}</div></section>;
const Row=({l,v,action})=><div className="flex items-center justify-between gap-3 py-3 border-b border-line last:border-0"><div className="min-w-0"><p className="text-xs text-mute">{l}</p><p className="text-sm font-semibold truncate">{v}</p></div>{action}</div>;
const Acc=({title,value,children})=><details className="rounded-xl border border-line bg-bg2 mb-3"><summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none"><span className="text-sm font-bold">{title}</span><span className="text-xs text-mute flex items-center gap-1.5 truncate">{value}<I n="right" s={14}/></span></summary><div className="p-4 pt-0">{children}</div></details>;
const NOTIFS=[['reminders','Match reminders','Know before kickoff'],['results','Prediction results','When your picks are settled'],['friends','Friend requests','New requests and accepts'],['community','Community activity','Likes, comments and mentions'],['achievements','Achievement notifications','Badges and milestones']];
const THEMES=[['dark','Dark','sun','#080B0A','rgb(var(--card))'],['light','Light','sun','#F4F6F4','#FFFFFF'],['system','System','monitor','linear-gradient(90deg,#080B0A 50%,#F4F6F4 50%)','#9AA39D']];

export function Settings(){
 const {toast,nav,theme,setTheme}=useContext(Ctx);const {user,update,changePassword,logout,deleteAccount}=useAuth();const st=user.settings,p=user.profile;
 const [pw,setPw]=useState({cur:'',next:'',conf:''}),[sub,setSub]=useState(false),[srv,setSrv]=useState(''),[out,setOut]=useState(false),[del,setDel]=useState(false),[typed,setTyped]=useState('');
 const err={cur:pw.cur?'':'Enter your current password',next:V.password(pw.next),conf:V.confirm(pw.conf,pw.next)};
 const savePw=e=>{e.preventDefault();setSub(true);if(hasErrors(err))return;const r=changePassword(pw.cur,pw.next);if(r.error){setSrv(r.error);return}setPw({cur:'',next:'',conf:''});setSub(false);setSrv('');toast('Password updated')};
 const go=id=>document.getElementById('s-'+id)?.scrollIntoView({behavior:'smooth'});
 const doLogout=()=>{logout();nav('landing');toast('You have been logged out')};
 const doDelete=()=>{deleteAccount();nav('landing');toast('Your demo account was deleted')};
 const setN=k=>v=>update({settings:{notif:{[k]:v}}}),setP=k=>v=>update({settings:{privacy:{[k]:v}}});
 return <div className="max-w-3xl space-y-10">
  <div><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Settings</h1><p className="text-mute text-sm mt-1">Changes save automatically in this browser.</p></div>
  <div className="flex gap-2 overflow-x-auto no-scrollbar -mt-4">{SECS.map(([id,l])=><button key={id} onClick={()=>go(id)} className="whitespace-nowrap text-xs font-semibold text-mute border border-line rounded-full px-3.5 py-1.5 hover:text-white hover:border-white/30 transition">{l}</button>)}</div>
  <Card id="account" title="Account" sub="Your personal details and sign-in.">
   <Row l="Full name" v={user.name} action={<Btn v="s" className="!py-2 !px-3 text-xs" onClick={()=>nav('profile')}>Edit</Btn>}/><Row l="Username" v={'@'+user.username} action={<Btn v="s" className="!py-2 !px-3 text-xs" onClick={()=>nav('profile')}>Edit</Btn>}/><Row l="Email" v={user.email}/>
   <Row l="Account status" v={<span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"/>Active · member since {new Date(user.created).toLocaleDateString([], {month:'short',year:'numeric'})}</span>}/>
   <p className="mt-5 pt-5 border-t border-line text-sm text-mute"><b className="text-white">Password:</b> to change it, use “Forgot password” on the login screen.</p></Card>
  <Card id="appearance" title="Appearance" sub="Dark is the default MatchIQ look."><div className="grid grid-cols-3 gap-3">{THEMES.map(([k,l,ic,bg,fg])=><button key={k} onClick={()=>setTheme(k)} className={`rounded-2xl border p-3 text-center transition active:scale-95 ${theme===k?'border-lime bg-white/5':'border-line hover:border-white/30'}`}><div className="h-14 rounded-xl border border-line mb-2.5 p-2 flex flex-col gap-1.5" style={{background:bg}}><span className="h-2 w-2/3 rounded" style={{background:fg}}/><span className="h-2 w-1/2 rounded bg-lime"/></div><p className="text-xs font-bold flex items-center justify-center gap-1.5"><I n={k==='dark'?'moon':k==='light'?'sun':'monitor'} s={13}/>{l}</p></button>)}</div></Card>
  <Card id="notifications" title="Notifications" sub="Choose what you want to hear about."><div className="divide-y divide-line">{NOTIFS.map(([k,l,d])=><Toggle key={k} on={st.notif[k]} onChange={setN(k)} label={l} desc={d}/>)}</div></Card>
  <Card id="privacy" title="Privacy" sub="Control what other players can see.">
   <p className="text-xs font-bold uppercase tracking-wider text-mute mb-2">Profile visibility</p>
   <div className="grid grid-cols-3 gap-2 mb-2">{[['public','Public'],['friends','Friends'],['private','Private']].map(([k,l])=><button key={k} onClick={()=>setP('visibility')(k)} className={`rounded-xl border py-2.5 text-sm font-bold transition ${st.privacy.visibility===k?'border-lime bg-lime text-ink':'border-line bg-bg2 hover:border-white/30'}`}>{l}</button>)}</div>
   <div className="divide-y divide-line"><Toggle on={st.privacy.history} onChange={setP('history')} label="Show prediction history" desc="Let others see your past picks"/><Toggle on={st.privacy.requests} onChange={setP('requests')} label="Allow friend requests" desc="Anyone can send you a request"/><Toggle on={st.privacy.online} onChange={setP('online')} label="Show online status" desc="Display the green dot to friends"/></div></Card>
  <Card id="preferences" title="Preferences" sub="Personalise your matches and community.">
   <Acc title="Favourite club" value={p.club?T[p.club][0]:'Not set'}><ClubPicker value={p.club} onChange={v=>{update({profile:{club:v}});toast('Favourite club updated')}}/></Acc>
   <Acc title="Favourite leagues" value={`${(p.leagues||[]).length} selected`}><LeaguePicker value={p.leagues||[]} onChange={v=>update({profile:{leagues:v}})}/></Acc>
   <Acc title="Preferred country" value={p.country?<>{flag(p.country)} {countryName(p.country)}</>:'Not set'}><CountryPicker value={p.country} onChange={v=>{update({profile:{country:v}});toast('Country updated')}}/></Acc></Card>
  <Card id="actions" title="Account actions">
   <div className="flex flex-col sm:flex-row gap-3"><Btn v="s" onClick={()=>setOut(true)}><I n="logout" s={16}/>Log out</Btn><button onClick={()=>{setTyped('');setDel(true)}} className="rounded-xl font-bold text-sm px-5 py-3 border border-red-400/40 text-red-400 hover:bg-red-500/10 transition active:scale-95 inline-flex items-center justify-center gap-2"><I n="trash" s={16}/>Delete account</button></div></Card>
  {out&&<Confirm title="Log out?" body="You will return to the landing page. Your demo account stays saved in this browser." label="Log out" onConfirm={doLogout} onClose={()=>setOut(false)}/>}
  {del&&<Sheet title="Delete your account?" onClose={()=>setDel(false)}><p className="text-sm text-mute">This removes your demo account from this browser. This cannot be undone. Type <b className="text-white">DELETE</b> to confirm.</p><input value={typed} onChange={e=>setTyped(e.target.value)} placeholder="DELETE" className="w-full mt-4 rounded-xl bg-card border border-line px-4 py-3 text-sm outline-none focus:border-red-400/60"/><div className="grid grid-cols-2 gap-3 mt-5"><Btn v="s" onClick={()=>setDel(false)}>Cancel</Btn><button onClick={doDelete} className={`rounded-xl font-bold text-sm px-5 py-3 bg-red-500 text-[#fff] transition ${typed==='DELETE'?'':'opacity-40 pointer-events-none'}`}>Delete account</button></div></Sheet>}
 </div>}
