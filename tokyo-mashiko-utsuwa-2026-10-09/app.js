(() => {'use strict';
const data=window.UTSUWA_DATA,select=document.getElementById('view'),list=document.getElementById('shop-list'),detail=document.getElementById('detail'),frame=document.getElementById('google-map'),status=document.getElementById('map-status');
const groups={tokyo:s=>s.city==='tokyo',aoyama:s=>s.id.startsWith('a'),kappabashi:s=>s.id==='k1',kudan:s=>s.id.startsWith('c'),ginza:s=>s.id.startsWith('g'),mashiko:s=>s.city==='mashiko'};
let view='tokyo',selected='a1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=s=>data.shops.indexOf(s)+1;
try{const saved=JSON.parse(localStorage.getItem('utsuwa-selection'));if(saved&&groups[saved.view]&&data.shops.some(s=>s.id===saved.selected&&groups[saved.view](s))){view=saved.view;selected=saved.selected}}catch{}
select.value=view;
function save(){try{localStorage.setItem('utsuwa-selection',JSON.stringify({view,selected}))}catch{}}
  function show(id){
    const s=data.shops.find(s=>s.id===id);if(!s)return;
    const nav='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.name+' '+s.address);
    detail.innerHTML=`<div class="meta"><i class="ph ph-map-pin" aria-hidden="true"></i>${esc(s.area)} · <span class="day">${esc(s.day)}</span></div><h2>${number(s)} · ${esc(s.name)}</h2><dl><dt><i class="ph ph-paint-brush" aria-hidden="true"></i>代表作家／选品</dt><dd>${esc(s.artists)}</dd><dt><i class="ph ph-bowl-food" aria-hidden="true"></i>特色物品</dt><dd>${esc(s.items)}</dd><dt><i class="ph ph-clock" aria-hidden="true"></i>营业时间</dt><dd>${esc(s.hours)}</dd><dt><i class="ph ph-eye" aria-hidden="true"></i>逛店重点</dt><dd>${esc(s.feature)}</dd><dt><i class="ph ph-map-pin" aria-hidden="true"></i>地址</dt><dd>${esc(s.address)}</dd></dl><div class="note"><i class="ph ph-info" aria-hidden="true"></i>${esc(s.note)}</div><div class="links"><a class="navigate" href="${esc(nav)}" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow" aria-hidden="true"></i>打开地图导航</a><a href="${esc(s.source)}" target="_blank" rel="noopener"><i class="ph ph-globe" aria-hidden="true"></i>店铺官网</a>${s.artistSource?`<a href="${esc(s.artistSource)}" target="_blank" rel="noopener"><i class="ph ph-palette" aria-hidden="true"></i>作家／展览资料</a>`:''}</div><p class="coordinates">定位依据：${esc(s.geoTitle)}${s.id==='m3'?'（非入口精确点）':''}</p>`;
  }

function highlight(){list.querySelectorAll('[data-shop]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shop===selected)))}
function locate(id){const s=data.shops.find(s=>s.id===id);if(!s)return;status.innerHTML='<i class="ph ph-map-pin" aria-hidden="true"></i>当前定位：'+esc(s.name);frame.title=s.name+' Google 地图';frame.src='https://maps.google.com/maps?q='+encodeURIComponent(s.name+' '+s.address)+'&hl=zh-CN&z=16&output=embed'}
function choose(id){selected=id;show(id);highlight();locate(id);save()}
function render(){list.innerHTML='';data.shops.filter(groups[view]).forEach(s=>{const b=document.createElement('button');b.type='button';b.dataset.shop=s.id;b.innerHTML='<span class="number">'+number(s)+'</span><span class="shop-name">'+esc(s.name)+'</span><i class="ph ph-caret-right shop-arrow" aria-hidden="true"></i>';b.addEventListener('click',()=>choose(s.id));b.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)show(s.id)});b.addEventListener('mouseleave',()=>show(selected));b.addEventListener('focus',()=>show(s.id));b.addEventListener('blur',()=>show(selected));list.appendChild(b)});highlight();show(selected);locate(selected)}
select.addEventListener('change',()=>{view=select.value;const shops=data.shops.filter(groups[view]);if(!shops.some(s=>s.id===selected))selected=shops[0].id;render();save()});
render();
})();