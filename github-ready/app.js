const CONFIG={API_URL:"PASTE_YOUR_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE",REFRESH_SECONDS:60};
let all=[],cat="All";
const q=s=>document.querySelector(s);
q("#refresh").onclick=()=>load(true);
function ok(){return CONFIG.API_URL.startsWith("https://script.google.com/macros/s/")&&CONFIG.API_URL.endsWith("/exec")}
async function load(force=false){
 if(!ok()){q("#msg").textContent="Open app.js and paste your Google Apps Script /exec URL.";return}
 q("#msg").textContent="Loading…";
 try{
  const u=new URL(CONFIG.API_URL);u.searchParams.set("action","prices");if(force)u.searchParams.set("force","1");
  const r=await fetch(u,{cache:"no-store"}),j=await r.json();if(!j.success)throw new Error(j.error||"API error");
  all=j.data||[];q("#status").textContent=j.cached?"Connected · cached":"Connected";q("#msg").textContent="";filters();cards();
 }catch(e){q("#status").textContent="Connection error";q("#msg").textContent=e.message}
}
function filters(){const xs=["All",...new Set(all.map(x=>x.category).filter(Boolean))];q("#filters").innerHTML=xs.map(x=>`<button class="${x===cat?"active":""}" data-c="${x}">${x}</button>`).join("");q("#filters").querySelectorAll("button").forEach(b=>b.onclick=()=>{cat=b.dataset.c;filters();cards()})}
function cards(){const rows=cat==="All"?all:all.filter(x=>x.category===cat);q("#grid").innerHTML=rows.map(card).join("")}
function card(x){
 if(!x.ok)return `<article><div class="top"><b>${x.displaySymbol}</b><span>${x.category}</span></div><small>${x.name}</small><h3>Unavailable</h3><p class="red">${x.error||"No quote"}</p></article>`;
 const d=Number(x.decimals)||2,p=n(x.price,d),ch=x.changePercent==null?"":`${Number(x.changePercent)>=0?"+":""}${Number(x.changePercent).toFixed(2)}%`,cls=Number(x.changePercent)>0?"green":Number(x.changePercent)<0?"red":"muted";
 return `<article><div class="top"><b>${x.displaySymbol}</b><span>${x.category}</span></div><small>${x.name}</small><h3>${x.currency==="USD"?"$":""}${p}</h3><p class="${cls}">${ch||"—"}</p><div class="stats"><div>Open<b>${v(x.open,d)}</b></div><div>High<b>${v(x.high,d)}</b></div><div>Low<b>${v(x.low,d)}</b></div><div>Prev<b>${v(x.previousClose,d)}</b></div></div><footer>Source: ${x.source||""}</footer></article>`}
function n(v,d){return Number(v).toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d})}
function v(x,d){return x==null||x===""?"—":n(x,d)}
load();setInterval(()=>load(false),CONFIG.REFRESH_SECONDS*1000);