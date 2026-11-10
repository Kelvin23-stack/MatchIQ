export const V={
 name:v=>!v.trim()?'Enter your full name':v.trim().length<2?'That name looks too short':'',
 username:v=>!v?'Choose a username':!/^[a-zA-Z0-9_]{3,20}$/.test(v)?'Use 3–20 letters, numbers or underscores':'',
 email:v=>!v?'Enter your email address':!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?'Enter a valid email address':'',
 password:v=>!v?'Enter a password':v.length<8?'Use at least 8 characters':!/[A-Za-z]/.test(v)||!/\d/.test(v)?'Include at least one letter and one number':'',
 confirm:(v,p)=>!v?'Confirm your password':v!==p?'Passwords do not match':''};
export const strength=p=>(p.length>=8)+(/[A-Z]/.test(p)&&/[a-z]/.test(p))+/\d/.test(p)+(/[^A-Za-z0-9]/.test(p)||p.length>=12);
export const hasErrors=e=>Object.values(e).some(Boolean);
