import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { json, readBody, telegramSend, upstash } from '../lib/server.js';
const rate=new Map();
async function loadKnowledge(){
 const [knowledge,content]=await Promise.all([readFile(resolve(process.cwd(),'public/data/knowledge.json'),'utf8'),readFile(resolve(process.cwd(),'public/data/content.json'),'utf8')]);
 return {knowledge:JSON.parse(knowledge),content:JSON.parse(content)};
}
function splitDocs(data){const k=data.knowledge,c=data.content;const docs=[];
 const add=(text,source)=>{if(text&&String(text).trim())docs.push({text:String(text).trim(),source});};
 add(k.identity,'profile');add(k.availability,'availability');add(k.contact,'contact');add(k.limitations,'policy');
 for(const group of c.skills||[])add(`${group.group}: ${(group.items||[]).join(', ')}`,'skills');
 for(const p of c.projects||[])add(`${p.name} — ${p.type}. ${p.description} Website: ${p.url}`,'projects');
 for(const s of c.services||[])add(`${s.title}: ${s.detail}`,'services');
 for(const e of c.experience||[])add(`${e.role} at ${e.organization}. ${e.description}`,'experience');
 for(const p of c.education||[])add(`${p.qualification} — ${p.institution}. ${p.note||''}`,'education');
 for(const s of c.socials||[])add(`${s.label}: ${s.url}`,'contact');
 return docs;
}
function retrieve(query,docs){const terms=query.toLowerCase().match(/[a-z0-9]{3,}/g)||[];return docs.map(d=>{const text=d.text.toLowerCase();let score=0;for(const term of terms){if(text.includes(term))score+=text.split(term).length-1;}return {...d,score};}).filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,7);}
function groundedFallback(q,found){if(!found.length)return 'I do not have verified information about that detail in the portfolio knowledge base. You can send an enquiry through the Hire Me page so Ibukunoluwa can confirm it directly.';return `Here is what the portfolio currently records:\n\n${found.slice(0,5).map(x=>`• ${x.text}`).join('\n\n')}\n\nFor anything that needs confirmation, please use the Hire Me page.`;}
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 try{
  const body=await readBody(req,10000);const message=String(body.message||'').trim().slice(0,3000);const sessionId=String(body.sessionId||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);
  if(!message)return json(res,400,{error:'A message is required.'});
  const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0];const now=Date.now();const recent=(rate.get(ip)||[]).filter(t=>now-t<60000);if(recent.length>=12)return json(res,429,{error:'Please slow down and try again shortly.'});recent.push(now);rate.set(ip,recent);
  const data=await loadKnowledge();const docs=splitDocs(data);const found=retrieve(message,docs);let answer=groundedFallback(message,found);let aiUsed=false;
  const key=process.env.OPENAI_API_KEY;
  if(key){
   const base=(process.env.OPENAI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');const model=process.env.OPENAI_MODEL||'gpt-4.1-mini';
   const system=`You are the clearly disclosed AI assistant for Ibukunoluwa Olabode's professional portfolio. Do not claim to be Ibukunoluwa. Answer politely and concisely. Ground claims only in the retrieved context. Do not invent years of experience, qualifications, certifications, project metrics, prices, employer references, or technical capabilities. If information is missing, say that and direct the visitor to /hire/. The visitor may ask general questions; answer briefly when reasonable, but identify portfolio facts as the source of truth. Context:\n${found.map(d=>`[${d.source}] ${d.text}`).join('\n')}`;
   const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model,temperature:.35,max_tokens:500,messages:[{role:'system',content:system},{role:'user',content:message}]})});
   if(response.ok){const result=await response.json();answer=result.choices?.[0]?.message?.content?.trim()||answer;aiUsed=true;}
  }
  let telegramNotified=false;
  try{if(sessionId&&process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_CHAT_ID){const msg=await telegramSend(`Portfolio visitor message\nSession: ${sessionId}\n\n${message}\n\nReply to this message in Telegram to send a follow-up to the visitor.`);if(msg?.message_id){try{await upstash(['SET',`ibk:tgmsg:${msg.message_id}`,sessionId,'EX',86400]);}catch{}}telegramNotified=true;}}catch{}
  return json(res,200,{answer,aiUsed,telegramNotified,sources:found.map(x=>x.source)});
 }catch(error){return json(res,500,{error:'The assistant could not process this message. Please try again.'});}
}
