import { json, readBody, requireAdmin } from '../lib/server.js';
const allowed=new Set(['content.json','blog.json','knowledge.json']);
export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!requireAdmin(req,res))return;
 const {GITHUB_TOKEN,GITHUB_OWNER,GITHUB_REPO,GITHUB_BRANCH='main'}=process.env;
 if(!GITHUB_TOKEN||!GITHUB_OWNER||!GITHUB_REPO)return json(res,503,{error:'GitHub publishing is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in Vercel.'});
 try{
  const body=await readBody(req,500000);const file=String(body.file||'');
  if(!allowed.has(file))return json(res,400,{error:'This content path is not allowed.'});
  const content=JSON.stringify(body.content,null,2);if(content.length>450000)return json(res,413,{error:'JSON content is too large.'});
  const path=`public/data/${file}`,api=`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers={Authorization:`Bearer ${GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
  let sha;const existing=await fetch(`${api}?ref=${encodeURIComponent(GITHUB_BRANCH)}`,{headers});if(existing.ok){const prior=await existing.json();sha=prior.sha;}else if(existing.status!==404){const problem=await existing.json().catch(()=>({}));return json(res,existing.status,{error:problem.message||'Could not read current GitHub file.'});}
  const payload={message:`Update portfolio ${file}`,content:Buffer.from(content,'utf8').toString('base64'),branch:GITHUB_BRANCH};if(sha)payload.sha=sha;
  const saved=await fetch(api,{method:'PUT',headers,body:JSON.stringify(payload)});const result=await saved.json();if(!saved.ok)return json(res,saved.status,{error:result.message||'GitHub commit failed.'});
  return json(res,200,{ok:true,path,commit:result.commit?.html_url||null});
 }catch(error){return json(res,400,{error:error.message||'Publish request failed.'});}
}
