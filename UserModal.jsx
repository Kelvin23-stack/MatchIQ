import React,{useContext} from 'react'
import {Ctx} from './context'
import {useSocial} from './SocialContext'
import {T} from './data'
import {ME,flag,ini,levelInfo,BADGES,board,hash} from './compData'
import {countryName} from './countries'
import {userOf,online} from './socialData'
import {I} from './Icon'
import {Sheet} from './Sheet'
import {Av,ClubBox,Btn} from './ui'
import {BadgeIcon} from './Badges'

// One profile sheet for the whole app: leaderboard rows, feed posts, comments, friends, leagues and chats all open this.
export function UserModal(){
 const {profileUser:pu,closeUser,friends,sendReq,accept,openChat}=useSocial();const {nav,toast}=useContext(Ctx);
 if(!pu)return null;
 const base=userOf(pu.name),me=base===ME||pu.name===ME.name,u=me?ME:{...base,...pu};
 const rank=pu.rank||(board('global').find(x=>x.name===u.name)||{}).rank,xp=me?ME.xp:Math.round(u.points*1.5),L=levelInfo(xp),best=me?ME.longest:u.streak+2+hash(u.name)%5;
 const dots=Array.from({length:10},(_,i)=>hash(u.name+i)%100<u.acc);
 const st=friends.friends.includes(u.name)?'friend':friends.incoming.includes(u.name)?'in':friends.sent.includes(u.name)?'sent':'none';
 const earned=me?BADGES.filter(b=>b.have):BADGES.slice(0,Math.min(9,1+hash(u.name)%7));
 return <Sheet title="Player profile" onClose={closeUser} z={70}>
  <div className="flex items-center gap-4"><div className="relative"><Av t={ini(me?ME.full:u.name)} s={68} me={me}/>{online(u)&&<span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-bg2"/>}</div>
   <div className="min-w-0"><p className="text-xl font-extrabold truncate">{me?ME.full:u.name}</p><p className="text-sm text-mute truncate">@{u.name} · {flag(u.cc)} {countryName(u.cc)}</p><p className="text-xs text-mute mt-0.5">Level {L.level} · {L.title}</p></div></div>
  <div className="mt-3"><div className="h-1.5 rounded-full bg-bg overflow-hidden"><div className="h-full rounded-full bg-sky" style={{width:L.pct+'%'}}/></div><p className="text-[11px] text-mute mt-1">{xp.toLocaleString()} XP · {L.need} to level {L.level+1}</p></div>
  <div className="flex items-center gap-3 mt-4 rounded-xl bg-card border border-line px-3 py-2.5"><ClubBox k={u.club} s={30}/><div><p className="text-[10px] uppercase tracking-wider text-mute">Favourite club</p><p className="text-sm font-bold">{T[u.club][0]}</p></div></div>
  {me&&ME.bio&&<p className="text-sm mt-3 break-words">{ME.bio}</p>}
  <div className="grid grid-cols-3 gap-2 mt-4">{[['Rank',rank?'#'+rank:'–',''],['Points',u.points.toLocaleString(),'text-gold'],['Accuracy',u.acc+'%','text-emerald-400'],['Streak',u.streak,'text-flame'],['Best streak',best,''],['Level',L.level,'text-sky']].map(([a,b,c])=><div key={a} className="rounded-xl bg-card border border-line p-3"><p className="text-[10px] text-mute">{a}</p><p className={`text-lg font-extrabold mt-0.5 ${c}`}>{b}</p></div>)}</div>
  <p className="text-[10px] uppercase tracking-wider text-mute mt-4 mb-2">Recent form · demo</p>
  <div className="flex gap-1.5">{dots.map((w,i)=><span key={i} className={`flex-1 h-7 rounded-md grid place-items-center ${w?'bg-emerald-400/15 text-emerald-400':'bg-red-500/10 text-red-400'}`}><I n={w?'check':'x'} s={12}/></span>)}</div>
  <p className="text-[10px] uppercase tracking-wider text-mute mt-4 mb-2">Achievements</p>
  <div className="flex flex-wrap gap-2">{earned.map(b=><span key={b.id} title={b.name}><BadgeIcon icon={b.icon} color={b.color} s={40}/></span>)}</div>
  <div className="grid grid-cols-2 gap-3 mt-6">{me?<><Btn v="s" onClick={()=>{closeUser();nav('competition/st')}}>My streak</Btn><Btn onClick={()=>{closeUser();nav('profile')}}>Edit profile</Btn></>
   :<><Btn v="s" onClick={()=>{closeUser();openChat(u.name)}}><I n="comment" s={15}/>Message</Btn>{st==='friend'?<Btn onClick={()=>{toast('Challenge sent to '+u.name+' (demo)');closeUser()}}>Challenge</Btn>:st==='in'?<Btn onClick={()=>{accept(u.name)}}>Accept request</Btn>:st==='sent'?<Btn v="s" className="opacity-60 pointer-events-none">Request pending</Btn>:<Btn onClick={()=>sendReq(u.name)}><I n="userplus" s={15}/>Add friend</Btn>}</>}</div>
 </Sheet>}
