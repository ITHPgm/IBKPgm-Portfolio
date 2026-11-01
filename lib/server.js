import { createHmac, timingSafeEqual } from 'node:crypto';

export function json(res, status, payload, headers={}) {
  for (const [key,value] of Object.entries(headers)) res.setHeader(key,value);
  res.status(status).json(payload);
}
export function getCookie(req,name){const cookies=(req.headers.cookie||'').split(';').map(v=>v.trim());const entry=cookies.find(v=>v.startsWith(`${name}=`));return entry?decodeURIComponent(entry.slice(name.length+1)):'';}
export function sign(value,secret){return createHmac('sha256',secret).update(value).digest('base64url');}
export function createSession(secret){const expires=Date.now()+1000*60*60*8;const payload=Buffer.from(JSON.stringify({exp:expires,role:'admin'})).toString('base64url');return `${payload}.${sign(payload,secret)}`;}
export function isAdmin(req){
  const secret=process.env.ADMIN_SESSION_SECRET;if(!secret)return false;
  const token=getCookie(req,'ibk_admin');if(!token)return false;
  const [payload,signature]=token.split('.');if(!payload||!signature)return false;
  const expected=sign(payload,secret);
  try{if(!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return data.role==='admin'&&data.exp>Date.now();}catch{return false;}
}
export function requireAdmin(req,res){if(!isAdmin(req)){json(res,401,{error:'Admin authentication required'});return false;}return true;}
export async function readBody(req,limit=500000){if(req.body&&typeof req.body==='object')return req.body;let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>limit)throw new Error('Request too large');}return raw?JSON.parse(raw):{};}
export async function upstash(command){
  const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
  if(!url||!token)throw new Error('Upstash Redis is not configured');
  const response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(command)});
  if(!response.ok)throw new Error('Redis request failed');const result=await response.json();if(result.error)throw new Error(result.error);return result.result;
}
export async function telegramSend(text){
  const token=process.env.TELEGRAM_BOT_TOKEN,chatId=process.env.TELEGRAM_CHAT_ID;
  if(!token||!chatId)return null;
  const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text,disable_web_page_preview:true})});
  const result=await response.json();if(!response.ok||!result.ok)throw new Error('Telegram notification failed');return result.result;
}
