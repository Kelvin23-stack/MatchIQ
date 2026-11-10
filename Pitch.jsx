import React,{useState,useEffect,useContext} from 'react'
import {Ctx} from './context'
import {I} from './Icon'
import {Btn} from './ui'
import {teamName,teamColor} from './intelHelpers'
import {PlayerAvatar,TeamBadge} from './PlayerBits'

export const useMobile=()=>{const q='(max-width:767px)';const [m,setM]=useState(()=>matchMedia(q).matches);useEffect(()=>{const mq=matchMedia(q),f=()=>setM(mq.matches);mq.addEventListener('change',f);return()=>mq.removeEventListener('change',f)},[]);return m};
const lum=h=>{const n=parseInt(h.slice(1),16);return (.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};

function PitchSvg({portrait}){
 const W=portrait?68:105,H=portrait?105:68,m=(l,w)=>portrait?[w,l]:[l,w];
 const rect=(l0,w0,l1,w1)=>{const [x0,y0]=m(l0,w0),[x1,y1]=m(l1,w1);return{x:Math.min(x0,x1),y:Math.min(y0,y1),width:Math.abs(x1-x0),height:Math.abs(y1-y0)}};
 const ln=(l0,w0,l1,w1)=>{const [x1,y1]=m(l0,w0),[x2,y2]=m(l1,w1);return{x1,y1,x2,y2}};
 const c=(l,w)=>{const [cx,cy]=m(l,w);return{cx,cy}};
 const st={fill:'none',stroke:'rgba(255,255,255,.6)',strokeWidth:.4};
 return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
  <rect {...rect(.3,.3,104.7,67.7)} {...st}/><line {...ln(52.5,.3,52.5,67.7)} {...st}/>
  <circle {...c(52.5,34)} r="9.15" {...st}/><circle {...c(52.5,34)} r=".6" fill="rgba(255,255,255,.8)"/>
  <rect {...rect(.3,13.84,16.5,54.16)} {...st}/><rect {...rect(88.5,13.84,104.7,54.16)} {...st}/>
  <rect {...rect(.3,24.84,5.5,43.16)} {...st}/><rect {...rect(99.5,24.84,104.7,43.16)} {...st}/>
  <circle {...c(11,34)} r=".5" fill="rgba(255,255,255,.8)"/><circle {...c(94,34)} r=".5" fill="rgba(255,255,255,.8)"/>
  <line {...ln(.3,30.3,.3,37.7)} stroke="#fff" strokeWidth="1.3"/><line {...ln(104.7,30.3,104.7,37.7)} stroke="#fff" strokeWidth="1.3"/></svg>}

// Live data: place players from the provider's grid (row:col). Falls back to position groups if a grid is missing.
const gridSpots=(xi,side,portrait)=>{const has=xi.length&&xi.every(p=>p.grid);let groups;
 if(has){const rows=[...new Set(xi.map(p=>p.grid[0]))].sort((a,b)=>a-b);groups=rows.map(r=>xi.filter(p=>p.grid[0]===r).sort((a,b)=>a.grid[1]-b.grid[1]))}
 else{const order=['GK','DF','MF','FW'];groups=order.map(g=>xi.filter(p=>p.pos===g)).filter(x=>x.length);const rest=xi.filter(p=>!order.includes(p.pos));if(rest.length)groups.push(rest)}
 const R=groups.length,out=[];groups.forEach((g,li)=>{const t=R>1?li/(R-1):0;g.forEach((pl,j)=>{const a=(j+1)/(g.length+1);out.push(portrait?{pl,left:8+a*84,top:89-t*75}:side==='H'?{pl,left:4+t*44,top:8+a*84}:{pl,left:96-t*44,top:92-a*84})})});return out};
function Marker({s,color,onClick,on,cap}){
 const gk=s.pl.pos==='GK',bg=gk?'#F5C451':color,fg=lum(bg)>.6?'#080B0A':'#fff';
 return <button onClick={onClick} aria-label={`${s.pl.name}, number ${s.pl.num}`} aria-pressed={on} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 group focus:outline-none" style={{left:s.left+'%',top:s.top+'%'}}>
  <span className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full grid place-items-center text-[11px] sm:text-sm font-extrabold border-2 shadow-lg transition group-hover:scale-110 group-focus-visible:scale-110 ${on?'border-lime scale-110':'border-white/80'}`} style={{background:bg,color:fg}}>{s.pl.num}{cap&&<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#fff] text-[#080B0A] text-[9px] font-extrabold grid place-items-center border border-black/30">C</span>}</span>
  <span className="max-w-[64px] sm:max-w-[84px] truncate rounded bg-black/55 px-1.5 text-[9px] sm:text-[11px] font-semibold text-[#fff] leading-4">{s.pl.sn}</span></button>}

export function LineupPending({m}){return <div className="rounded-3xl border border-dashed border-line p-10 sm:p-14 text-center"><div className="w-14 h-14 mx-auto rounded-2xl bg-card border border-line grid place-items-center text-mute"><I n="clock" s={26}/></div>
 <p className="font-extrabold text-lg mt-4">Official lineups have not been announced yet.</p>
 <p className="text-sm text-mute mt-2 max-w-md mx-auto">Confirmed lineups will appear here when the provider publishes them. MatchIQ never shows projected lineups as confirmed.</p>{m&&m.t&&<p className="text-xs text-mute mt-3">Kickoff: {m.t}</p>}</div>}

export function LineupView({m,d}){
 const {nav}=useContext(Ctx);const mobile=useMobile();
 const [team,setTeam]=useState('H'),[sel,setSel]=useState(null);
 const color=s=>teamColor(s==='H'?m.h:m.a),code=s=>s==='H'?m.h:m.a;
 const shown=mobile?[team]:['H','A'];
 const spotsAll=shown.flatMap(s=>gridSpots(d[s].xi,s,mobile).map(x=>({...x,s})));
 const stripe=mobile?'180deg':'90deg';
 return <div>
  <div className="flex flex-wrap items-center gap-3 mb-4"><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-mute border border-line rounded-full px-2.5 py-1"><I n="info" s={11}/>Live data (provider)</span>{mobile&&<div role="tablist" aria-label="Team" className="inline-flex rounded-full border border-line bg-card p-1 ml-auto">{['H','A'].map(s=><button key={s} role="tab" aria-selected={team===s} onClick={()=>{setTeam(s);setSel(null)}} className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${team===s?'bg-lime text-ink':'text-mute'}`}>{teamName(code(s))}</button>)}</div>}</div>
  <div className="grid md:grid-cols-2 gap-3 mb-4">{shown.map(s=>{const t=d[s];return <div key={s} className="rounded-2xl border border-line bg-card p-4">
   <div className="flex items-center gap-3"><TeamBadge code={code(s)} s={36}/><div className="min-w-0 flex-1"><p className="font-extrabold truncate">{teamName(code(s))}</p><p className="text-xs text-mute">{t.manager?`Manager: ${t.manager}`:'Manager: not provided'}</p></div><div className="text-xs text-mute text-right">Formation<p className="text-sm font-bold text-white">{t.formation||'Not provided'}</p></div></div>
   <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">{t.xi.map(p=><li key={p.id||p.name} className="truncate"><span className="text-mute tabular-nums inline-block w-6">{p.num??''}</span>{p.name}</li>)}</ol></div>})}</div>
  <div className={`relative mx-auto overflow-hidden rounded-2xl border border-white/10 ${mobile?'aspect-[68/105] max-w-sm':'aspect-[105/68]'}`} style={{background:`repeating-linear-gradient(${stripe},#17703a 0 7.14%,#135f31 7.14% 14.28%)`}}>
   <PitchSvg portrait={mobile}/>{spotsAll.map(s=><Marker key={s.s+(s.pl.id||s.pl.name)} s={s} color={color(s.s)} on={sel&&sel.pl.name===s.pl.name} cap={false} onClick={()=>setSel({pl:s.pl,side:s.s})}/>)}</div>
  <p className="text-[11px] text-mute text-center mt-2">Positions use the provider's grid. Tap or click a player for details.</p>
  {sel&&<div className="pop mt-4 rounded-2xl border border-white/20 bg-card p-5"><div className="flex items-start gap-4"><PlayerAvatar p={{name:sel.pl.name,photo:sel.pl.photo,team:code(sel.side),num:sel.pl.num}} s={56}/>
   <div className="flex-1 min-w-0"><p className="font-extrabold text-lg">{sel.pl.name}</p><p className="text-xs text-mute">{sel.pl.num!=null?`#${sel.pl.num} · `:''}{({GK:'Goalkeeper',DF:'Defender',MF:'Midfielder',FW:'Forward'})[sel.pl.pos]||'Position not provided'} · {teamName(code(sel.side))}</p></div><button onClick={()=>setSel(null)} aria-label="Close player panel" className="text-mute hover:text-white"><I n="x"/></button></div>
   {sel.pl.id?<Btn className="w-full mt-4" onClick={()=>nav('lplayer/'+sel.pl.id)}>Open full profile<I n="arrow" s={15}/></Btn>:<p className="text-xs text-mute mt-4">The provider did not return a player id, so no profile is available.</p>}</div>}
  <h3 className="font-extrabold mt-8 mb-3">Substitutes</h3>
  <div className="grid md:grid-cols-2 gap-4">{['H','A'].map(s=><div key={s} className="rounded-2xl border border-line bg-card p-4"><p className="text-xs font-bold uppercase tracking-wider text-mute mb-3 flex items-center gap-2"><TeamBadge code={code(s)} s={20}/>{teamName(code(s))}</p>
   <div className="divide-y divide-line">{d[s].bench.length?d[s].bench.map(p=><button key={p.id||p.name} onClick={()=>setSel({pl:p,side:s})} className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-white/[0.04] rounded-lg px-1 transition"><PlayerAvatar p={{name:p.name,photo:p.photo,team:code(s),num:p.num}} s={36} num={false}/><span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{p.name}</span><span className="text-[11px] text-mute">{p.num!=null?`#${p.num}`:''}{p.pos?` · ${p.pos}`:''}</span></span></button>):<p className="text-xs text-mute py-2">No substitutes provided.</p>}</div></div>)}</div>
 </div>}
