import React,{createContext,useContext,useState} from 'react'
import {Ctx} from './context'
import {useStored} from './hooks'
import {ME,hash} from './compData'
// MOCK AUTH: accounts live in this browser's localStorage and passwords are only run through
// a trivial non-cryptographic hash. This is NOT real security. Replace with Supabase Auth later.
export const AC=createContext();export const useAuth=()=>useContext(AC);
const hp=s=>'m'+hash('matchiq:'+s);
const SK='matchiq.session';
const DEF={notif:{reminders:true,results:true,friends:true,community:true,achievements:true},privacy:{visibility:'public',history:true,requests:true,online:true}};
const merge=(a,p)=>({...a,...p,profile:{...a.profile,...(p.profile||{})},settings:{...a.settings,...(p.settings||{}),notif:{...a.settings.notif,...((p.settings||{}).notif||{})},privacy:{...a.settings.privacy,...((p.settings||{}).privacy||{})}}});
const applyMe=u=>Object.assign(ME,{name:u.username,full:u.name,cc:u.profile.country||'NG',club:u.profile.club||'ARS',avatar:u.profile.avatar||null,bio:u.profile.bio||'',leagues:u.profile.leagues||[]});
export function AuthProvider({children}){
 const {toast}=useContext(Ctx);
 const [accounts,setAccounts]=useStored('matchiq.accounts',[]);
 const [sid,setSid]=useState(()=>{try{return localStorage.getItem(SK)||sessionStorage.getItem(SK)||null}catch(e){return null}});
 const user=accounts.find(a=>a.id===sid)||null;if(user)applyMe(user);
 const setSession=(id,remember)=>{try{localStorage.removeItem(SK);sessionStorage.removeItem(SK);(remember?localStorage:sessionStorage).setItem(SK,id)}catch(e){}setSid(id)};
 const taken=(username,except)=>accounts.some(a=>a.id!==except&&a.username.toLowerCase()===username.toLowerCase());
 const signup=({name,username,email,password})=>{
  if(accounts.some(a=>a.email.toLowerCase()===email.toLowerCase()))return{field:'email',error:'An account with this email already exists'};
  if(taken(username))return{field:'username',error:'That username is taken'};
  const id='u'+Date.now(),a={id,name:name.trim(),username,email:email.trim(),pw:hp(password),created:Date.now(),onboarded:false,profile:{club:'',leagues:[],country:'',interests:[],bio:'',avatar:null},settings:DEF};
  setAccounts(s=>[...s,a]);setSession(id,true);return{ok:true}};
 const login=(idf,pw,remember)=>{const k=idf.trim().toLowerCase(),a=accounts.find(x=>x.email.toLowerCase()===k||x.username.toLowerCase()===k);
  if(!a||a.pw!==hp(pw))return{error:'Incorrect email/username or password.'};setSession(a.id,remember);return{ok:true}};
 const logout=()=>{try{localStorage.removeItem(SK);sessionStorage.removeItem(SK)}catch(e){}setSid(null)};
 const update=p=>setAccounts(s=>s.map(a=>a.id===sid?merge(a,p):a));
 const changePassword=(cur,next)=>{if(!user||user.pw!==hp(cur))return{error:'Your current password is incorrect'};update({pw:hp(next)});return{ok:true}};
 const resetPassword=(email,pw)=>{const a=accounts.find(x=>x.email.toLowerCase()===email.trim().toLowerCase());if(!a)return{error:'No demo account found for that email. Create an account first.'};setAccounts(s=>s.map(x=>x.id===a.id?{...x,pw:hp(pw)}:x));return{ok:true}};
 const deleteAccount=()=>{setAccounts(s=>s.filter(a=>a.id!==sid));logout()};
 return <AC.Provider value={{user,signup,login,logout,update,taken,changePassword,resetPassword,deleteAccount}}>{children}</AC.Provider>}
