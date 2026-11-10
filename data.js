// STATIC REFERENCE DATA ONLY. No fixtures, scores, lineups or players live here: all football data comes from the server proxy.
// BRANDS = the clubs that exist as MatchIQ club communities / onboarding choices (name + brand colour).
const BRANDS={ARS:['Arsenal','#EF0107'],MCI:['Manchester City','#6CABDD'],RMA:['Real Madrid','#E8E8F0'],BAR:['Barcelona','#A50044'],BAY:['Bayern Munich','#DC052D'],BVB:['Dortmund','#FDE100'],INT:['Inter','#0068A8'],JUV:['Juventus','#9AA0A6'],LIV:['Liverpool','#C8102E'],CHE:['Chelsea','#034694'],PSG:['PSG','#1E5AA8'],OM:['Marseille','#2FAEE0'],MUN:['Manchester United','#DA291C'],TOT:['Tottenham','#9AA7C7'],ATM:['Atlético Madrid','#CB3524'],NAP:['Napoli','#12A0D7'],MIL:['AC Milan','#FB090B'],LEV:['Leverkusen','#E32221'],LIL:['Lille','#E0212A']};
export const isBrand=k=>Object.prototype.hasOwnProperty.call(BRANDS,k);
// Runtime registry: live teams (code "T<id>") are registered when their fixtures load, so T[code] works for them too.
export const TEAM_REG={};
export const registerTeam=(code,t)=>{TEAM_REG[code]={...TEAM_REG[code],...t}};
const FALLBACK='#7A857E';
export const T=new Proxy(BRANDS,{get(t,k){if(typeof k!=='string'||isBrand(k))return t[k];const r=TEAM_REG[k];return[(r&&r.name)||k,(r&&r.color)||FALLBACK]}});
// League badge palette (cosmetic). Unknown competitions fall back to initials in LeagueBadge.
export const LG={'Premier League':['PL','#B388FF'],'La Liga':['LL','#FF7A59'],'Champions League':['UCL','#5AA9FF'],'UEFA Champions League':['UCL','#5AA9FF'],'Serie A':['SA','#37D6A0'],'Bundesliga':['BL','#FF5A5F'],'Ligue 1':['L1','#FFD166'],'Europa League':['UEL','#FF9F43'],'UEFA Europa League':['UEL','#FF9F43']};
export const OU={O15:'Over 1.5',O25:'Over 2.5',O35:'Over 3.5',U25:'Under 2.5'};
export const marketLines=(p,m)=>{const L=[];if(p.result)L.push(['Match Result',p.result==='H'?T[m.h][0]+' win':p.result==='A'?T[m.a][0]+' win':'Draw']);if(p.score)L.push(['Correct Score',p.score[0]+' – '+p.score[1]]);if(p.ou)L.push(['Over/Under',OU[p.ou]]);if(p.btts)L.push(['Both Teams to Score',p.btts==='Y'?'Yes':'No']);return L};
export const conflicts=p=>{if(!p.score)return false;const[h,a]=p.score,g=h+a;return !!((p.result&&p.result!==(h>a?'H':h<a?'A':'D'))||(p.ou&&((p.ou==='O15'&&g<2)||(p.ou==='O25'&&g<3)||(p.ou==='O35'&&g<4)||(p.ou==='U25'&&g>2)))||(p.btts&&p.btts!==((h>0&&a>0)?'Y':'N')))};
