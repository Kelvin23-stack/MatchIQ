// Downscale a chosen image so it fits comfortably in localStorage. Local preview only; nothing is uploaded.
export const compressImage=(file,max=900,q=.72)=>new Promise((res,rej)=>{if(!file||!file.type.startsWith('image/'))return rej(new Error('Choose an image file'));
 const r=new FileReader();r.onerror=()=>rej(new Error('Could not read that image'));
 r.onload=()=>{const img=new Image();img.onerror=()=>rej(new Error('Could not read that image'));img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',q))};img.src=r.result};r.readAsDataURL(file)});
