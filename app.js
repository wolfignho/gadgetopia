const eur=n=>n.toFixed(2).replace('.',',')+' €',$=s=>document.querySelector(s);
let cart=JSON.parse(localStorage.getItem('gg_cart')||'{}'),cur='Tous',q='';
for(const k in cart)if(!PRODUCTS.find(p=>p.id==k))delete cart[k];
const cats=['Tous',...new Set(PRODUCTS.map(p=>p.cat))],P=id=>PRODUCTS.find(x=>x.id==id);
const root=document.documentElement;root.dataset.theme=localStorage.getItem('gg_theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
const setIcon=()=>$('#theme').textContent=root.dataset.theme=='dark'?'☀️':'🌙';setIcon();
$('#theme').onclick=()=>{root.dataset.theme=root.dataset.theme=='dark'?'light':'dark';localStorage.setItem('gg_theme',root.dataset.theme);setIcon()};
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;$('#toasts').append(t);setTimeout(()=>t.remove(),2900)}
function save(bump){localStorage.setItem('gg_cart',JSON.stringify(cart));const c=$('#count');c.textContent=Object.values(cart).reduce((a,b)=>a+b,0);if(bump){c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')}}
function renderCats(){$('#cats').innerHTML=cats.map(c=>`<button class="${c==cur?'on':''}" data-c="${c}">${c}</button>`).join('')}
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function render(){renderCats();const L=PRODUCTS.filter(p=>(cur=='Tous'||p.cat==cur)&&(!q||norm(p.name+' '+p.desc+' '+p.cat).includes(norm(q))));
$('#grid').innerHTML=L.map((p,i)=>`<article class="card" style="animation-delay:${i*45}ms"><div class="pic" data-v="${p.id}"><img src="${p.imgs[0]}" alt="${p.name}" loading="lazy"><span class="more">📷 ${p.imgs.length} photos</span></div><div class="b"><span class="cat">${p.cat}</span><h3>${p.name}</h3><div class="row"><span class="price">${eur(p.price)}</span><button class="add" data-a="${p.id}">Ajouter</button></div></div></article>`).join('');
$('#empty').classList.toggle('hidden',L.length>0);tilt()}
function tilt(){if(matchMedia('(hover:none)').matches)return;document.querySelectorAll('.card').forEach(c=>{c.onmousemove=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(800px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-4px)`};c.onmouseleave=()=>c.style.transform=''})}
function view(id){const p=P(id);$('#mbody').innerHTML=`<div class="mg"><div><img class="main-img" id="mi" src="${p.imgs[0]}" alt="${p.name}"><div class="thumbs">${p.imgs.map((s,i)=>`<img src="${s}" data-g="${s}" class="${i?'':'on'}" alt="">`).join('')}</div></div><div class="mbody-t"><span class="cat">${p.cat}</span><h2>${p.name}</h2><p>${p.desc}</p><div class="big">${eur(p.price)}</div><button class="btn full" data-a="${p.id}">Ajouter au panier</button><p style="font-size:.85rem">🚚 Expédition depuis l'entrepôt fournisseur · 💳 Paiement en ligne bientôt disponible</p></div></div>`;$('#modal').classList.add('open')}
function drawer(){const ids=Object.keys(cart);let t=0;$('#lines').innerHTML=ids.length?ids.map(id=>{const p=P(id);t+=p.price*cart[id];return `<div class="line"><img src="${p.imgs[0]}" alt=""><span class="n">${p.name}<br><b>${eur(p.price*cart[id])}</b></span><span class="qty"><button data-m="${id}">−</button>${cart[id]}<button data-a="${id}">+</button></span></div>`}).join(''):'<p style="color:var(--mu)">Votre panier est vide.</p>';$('#total').textContent=eur(t);$('#order').style.display=ids.length?'':'none'}
const openCart=()=>{drawer();$('#drawer').classList.add('open');$('#scrim').classList.add('open')},closeCart=()=>{$('#drawer').classList.remove('open');$('#scrim').classList.remove('open')};
document.addEventListener('click',e=>{const t=e.target.closest('[data-c],[data-v],[data-a],[data-m],[data-g],[data-close],[data-closecart]');if(e.target.id=='modal')$('#modal').classList.remove('open');if(e.target.id=='scrim')closeCart();if(!t)return;const d=t.dataset;
if(d.c){cur=d.c;render()}if(d.v)view(d.v);if(d.g){$('#mi').src=d.g;$('#mi').style.animation='none';void $('#mi').offsetWidth;$('#mi').style.animation='';document.querySelectorAll('.thumbs img').forEach(i=>i.classList.toggle('on',i==t))}
if(d.a){cart[d.a]=(cart[d.a]||0)+1;save(1);if($('#drawer').classList.contains('open'))drawer();else toast('✓ '+P(d.a).name+' ajouté au panier')}
if(d.m){if(--cart[d.m]<=0)delete cart[d.m];save(1);drawer()}if('close' in d)$('#modal').classList.remove('open');if('closecart' in d)closeCart()});
document.addEventListener('keydown',e=>{if(e.key=='Escape'){$('#modal').classList.remove('open');closeCart()}});
$('#cartBtn').onclick=openCart;$('#q').oninput=e=>{q=e.target.value;render()};
addEventListener('scroll',()=>$('#nav').classList.toggle('sc',scrollY>40),{passive:true});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
$('#order').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);let t=0,l=Object.keys(cart).map(id=>{const p=P(id);t+=p.price*cart[id];return `- ${cart[id]} x ${p.name} (${eur(p.price)})`}).join('\n');
const body=`Bonjour,\n\nJe souhaite commander :\n${l}\nTotal : ${eur(t)}\n\nNom : ${f.get('nom')}\nE-mail : ${f.get('email')}\nTéléphone : ${f.get('tel')}\nAdresse : ${f.get('adresse')}\n`;toast('📧 Ouverture de votre messagerie…');location.href='mailto:hervenjike99@gmail.com?subject='+encodeURIComponent('Demande de commande Gadgetopia')+'&body='+encodeURIComponent(body)};
(function(){const c=$('#fx'),x=c.getContext('2d');let W,H,pts;const rs=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;pts=Array.from({length:Math.min(70,W/18)},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4}))};rs();addEventListener('resize',rs);
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;(function f(){x.clearRect(0,0,W,H);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;x.fillStyle='#ffffffb0';x.beginPath();x.arc(p.x,p.y,1.8,0,7);x.fill()}
for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const a=pts[i],b=pts[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<120){x.strokeStyle=`rgba(255,255,255,${.25*(1-d/120)})`;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}requestAnimationFrame(f)})()})();
render();save();
