const CONFIG={API_URL:'PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE',AUTO_REFRESH_SECONDS:60};
let allData=[],activeCategory='All'; const $=id=>document.getElementById(id);
$('refreshBtn').onclick=()=>loadPrices(true);
function configured(){return CONFIG.API_URL.startsWith('https://script.google.com/macros/s/')&&CONFIG.API_URL.endsWith('/exec')}
async function loadPrices(force=false){
 if(!configured()){ $('message').textContent='Open app.js and paste your NEW Google Apps Script /exec URL.'; $('status').textContent='Setup required'; return; }
 $('message').textContent='Loading prices…'; $('refreshBtn').disabled=true;
 try{const u=new URL(CONFIG.API_URL);u.searchParams.set('action','prices');if(force)u.searchParams.set('force','1');const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(!j.success)throw new Error(j.error||'Backend error');allData=Array.isArray(j.data)?j.data:[];$('message').textContent='';$('status').textContent=j.cached?'Connected · cached':'Connected';renderFilters();renderCards();}
 catch(e){$('message').textContent=e.message||'Cannot load prices';$('status').textContent='Connection error';}
 finally{$('refreshBtn').disabled=false;}
}
function renderFilters(){const cats=['All',...new Set(allData.map(x=>x.category).filter(Boolean))];if(!cats.includes(activeCategory))activeCategory='All';$('filters').innerHTML=cats.map(c=>`<button class="${c===activeCategory?'active':''}" data-c="${c}">${c}</button>`).join('');document.querySelectorAll('#filters button').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.c;renderFilters();renderCards()});}
function renderCards(){const rows=activeCategory==='All'?allData:allData.filter(x=>x.category===activeCategory);$('grid').innerHTML=rows.map(card).join('');}
function card(x){if(!x.ok)return `<article><div class="top"><b>${x.displaySymbol}</b><span>${x.category}</span></div><small>${x.name}</small><h3>Unavailable</h3><p class="red">${x.error||'No quote'}</p></article>`;const d=Number(x.decimals)||2,p=fmt(x.price,d),pct=val(x.changePercent),cls=pct>0?'green':pct<0?'red':'muted';return `<article><div class="top"><b>${x.displaySymbol}</b><span>${x.category}</span></div><small>${x.name}</small><h3>${x.currency==='USD'?'$':''}${p}</h3><p class="${cls}">${pct===null?'—':(pct>0?'+':'')+pct.toFixed(2)+'%'}</p><footer>Source: ${x.source||x.provider}</footer></article>`;}
function val(v){if(v===undefined||v===null||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null;}
function fmt(v,d){const n=val(v);return n===null?'—':n.toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});}
loadPrices();setInterval(()=>loadPrices(false),CONFIG.AUTO_REFRESH_SECONDS*1000);
