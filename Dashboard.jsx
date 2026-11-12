import React,{useState,useEffect,useContext} from 'react'
import {T,marketLines} from './data'
import {MatchCentre} from './Matches'
import {Competition} from './Competition'
import {Community} from './Community'
import {MessagesPage} from './Messages'
import {useSocial} from './SocialContext'
import {NotificationBell} from './Notifications'
import {Profile} from './Profile'
import {Settings} from './Settings'
import {LivePlayersPage} from './LivePlayers'
import {LiveMatchPage} from './LiveMatchPage'
import {LivePlayerProfile} from './LivePlayers'
import {createPortal} from 'react-dom'
import {useAuth} from './AuthContext'
import {ME,ini} from './compData'
import {PredictionHistory} from './PredictionHistory'
import {Ctx} from './context'
import {I} from './Icon'
import {Crest,Av,Logo,Btn,Count} from './ui'
import {useNextMatches,useLeagueList,rehydrate} from './liveMatch'
import {MatchRow} from './LiveMatches'
import {Async} from './LiveBits'
import {setLeague} from './dataMode'
import {Empty} from './PlayerBits'
import {Loading} from './Loader'
import {Board} from './Board'

export const TABS=[['overview','Overview','grid'],['matches','Matches','ball'],['predictions','My Predictions','list'],['players','Player Intelligence','shirt'],['competition','Competition','trophy'],['community','Community','users'],['messages','Messages','comment'],['profile','Profile','user'],['settings','Settings','cog']];


const Stat=({l,v,s,ic})=><div className="rounded-2xl bg-card border border-line p-4 sm:p-5 hover:border-white/25 transition"><div className="flex justify-between text-mute text-xs"><span>{l}</span><span className={({trophy:'text-gold',check:'text-emerald-400',bolt:'text-sky',flame:'text-flame'})[ic]}><I n={ic} s={16}/></span></div><p className="text-2xl sm:text-3xl font-extrabold mt-3"><Count to={v} suffix={s}/></p></div>;

function Overview(){
 const {points,store,nav}=useContext(Ctx);
 const up=useNextMatches(4);const L=useLeagueList();
 const picks=Object.keys(store).length;
 return <div className="grid xl:grid-cols-3 gap-6">
   <div className="xl:col-span-2 space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"><Stat l="Total Points" v={points} ic="trophy"/><Stat l="Predictions" v={picks} ic="check"/><Stat l="Accuracy" v={76} s="%" ic="bolt"/><Stat l="Current Streak" v={5} ic="flame"/></div>
    <p className="text-[11px] text-mute -mt-3">Points, accuracy and streak are placeholders until Phase 2 (they are not calculated from real results yet).</p>
    <div><H t="Upcoming matches"/><Async s={up} banner={false}>{up.list.length?<div className="space-y-2">{up.list.map(m=><MatchRow key={m.id} m={m}/>)}</div>:<Empty title="No upcoming matches returned" body="The data provider has no scheduled matches for this competition."/>}</Async></div>
    <div><H t="Competitions"/>{L.loading?<Loading label="Loading competitions…" min="min-h-[7rem]" size={44}/>:L.list.length?<div className="grid sm:grid-cols-3 gap-4">{L.list.map(c=><Comp key={c.id} c={c}/>)}</div>:<Empty title="No competitions available" body="Enable competitions with HIGHLIGHTLY_LEAGUES on the server."/>}</div>
   </div>
   <div className="space-y-6">
    <div className="rounded-2xl border border-flame/25 bg-gradient-to-br from-flame/15 to-card p-5"><div className="flex items-center justify-between"><h3 className="font-bold">My Prediction Streak</h3><I n="flame" c="text-flame"/></div><p className="text-5xl font-extrabold mt-3 text-flame">5</p><p className="text-sm text-mute">correct in a row · best: 9</p><div className="flex gap-1.5 mt-4">{[1,1,1,1,1,0,0].map((x,i)=><div key={i} className={`flex-1 h-9 rounded-lg grid place-items-center ${x?'bg-flame text-ink':'bg-bg2 border border-line text-mute'}`}>{x?<I n="check" s={14}/>:i+1-4}</div>)}</div><p className="text-xs text-mute mt-3">Sample streak, shown until results tracking arrives.</p></div>
    <div><H t="Top 5 leaderboard"/><Board/></div>
    <div><H t="Recent activity"/><Activity/></div>
   </div></div>}

