import React,{useState,useContext,useMemo} from 'react'
import {Ctx} from './context'
import {useApi} from './footballApi'
import {normFixture,normLineups,normTeamStats,normEvents,normTopPlayers} from './liveData'
import {registerTeam} from './intelHelpers'
import {I} from './Icon'
import {Btn} from './ui'
import {TeamLogo,LiveStatus,Skeleton,ErrorBox,DataBanner,fmtTime,tzName,PROVIDER} from './LiveBits'
import {toMatch} from './liveMatch'
import {FavStar} from './LiveMatches'
import {marketLines} from './data'
import {Crumbs,Empty} from './PlayerBits'
import {LineupView,LineupPending} from './Pitch'

const TABS=[['overview','Overview'],['lineups','Lineups'],['stats','Player Stats']];
const fmtV=v=>v==null?'–':Number.isInteger(v)?v:Math.round(v*100)/100;
// The spec types top-player statistic values loosely (its own example is a number). Anything that is not a number or string shows as a dash instead of crashing.
const sv=v=>typeof v==='number'?fmtV(v):typeof v==='string'&&v?v:'–';

function Header({fx}){const {openPick,store}=useContext(Ctx);const st=fx.status,show=st.kind!=='upcoming'&&st.kind!=='off',m=toMatch(fx),pr=store[m.id],n=pr?marketLines(pr,m).length:0;
 return <div className="rounded-3xl border border-line bg-gradient-to-br from-card to-bg2 p-5 sm:p-8">
  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-mute"><span className="flex items-center gap-2">{fx.leagueLogo&&<img src={fx.leagueLogo} alt="" referrerPolicy="no-referrer" className="w-5 h-5 object-contain"/>}{fx.leagueName}{fx.round?` · ${fx.round}`:''}</span><span className="flex items-center gap-1"><LiveStatus st={st}/><FavStar m={m}/></span></div>
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-6 text-center"><div className="flex flex-col items-center gap-3"><TeamLogo t={fx.home} s={72}/><span className="font-extrabold text-sm sm:text-lg">{fx.home.name}</span></div>
   {show?<p className="text-4xl sm:text-5xl font-extrabold tabular-nums">{fx.goals.home??'–'}<span className="text-mute mx-1.5">–</span>{fx.goals.away??'–'}</p>:<div><p className="text-mute font-bold">VS</p><p className="text-xs text-mute mt-1">{fmtTime(fx.timestamp)}</p></div>}
   <div className="flex flex-col items-center gap-3"><TeamLogo t={fx.away} s={72}/><span className="font-extrabold text-sm sm:text-lg">{fx.away.name}</span></div></div>
  <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-6 text-xs text-mute"><span className="flex items-center gap-1.5"><I n="clock" s={13}/>{fmtTime(fx.timestamp)}{tzName()?` (${tzName()})`:''}</span>{fx.venue&&<span className="flex items-center gap-1.5"><I n="pin" s={13}/>{fx.venue}{fx.city?`, ${fx.city}`:''}</span>}{fx.referee&&<span>Referee: {fx.referee}</span>}</div>
  {m.st==='upcoming'&&<div className="flex justify-center mt-5"><Btn onClick={()=>openPick(m)}>{pr?`Edit prediction (${n} market${n===1?'':'s'})`:'Predict this match'}<I n="arrow" s={16}/></Btn></div>}</div>}

