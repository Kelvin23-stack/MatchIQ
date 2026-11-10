import React,{useState,useContext} from 'react'
import {Ctx} from './context'
import {useAuth} from './AuthContext'
import {V,hasErrors} from './validation'
import {I} from './Icon'
import {Btn,LogoMark} from './ui'
import {Field,PasswordField,Strength,Checkbox,GoogleButton} from './Fields'

const Brand=()=><button onClick={()=>{location.hash='landing'}} className="flex items-center gap-2 font-extrabold text-xl tracking-tight"><LogoMark/>Match<span style={{color:'rgb(var(--brand))'}}>IQ</span></button>;
function AuthShell({title,sub,children}){
 return <div className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
  <div className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 border-r border-line bg-gradient-to-br from-card via-bg2 to-bg"><div className="glow absolute inset-0 pointer-events-none"/>
   <div className="relative"><Brand/></div>
   <div className="relative"><h2 className="text-5xl font-extrabold leading-[1.05] tracking-tight">Predict Smart.<br/><span className="bg-gradient-to-r from-gold to-flame bg-clip-text text-transparent">Play Bold.</span></h2>
    <div className="mt-8 space-y-4 max-w-sm">{[['target','Predict real fixtures','Pick results, scores and markets before kickoff.','#5AA9FF'],['trophy','Climb the leaderboard','Earn points, build streaks and unlock badges.','#F5C451'],['users','Play with friends','Private leagues, match rooms and club communities.','#B388FF']].map(([ic,t,d,c])=><div key={t} className="flex gap-3"><span className="w-10 h-10 rounded-xl grid place-items-center shrink-0" style={{background:c+'22',color:c}}><I n={ic} s={18}/></span><div><p className="font-bold text-sm">{t}</p><p className="text-xs text-mute">{d}</p></div></div>)}</div></div>
   <p className="relative text-xs text-mute">Virtual points only. No real-money gambling.</p></div>
  <div className="flex flex-col px-5 py-6 sm:px-10" style={{paddingTop:'max(1.5rem,env(safe-area-inset-top))',paddingBottom:'max(1.5rem,env(safe-area-inset-bottom))'}}>
   <div className="lg:hidden"><Brand/></div>
   <div className="flex-1 grid place-items-center py-8"><div className="up w-full max-w-md"><h1 className="text-3xl font-extrabold tracking-tight">{title}</h1><p className="text-mute mt-2">{sub}</p><div className="mt-7">{children}</div></div></div>
   <p className="text-[11px] text-mute text-center max-w-md mx-auto">Prototype: accounts are mock and stored only in this browser. This is not real account security.</p></div></div>}
const Divider=()=><div className="flex items-center gap-3 text-xs text-mute my-5"><span className="flex-1 h-px bg-line"/>or<span className="flex-1 h-px bg-line"/></div>;
const Banner=({children})=><div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2"><I n="alert" s={16}/>{children}</div>;
const useTouched=()=>{const [t,setT]=useState({}),[sub,setSub]=useState(false);return{show:k=>sub||t[k],blur:k=>setT(s=>({...s,[k]:true})),submit:()=>setSub(true)}};

export function SignUp(){
 const {toast,nav}=useContext(Ctx);const {signup}=useAuth();const tt=useTouched();
 const [v,setV]=useState({name:'',username:'',email:'',password:'',confirm:'',terms:false}),[srv,setSrv]=useState({});
 const set=k=>e=>{setV(s=>({...s,[k]:e.target.value}));setSrv(s=>({...s,[k]:''}))};
 const err={name:V.name(v.name),username:V.username(v.username),email:V.email(v.email),password:V.password(v.password),confirm:V.confirm(v.confirm,v.password),terms:v.terms?'':'You need to accept the terms to continue'};
 const e=k=>tt.show(k)?(err[k]||srv[k]):'';
 const go=ev=>{ev.preventDefault();tt.submit();if(hasErrors(err))return;const r=signup(v);if(r.error){setSrv({[r.field]:r.error});return}toast('Account created. Let’s personalise MatchIQ.');nav('onboarding')};
 return <AuthShell title="Create your account" sub="Join MatchIQ and start predicting in minutes."><form noValidate onSubmit={go} className="space-y-4">
  <Field label="Full name" icon="user" value={v.name} onChange={set('name')} onBlur={()=>tt.blur('name')} error={e('name')} placeholder="Alex Morgan" autoComplete="name"/>
  <Field label="Username" icon="star" value={v.username} onChange={set('username')} onBlur={()=>tt.blur('username')} error={e('username')} placeholder="alex_predicts" autoComplete="username"/>
  <Field label="Email address" icon="mail" type="email" value={v.email} onChange={set('email')} onBlur={()=>tt.blur('email')} error={e('email')} placeholder="you@example.com" autoComplete="email"/>
  <div><PasswordField label="Password" value={v.password} onChange={set('password')} onBlur={()=>tt.blur('password')} error={e('password')} placeholder="At least 8 characters" autoComplete="new-password"/><Strength v={v.password}/></div>
  <PasswordField label="Confirm password" value={v.confirm} onChange={set('confirm')} onBlur={()=>tt.blur('confirm')} error={e('confirm')} placeholder="Repeat your password" autoComplete="new-password"/>
  <Checkbox checked={v.terms} onChange={c=>setV(s=>({...s,terms:c}))} error={tt.show('terms')?err.terms:''}>I agree to the <span className="text-white font-semibold">Terms & Conditions</span> and <span className="text-white font-semibold">Privacy Policy</span>.</Checkbox>
  <Btn type="submit" className="w-full">Create Account</Btn></form>
  <Divider/><GoogleButton label="Sign up with Google" onClick={()=>toast('Google sign-up is a visual placeholder in this prototype.')}/>
  <p className="text-sm text-mute text-center mt-6">Already have an account? <button onClick={()=>nav('login')} className="text-white font-bold hover:underline">Log in</button></p></AuthShell>}

