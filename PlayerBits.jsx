import React,{useContext,useState} from 'react'
import {Ctx} from './context'
import {I} from './Icon'
import {Crest} from './ui'
import {teamColor,initials} from './intelHelpers'

export const TeamBadge=({code,s=28})=><Crest k={code} s={s}/>;
function Photo({src,alt,s,children}){const [bad,setBad]=useState(false);return src&&!bad?<img src={src} alt={alt} loading="lazy" onError={()=>setBad(true)} className="rounded-full object-cover" style={{width:s-3,height:s-3}}/>:children}
export const PlayerAvatar=({p,s=56,num=true})=>{const c=teamColor(p.team);return <span className="relative inline-grid place-items-center rounded-full font-extrabold shrink-0" style={{width:s,height:s,fontSize:s*.34,background:`linear-gradient(145deg,${c}66,${c}22)`,border:`1.5px solid ${c}99`}}><Photo src={p.photo} alt={p.name} s={s}>{initials(p.name)}</Photo>{num&&p.num!=null&&<span className="absolute -bottom-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-bg2 border border-line text-[10px] font-bold grid place-items-center">{p.num}</span>}</span>};
export const StatTile=({l,v,sub})=><div className="rounded-2xl bg-card border border-line p-4"><p className="text-xs text-mute">{l}</p><p className="text-2xl font-extrabold mt-1.5 tabular-nums">{v}</p>{sub&&<p className="text-[11px] text-mute mt-0.5">{sub}</p>}</div>;
export const Crumbs=({items})=>{const {nav}=useContext(Ctx);return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-mute mb-5">{items.map((it,i)=><React.Fragment key={i}>{i>0&&<I n="right" s={12}/>}{it.go?<button onClick={()=>nav(it.go)} className="hover:text-white transition">{it.l}</button>:<span className="text-white font-semibold" aria-current="page">{it.l}</span>}</React.Fragment>)}</nav>};
export const Empty=({icon='empty',title,body,children})=><div className="rounded-2xl border border-dashed border-line p-10 text-center text-mute"><I n={icon} s={28} c="mx-auto mb-3"/><p className="font-bold text-white">{title}</p>{body&&<p className="text-sm mt-1 max-w-md mx-auto">{body}</p>}<div className="mt-4">{children}</div></div>;