function EventIcon({e}){return /Goal|^Penalty$/.test(e.type)&&!/Cancelled/.test(e.type)&&!/^VAR/.test(e.type)?<I n="ball" s={13}/>:e.type==='Yellow Card'?<span className="w-2.5 h-3.5 rounded-sm bg-yellow-400"/>:e.type==='Red Card'?<span className="w-2.5 h-3.5 rounded-sm bg-red-500"/>:e.type==='Substitution'?<I n="arrow" s={12}/>:e.type==='Missed Penalty'?<I n="x" s={12}/>:<I n="info" s={12}/>}
const evText=e=>e.type==='Substitution'?`Substitution: ${[e.player,e.substituted].filter(Boolean).join(' / ')||'details not provided'}`:`${e.type}${e.player?': '+e.player:''}${e.assist&&/Goal|Penalty/.test(e.type)?` (assist: ${e.assist})`:''}`;
// Events and team statistics are part of the single /matches/{id} response, so this tab costs no extra requests.
export function Overview({fx,raw,kind}){
 const on=kind!=='upcoming'&&kind!=='off';
 const events=normEvents(raw&&raw.events),rows=normTeamStats(raw&&raw.statistics,fx);
 if(!on)return <Empty icon="clock" title={kind==='off'?`Match ${fx.status.long.toLowerCase()}`:'Match events and statistics will appear once the game begins.'} body="Nothing is shown before kickoff, and nothing is estimated."/>;
 return <div className="grid lg:grid-cols-2 gap-4">
  <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-4">Match events</p>{events.length?<div className="space-y-4 border-l border-line ml-3">{[...events].reverse().map((e,i)=><div key={i} className="relative pl-6"><span className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-bg2 border border-line grid place-items-center"><EventIcon e={e}/></span><p className="text-xs text-mute">{e.minute!=null?`${e.minute}${e.extra?'+'+e.extra:''}'`:''} · {e.teamName}</p><p className="text-sm font-semibold">{evText(e)}</p></div>)}</div>:<p className="text-sm text-mute">The provider has no events for this match yet.</p>}</div>
  <div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-4">Team statistics</p>{rows?<div className="space-y-4"><div className="flex justify-between text-xs font-bold"><span>{fx.home.name}</span><span>{fx.away.name}</span></div>{rows.map(r=>{const h=r.h??0,a=r.a??0,t=h+a||1;return <div key={r.label}><div className="flex justify-between text-sm tabular-nums"><b>{fmtV(r.h)}</b><span className="text-xs text-mute">{r.label}</span><b>{fmtV(r.a)}</b></div><div className="flex h-2 gap-1 mt-1.5"><div className="rounded-l-full bg-bg2 flex justify-end overflow-hidden" style={{width:h/t*100+'%'}}><div className="h-full w-full" style={{background:'#34D399'}}/></div><div className="rounded-r-full bg-bg2 overflow-hidden" style={{width:a/t*100+'%'}}><div className="h-full w-full" style={{background:'#5AA9FF'}}/></div></div></div>})}<p className="text-[11px] text-mute">Values are shown exactly as the provider returns them.</p></div>:<p className="text-sm text-mute">The provider has not returned team statistics for this match.</p>}</div></div>}

function Lineups({fx,fin,kind}){
 const r=useApi('lineups',{fixture:fx.id,final:fin},{ttl:kind==='upcoming'?300000:3600000});
 const lu=useMemo(()=>r.data?normLineups(r.data):null,[r.data]);
 if(r.loading&&!r.data)return <Skeleton n={2} h="h-40"/>;
 if(r.error&&!r.data&&r.error.code!=='not_found')return <ErrorBox e={r.error} retry={r.reload}/>;
 if(!lu)return <><DataBanner s={r}/><LineupPending m={{t:fmtTime(fx.timestamp)}}/></>;
 const hc='T'+fx.home.id,ac='T'+fx.away.id;
 registerTeam(hc,{name:fx.home.name,logo:fx.home.logo});registerTeam(ac,{name:fx.away.name,logo:fx.away.logo});
 const m={id:fx.id,h:hc,a:ac,t:fmtTime(fx.timestamp)};
 const d={live:true,H:{...lu.H,manager:lu.H.coach},A:{...lu.A,manager:lu.A.coach},ps:{}};
 return <><DataBanner s={r}/><LineupView key={fx.id} m={m} d={d}/><p className="text-[11px] text-mute mt-4">Lineups are published by the provider from about 40 minutes before kickoff. Pitch positions are derived from the formation rows the provider returns.</p></>}

