import { escapeHTML, toast } from './utils.js';
let commandData;
export async function initChat({content, blogData}){
 const log=document.querySelector('#chat-log');if(!log)return;
 try{commandData=await(await fetch('/data/bot-commands.json')).json();}catch{commandData={commands:[]};}
 const sessionId=sessionStorage.getItem('ibk-chat-session')||crypto.randomUUID();sessionStorage.setItem('ibk-chat-session',sessionId);
 let pollTimer=null;
 const add=(text,role='bot')=>{const bubble=document.createElement('div');bubble.className=`bubble ${role}`;bubble.textContent=text;log.append(bubble);log.scrollTop=log.scrollHeight;return bubble;};
 const localAnswer=(question)=>{
   const q=question.toLowerCase();
   if(/^(\/help|\/commands|help|commands)/.test(q))return `I can help with: ${['/skills','/projects','/services','/availability','/experience','/contact','/freelance','/resume','/blog','/tour','/share-page'].join(', ')}. There are ${commandData.total||commandData.commands?.length||0} registered command actions in the command catalogue. Ask a natural-language question too.`;
   if(/skill|technology|stack|language/.test(q))return `Ibukunoluwa works with HTML5, CSS3, JavaScript, PHP, Node.js, MySQL, SQL fundamentals, JSON, REST API integration, AJAX, Git, GitHub, Vercel, Render, Visual Studio Code, and XAMPP. His digital skills also include Figma UI/UX, SEO, email marketing, digital product publishing, Canva, and CapCut.`;
   if(/project|work|built|portfolio/.test(q))return `Selected projects include IBK Technet Hub (technology and digital learning platform), DigiTrovea (e-commerce storefront and blogging platform), Song (music web app with PWA functionality), and TheekChat (web-based communication product). Open the Work page to visit them.`;
   if(/available|hire|job|opportunit|work with/.test(q))return content.profile.availability||'Ibukunoluwa is available to discuss suitable full-time, contract, freelance, and collaboration opportunities. Use the Hire Me page to send an enquiry.';
   if(/service|freelance|offer/.test(q))return `Services include full stack web development, backend and API integration, storefront and website setup, website improvements and SEO, and digital content/product support. See /freelance/ for details.`;
   if(/education|school|university|degree/.test(q))return `The profile lists undergraduate studies at Ladoke Akintola University of Technology (LAUTECH). The exact programme and expected graduation details should be confirmed in the published CV.`;
   if(/contact|email|social|linkedin|github/.test(q))return 'Use the social links in the Hire Me page or send a message through /hire/. Email and profile placeholders need to be updated by the site owner before launch.';
   if(/blog|article|write|post/.test(q))return `The Journal page currently contains ${(blogData.posts||[]).filter(p=>p.status==='published').length} published article(s). New articles can be drafted and published from the Portfolio Studio.`;
   if(/hello|hi|hey/.test(q))return 'Hello! Ask me about Ibukunoluwa’s work, skills, services, or availability.';
   return `I can help with questions about Ibukunoluwa's portfolio, web development skills, projects, services, and availability. I don't have verified information about that specific detail yet. You can send an enquiry through /hire/.`;
 };
 async function send(text){
   const prompt=text.trim();if(!prompt)return;add(prompt,'user');
   if(prompt.startsWith('/')){
     const cmd=commandData.commands?.find(c=>c.command.toLowerCase()===prompt.split(/\s/)[0].toLowerCase());
     if(cmd){
       if(cmd.mode==='navigate'){const map={'/home':'/','/about':'/about/','/work':'/work/','/freelance':'/freelance/','/blog':'/blog/','/resume':'/resume/','/hire':'/hire/','/chat':'/chat/','/admin':'/admin/','/media':'/media/','/open-projects':'/work/','/open-services':'/freelance/','/open-journal':'/blog/','/open-cv':'/resume/','/open-contact':'/hire/','/open-assistant':'/chat/','/back-home':'/','/top':'/'};const target=map[cmd.command];if(target){add(`Opening ${target}…`);location.href=target;return;}}
       if(cmd.mode==='admin'){add('This action belongs to the private Portfolio Studio. Sign in at /admin/ to use content-management tools.');return;}
       if(cmd.mode==='audit'){add('Security and quality checks are limited to passive checks on this portfolio. No remote exploitation or third-party scanning is performed. Open the admin command catalogue for the self-audit checklist.');return;}
       if(cmd.mode==='utility'&&cmd.command==='/tour'){document.querySelector('#tour-start')?.click();add('Starting the guided tour.');return;}
     }
   }
   const pending=add('Thinking…','bot');
   try{
     const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:prompt,sessionId})});
     const result=await response.json();if(!response.ok)throw new Error(result.error||'Assistant service unavailable');
     pending.textContent=result.answer||localAnswer(prompt);
     if(result.telegramNotified){pending.textContent+='\n\nA notification was sent to the site owner for follow-up.';}
     if(result.telegramNotified)startTelegramPolling();
   }catch(error){pending.textContent=localAnswer(prompt);}
 }
 function startTelegramPolling(){if(pollTimer)return;let attempts=0;pollTimer=setInterval(async()=>{attempts++;if(attempts>24){clearInterval(pollTimer);pollTimer=null;return;}try{const r=await fetch(`/api/telegram-reply?sessionId=${encodeURIComponent(sessionId)}`);if(!r.ok)return;const data=await r.json();for(const reply of data.replies||[])add(reply.text||String(reply),'bot');if(data.replies?.length){clearInterval(pollTimer);pollTimer=null;}}catch{}},3000);}
 document.querySelector('#chat-form')?.addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#chat-input');const value=input.value;input.value='';send(value);});
 document.querySelectorAll('.quick-prompt').forEach(button=>button.addEventListener('click',()=>send(button.textContent)));
 window.ibkSendChat=send;
}
