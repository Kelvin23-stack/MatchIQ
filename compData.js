export const flag=cc=>cc.toUpperCase().replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0)));
export const hash=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);
export const ini=n=>n.replace(/[^A-Za-z ]/g,' ').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const NAMES=['Kofi_Bets','SarahXI','TacticalTemi','Diego9','MarcoV10','LunaGoals','Okonkwo_FC','HenryTheKing','AishaPredicts','Gunner_Jay','ElClasicoEli','Mbappe_Mind','TomasR','NaijaScout','CuleKing','ThePivot','NinaOffside','RedDevilRay','ZedGoals','FantasyFiona','BundesBen','SerieA_Sam','PitchProphet','Kwame_xG','ChidiTips','VAR_Victor','LaLigaLou','OffsideOla','StreakSamuel','CornerKickKim','GoalMachineG','MatteoFT'];
const PTS=[4820,4615,4380,4102,3950,3811,3604,3390,3175,2988,2790];
const CC=['GH','NG','GB','ES','IT','DE','BR','FR','KE','US','PT','AR','ZA','NL','MX'],CL=['MCI','ARS','RMA','BAR','LIV','BAY','CHE','PSG','MUN','INT','JUV','MIL','NAP','ATM','TOT'];
export const ME={name:'Alex Morgan',full:'Alex Morgan',avatar:null,bio:'',cc:'NG',club:'ARS',points:2450,acc:76,streak:5,longest:11,xp:3680,me:true};
export const ALL=[...NAMES.map((name,i)=>({name,cc:CC[i%CC.length],club:CL[(i*4+1)%CL.length],points:i<11?PTS[i]:2300-(i-11)*60,acc:58+hash(name)%27,streak:hash(name+'s')%9,friend:[0,3,7,9,14,20].includes(i)})),ME];
export function board(kind){let L=ALL.map(u=>({...u}));
 if(kind==='weekly')L.forEach(u=>u.points=u.me?180:60+hash(u.name)%320);
 if(kind==='monthly')L.forEach(u=>u.points=u.me?760:400+hash(u.name+'m')%900);
 if(kind==='friends')L=L.filter(u=>u.friend||u.me);
 L.sort((a,b)=>b.points-a.points);
 return L.map((u,i)=>({...u,rank:i+1,move:u.me?2:(hash(u.name+kind)%9)-3}))}
const TITLES=['Rookie','Scout','Analyst','Tactician','Strategist','Maestro','Legend'];
export const levelInfo=xp=>{const l=Math.floor(Math.sqrt(xp/50)),cur=l*l*50,nxt=(l+1)**2*50;return{level:l,title:TITLES[Math.min(Math.floor(l/2),6)],cur,nxt,pct:Math.round((xp-cur)/(nxt-cur)*100),need:nxt-xp}};
export const SCORING=[['Correct match result','10 pts','Pick the right 1X2 outcome'],['Exact score','30 pts total','Replaces the result points, not added on top'],['Correct special prediction','5 pts','Over/Under or Both Teams to Score'],['Incorrect prediction','0 pts','Nothing is deducted']];
export const XP_RULES=[['Submit a prediction','+10 XP'],['Correct prediction','+20 XP'],['Complete five predictions','+50 bonus XP']];
export const WEEKS=[['W37',3],['W38',5],['W39',2],['W40',7],['W41',4],['W42',11],['W43',6],['W44',5]];
export const RECENT=[1,0,1,1,0,1,1,1,1,1];
export const MILESTONES=[[3,'Hot Starter','flame','#FFB347'],[5,'On Fire','flame','#FF8A3D'],[10,'Prediction Machine','cpu','#22D3EE'],[20,'Football Oracle','eye','#C084FC']];
export const BADGES=[
{id:'fp',name:'First Prediction',icon:'target',color:'#5AA9FF',desc:'Made your very first prediction.',req:'Submit 1 prediction',have:true},
{id:'fw',name:'First Win',icon:'award',color:'#34D399',desc:'Got a result right for the first time.',req:'Get 1 correct prediction',have:true},
{id:'ps',name:'Perfect Score',icon:'crosshair',color:'#B388FF',desc:'Nailed an exact scoreline.',req:'Predict 1 exact score',have:true},
{id:'ht',name:'Hat-Trick',icon:'sparkles',color:'#FF6FB5',desc:'Three correct predictions in a single matchday.',req:'3 correct in one matchday',have:true},
{id:'of',name:'On Fire',icon:'flame',color:'#FF8A3D',desc:'Five correct predictions in a row.',req:'5-prediction streak',have:true},
{id:'pm',name:'Prediction Machine',icon:'cpu',color:'#22D3EE',desc:'Ten correct predictions in a row.',req:'10-prediction streak',have:true},
{id:'fo',name:'Football Oracle',icon:'eye',color:'#C084FC',desc:'Twenty correct predictions in a row. Legendary.',req:'20-prediction streak',have:false,prog:[11,20]},
{id:'t10',name:'Top 10',icon:'medal',color:'#F5C451',desc:'Break into the global top ten.',req:'Reach rank 10 or better',have:false,prog:[12,10],inv:true},
{id:'lc',name:'League Champion',icon:'crown',color:'#FFD166',desc:'Finish first in a private league.',req:'Win a private league',have:false,prog:[0,1]}];
export const FEAT=[
{id:'f1',name:'Premier League Elite',creator:'MatchIQ',members:1204,dur:'Full Season',code:'PLE-2026',top:[0,1,2]},
{id:'f2',name:'Champions Crew',creator:'SarahXI',members:860,dur:'8 Weeks',code:'CHC-8841',top:[1,4,5]},
{id:'f3',name:'Sunday League Legends',creator:'Okonkwo_FC',members:342,dur:'12 Weeks',code:'SLL-5120',top:[6,8,10]},
{id:'f4',name:'Midweek Madness',creator:'LunaGoals',members:97,dur:'4 Weeks',code:'MWM-3377',top:[5,7,12]}];
export const MY_SEED=[{id:'l1',name:'Office Rivals',creator:'Alex Morgan',members:12,dur:'Full Season',code:'OFR-4821',top:[3,9,7],mePts:980}];
export const leagueTable=l=>[...l.top.map(i=>({...ALL[i],points:Math.round(ALL[i].points*.35)})),{...ME,points:l.mePts}].sort((a,b)=>b.points-a.points).map((u,i)=>({...u,rank:i+1}));
export const genCode=()=>'MIQ-'+Math.random().toString(36).slice(2,7).toUpperCase();
export const HIST=[['Global leaderboard','Rank #12','Season 26/27 · now'],['Office Rivals','2nd of 12','Weekly · Oct 2026'],['Champions Crew','Top 15%','Sep 2026'],['Global leaderboard','Rank #38','Season 25/26 final']];