// The provider's own "top players" for the match (name, position and its highlighted statistics). Not a full player-by-player table.
export function Stats({fx,raw,kind}){
 const on=kind!=='upcoming'&&kind!=='off';
 if(!on)return <Empty icon="clock" title="Player statistics will appear once the match is underway." body="Nothing is shown or estimated before kickoff."/>;
 const top=normTopPlayers(raw);
 if(!top.length)return <Empty icon="clock" title="No player statistics yet" body="The provider has not published player statistics for this match."/>;
 return <div className="grid md:grid-cols-2 gap-4">{['H','A'].map(side=>{const rows=top.filter(p=>p.team===side);return <div key={side} className="rounded-2xl border border-line bg-card p-5"><p className="font-bold mb-4">{side==='H'?fx.home.name:fx.away.name} · top players</p>{rows.length?<div className="divide-y divide-line">{rows.map((p,i)=><div key={i} className="py-3"><p className="font-semibold text-sm">{p.name}{p.position&&<span className="text-[11px] text-mute font-normal"> · {p.position}</span>}</p><div className="flex flex-wrap gap-1.5 mt-2">{p.stats.length?p.stats.map((s,k)=><span key={k} className="text-[11px] rounded-full border border-line bg-bg2 px-2.5 py-1"><span className="text-mute">{s.name}</span> <b className="tabular-nums">{sv(s.value)}</b></span>):<span className="text-[11px] text-mute">No statistics provided</span>}</div></div>)}</div>:<p className="text-sm text-mute">Not provided for this team.</p>}</div>})}
  <p className="text-[11px] text-mute md:col-span-2">Only values returned by the provider are shown. Highlightly does not publish per-match ratings or a full player table.</p></div>}

export function LiveMatchPage({id,tab='overview'}){
 const {nav}=useContext(Ctx);const valid=/^\d+$/.test(String(id||''));
 const r=useApi('fixture',{id},{enabled:valid,ttl:60000});
 if(!valid)return <div><Crumbs items={[{l:'Matches',go:'matches'},{l:'Not found'}]}/><Empty icon="alert" title="Invalid match" body="That match id is not valid."><Btn onClick={()=>nav('matches')}>Back to Matches</Btn></Empty></div>;
 const raw=r.data&&r.data[0];const fx=raw?normFixture(raw):null;const kind=fx&&fx.status.kind,fin=kind==='finished'?1:0;
 const t=TABS.find(x=>x[0]===tab)?tab:'overview';
 return <div>
  <Crumbs items={[{l:'Matches',go:'matches'},{l:fx?fx.leagueName||'Competition':'Match',go:'matches'},{l:'Match Details',go:`lmatch/${id}/overview`},{l:TABS.find(x=>x[0]===t)[1]}]}/>
  {r.loading&&!r.data?<Skeleton n={2} h="h-40"/>:r.error&&!r.data?<ErrorBox e={r.error} retry={r.reload}/>:!fx?<Empty icon="alert" title="Match not found" body="The provider returned no match for this id."><Btn onClick={()=>nav('matches')}>Back to Matches</Btn></Empty>:<>
   <Header fx={fx}/>
   <div role="tablist" aria-label="Match sections" className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line mt-6 mb-6">{TABS.map(([k,l])=><button key={k} role="tab" aria-selected={t===k} onClick={()=>nav(`lmatch/${id}/${k}`)} className={`whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition ${t===k?'border-lime text-white':'border-transparent text-mute hover:text-white'}`}>{l}</button>)}</div>
   <div key={t} className="slide">{t==='overview'&&<Overview fx={fx} raw={raw} kind={kind}/>}{t==='lineups'&&<Lineups fx={fx} fin={fin} kind={kind}/>}{t==='stats'&&<Stats fx={fx} raw={raw} kind={kind}/>}</div></>}
  <p className="text-[11px] text-mute mt-6">Data: {PROVIDER}{r.updatedAt?`, fetched ${new Date(r.updatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`:''}. Cached responses are not real-time.</p></div>}
