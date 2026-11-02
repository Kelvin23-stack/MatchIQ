import React,{useState,useEffect} from 'react'
import {motion} from 'framer-motion'
import {T} from './data'
import {Ctx} from './context'
import {useStored} from './hooks'
import {AuthProvider,useAuth} from './AuthContext'
import {SocialProvider} from './SocialContext'
import {Landing} from './Landing'
import {Shell,TABS} from './Dashboard'
import {SignUp,Login,Forgot,Reset} from './Auth'
import {Onboarding} from './Onboarding'
import {Toasts} from './Overlays'
import {PredictionModal} from './PredictionModal'
import {MatchDetail} from './MatchDetail'
import {ShareModal} from './ShareModal'
import {UserModal} from './UserModal'

const KEY='matchiq.predictions'
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
const SHELL=TABS.map(t=>t[0]),AUTH=['signup','login','forgot','reset'],VALID=[...SHELL,...AUTH,'landing','onboarding','player','match'],tabOf=r=>{const b=r.split('/')[0];return b==='player'?'players':b==='match'?'matches':b};

function Router({view}){
 const {user}=useAuth();let r=view;
 const base=view.split('/')[0];
 if(!user){if(SHELL.includes(base)||['player','match'].includes(base)||view==='onboarding')r='login'}
 else if(!user.onboarded){if(view!=='landing')r='onboarding'}
 else if(AUTH.includes(view)||view==='onboarding')r='overview';
 useEffect(()=>{if(r!==view)location.replace('#'+r)},[r,view]);
 const grp=r==='landing'?'l':AUTH.includes(r)?'a'+r:r==='onboarding'?'o':'d';
 const C={signup:SignUp,login:Login,forgot:Forgot,reset:Reset}[r];
 return <motion.div key={grp} initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.4}}>{r==='landing'?<Landing/>:C?<C/>:r==='onboarding'?<Onboarding/>:<Shell tab={tabOf(r)} route={r}/>}</motion.div>}

export default function App(){
 const get=()=>{const h=location.hash.slice(1);return VALID.includes(h.split('/')[0])?h:'landing'};
 const[view,setView]=useState(get),[store,setStore]=useState(load),[points]=useState(2450),[modal,setModal]=useState(null),[detail,setDetail]=useState(null),[toasts,setToasts]=useState([]),[theme,setTheme]=useStored('matchiq.theme','dark');
 useEffect(()=>{const f=()=>{setView(get());window.scrollTo(0,0)};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}},[store]);
 useEffect(()=>{const k=e=>{if(e.key==='Escape'){setModal(null);setDetail(null)}};addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
 useEffect(()=>{const mq=matchMedia('(prefers-color-scheme: light)');const apply=()=>{document.documentElement.dataset.theme=theme==='system'?(mq.matches?'light':'dark'):theme};apply();mq.addEventListener('change',apply);return()=>mq.removeEventListener('change',apply)},[theme]);
 const nav=v=>{location.hash=v;setView(VALID.includes(v.split('/')[0])?v:'landing')};
 const toast=m=>{const id=Date.now()+Math.random();setToasts(t=>[...t,{id,m}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3200)};
 const save=(m,p,edit)=>{setStore(s=>({...s,[m.id]:{...p,at:Date.now()}}));toast(`${edit?'Prediction updated':'Prediction locked'}: ${T[m.h][0]} vs ${T[m.a][0]}`)};
 const preds=Object.fromEntries(Object.keys(store).map(k=>[k,store[k].result||'X']));
 return <Ctx.Provider value={{nav,toast,preds,points,store,save,modal,setModal,openPick:setModal,detail,setDetail,toasts,theme,setTheme}}><AuthProvider><SocialProvider>
  <Router view={view}/><MatchDetail/><PredictionModal/><ShareModal/><UserModal/><Toasts/></SocialProvider></AuthProvider></Ctx.Provider>}
