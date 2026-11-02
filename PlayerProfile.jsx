import React,{useContext} from 'react'
import {Ctx} from './context'
import {FIXTURES,T} from './data'
import {flag} from './compData'
import {I} from './Icon'
import {Btn} from './ui'
import {getPlayer,seasonOf,months,teamName,POS,SEASON,tone,per90} from './intelHelpers'
import {MATCH_DATA,LINEUP_MATCHES} from './matchData'
import {PlayerAvatar,TeamBadge,RatingPill,FormBars,StatTile,Crumbs,Empty,DemoTag,useBrief} from './PlayerBits'
import {RatingChart,GAChart,TrendChart} from './Charts'

const SET={GK:[['Appearances','apps'],['Minutes played','min'],['Clean sheets','cs'],['Saves','saves'],['Pass accuracy','pass','%']],
 DF:[['Appearances','apps'],['Minutes played','min'],['Goals','g'],['Assists','a'],['Tackles','tkl'],['Clean sheets','cs'],['Key passes','kp'],['Pass accuracy','pass','%']],
 MF:[['Appearances','apps'],['Minutes played','min'],['Goals','g'],['Assists','a'],['Shots','shots'],['Shots on target','sot'],['Key passes','kp'],['Pass accuracy','pass','%'],['Tackles','tkl'],['Successful dribbles','drib']],
 FW:[['Appearances','apps'],['Minutes played','min'],['Goals','g'],['Assists','a'],['Shots','shots'],['Shots on target','sot'],['Key passes','kp'],['Pass accuracy','pass','%'],['Tackles','tkl'],['Successful dribbles','drib']]};
const fmtDate=d=>new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const Card=({title,sub,children})=><div className="rounded-2xl border border-line bg-card p-5"><p className="font-bold">{title}</p>{sub&&<p className="text-xs text-mute mb-4">{sub}</p>}{children}</div>;