export function Dashboard({tab,route}){
 const [rb,...rr]=(route||tab).split('/');
 const body0={overview:<Overview/>,matches:<MatchCentre/>,predictions:<PredictionHistory/>,competition:<Competition/>,community:<Community/>,messages:<MessagesPage/>,settings:<Settings/>,profile:<Profile/>}[tab];let body=body0;
 if(rb==='competition')body=<Competition section={rr[0]}/>;
 if(rb==='lmatch')body=<LiveMatchPage id={rr[0]} tab={rr[1]}/>;
 if(rb==='lplayer')body=<LivePlayerProfile id={rr[0]}/>;
 if(rb==='players')body=<LivePlayersPage sub={rr[0]} a={rr[1]} b={rr[2]}/>;
 return <div key={route||tab} className="slide">{tab==='overview'&&<div className="mb-6"><h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {ME.full.split(' ')[0]}</h1><p className="text-mute text-sm mt-1">Your streak is alive. Keep it going this weekend.</p></div>}{body}</div>;}

export const H=({t})=><h2 className="font-bold text-lg mb-4">{t}</h2>;

// A real competition returned by the provider. "View matches" selects it in Match Centre.
export const Comp=({c})=>{const {nav}=useContext(Ctx);return <div className="rounded-2xl bg-card border border-line p-5 hover:border-white/25 transition"><div className="w-10 h-10 rounded-xl bg-white/5 border border-line grid place-items-center overflow-hidden">{c.logo?<img src={c.logo} alt="" referrerPolicy="no-referrer" className="w-7 h-7 object-contain"/>:<I n="trophy"/>}</div><p className="font-bold mt-4 text-sm">{c.name}</p><p className="text-xs text-mute">{c.country||'Competition'}</p><button onClick={()=>{setLeague(c.id);nav('matches')}} className="mt-4 text-xs font-bold text-white hover:underline">View matches</button></div>};

