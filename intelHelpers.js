import {PLAYERS,SEASON} from './playerData'
import {T} from './data'
export {PLAYERS,SEASON}
export const OPPN={NEW:'Newcastle United',AVL:'Aston Villa',BHA:'Brighton',WHU:'West Ham',EVE:'Everton',FUL:'Fulham',BRE:'Brentford',CRY:'Crystal Palace',WOL:'Wolves',NFO:'Nottingham Forest',BOU:'Bournemouth',LEE:'Leeds United',SUN:'Sunderland',BUR:'Burnley'};
// Runtime registry so live-API teams (numeric ids) can be shown by the same components as demo teams.
export const TEAM_REG={};
export const registerTeam=(code,t)=>{TEAM_REG[code]=t};
export const teamName=c=>T[c]?T[c][0]:(TEAM_REG[c]&&TEAM_REG[c].name)||OPPN[c]||c;
export const teamColor=c=>T[c]?T[c][1]:(TEAM_REG[c]&&TEAM_REG[c].color)||'#7A857E';
export const teamLogo=c=>(TEAM_REG[c]&&TEAM_REG[c].logo)||null;
export const POS={GK:'Goalkeeper',DF:'Defender',MF:'Midfielder',FW:'Forward'};
export const TEAM_CODES=['ARS','CHE','LIV','MCI','MUN','TOT'];
export const getPlayer=id=>PLAYERS.find(p=>p.id===id);
export const initials=n=>n.split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
export const tone=r=>r>=7.5?'#34D399':r>=6.8?'#F5C451':'#FF8A3D';
const memo={};
export const seasonOf=p=>memo[p.id]||(memo[p.id]=(()=>{const L=p.log,s=i=>L.reduce((a,r)=>a+r[i],0);return{apps:L.length,min:s(5),g:s(7),a:s(8),y:s(9),r:s(10),cs:L.filter(r=>r[4]===0&&r[5]>=60).length,rating:Math.round(s(6)/L.length*10)/10,...p.x}})());
export const form=p=>p.log.slice(-5).map(r=>r[6]);
export const months=p=>{const M={};p.log.forEach(r=>{const k=r[0].slice(0,7);(M[k]=M[k]||{k,n:0,rs:0,g:0,a:0});M[k].n++;M[k].rs+=r[6];M[k].g+=r[7];M[k].a+=r[8]});return Object.values(M).sort((a,b)=>a.k<b.k?-1:1).map(m=>({m:new Date(m.k+'-15').toLocaleString('en',{month:'short'}),n:m.n,rating:Math.round(m.rs/m.n*10)/10,g:m.g,a:m.a}))};
export const per90=(p,v)=>{const s=seasonOf(p);return s.min?Math.round(v/s.min*90*100)/100:0};
