import React,{useState,useContext,useMemo} from 'react'
import {Ctx} from './context'
import {useApi} from './footballApi'
import {normFixture,normLineups,normFixturePlayers,normTeamStats,normEvents,statusInfo} from './liveData'
import {registerTeam} from './intelHelpers'
import {I} from './Icon'
import {Btn} from './ui'
import {TeamLogo,LiveStatus,Async,Skeleton,ErrorBox,DataBanner,fmtTime,tzName} from './LiveBits'
import {Crumbs,Empty,DemoTag,PlayerAvatar} from './PlayerBits'
import {LineupView,LineupPending} from './Pitch'

const TABS=[['overview','Overview'],['lineups','Lineups'],['stats','Player Stats']];
const fmt=v=>v==null?'–':v;

function Header({fx}){const st=fx.status,show=st.kind!=='upcoming'&&st.kind!=='off';
 return <div className="rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-5 sm:p-8">
  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-mute"><span className="flex items-center gap-2">{fx.leagueLogo&&<img src={fx.leagueLogo} alt="" className="w-5 h-5 object-contain"/>}{fx.leagueName}{fx.round?` · ${fx.round}`:''}</span><LiveStatus st={st}/></div>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-6 text-center"><div className="flex flex-col items-center gap-3"><TeamLogo t={fx.home} s={72}/><span className="font-extrabold text-sm sm:text-lg">{fx.home.name}</span></div>
   {show?<p className="text-4xl sm:text-5xl font-extrabold tabular-nums">{fx.goals.home??'–'}<span className="text-mute mx-1.5">–</span>{fx.goals.away??'–'}</p>:<div><p className="text-mute font-bold">VS</p><p className="text-xs text-mute mt-1">{fmtTime(fx.timestamp)}</p></div>}
   <div className="flex flex-col items-center gap-3"><TeamLogo t={fx.away} s={72}/><span className="font-extrabold text-sm sm:text-lg">{fx.away.name}</span></div></div>
  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-6 text-xs text-mute"><span className="flex items-center gap-1.5"><I n="clock" s={13}/>{fmtTime(fx.timestamp)}{tzName()?` (${tzName()})`:''}</span>{fx.venue&&<span className="flex items-center gap-1.5"><I n="pin" s={13}/>{fx.venue}{fx.city?`, ${fx.city}`:''}</span>}{fx.referee&&<span>Referee: {fx.referee}</span>}</div></div>}

function EventIcon({e}){return e.type==='Goal'?<I n="ball" s={13}/>:e.type==='Card'?<span className={`w-2.5 h-3.5 rounded-sm ${/Red/.test(e.detail)?'bg-red-500':'bg-yellow-400'}`}/>:e.type==='subst'?<I n="arrow" s={12}/>:<I n="info" s={12}/>}
function Overview({fx,fin,kind}){
 const on=kind!=='upcoming'&&kind!=='off';
 const ev=useApi('events',{fixture:fx.id,final:fin},{enabled:on,ttl:fin?3600000:60000}),st=useApi('fixtureStats',{fixture:fx.id,final:fin},{enabled:on,ttl:fin?3600000:120000});
 const events=normEvents(ev.data),rows=st.data?normTeamStats(st.data,fx):null;
 if(!on)return <Empty icon="clock" title={kind==='off'?`Match ${fx.status.long.toLowerCase()}`:'Match events and statistics will appear once the game begins.'} body="Nothing is shown before kickoff, and nothing is estimated."/>;
 return <div className="grid lg:grid-cols-2 gap-4">
  <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-4">Match events</p><Async s={ev}>{events.length?<div className="space-y-4 border-l border-line ml-3">{[...events].reverse().map((e,i)=><div key={i} className="relative pl-6"><span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-bg2 border border-line grid place-items-center"><EventIcon e={e}/></span><p className="text-xs text-mute">{e.minute!=null?`${e.minute}${e.extra?'+'+e.extra:''}'`:''} · {e.teamName}</p><p className="text-sm font-semibold">{e.type==='subst'?`${e.assist||'?'} off, ${e.player||'?'} on`:`${e.detail}${e.player?': '+e.player:''}${e.assist&&e.type==='Goal'?` (assist: ${e.assist})`:''}`}</p></div>)}</div>:<p className="text-sm text-mute">The provider has no events for this match yet.</p>}</Async></div>
  <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-4">Team statistics</p><Async s={st} banner={false}>{rows?<div className="space-y-4"><div className="flex justify-between text-xs font-bold"><span>{fx.home.name}</span><span>{fx.away.name}</span></div>{rows.map(r=>{const h=r.h??0,a=r.a??0,t=h+a||1;return <div key={r.label}><div className="flex justify-between text-sm tabular-nums"><b>{r.h==null?'–':r.h+r.unit}</b><span className="text-xs text-mute">{r.label}</span><b>{r.a==null?'–':r.a+r.unit}</b></div><div className="flex h-2 gap-1 mt-1.5"><div className="rounded-l-full bg-bg2 flex justify-end overflow-hidden" style={{width:h/t*100+'%'}}><div className="h-full w-full" style={{background:'#34D399'}}/></div><div className="rounded-r-full bg-bg2 overflow-hidden" style={{width:a/t*100+'%'}}><div className="h-full w-full" style={{background:'#5AA9FF'}}/></div></div></div>})}</div>:<p className="text-sm text-mute">The provider has not returned team statistics for this match.</p>}</Async></div></div>}

