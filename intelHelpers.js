import {T,TEAM_REG,registerTeam} from './data'
export {TEAM_REG,registerTeam}
export const teamName=c=>T[c][0];
export const teamColor=c=>T[c][1];
export const teamLogo=c=>(TEAM_REG[c]&&TEAM_REG[c].logo)||null;
export const POS={GK:'Goalkeeper',DF:'Defender',MF:'Midfielder',FW:'Forward'};
export const initials=n=>String(n||'?').split(' ').filter(Boolean).map(w=>w[0]).slice(0,2).join('').toUpperCase();
export const tone=r=>r>=7.5?'#34D399':r>=6.8?'#F5C451':'#FF8A3D';
