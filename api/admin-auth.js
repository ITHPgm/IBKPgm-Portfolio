import { json, readBody, createSession, isAdmin } from '../lib/server.js';
export default async function handler(req,res){
  if(req.method==='GET')return json(res,200,{authenticated:isAdmin(req)});
  if(req.method==='DELETE'){res.setHeader('Set-Cookie','ibk_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');return json(res,200,{ok:true});}
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  const password=process.env.ADMIN_PASSWORD,secret=process.env.ADMIN_SESSION_SECRET;
  if(!password||!secret)return json(res,503,{error:'Admin login is not configured on the server.'});
  try{const body=await readBody(req,5000);if(String(body.password||'').length>512||body.password!==password)return json(res,401,{error:'Incorrect password'});const token=createSession(secret);res.setHeader('Set-Cookie',`ibk_admin=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);return json(res,200,{ok:true,authenticated:true});}catch{return json(res,400,{error:'Invalid request'});}
}
