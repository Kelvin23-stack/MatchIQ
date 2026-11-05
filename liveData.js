// Normalisers: provider (API-Football v3) responses -> MatchIQ structures. Pure functions, no invented values:
// anything the provider omits stays null and the UI shows "–" or "unavailable".
//
// Fixture   {id,leagueId,leagueName,leagueLogo,season,round,timestamp,venue,city,referee,status{short,long,elapsed,extra,kind},home{id,name,logo,winner},away{...},goals{home,away}}
// Lineup    {H|A:{teamId,teamName,logo,color,formation,coach,xi:[Player],bench:[Player]}}   Player {id,name,sn,num,pos,grid:[row,col]|null,photo}
// MatchStat {id,name,teamId,min,rating,captain,sub,pos,g,a,saves,conceded,shots,sot,passes,keyPasses,passAcc,tackles,duels,duelsWon,dribbles,y,r}
// Season    {id,name,age,nationality,photo,stats:[{teamId,teamName,teamLogo,leagueId,leagueName,season,position,number,apps,starts,minutes,rating,goals,assists,...}]}
export const num=v=>v===null||v===undefined||v===''||Number.isNaN(Number(v))?null:Number(v);
const LIVE=['1H','2H','ET','BT','P','LIVE'],DONE=['FT','AET','PEN'],OFF=['PST','CANC','SUSP','INT','ABD','AWD','WO'];
export function statusInfo(st={}){const s=st.short||'';
 const kind=LIVE.includes(s)?'live':s==='HT'?'break':DONE.includes(s)?'finished':s==='NS'||s==='TBD'?'upcoming':OFF.includes(s)?'off':'unknown';
 return{short:s,long:st.long||'',elapsed:num(st.elapsed),extra:num(st.extra),kind}}
export function normFixture(r){if(!r||!r.fixture)return null;const f=r.fixture,l=r.league||{},t=r.teams||{};
 return{id:f.id,leagueId:l.id,leagueName:l.name||'',leagueLogo:l.logo||null,season:l.season??null,round:l.round||'',timestamp:num(f.timestamp),venue:f.venue&&f.venue.name||null,city:f.venue&&f.venue.city||null,referee:f.referee||null,
  status:statusInfo(f.status),home:{id:t.home&&t.home.id,name:t.home&&t.home.name||'Home',logo:t.home&&t.home.logo||null,winner:t.home?t.home.winner:null},away:{id:t.away&&t.away.id,name:t.away&&t.away.name||'Away',logo:t.away&&t.away.logo||null,winner:t.away?t.away.winner:null},goals:{home:num(r.goals&&r.goals.home),away:num(r.goals&&r.goals.away)}}}
export const normFixtures=a=>(Array.isArray(a)?a:[]).map(normFixture).filter(Boolean).sort((x,y)=>(x.timestamp||0)-(y.timestamp||0));
const POSMAP={G:'GK',D:'DF',M:'MF',F:'FW',Goalkeeper:'GK',Defender:'DF',Midfielder:'MF',Attacker:'FW'};
export const posCode=p=>POSMAP[p]||null;
const surname=n=>{const s=String(n||'').trim();if(!s)return '';const parts=s.split(/\s+/);return parts.length>1&&/^[A-Z]\.?$/.test(parts[0])?parts.slice(1).join(' '):parts[parts.length-1]};
export const photoUrl=id=>id?`https://media.api-sports.io/football/players/${id}.png`:null;
const gridOf=g=>{const m=/^(\d+):(\d+)$/.exec(g||'');return m?[Number(m[1]),Number(m[2])]:null};
const normP=x=>{const p=x&&x.player||{};return{id:p.id??null,name:p.name||'Unknown',sn:surname(p.name),num:num(p.number),pos:posCode(p.pos),grid:gridOf(p.grid),photo:photoUrl(p.id)}};
// Returns null when the provider has no lineup (e.g. not announced yet).
export function normLineups(raw,fx){if(!Array.isArray(raw)||raw.length<2||!fx)return null;
 const mk=t=>{if(!t)return null;const c=t.team&&t.team.colors&&t.team.colors.player&&t.team.colors.player.primary;return{teamId:t.team&&t.team.id,teamName:t.team&&t.team.name,logo:t.team&&t.team.logo,color:c&&/^[0-9a-fA-F]{6}$/.test(c)?'#'+c:null,formation:t.formation||null,coach:t.coach&&t.coach.name||null,xi:(t.startXI||[]).map(normP),bench:(t.substitutes||[]).map(normP)}};
 const H=mk(raw.find(t=>t.team&&t.team.id===fx.home.id)||raw[0]),A=mk(raw.find(t=>t.team&&t.team.id===fx.away.id)||raw[1]);
 if(!H||!A||(!H.xi.length&&!A.xi.length))return null;return{H,A}}
export function normFixturePlayers(raw){const out=[];
 (Array.isArray(raw)?raw:[]).forEach(t=>(t.players||[]).forEach(x=>{const s=(x.statistics||[])[0]||{},g=s.games||{},go=s.goals||{},sh=s.shots||{},pa=s.passes||{},ta=s.tackles||{},du=s.duels||{},dr=s.dribbles||{},ca=s.cards||{};
  out.push({id:x.player&&x.player.id,name:x.player&&x.player.name||'Unknown',teamId:t.team&&t.team.id,teamName:t.team&&t.team.name,photo:photoUrl(x.player&&x.player.id),min:num(g.minutes),rating:num(g.rating),captain:!!g.captain,sub:!!g.substitute,pos:posCode(g.position),num:num(g.number),g:num(go.total),a:num(go.assists),saves:num(go.saves),conceded:num(go.conceded),shots:num(sh.total),sot:num(sh.on),passes:num(pa.total),keyPasses:num(pa.key),passAcc:num(pa.accuracy),tackles:num(ta.total),duels:num(du.total),duelsWon:num(du.won),dribbles:num(dr.success),y:num(ca.yellow),r:num(ca.red)})}));
 return out}
