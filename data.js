export const T={ARS:['Arsenal','#EF0107'],MCI:['Manchester City','#6CABDD'],RMA:['Real Madrid','#E8E8F0'],BAR:['Barcelona','#A50044'],BAY:['Bayern Munich','#DC052D'],BVB:['Dortmund','#FDE100'],INT:['Inter','#0068A8'],JUV:['Juventus','#9AA0A6'],LIV:['Liverpool','#C8102E'],CHE:['Chelsea','#034694'],PSG:['PSG','#1E5AA8'],OM:['Marseille','#2FAEE0'],MUN:['Manchester United','#DA291C'],TOT:['Tottenham','#9AA7C7'],ATM:['Atlético Madrid','#CB3524'],NAP:['Napoli','#12A0D7'],MIL:['AC Milan','#FB090B'],LEV:['Leverkusen','#E32221'],LIL:['Lille','#E0212A']};
export const COMPETITIONS=['All Matches','Premier League','La Liga','Champions League','Serie A','Bundesliga','Ligue 1'];
export const DATE_FILTERS=['Today','Tomorrow','This Week','All'];
export const LG={'Premier League':['PL','#B388FF'],'La Liga':['LL','#FF7A59'],'Champions League':['UCL','#5AA9FF'],'Serie A':['SA','#37D6A0'],'Bundesliga':['BL','#FF5A5F'],'Ligue 1':['L1','#FFD166'],'Europa League':['UEL','#FF9F43']};
const VENUES={ARS:'Emirates Stadium, London',MCI:'Etihad Stadium, Manchester',RMA:'Santiago Bernabéu, Madrid',BAR:'Estadi Olímpic Lluís Companys, Barcelona',BAY:'Allianz Arena, Munich',BVB:'Signal Iduna Park, Dortmund',INT:'San Siro, Milan',JUV:'Allianz Stadium, Turin',LIV:'Anfield, Liverpool',CHE:'Stamford Bridge, London',PSG:'Parc des Princes, Paris',OM:'Orange Vélodrome, Marseille',MUN:'Old Trafford, Manchester',TOT:'Tottenham Hotspur Stadium, London',ATM:'Metropolitano, Madrid',NAP:'Stadio Maradona, Naples',MIL:'San Siro, Milan',LEV:'BayArena, Leverkusen',LIL:'Stade Pierre-Mauroy, Lille'};
const WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const dayLabel=d=>d===0?'Today':d===1?'Tomorrow':d===-1?'Yesterday':WD[(new Date().getDay()+d+7)%7];
// [id, home, away, league, dayOffset, time, status, score, minute]
const RAW=[
[1,'ARS','MCI','Premier League',0,'16:30','up'],[2,'RMA','BAR','La Liga',1,'20:00','up'],[3,'BAY','BVB','Bundesliga',0,'17:30','up'],
[4,'INT','JUV','Serie A',2,'19:45','up'],[5,'LIV','CHE','Premier League',1,'15:00','up'],[6,'PSG','OM','Ligue 1',3,'20:45','up'],
[7,'MUN','TOT','Premier League',0,'15:00','live',[1,1],63],[8,'ATM','BAR','La Liga',0,'15:15','live',[0,2],34],[9,'NAP','MIL','Serie A',0,'14:45','live',[2,1],78],
[10,'LIV','RMA','Champions League',2,'20:00','up'],[11,'CHE','BAY','Champions League',1,'20:00','up'],[12,'LEV','BVB','Bundesliga',4,'18:30','up'],[13,'LIL','OM','Ligue 1',5,'19:00','up'],
[20,'INT','NAP','Serie A',0,'20:45','up'],[21,'TOT','LIV','Premier League',0,'19:00','up'],
[22,'ARS','TOT','Premier League',3,'16:30','up'],[23,'MCI','MUN','Premier League',4,'17:30','up'],[24,'RMA','ATM','La Liga',5,'21:00','up'],[25,'MIL','INT','Serie A',4,'20:45','up'],
[14,'CHE','ARS','Premier League',-1,'17:30','ft',[1,2]],[15,'BAR','RMA','La Liga',-1,'21:00','ft',[3,2]],[16,'JUV','MIL','Serie A',-2,'20:45','ft',[0,0]],
[17,'BVB','BAY','Bundesliga',-2,'18:30','ft',[2,2]],[18,'PSG','LIL','Ligue 1',-1,'21:00','ft',[3,0]],[19,'MCI','RMA','Champions League',-1,'20:00','ft',[1,1]]];
export const DERBIES={2:'El Clásico',3:'Der Klassiker',6:'Le Classique',22:'North London Derby',23:'Manchester Derby',24:'Madrid Derby',25:'Derby della Madonnina'};
export const FIXTURES=RAW.map(([id,h,a,lg,day,time,st,sc,min])=>{const s=id*37,p=40+s%21,H=34+s%28,D=16+s%10;
 return{id,h,a,lg,day,time,derby:DERBIES[id],st:st==='up'?'upcoming':st,sc:sc||[0,0],min,t:dayLabel(day)+' '+time,venue:VENUES[h],
 stats:{poss:[p,100-p],shots:[8+s%9,6+(s*3)%9],sot:[3+s%5,2+(s*2)%5],corners:[3+s%6,2+(s*5)%6]},
 comm:{H,D,A:100-H-D,o25:46+s%30,btts:42+(s*7)%36}}});
export const MATCHES=FIXTURES.slice(0,6);
export const USERS=[['Kofi_Bets','KB',4820],['SarahXI','SX',4615],['TacticalTemi','TT',4380],['Diego9','D9',4102],['Alex Morgan','AM',2450]];
export const COMPS=[['Premier League Elite','1.2k players','Free'],['Champions Crew','860 players','Free'],['Office Rivals','Private · 12 players','Invite']];
export const OU={O15:'Over 1.5',O25:'Over 2.5',O35:'Over 3.5',U25:'Under 2.5'};
export const marketLines=(p,m)=>{const L=[];if(p.result)L.push(['Match Result',p.result==='H'?T[m.h][0]+' win':p.result==='A'?T[m.a][0]+' win':'Draw']);if(p.score)L.push(['Correct Score',p.score[0]+' – '+p.score[1]]);if(p.ou)L.push(['Over/Under',OU[p.ou]]);if(p.btts)L.push(['Both Teams to Score',p.btts==='Y'?'Yes':'No']);return L};
export const conflicts=p=>{if(!p.score)return false;const[h,a]=p.score,g=h+a;return !!((p.result&&p.result!==(h>a?'H':h<a?'A':'D'))||(p.ou&&((p.ou==='O15'&&g<2)||(p.ou==='O25'&&g<3)||(p.ou==='O35'&&g<4)||(p.ou==='U25'&&g>2)))||(p.btts&&p.btts!==((h>0&&a>0)?'Y':'N')))};
