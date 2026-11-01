import { escapeHTML } from './utils.js';
const tourSteps = [
  { selector: '.brand', title: 'Your portfolio home', text: 'This brand mark returns visitors to the main portfolio introduction.' },
  { selector: '#main-nav', title: 'Explore the portfolio', text: 'Use these links to move between the profile, selected work, freelance services, articles, resume, and hire page.' },
  { selector: '.page-frame', title: 'The active experience', text: 'Pages use contained panels and animated scene transitions. On the homepage, use your wheel, arrow keys, or touch gestures to move between chapters.' },
  { selector: '#chat-launcher', title: 'Ask the portfolio assistant', text: 'The assistant answers questions using the portfolio knowledge base. An AI provider can be connected through private Vercel environment variables.' },
  { selector: '#tour-start', title: 'Guided tour', text: 'This help control can be used again whenever a visitor needs a quick walkthrough.' }
];
export function initTour(force=false){
 const trigger=document.querySelector('#tour-start'); if(!trigger)return;
 if(force){start();return;}
 trigger.addEventListener('click',start);
 function start(){let index=0;const overlay=document.createElement('div');overlay.className='tour-overlay';overlay.innerHTML=`<div class="tour-card"><div class="eyebrow">QUICK TOUR</div><div class="tour-progress"><span></span></div><h3></h3><p></p><div class="tour-actions"><button class="btn ghost" data-action="skip">Skip tour</button><div><button class="btn ghost" data-action="back">Back</button> <button class="btn primary" data-action="next">Next →</button></div></div></div>`;document.body.append(overlay);
 const title=overlay.querySelector('h3'),text=overlay.querySelector('p'),progress=overlay.querySelector('.tour-progress span'),next=overlay.querySelector('[data-action="next"]'),back=overlay.querySelector('[data-action="back"]');
 const show=()=>{const step=tourSteps[index];title.textContent=step.title;text.textContent=step.text;progress.style.width=`${(index+1)/tourSteps.length*100}%`;back.disabled=index===0;next.textContent=index===tourSteps.length-1?'Finish ✓':'Next →';const target=document.querySelector(step.selector);if(target){target.animate([{filter:'brightness(1)'},{filter:'brightness(1.45)'},{filter:'brightness(1)'}],{duration:900});}};
 const close=()=>{overlay.remove();};
 overlay.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
 overlay.querySelector('[data-action="skip"]').onclick=close;back.onclick=()=>{index=Math.max(0,index-1);show();};next.onclick=()=>{if(index===tourSteps.length-1)close();else{index++;show();}};show();
 }
}
