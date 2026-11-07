import React,{createContext,useContext,useState} from 'react'
import {Ctx} from './context'
import {useStored} from './hooks'
import {ME} from './compData'
import {SEED_ROOMS,BOT_POSTS,SEED_POSTS,SEED_FRIENDS,SEED_CONVOS,SEED_UNREAD,SEED_NOTIFS,CANNED,userOf,online} from './socialData'
// Every action below is the single place a future Supabase call would replace.
export const SC=createContext();export const useSocial=()=>useContext(SC);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export function SocialProvider({children}){
 const {toast,nav}=useContext(Ctx);
 const [posts,setPosts]=useStored('matchiq.s.posts',SEED_POSTS),[friends,setFriends]=useStored('matchiq.s.friends',SEED_FRIENDS),[convos,setConvos]=useStored('matchiq.s.convos',SEED_CONVOS),[unread,setUnread]=useStored('matchiq.s.unread',SEED_UNREAD),[joined,setJoined]=useStored('matchiq.s.joined',['ARS']),[disc,setDisc]=useStored('matchiq.s.disc',{}),[notifs,setNotifs]=useStored('matchiq.s.notifs',SEED_NOTIFS);
 const [typing,setTyping]=useState(null),[chatWith,setChatWith]=useState(null),[shareReq,setShareReq]=useState(null),[commTab,setCommTab]=useState('Feed');
 const [rooms,setRooms]=useStored('matchiq.s.rooms',SEED_ROOMS),[profileUser,setProfileUser]=useState(null);
 const openUser=u=>setProfileUser(typeof u==='string'?{name:u}:u);
 const roomSend=(room,text,img)=>setRooms(r=>({...r,[room]:[...(r[room]||[]).slice(-119),{id:uid(),user:ME.name,text,img,at:Date.now()}]}));
 const roomPush=(room,m)=>setRooms(r=>({...r,[room]:[...(r[room]||[]).slice(-119),{id:uid(),at:Date.now(),...m}]}));
 const botPost=()=>{const names=Object.keys(SEED_ROOMS).length?['Kofi_Bets','SarahXI','TacticalTemi','LunaGoals','Diego9','Gunner_Jay','Mbappe_Mind','OffsideOla']:[];const user=names[Math.floor(Math.random()*names.length)];setPosts(s=>[{id:uid(),user,type:'general',at:Date.now(),text:BOT_POSTS[Math.floor(Math.random()*BOT_POSTS.length)],likes:[],comments:[],shares:0,fresh:true},...s])};
 const addNotif=(type,text)=>setNotifs(n=>[{id:uid(),type,text,at:Date.now(),read:false},...n]);
 const post=p=>{const id=uid();setPosts(s=>[{id,user:ME.name,at:Date.now(),likes:[],comments:[],shares:0,type:'general',...p},...s]);toast(p.club?'Posted to the community':'Post published');
  const pool=friends.friends.length?friends.friends:['Kofi_Bets'];
  setTimeout(()=>{const u=pool[0];setPosts(s=>s.map(x=>x.id===id?{...x,likes:[...x.likes,u]}:x));addNotif('like',`${u} liked your post`)},3500);
  setTimeout(()=>{const u=pool[pool.length-1];setPosts(s=>s.map(x=>x.id===id?{...x,comments:[...x.comments,{id:uid(),user:u,text:'Great call! Let us see how it plays out.',at:Date.now()}]}:x));addNotif('comment',`${u} commented on your post`)},7500)};
 const toggleLike=id=>setPosts(s=>s.map(x=>x.id!==id?x:{...x,likes:x.likes.includes(ME.name)?x.likes.filter(n=>n!==ME.name):[...x.likes,ME.name]}));
 const addComment=(id,text)=>setPosts(s=>s.map(x=>x.id!==id?x:{...x,comments:[...x.comments,{id:uid(),user:ME.name,text,at:Date.now()}]}));
 const deletePost=id=>{setPosts(s=>s.filter(x=>x.id!==id));toast('Post deleted')};
 const sharePost=id=>setPosts(s=>s.map(x=>x.id===id?{...x,shares:x.shares+1}:x));
 const sendReq=n=>{setFriends(f=>({...f,sent:[...f.sent,n]}));toast(`Friend request sent to ${n} (demo)`)};
 const cancel=n=>{setFriends(f=>({...f,sent:f.sent.filter(x=>x!==n)}));toast('Request cancelled')};
 const accept=n=>{setFriends(f=>({...f,incoming:f.incoming.filter(x=>x!==n),friends:[...f.friends,n]}));toast(`You and ${n} are now friends`)};
 const reject=n=>{setFriends(f=>({...f,incoming:f.incoming.filter(x=>x!==n)}));toast(`Request from ${n} declined`)};
 const remove=n=>{setFriends(f=>({...f,friends:f.friends.filter(x=>x!==n)}));toast(`${n} removed from your friends`)};
 const send=(to,text)=>{setConvos(c=>({...c,[to]:[...(c[to]||[]),{id:uid(),from:'me',text,at:Date.now()}]}));
  if(online(userOf(to))){setTimeout(()=>setTyping(to),700);setTimeout(()=>{setTyping(null);setConvos(c=>({...c,[to]:[...(c[to]||[]),{id:uid(),from:'them',text:CANNED[Math.floor(Math.random()*CANNED.length)],at:Date.now()}]}))},2600)}};
 const openConvo=n=>setUnread(u=>({...u,[n]:0}));
 const openTab=t=>{if(t==='Messages'){nav('messages');return}setCommTab(t);nav('community')};
 const openChat=n=>{setChatWith(n);openTab('Messages')};
 const joinClub=c=>{setJoined(j=>[...j,c]);toast('Joined the community')};
 const leaveClub=c=>{setJoined(j=>j.filter(x=>x!==c));toast('You left the community')};
 const discSend=(mid,text,pred)=>setDisc(d=>({...d,[mid]:[...(d[mid]||[]),{id:uid(),user:ME.name,text,pred,at:Date.now(),reacts:{}}]}));
 const discReact=(mid,id,e)=>setDisc(d=>({...d,[mid]:d[mid].map(m=>{if(m.id!==id)return m;const l=m.reacts[e]||[],has=l.includes(ME.name);return{...m,reacts:{...m.reacts,[e]:has?l.filter(x=>x!==ME.name):[...l,ME.name]}}})}));
 const renameMe=(o,n)=>{if(o===n)return;const r=x=>x===o?n:x;setPosts(s=>s.map(p=>({...p,user:r(p.user),likes:p.likes.map(r),comments:p.comments.map(c=>({...c,user:r(c.user)}))})));setDisc(d=>Object.fromEntries(Object.entries(d).map(([k,v])=>[k,v.map(m=>({...m,user:r(m.user),reacts:Object.fromEntries(Object.entries(m.reacts).map(([e,l])=>[e,l.map(r)]))}))])))};
 const markAll=()=>{setNotifs(n=>n.map(x=>({...x,read:true})));toast('All notifications marked as read')};
 const markRead=id=>setNotifs(n=>n.map(x=>x.id===id?{...x,read:true}:x));
 return <SC.Provider value={{profileUser,openUser,closeUser:()=>setProfileUser(null),rooms,roomSend,roomPush,botPost,renameMe,posts,post,toggleLike,addComment,deletePost,sharePost,friends,sendReq,cancel,accept,reject,remove,convos,unread,typing,send,openConvo,chatWith,openChat,clearChat:()=>setChatWith(null),joined,joinClub,leaveClub,disc,discSend,discReact,notifs,markAll,markRead,shareReq,openShare:setShareReq,closeShare:()=>setShareReq(null),commTab,setCommTab,openTab}}>{children}</SC.Provider>}
