// Normalisers: Highlightly Football API responses -> MatchIQ structures. Pure functions, no invented values:
// anything the provider omits stays null and the UI shows "–" or "unavailable".
// Shapes follow the Highlightly OpenAPI spec (Football API v8.2.7).
//
// Fixture   {id,leagueId,leagueName,leagueLogo,season,round,timestamp,venue,city,referee,status{short,long,elapsed,extra,kind},home{id,name,logo,winner},away{...},goals{home,away},penalties:[h,a]|null}
// Lineup    {H|A:{teamId,teamName,logo,color,formation,coach,xi:[Player],bench:[Player]}}   Player {id,name,sn,num,pos,grid:[row,col]|null,photo}
// Provider image URLs: trimmed, and upgraded from http:// (or protocol-relative) to https:// so browsers on an https page do not block them as mixed content.
export const img=u=>typeof u==='string'&&u.trim()?u.trim().replace(/^http:\/\//i,'https://').replace(/^\/\//,'https://'):null;
export const num=v=>v===null||v===undefined||v===''||Number.isNaN(Number(v))?null:Number(v);

// ---- match state ----------------------------------------------------------------------------------------------
const LIVE=['First half','Second half','Extra time','Penalties','In progress'],BREAK=['Half time','Break time'],DONE=['Finished','Finished after penalties','Finished after extra time'],UP=['Not started','To be announced'],OFF=['Postponed','Cancelled','Suspended','Interrupted','Abandoned','Awarded'];
const SHORT={'Finished':'FT','Not started':'NS','To be announced':'TBD','Half time':'HT'};
export function statusInfo(st={}){const d=st.description||'';
 const kind=LIVE.includes(d)?'live':BREAK.includes(d)?'break':DONE.includes(d)?'finished':UP.includes(d)?'upcoming':OFF.includes(d)?'off':'unknown';
 return{short:SHORT[d]||d,long:d,elapsed:num(st.clock),extra:null,kind}}
// "3 - 1" -> [3,1]; anything else -> null
export const parseScore=s=>{const m=/^\s*(\d+)\s*-\s*(\d+)\s*$/.exec(String(s??''));return m?[Number(m[1]),Number(m[2])]:null};
const ts=d=>{const t=Date.parse(d);return Number.isNaN(t)?null:Math.floor(t/1000)};

// ---- matches (list items and /matches/{id} items share this shape) ----------------------------------------------------
export function normFixture(r){if(!r||r.id==null)return null;const st=r.state||{},sc=parseScore(st.score&&st.score.current),h=r.homeTeam||{},a=r.awayTeam||{},l=r.league||{};
 return{id:r.id,leagueId:l.id??null,leagueName:l.name||'',leagueLogo:img(l.logo),season:l.season??null,round:r.round||'',timestamp:ts(r.date),
  venue:r.venue&&r.venue.name||null,city:r.venue&&r.venue.city||null,referee:r.referee&&r.referee.name||null,status:statusInfo(st),
  home:{id:h.id,name:h.name||'Home',logo:img(h.logo),winner:null},away:{id:a.id,name:a.name||'Away',logo:img(a.logo),winner:null},
  goals:{home:sc?sc[0]:null,away:sc?sc[1]:null},penalties:parseScore(st.score&&st.score.penalties)}}
export const normFixtures=a=>(Array.isArray(a)?a:[]).map(normFixture).filter(Boolean).sort((x,y)=>(x.timestamp||0)-(y.timestamp||0));

// ---- lineups ------------------------------------------------------------------------------------------------------------
const POSMAP={Goalkeeper:'GK',Defender:'DF',Midfielder:'MF',Forward:'FW',Attacker:'FW'};
export const posCode=p=>POSMAP[p]||null;
const surname=n=>{const s=String(n||'').trim();if(!s)return '';const parts=s.split(/\s+/);return parts.length>1&&/^[A-Z]\.?$/.test(parts[0])?parts.slice(1).join(' '):parts[parts.length-1]};
const mkP=(p,grid)=>({id:p&&p.id!=null?p.id:null,name:p&&p.name||'Unknown',sn:surname(p&&p.name),num:num(p&&p.number),pos:posCode(p&&p.position),grid:grid||null,photo:null});
// The provider returns initialLineup as rows (goalkeeper first, then one row per formation line). A flat list is split by the formation
// when its size matches. If the shape cannot be trusted no grid is produced and the pitch falls back to position groups.
function rowsOf(t){const il=Array.isArray(t.initialLineup)?t.initialLineup:[];
 if(il.length&&Array.isArray(il[0]))return il;
 const f=String(t.formation||'').split('-').map(Number);
 if(il.length&&f.length&&f.every(n=>n>0)&&il.length===1+f.reduce((s,n)=>s+n,0)){let i=0;return[[il[i++]],...f.map(n=>il.slice(i,i+=n))]}
 return null}
// Returns null when the provider has no lineup (e.g. not announced yet).
export function normLineups(raw){if(!raw||!raw.homeTeam||!raw.awayTeam)return null;
 const mk=t=>{const rows=rowsOf(t),xi=rows?rows.flatMap((row,ri)=>row.map((p,ci)=>mkP(p,[ri+1,ci+1]))):(t.initialLineup||[]).map(p=>mkP(p,null));
  return{teamId:t.id,teamName:t.name,logo:img(t.logo),color:null,formation:t.formation||null,coach:null,xi,bench:(t.substitutes||[]).map(p=>mkP(p,null))}};
 const H=mk(raw.homeTeam),A=mk(raw.awayTeam);if(!H.xi.length&&!A.xi.length)return null;return{H,A}}

// ---- events (inside /matches/{id}) -----------------------------------------------------------------------------------------
const tm=t=>{const m=/^(\d+)(?:\s*\+\s*(\d+))?/.exec(String(t??''));return m?[Number(m[1]),m[2]?Number(m[2]):null]:[null,null]};
export const normEvents=raw=>(Array.isArray(raw)?raw:[]).map(e=>{const [minute,extra]=tm(e.time);return{minute,extra,teamId:e.team&&e.team.id,teamName:e.team&&e.team.name,logo:img(e.team&&e.team.logo),player:e.player||null,playerId:e.playerId??null,assist:e.assist||null,substituted:e.substituted||null,type:e.type||'',detail:e.type||'',comments:null}});

// ---- team statistics (inside /matches/{id}, or /statistics/{matchId}) ---------------------------------------------------------
// Statistic names are the provider's own `displayName` strings. Values are shown exactly as returned (no unit is guessed).
export function normTeamStats(raw,fx){if(!Array.isArray(raw)||raw.length<2)return null;
 const by=t=>Object.fromEntries(((t&&t.statistics)||[]).map(s=>[s.displayName,num(s.value)]));
 const hT=(fx&&raw.find(t=>t.team&&t.team.id===fx.home.id))||raw[0],aT=(fx&&raw.find(t=>t.team&&t.team.id===fx.away.id))||raw[1];
 const h=by(hT),a=by(aT),names=[...new Set([...Object.keys(h),...Object.keys(a)])];
 const rows=names.map(n=>({label:n,unit:'',h:h[n]??null,a:a[n]??null})).filter(r=>r.h!==null||r.a!==null);
 return rows.length?rows:null}
// "Top players" per team from /matches/{id}: [{team:'H'|'A',teamName,name,position,stats:[{name,value}]}]
export function normTopPlayers(detail){if(!detail)return[];const out=[];
 [['H',detail.homeTeam],['A',detail.awayTeam]].forEach(([side,t])=>((t&&t.topPlayers)||[]).forEach(p=>out.push({team:side,teamName:t.name,name:p.name||'Unknown',position:p.position||null,stats:(p.statistics||[]).map(s=>({name:s.name,value:s.value}))})));
 return out}

// ---- standings ----------------------------------------------------------------------------------------------------------------
// -> [{name,rows:[...]}]  (form is not provided by Highlightly; goal difference is computed from goals for/against)
export function normStandings(raw){const g=raw&&raw.groups;if(!Array.isArray(g))return null;
 return g.map(grp=>({name:grp.name||'',rows:(grp.standings||[]).map(r=>{const t=r.total||{};return{rank:r.position,teamId:r.team&&r.team.id,name:r.team&&r.team.name,logo:img(r.team&&r.team.logo),points:num(r.points),
  diff:t.scoredGoals!=null&&t.receivedGoals!=null?t.scoredGoals-t.receivedGoals:null,form:'',played:num(t.games),win:num(t.wins),draw:num(t.draws),lose:num(t.loses),gf:num(t.scoredGoals),ga:num(t.receivedGoals),description:null}})}))}

// ---- leagues -------------------------------------------------------------------------------------------------------------------------
export const normLeague=r=>r&&r.id!=null?{id:r.id,name:r.name||'',logo:img(r.logo),country:r.country&&r.country.name||null,seasons:(r.seasons||[]).map(s=>s.season)}:null;

// ---- players --------------------------------------------------------------------------------------------------------------------------
export const normPlayerList=raw=>(Array.isArray(raw)?raw:[]).filter(p=>p&&p.id!=null).map(p=>({id:p.id,name:p.name||'Unknown',fullName:p.fullName||null,photo:img(p.logo)}));
const age=b=>{const t=Date.parse(b);if(Number.isNaN(t))return null;const d=new Date(t),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;return a>0&&a<70?a:null};
export function normPlayerProfile(item){if(!item||item.id==null)return null;const p=item.profile||{},c=p.club||{};
 return{id:item.id,name:item.name||'Unknown',fullName:item.fullName||p.fullName||null,photo:img(item.logo),birthDate:p.birthDate||null,age:age(p.birthDate),birthPlace:p.birthPlace||null,nationality:p.citizenship||null,height:p.height||null,foot:p.foot||null,
  position:p.position&&p.position.main||null,secondaryPosition:p.position&&p.position.secondary||null,club:c.current||null,joinedAt:c.joinedAt||null,contractExpiry:c.contractExpiry||null,
  injuries:(item.injuries||[]).map(i=>({reason:i.reason,season:i.season,fromDate:i.fromDate,toDate:i.toDate||null,missedGames:num(i.missedGames)})),
  transfers:(item.transfers||[]).map(t=>({from:t.from,to:t.to,type:t.type,season:t.season,fee:t.fee||null,date:t.transferDate}))}}
const sRow=s=>({club:s.club,league:s.league||null,type:s.type||null,season:s.season||null,apps:num(s.gamesPlayed),minutes:num(s.minutesPlayed),goals:num(s.goals),assists:num(s.assists),yellow:num(s.yellowCards),red:num(s.redCards),cleanSheets:num(s.cleanSheets),conceded:num(s.goalsConceded),penalties:num(s.penaltiesScored)});
export function normPlayerStats(item){if(!item)return null;return{perCompetition:(item.perCompetition||[]).map(sRow),perClub:(item.perClub||[]).map(sRow)}}