export const Activity=()=>{const{store}=useContext(Ctx);
 const rows=Object.values(store).filter(p=>p.m).sort((a,b)=>b.at-a.at).slice(0,5).map(p=>{rehydrate(p.m);return [T[p.m.h][0]+' vs '+T[p.m.a][0],`${marketLines(p,p.m).length} market${marketLines(p,p.m).length===1?'':'s'} predicted`]});
 return rows.length?<div className="rounded-2xl bg-card border border-line divide-y divide-line">{rows.map(r=><div key={r[0]} className="flex items-center gap-3 px-4 py-3"><div className="w-8 h-8 rounded-full grid place-items-center bg-emerald-400/10 text-emerald-400"><I n="check" s={14}/></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{r[0]}</p><p className="text-xs text-mute">Prediction submitted</p></div><span className="text-xs font-bold text-mute">{r[1]}</span></div>)}</div>
 :<div className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-mute">No predictions yet. Lock in your first pick from Matches.</div>};

const NAVC={overview:'#5AA9FF',matches:'#34D399',predictions:'#FF8A3D',competition:'#F5C451',community:'#B388FF',messages:'#22D3EE',profile:'#FF6FB5',settings:'#94A3B8',players:'#2DD4BF'};
const Tile=({k,ic,on,s=34})=>{const c=NAVC[k];return <span className="grid place-items-center rounded-[11px] shrink-0 transition" style={{width:s,height:s,background:on?`linear-gradient(145deg,${c},${c}bb)`:c+'22',border:'1px solid '+(on?c:c+'44'),color:on?'#fff':c,boxShadow:on?`0 6px 16px -6px ${c}`:'none'}}><I n={ic} s={s*.5}/></span>};
export function Shell({tab,route}){
 const {nav,toast}=useContext(Ctx);const {unread}=useSocial();const {logout}=useAuth();const [menu,setMenu]=useState(false);
 const unreadN=Object.values(unread).reduce((a,b)=>a+b,0);
 const out=()=>{setMenu(false);logout();nav('landing');toast('You have been logged out')};
 const go=k=>{setMenu(false);nav(k)};
 return <div className="min-h-screen lg:flex">
  <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-bg2 p-4 sticky top-0 h-screen"><div className="mb-8 mt-1 px-1 cursor-pointer" onClick={()=>nav('landing')}><Logo/></div>
   <nav className="flex flex-col gap-1">{TABS.map(([k,l,ic])=>{const on=tab===k;return <button key={k} onClick={()=>nav(k)} className={`flex items-center gap-3 px-2.5 py-2 rounded-2xl text-sm font-semibold transition border ${on?'bg-white/10 border-white/15 backdrop-blur text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)]':'border-transparent text-mute hover:bg-white/5 hover:text-white'}`}><Tile k={k} ic={ic} on={on}/>{l}{k==='messages'&&unreadN>0&&<span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-[#fff] text-[11px] font-bold grid place-items-center">{unreadN}</span>}</button>})}</nav>
   <div className="mt-auto rounded-2xl bg-card border border-line p-4"><p className="text-xs text-mute">Weekly goal</p><p className="font-bold mt-1">8 / 10 picks</p><div className="h-1.5 rounded-full bg-bg mt-3"><div className="h-full w-4/5 rounded-full bg-sky"/></div></div></aside>
  <div className="flex-1 min-w-0">
   <header className="sticky top-0 z-30 bg-bg/70 backdrop-blur-2xl border-b border-line px-4 sm:px-8 flex items-center justify-between" style={{paddingTop:'env(safe-area-inset-top,0px)',height:'calc(4rem + env(safe-area-inset-top,0px))'}}>
    <div className="lg:hidden cursor-pointer" onClick={()=>nav('landing')}><Logo/></div><p className="hidden lg:block text-sm text-mute">{TABS.find(t=>t[0]===tab)[1]}</p>
    <div className="flex items-center gap-3"><button onClick={()=>nav('competition/st')} aria-label="Open my streak" title="My streak" className="flex items-center gap-1.5 text-sm font-bold bg-white/10 backdrop-blur border border-white/15 rounded-full px-3 py-1.5 hover:bg-white/15 transition active:scale-95"><I n="flame" s={14} c="text-flame"/>{ME.streak}</button><NotificationBell/>
     <button onClick={()=>setMenu(!menu)} title="Account menu" aria-label={unreadN>0?`Account menu, ${unreadN} unread message${unreadN===1?'':'s'}`:'Account menu'} className={`relative rounded-full transition active:scale-95 ring-2 ${menu||tab==='profile'?'ring-white/60':'ring-white/15 hover:ring-white/40'}`}><Av t={ini(ME.full)} me/>{unreadN>0&&<span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-bg"/>}</button></div></header>
   {menu&&createPortal(<><div className="fixed inset-0 z-[55]" onClick={()=>setMenu(false)}/><div className="pop fixed z-[56] right-4 sm:right-8 w-60 rounded-2xl border border-white/15 bg-bg2/90 backdrop-blur-2xl shadow-2xl overflow-hidden" style={{top:'calc(4.25rem + env(safe-area-inset-top,0px))'}}>
    <div className="px-4 py-3 border-b border-line"><p className="font-bold text-sm truncate">{ME.full}</p><p className="text-xs text-mute truncate">@{ME.name}</p></div>
    {[['messages','Messages','comment'],['predictions','My Predictions','list'],['profile','Profile','user'],['settings','Settings','cog']].map(([k,l,ic])=><button key={k} onClick={()=>go(k)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold hover:bg-white/5 transition"><Tile k={k} ic={ic} on={false} s={28}/>{l}{k==='messages'&&unreadN>0&&<span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-[#fff] text-[11px] font-bold grid place-items-center">{unreadN}</span>}</button>)}
    <button onClick={out} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition border-t border-line"><span className="w-7 h-7 rounded-[9px] bg-red-500/15 grid place-items-center"><I n="logout" s={14}/></span>Log out</button></div></>,document.body)}
   <main className="px-4 sm:px-8 py-6 pb-32 lg:pb-10 max-w-6xl"><Dashboard tab={tab} route={route}/></main></div>
  {/* Mobile bottom navigation: a floating pill bar. The active item is a solid pill (icon + label); Messages is no longer here, it lives in the account menu. */}
  <nav aria-label="Primary" className="lg:hidden fixed z-40 inset-x-3 rounded-full border border-white/15 bg-bg2/80 backdrop-blur-2xl shadow-[0_12px_40px_-10px_rgba(0,0,0,.6)] grid grid-cols-5 gap-1 p-1.5" style={{bottom:'max(.75rem,env(safe-area-inset-bottom))'}}>{TABS.filter(t=>!['profile','settings','predictions','messages'].includes(t[0])).map(([k,l,ic])=>{const on=tab===k;return <button key={k} onClick={()=>nav(k)} aria-current={on?'page':undefined} className={`flex flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[10px] max-[359px]:text-[9px] leading-tight font-semibold transition active:scale-95 ${on?'bg-white text-bg font-bold shadow-[0_6px_16px_-8px_rgba(0,0,0,.5)]':'text-mute hover:text-white'}`}><I n={ic} s={20}/>{l.replace('My ','').split(' ')[0]}</button>})}</nav>
 </div>}
