(() => {
  'use strict';
  const data = window.UTSUWA_DATA;
  const select = document.getElementById('view');
  const svg = document.getElementById('map');
  const field = document.querySelector('.map');
  const pins = document.getElementById('pins');
  const list = document.getElementById('shop-list');
  const detail = document.getElementById('detail');
  const groups = {tokyo:s=>s.city==='tokyo',aoyama:s=>s.id.startsWith('a'),kappabashi:s=>s.id==='k1',kudan:s=>s.id.startsWith('c'),ginza:s=>s.id.startsWith('g'),mashiko:s=>s.city==='mashiko'};
  let view = 'tokyo', selected = 'a1', positions = [], transform = d3.zoomIdentity;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number = s => data.shops.indexOf(s)+1;
  try {const saved=JSON.parse(localStorage.getItem('utsuwa-selection'));if(saved&&groups[saved.view]&&data.shops.some(s=>s.id===saved.selected&&groups[saved.view](s))){view=saved.view;selected=saved.selected;}} catch {}
  select.value=view;
  function save(){try{localStorage.setItem('utsuwa-selection',JSON.stringify({view,selected}));}catch{}}
  function show(id){
    const s=data.shops.find(s=>s.id===id);if(!s)return;
    const nav='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.name+' '+s.address);
    detail.innerHTML=`<div class="meta">${esc(s.area)} · <span class="day">${esc(s.day)}</span></div><h2>${number(s)} · ${esc(s.name)}</h2><dl><dt>代表作家／选品</dt><dd>${esc(s.artists)}</dd><dt>特色物品</dt><dd>${esc(s.items)}</dd><dt>营业时间</dt><dd>${esc(s.hours)}</dd><dt>逛店重点</dt><dd>${esc(s.feature)}</dd><dt>地址</dt><dd>${esc(s.address)}</dd></dl><div class="note">${esc(s.note)}</div><div class="links"><a class="navigate" href="${esc(nav)}" target="_blank" rel="noopener">打开地图导航</a><a href="${esc(s.source)}" target="_blank" rel="noopener">店铺官网</a>${s.artistSource?`<a href="${esc(s.artistSource)}" target="_blank" rel="noopener">作家／展览资料</a>`:''}</div><p class="coordinates">定位依据：${esc(s.geoTitle)}${s.id==='m3'?'（非入口精确点）':''}</p>`;
  }
  function highlight(){document.querySelectorAll('[data-shop]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shop===selected)));}
  function choose(id){selected=id;show(id);highlight();save();}
  function bind(b,s){b.addEventListener('click',()=>choose(s.id));b.addEventListener('mouseenter',()=>{if(matchMedia('(hover:hover)').matches)show(s.id);});b.addEventListener('mouseleave',()=>show(selected));b.addEventListener('focus',()=>show(s.id));b.addEventListener('blur',()=>show(selected));}
  function move(){const layer=svg.querySelector('#road-layer');if(layer)layer.setAttribute('transform',transform.toString());positions.forEach(o=>{const p=transform.apply(o.p);o.el.style.left=p[0]+'px';o.el.style.top=p[1]+'px';o.el.hidden=p[0]<-20||p[1]<-20||p[0]>field.clientWidth+20||p[1]>field.clientHeight+20;});}
  const zoom=d3.zoom().scaleExtent([1,8]).filter(e=>!e.target.closest('button')&&(!e.ctrlKey||e.type==='wheel')&&!e.button).on('zoom',e=>{transform=e.transform;move();});
  d3.select(field).call(zoom);
  document.getElementById('zoom-in').onclick=()=>d3.select(field).call(zoom.scaleBy,1.5);
  document.getElementById('zoom-out').onclick=()=>d3.select(field).call(zoom.scaleBy,1/1.5);
  document.getElementById('reset').onclick=()=>d3.select(field).call(zoom.transform,d3.zoomIdentity);
  function render(){
    const shops=data.shops.filter(groups[view]),w=field.clientWidth,h=field.clientHeight,city=view==='mashiko'?'mashiko':'tokyo';
    let bounds=data.regions[city].bounds;
    if(view!==city){const xs=shops.map(s=>s.coord[0]),ys=shops.map(s=>s.coord[1]),p=view==='kappabashi'?.004:.003;bounds=[Math.min(...xs)-p,Math.min(...ys)-p,Math.max(...xs)+p,Math.max(...ys)+p];}
    const project=d3.geoMercator().fitExtent([[30,40],[w-30,h-30]],{type:'MultiPoint',coordinates:[[bounds[0],bounds[1]],[bounds[2],bounds[3]]]}).clipExtent([[-w*8,-h*8],[w*8,h*8]]);
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const path=d3.geoPath(project);
    svg.innerHTML=`<title>${esc(select.selectedOptions[0].textContent)}</title><g id="road-layer"><path class="roads" d="${path(data.regions[city].geometry)}"></path></g>`;
    const layer=svg.querySelector('#road-layer');
    positions=shops.map(s=>({s,actual:project(s.coord),p:project(s.coord)}));
    for(let n=0;n<65;n++)for(let i=0;i<positions.length;i++)for(let j=i+1;j<positions.length;j++){let a=positions[i].p,b=positions[j].p,dx=b[0]-a[0],dy=b[1]-a[1],dist=Math.hypot(dx,dy);if(dist<48){if(dist<.01){dx=1;dy=.2;dist=1;}const force=(48-dist)/2;a[0]-=dx/dist*force;a[1]-=dy/dist*force;b[0]+=dx/dist*force;b[1]+=dy/dist*force;}}
    pins.innerHTML='';list.innerHTML='';
    positions.forEach(o=>{
      o.p[0]=Math.max(26,Math.min(w-70,o.p[0]));o.p[1]=Math.max(42,Math.min(h-26,o.p[1]));
      const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('class','leaders');line.setAttribute('d',`M${o.actual[0]},${o.actual[1]}L${o.p[0]},${o.p[1]}`);layer.appendChild(line);
      const wrap=document.createElement('div');wrap.className='pin-position';const b=document.createElement('button');b.className='pin';b.type='button';b.dataset.shop=o.s.id;b.textContent=number(o.s);b.setAttribute('aria-label',o.s.name+'，查看详情');bind(b,o.s);wrap.appendChild(b);pins.appendChild(wrap);o.el=wrap;
      const lb=document.createElement('button');lb.type='button';lb.dataset.shop=o.s.id;lb.innerHTML=`<span class="number">${number(o.s)}</span><span class="shop-name">${esc(o.s.name)}</span>`;bind(lb,o.s);list.appendChild(lb);
    });
    d3.select(field).call(zoom.extent([[0,0],[w,h]]).translateExtent([[-w*2,-h*2],[w*3,h*3]]));
    d3.select(field).call(zoom.transform,d3.zoomIdentity);
    highlight();show(selected);
  }
  select.onchange=()=>{view=select.value;const shops=data.shops.filter(groups[view]);if(!shops.some(s=>s.id===selected))selected=shops[0].id;render();save();};
  let lastWidth=0;new ResizeObserver(()=>{if(field.clientWidth!==lastWidth){lastWidth=field.clientWidth;render();}}).observe(field);
  render();
})();