export function Login(){
 const {toast,nav}=useContext(Ctx);const {login}=useAuth();const tt=useTouched();
 const [v,setV]=useState({id:'',pw:'',remember:true}),[srv,setSrv]=useState('');
 const err={id:v.id.trim()?'':'Enter your email or username',pw:v.pw?'':'Enter your password'};
 const go=ev=>{ev.preventDefault();tt.submit();if(hasErrors(err))return;const r=login(v.id,v.pw,v.remember);if(r.error){setSrv(r.error);return}toast('Welcome back!');nav('overview')};
 return <AuthShell title="Welcome back" sub="Log in to continue your streak."><form noValidate onSubmit={go} className="space-y-4">
  {srv&&<Banner>{srv}</Banner>}
  <Field label="Email or username" icon="user" value={v.id} onChange={e=>{setV({...v,id:e.target.value});setSrv('')}} onBlur={()=>tt.blur('id')} error={tt.show('id')?err.id:''} placeholder="you@example.com" autoComplete="username"/>
  <PasswordField label="Password" value={v.pw} onChange={e=>{setV({...v,pw:e.target.value});setSrv('')}} onBlur={()=>tt.blur('pw')} error={tt.show('pw')?err.pw:''} placeholder="Your password" autoComplete="current-password"/>
  <div className="flex items-center justify-between"><Checkbox checked={v.remember} onChange={c=>setV({...v,remember:c})}>Remember me</Checkbox><button type="button" onClick={()=>nav('forgot')} className="text-sm font-semibold text-sky hover:underline">Forgot password?</button></div>
  <Btn type="submit" className="w-full">Log in</Btn></form>
  <Divider/><GoogleButton label="Continue with Google" onClick={()=>toast('Google login is a visual placeholder in this prototype.')}/>
  <p className="text-sm text-mute text-center mt-6">New to MatchIQ? <button onClick={()=>nav('signup')} className="text-white font-bold hover:underline">Create an account</button></p></AuthShell>}

export function Forgot(){
 const {nav}=useContext(Ctx);const [email,setEmail]=useState(''),[sent,setSent]=useState(false),[show,setShow]=useState(false);const er=V.email(email);
 const go=ev=>{ev.preventDefault();setShow(true);if(er)return;try{sessionStorage.setItem('matchiq.resetEmail',email.trim())}catch(x){}setSent(true)};
 return <AuthShell title={sent?'Check your inbox':'Forgot password?'} sub={sent?'If an account exists for that email, a reset link would be sent.':'Enter your email and we will start the reset flow.'}>
  {sent?<div><div className="rounded-2xl border border-line bg-card p-5"><div className="w-12 h-12 rounded-full bg-emerald-400/15 text-emerald-400 grid place-items-center"><I n="mail" s={22}/></div><p className="font-bold mt-4">Request received for {email}</p><p className="text-sm text-mute mt-1">Demo mode: no email has been sent because MatchIQ has no email service yet. Use the button below to continue to the reset screen.</p></div>
   <Btn className="w-full mt-5" onClick={()=>nav('reset')}>Open demo reset screen</Btn><button onClick={()=>nav('login')} className="block mx-auto mt-4 text-sm text-mute hover:text-white">Back to login</button></div>
  :<form noValidate onSubmit={go} className="space-y-4"><Field label="Email address" icon="mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} error={show?er:''} placeholder="you@example.com"/><Btn type="submit" className="w-full">Send reset link</Btn><button type="button" onClick={()=>nav('login')} className="block mx-auto text-sm text-mute hover:text-white">Back to login</button></form>}</AuthShell>}

export function Reset(){
 const {toast,nav}=useContext(Ctx);const {resetPassword}=useAuth();const tt=useTouched();
 const [v,setV]=useState({email:(()=>{try{return sessionStorage.getItem('matchiq.resetEmail')||''}catch(x){return ''}})(),password:'',confirm:''}),[srv,setSrv]=useState('');
 const err={email:V.email(v.email),password:V.password(v.password),confirm:V.confirm(v.confirm,v.password)};
 const go=ev=>{ev.preventDefault();tt.submit();if(hasErrors(err))return;const r=resetPassword(v.email,v.password);if(r.error){setSrv(r.error);return}try{sessionStorage.removeItem('matchiq.resetEmail')}catch(x){}toast('Password updated. You can log in now.');nav('login')};
 return <AuthShell title="Set a new password" sub="Choose a strong password you have not used before."><form noValidate onSubmit={go} className="space-y-4">
  {srv&&<Banner>{srv}</Banner>}
  <Field label="Account email" icon="mail" type="email" value={v.email} onChange={e=>{setV({...v,email:e.target.value});setSrv('')}} error={tt.show('email')?err.email:''} placeholder="you@example.com"/>
  <div><PasswordField label="New password" value={v.password} onChange={e=>setV({...v,password:e.target.value})} error={tt.show('password')?err.password:''} placeholder="At least 8 characters"/><Strength v={v.password}/></div>
  <PasswordField label="Confirm new password" value={v.confirm} onChange={e=>setV({...v,confirm:e.target.value})} error={tt.show('confirm')?err.confirm:''} placeholder="Repeat your password"/>
  <Btn type="submit" className="w-full">Update password</Btn><button type="button" onClick={()=>nav('login')} className="block mx-auto text-sm text-mute hover:text-white">Back to login</button></form></AuthShell>}
