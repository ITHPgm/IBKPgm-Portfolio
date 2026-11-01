import { json, readBody } from '../lib/server.js';
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const key=process.env.RESEND_API_KEY,to=process.env.CONTACT_TO_EMAIL,from=process.env.CONTACT_FROM_EMAIL;
 if(!key||!to||!from)return json(res,503,{error:'Email is not configured. Use the email draft fallback.'});
 try{const body=await readBody(req,12000);const name=String(body.name||'').trim().slice(0,120),email=String(body.email||'').trim().slice(0,200),message=String(body.message||'').trim().slice(0,5000),type=String(body.type||'Website enquiry').slice(0,100);if(!name||!/^\S+@\S+\.\S+$/.test(email)||!message)return json(res,400,{error:'Please complete the required fields.'});
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to,reply_to:email,subject:`${type} — ${name}`,text:`Name: ${name}\nEmail: ${email}\nType: ${type}\nBudget: ${String(body.budget||'Not stated')}\n\n${message}`})});const d=await r.json();if(!r.ok)return json(res,502,{error:d.message||'Email provider rejected the request.'});return json(res,200,{ok:true});
 }catch{return json(res,400,{error:'Invalid contact request.'});}
}
