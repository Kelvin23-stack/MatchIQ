import React from 'react'
import {LG} from './data'
import {I} from './Icon'
import {LiveStatus} from './LiveBits'
import {initials} from './intelHelpers'

export const LeagueBadge=({lg,s=22})=>{const[c,col]=LG[lg]||[initials(lg||'?').slice(0,3)||'?','#A3FF12'];return <span className="inline-grid place-items-center rounded-md font-extrabold border shrink-0" style={{width:s+(c.length>2?6:0),height:s,fontSize:s*.36,color:col,borderColor:col+'55',background:col+'18'}}>{c}</span>}
// m = match from liveMatch.toMatch() (or a stored snapshot of one)
export const StatusPill=({m})=>m.st==='upcoming'?<span className="flex items-center gap-1.5 text-xs text-mute"><I n="clock" s={12}/>{m.t}</span>:m.status?<LiveStatus st={m.status}/>:null;