function Lineups({fx,fin,kind}){
 const r=useApi('lineups',{fixture:fx.id,final:fin},{ttl:kind==='upcoming'?300000:3600000});
 const lu=useMemo(()=>r.data?normLineups(r.data,fx):null,[r.data]);
 if(r.loading&&!r.data)return <Skeleton n={2} h="h-40"/>;
 if(r.error&&!r.data)return <ErrorBox e={r.error} retry={r.reload}/>;
 if(!lu)return <><DataBanner s={r}/><LineupPending m={{t:fmtTime(fx.timestamp)}} demo={kind!=='upcoming'&&kind!=='off'}/></>;
 const hc='T'+fx.home.id,ac='T'+fx.away.id;
 registerTeam(hc,{name:fx.home.name,logo:fx.home.logo,color:lu.H.color});registerTeam(ac,{name:fx.away.name,logo:fx.away.logo,color:lu.A.color});
 const m={id:fx.id,h:hc,a:ac,t:fmtTime(fx.timestamp)};
 const d={live:true,H:{...lu.H,manager:lu.H.coach},A:{...lu.A,manager:lu.A.coach},ps:{}};
 return <><DataBanner s={r}/><LineupView key={fx.id} m={m} d={d}/><p className="text-[11px] text-mute mt-4">Positions use the provider's grid. Match ratings load in the Player Stats tab.</p></>}

const COLS=[['min','Min'],['rating','Rating'],['g','G'],['a','A'],['shots','Shots'],['sot','SoT'],['keyPasses','Key'],['passes','Passes'],['passAcc','Acc.*'],['tackles','Tkl'],['duelsWon','Duels won'],['saves','Saves'],['y','YC'],['r','RC']];
function Stats({fx,fin,kind}){
 const on=kind!=='upcoming'&&kind!=='off';const {nav}=useContext(Ctx);
 const r=useApi('fixturePlayers',{fixture:fx.id,final:fin},{enabled:on,ttl:fin?3600000:120000});
 const [sort,setSort]=useState('rating'),[side,setSide]=useState('all');
 if(!on)return <Empty icon="clock" title="Player statistics will appear once the match is underway." body="Nothing is shown or estimated before kickoff."/>;
 const all=normFixturePlayers(r.data).filter(p=>p.min!=null||p.rating!=null);
 const rows=all.filter(p=>side==='all'||(side==='H'?p.teamId===fx.home.id:p.teamId===fx.away.id)).sort((a,b)=>(b[sort]??-1)-(a[sort]??-1));
 return <Async s={r}>{all.length?<div>
  <div className="flex flex-wrap items-center gap-3 mb-4"><div role="group" aria-label="Team filter" className="inline-flex rounded-full border border-line bg-card p-1">{[['all','Both'],['H',fx.home.name],['A',fx.away.name]].map(([k,l])=><button key={k} aria-pressed={side===k} onClick={()=>setSide(k)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${side===k?'bg-lime text-ink':'text-mute'}`}>{l}</button>)}</div>
   <label className="text-xs text-mute flex items-center gap-2 ml-auto">Sort by<select value={sort} onChange={e=>setSort(e.target.value)} className="rounded-xl bg-card border border-line px-3 py-2 text-sm font-semibold text-white outline-none"><option value="rating">Rating</option><option value="g">Goals</option><option value="a">Assists</option><option value="min">Minutes played</option></select></label></div>
  <div className="rounded-2xl border border-line bg-card overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="text-[10px] uppercase tracking-wider text-mute border-b border-line"><th className="text-left px-4 py-2.5">Player</th>{COLS.map(([k,l])=><th key={k} className="px-2 py-2.5 text-center">{l}</th>)}</tr></thead>
   <tbody className="divide-y divide-line">{rows.map(p=><tr key={p.id+'-'+p.teamId} onClick={()=>p.id&&nav('lplayer/'+p.id)} className="hover:bg-white/[0.04] cursor-pointer"><td className="px-4 py-2.5"><span className="flex items-center gap-2.5"><PlayerAvatar p={{name:p.name,photo:p.photo,team:'x',num:p.num}} s={30} num={false}/><span><b className="block font-semibold">{p.name}</b><span className="text-[10px] text-mute">{p.teamName}{p.pos?` · ${p.pos}`:''}{p.captain?' · C':''}</span></span></span></td>{COLS.map(([k])=><td key={k} className={`px-2 py-2.5 text-center tabular-nums ${k==='rating'?'font-extrabold':''}`}>{k==='rating'&&p.rating!=null?p.rating.toFixed(1):fmt(p[k])}</td>)}</tr>)}</tbody></table></div>
  <p className="text-[11px] text-mute mt-3">Only values returned by the provider are shown; "–" means not provided. *Pass accuracy is displayed exactly as the provider returns it. Ratings are the provider's ratings for this match.</p></div>
  :<Empty icon="clock" title="No player statistics yet" body="The provider has not published player statistics for this match."/>}</Async>}

export function LiveMatchPage({id,tab='overview'}){
 const {nav}=useContext(Ctx);const valid=/^\d+$/.test(String(id||''));
 const r=useApi('fixture',{id},{enabled:valid,ttl:60000,poll:undefined});
 if(!valid)return <div><Crumbs items={[{l:'Matches',go:'matches'},{l:'Not found'}]}/><Empty icon="alert" title="Invalid match" body="That match id is not valid."><Btn onClick={()=>nav('matches')}>Back to Matches</Btn></Empty></div>;const raw=r.data&&r.data[0];const fx=raw?normFixture(raw):null;const kind=fx&&fx.status.kind,fin=kind==='finished'?1:0;
 const t=TABS.find(x=>x[0]===tab)?tab:'overview';
 return <div>
  <Crumbs items={[{l:'Matches',go:'matches'},{l:fx?fx.leagueName||'Competition':'Match',go:'matches'},{l:'Match Details',go:`lmatch/${id}/overview`},{l:TABS.find(x=>x[0]===t)[1]}]}/>
  {r.loading&&!r.data?<Skeleton n={2} h="h-40"/>:r.error&&!r.data?<ErrorBox e={r.error} retry={r.reload}/>:!fx?<Empty icon="alert" title="Match not found" body="The provider returned no fixture for this id."><Btn onClick={()=>nav('matches')}>Back to Matches</Btn></Empty>:<>
   <Header fx={fx}/>
   <div role="tablist" aria-label="Match sections" className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mt-6 mb-6">{TABS.map(([k,l])=><button key={k} role="tab" aria-selected={t===k} onClick={()=>nav(`lmatch/${id}/${k}`)} className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${t===k?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{l}</button>)}</div>
   <div key={t} className="slide">{t==='overview'&&<Overview fx={fx} fin={fin} kind={kind}/>}{t==='lineups'&&<Lineups fx={fx} fin={fin} kind={kind}/>}{t==='stats'&&<Stats fx={fx} fin={fin} kind={kind}/>}</div></>}
  <p className="text-[11px] text-mute mt-6">Data: API-Football{r.updatedAt?`, fetched ${new Date(r.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`:''}. Cached responses are not real-time.</p></div>}
