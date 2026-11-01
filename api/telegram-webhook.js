import { json, readBody, upstash } from '../lib/server.js';
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const expected=process.env.TELEGRAM_WEBHOOK_SECRET;const received=req.headers['x-telegram-bot-api-secret-token'];if(!expected||received!==expected)return json(res,401,{error:'Webhook verification failed'});
 try{const update=await readBody(req,50000);const message=update.message;if(!message?.reply_to_message?.message_id||!message.text)return json(res,200,{ok:true,ignored:true});
  const sessionId=await upstash(['GET',`ibk:tgmsg:${message.reply_to_message.message_id}`]);if(!sessionId)return json(res,200,{ok:true,unmatched:true});
  const reply=String(message.text).trim().slice(0,2000);await upstash(['LPUSH',`ibk:replies:${sessionId}`,JSON.stringify({text:reply,at:Date.now()})]);await upstash(['LTRIM',`ibk:replies:${sessionId}`,0,4]);await upstash(['EXPIRE',`ibk:replies:${sessionId}`,3600]);
  return json(res,200,{ok:true});
 }catch(error){return json(res,500,{error:'Webhook processing failed'});}
}