export function PlayerProfile({id}){
 const {nav}=useContext(Ctx);const loading=useBrief(id);const p=getPlayer(id);
 if(!p)return <div><Crumbs items={[{l:'Player Intelligence',go:'players'},{l:'Not found'}]}/><Empty icon="alert" title="Player not found" body="This player is not in the demo dataset."><Btn onClick={()=>nav('players')}>Back to Player Intelligence</Btn></Empty></div>;
 if(loading)return <div className="space-y-4 animate-pulse"><div className="h-6 w-64 rounded bg-card"/><div className="h-52 rounded-3xl bg-card border border-line"/><div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[0,1,2,3].map(i=><div key={i} className="h-24 rounded-2xl bg-card border border-line"/>)}</div></div>;
 const s=seasonOf(p),rec=p.log.slice(-8),rev=[...rec].reverse(),stats=SET[p.pos];
 const feats=LINEUP_MATCHES.map(mid=>{const d=MATCH_DATA[mid],pl=[...d.H.xi,...d.H.bench,...d.A.xi,...d.A.bench].find(x=>x.id===p.id);return pl&&{m:FIXTURES.find(f=>f.id===mid),d,pl}}).filter(Boolean);
 return <div>
  <Crumbs items={[{l:'Player Intelligence',go:'players'},{l:teamName(p.team),go:'players'},{l:p.name}]}/>
  <div className="relative overflow-hidden rounded-3xl border border-line p-6 sm:p-9" style={{background:`linear-gradient(135deg,${T[p.team][1]}40,rgb(var(--card)) 55%,rgb(var(--bg2)))`}}>
   <div className="relative flex flex-col sm:flex-row sm:items-center gap-6"><PlayerAvatar p={p} s={110}/>
    <div className="flex-1 min-w-0"><h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{p.name}</h1>
     <p className="text-sm text-mute mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5"><span className="flex items-center gap-1.5"><TeamBadge code={p.team} s={20}/>{teamName(p.team)}</span><span>{POS[p.pos]} · {p.role}</span><span>{flag(p.nat)} {p.nat}</span><span>#{p.num}</span><span>Age {p.age}</span></p>
     <div className="mt-4 flex items-center gap-4"><div><p className="text-[10px] uppercase tracking-wider text-mute mb-1">Recent form</p><FormBars p={p}/></div><DemoTag>Demo profile</DemoTag></div></div>
    <div className="flex sm:flex-col items-center gap-3"><RatingPill v={s.rating} big/><p className="text-[10px] text-mute text-center">Season {SEASON}</p></div></div>
   <div className="relative flex flex-wrap gap-3 mt-6"><Btn v="s" onClick={()=>nav('players/compare/'+p.id)}>Compare player</Btn><Btn v="s" onClick={()=>nav('players')}>All players</Btn></div></div>
  <h2 className="font-extrabold text-lg mt-8 mb-3">Season statistics <span className="text-xs text-mute font-medium">· {SEASON} · demo</span></h2>
  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">{stats.map(([l,k,u])=><StatTile key={k} l={l} v={u?s[k]+u:Number(s[k]).toLocaleString()} sub={['g','a','kp','sot','shots','tkl','drib','saves'].includes(k)&&s.min?`${per90(p,s[k]).toFixed(2)} per 90`:undefined}/>)}</div>
  <h2 className="font-extrabold text-lg mt-8 mb-3">Performance</h2>
  <div className="grid lg:grid-cols-3 gap-4"><Card title="Match ratings" sub="Last 8 appearances"><RatingChart rows={rec}/></Card><Card title="Goals and assists" sub="Last 8 appearances"><GAChart rows={rec}/></Card><Card title="Season trend" sub="Average rating by month"><TrendChart data={months(p)}/></Card></div>
  <h2 className="font-extrabold text-lg mt-8 mb-3 flex items-center gap-3">Recent Performances<DemoTag>Demonstration data</DemoTag></h2>
  <div className="rounded-2xl border border-line bg-card overflow-x-auto"><div className="min-w-[620px]">
   <div className="grid grid-cols-[5.5rem_1fr_4.5rem_3.5rem_3.5rem_3rem_3rem_4rem] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-mute border-b border-line"><span>Date</span><span>Opponent</span><span>Result</span><span>Min</span><span>Rating</span><span>G</span><span>A</span><span>Cards</span></div>
   <div className="divide-y divide-line">{rev.map((r,i)=>{const res=r[3]>r[4]?'W':r[3]<r[4]?'L':'D';return <div key={i} className="grid grid-cols-[5.5rem_1fr_4.5rem_3.5rem_3.5rem_3rem_3rem_4rem] gap-2 px-4 py-3 items-center text-sm"><span className="text-xs text-mute">{fmtDate(r[0])}</span><span className="flex items-center gap-2 min-w-0"><TeamBadge code={r[1]} s={22}/><span className="truncate">{teamName(r[1])}</span><span className="text-[10px] text-mute">({r[2]})</span></span><span className="font-bold tabular-nums" style={{color:res==='W'?'#34D399':res==='L'?'#FF6B6B':'#F5C451'}}>{res} {r[3]}–{r[4]}</span><span className="tabular-nums">{r[5]}'</span><span className="font-extrabold tabular-nums" style={{color:tone(r[6])}}>{r[6].toFixed(1)}</span><span className="tabular-nums">{r[7]}</span><span className="tabular-nums">{r[8]}</span><span className="flex gap-1">{r[9]>0&&<span className="w-2.5 h-3.5 rounded-sm bg-yellow-400" title="Yellow card"/>}{r[10]>0&&<span className="w-2.5 h-3.5 rounded-sm bg-red-500" title="Red card"/>}{!r[9]&&!r[10]&&<span className="text-mute">–</span>}</span></div>})}</div></div></div>
  <p className="text-[11px] text-mute mt-2">Scores are shown from {teamName(p.team)}'s perspective. These archive matches are demonstration data and have no match page.</p>
  <h2 className="font-extrabold text-lg mt-8 mb-3">Matches in MatchIQ</h2>
  {feats.length?<div className="grid sm:grid-cols-2 gap-4">{feats.map(({m,d,pl})=>{const ps=d.ps[pl.name];return <button key={m.id} onClick={()=>nav(`match/${m.id}/lineups`)} className="text-left rounded-2xl border border-line bg-card p-5 hover:border-white/30 hover:-translate-y-0.5 transition">
   <div className="flex items-center justify-between text-xs text-mute"><span>{m.lg} · {m.t}</span><span className="font-bold">{m.st==='live'?'LIVE (demo)':'Finished (demo)'}</span></div>
   <p className="font-extrabold mt-2">{teamName(m.h)} {m.sc[0]}–{m.sc[1]} {teamName(m.a)}</p>
   {ps&&<p className="text-xs text-mute mt-2">This match: {ps[0]} min · rating {ps[1].toFixed(1)} · {ps[2]} goal{ps[2]===1?'':'s'} · {ps[3]} assist{ps[3]===1?'':'s'} <span className="opacity-70">(match stats, separate from season totals)</span></p>}
   <span className="inline-flex items-center gap-1 text-xs font-bold text-sky mt-3">Open lineups<I n="arrow" s={13}/></span></button>})}</div>:<Empty title="Not in a sample match" body="This player has no lineup in the demo matches. Open Matches to see the sample lineups."><Btn v="s" onClick={()=>nav('matches')}>Go to Matches</Btn></Empty>}
 </div>}