const pct=v=>{if(v===null||v===undefined)return null;const n=parseFloat(String(v).replace('%',''));return Number.isNaN(n)?null:n};
export function normTeamStats(raw,fx){if(!Array.isArray(raw)||raw.length<2||!fx)return null;
 const of=t=>Object.fromEntries((t&&t.statistics||[]).map(s=>[s.type,s.value]));
 const h=of(raw.find(t=>t.team&&t.team.id===fx.home.id)||raw[0]),a=of(raw.find(t=>t.team&&t.team.id===fx.away.id)||raw[1]);
 const rows=[['Ball Possession','Possession','%'],['Total Shots','Shots',''],['Shots on Goal','Shots on target',''],['Corner Kicks','Corners',''],['Fouls','Fouls',''],['Passes %','Pass accuracy','%'],['Yellow Cards','Yellow cards',''],['Red Cards','Red cards','']]
  .map(([k,l,u])=>({label:l,unit:u,h:pct(h[k]),a:pct(a[k])})).filter(r=>r.h!==null||r.a!==null);
 return rows.length?rows:null}
export const normEvents=raw=>(Array.isArray(raw)?raw:[]).map(e=>({minute:num(e.time&&e.time.elapsed),extra:num(e.time&&e.time.extra),teamId:e.team&&e.team.id,teamName:e.team&&e.team.name,logo:e.team&&e.team.logo,player:e.player&&e.player.name||null,assist:e.assist&&e.assist.name||null,type:e.type,detail:e.detail||'',comments:e.comments||null}));
export function normStandings(raw){const g=raw&&raw[0]&&raw[0].league&&raw[0].league.standings;if(!Array.isArray(g))return null;
 return g.map(grp=>grp.map(r=>({rank:r.rank,teamId:r.team&&r.team.id,name:r.team&&r.team.name,logo:r.team&&r.team.logo,points:num(r.points),diff:num(r.goalsDiff),form:r.form||'',played:num(r.all&&r.all.played),win:num(r.all&&r.all.win),draw:num(r.all&&r.all.draw),lose:num(r.all&&r.all.lose),gf:num(r.all&&r.all.goals&&r.all.goals.for),ga:num(r.all&&r.all.goals&&r.all.goals.against),description:r.description||null})))}
export const normTeams=raw=>(Array.isArray(raw)?raw:[]).map(r=>({id:r.team&&r.team.id,name:r.team&&r.team.name,logo:r.team&&r.team.logo,venue:r.venue&&r.venue.name||null})).filter(t=>t.id).sort((a,b)=>a.name.localeCompare(b.name));
// /players returns one entry per player with a statistics[] array (one item per team/competition).
export function normPlayer(item){if(!item||!item.player)return null;const p=item.player;
 const stats=(item.statistics||[]).map(s=>{const g=s.games||{};return{teamId:s.team&&s.team.id,teamName:s.team&&s.team.name,teamLogo:s.team&&s.team.logo,leagueId:s.league&&s.league.id,leagueName:s.league&&s.league.name,season:s.league&&s.league.season,
  position:g.position||null,number:num(g.number),apps:num(g.appearences??g.appearances),starts:num(g.lineups),minutes:num(g.minutes),rating:num(g.rating),
  goals:num(s.goals&&s.goals.total),assists:num(s.goals&&s.goals.assists),conceded:num(s.goals&&s.goals.conceded),saves:num(s.goals&&s.goals.saves),shots:num(s.shots&&s.shots.total),sot:num(s.shots&&s.shots.on),
  passes:num(s.passes&&s.passes.total),keyPasses:num(s.passes&&s.passes.key),passAcc:num(s.passes&&s.passes.accuracy),tackles:num(s.tackles&&s.tackles.total),interceptions:num(s.tackles&&s.tackles.interceptions),
  duels:num(s.duels&&s.duels.total),duelsWon:num(s.duels&&s.duels.won),dribbles:num(s.dribbles&&s.dribbles.success),yellow:num(s.cards&&s.cards.yellow),red:num(s.cards&&s.cards.red)}});
 return{id:p.id,name:p.name,firstname:p.firstname||null,lastname:p.lastname||null,age:num(p.age),nationality:p.nationality||null,height:p.height||null,injured:!!p.injured,photo:p.photo||photoUrl(p.id),stats}}
export const normPlayers=raw=>{const seen=new Set();return(Array.isArray(raw)?raw:[]).map(normPlayer).filter(p=>p&&!seen.has(p.id)&&seen.add(p.id))}; // de-duplicated by provider id
export const pickStats=(p,leagues=[])=>{if(!p||!p.stats.length)return null;return p.stats.find(s=>leagues.includes(String(s.leagueId)))||p.stats[0]};
export const ratingText=r=>r===null||r===undefined?'Rating unavailable':Number(r).toFixed(2);
export const per90=(v,min)=>v===null||!min?null:Math.round(v/min*90*100)/100;
