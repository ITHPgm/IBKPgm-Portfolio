import { json, upstash } from '../lib/server.js';
export default async function handler(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 const sessionId=String(req.query.sessionId||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);if(!sessionId)return json(res,400,{error:'Session is required'});
 try{const items=await upstash(['LRANGE',`ibk:replies:${sessionId}`,0,4]);if(items?.length)await upstash(['DEL',`ibk:replies:${sessionId}`]);return json(res,200,{replies:(items||[]).map(item=>{try{return JSON.parse(item);}catch{return {text:String(item)};}})});}catch{return json(res,200,{replies:[]});}
}
