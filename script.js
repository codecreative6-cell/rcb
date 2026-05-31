/* ── CURSOR (desktop only) ── */
(function(){
  const cur=document.getElementById('cursor');
  const ring=document.getElementById('cursor-ring');
  if(!cur||!ring)return;
  // Hide on touch devices
  if(!window.matchMedia('(pointer:fine)').matches){
    cur.style.display='none';ring.style.display='none';
    document.body.style.cursor='auto';
    return;
  }
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    cur.style.left=mx+'px';cur.style.top=my+'px';
  });
  (function lerp(){
    rx+=(mx-rx)*.12;ry+=(my-ry)*.12;
    ring.style.left=rx+'px';ring.style.top=ry+'px';
    requestAnimationFrame(lerp);
  })();
})();

/* ── STAR FIELD ── */
(function(){
  const c=document.getElementById('stars');
  if(!c)return;
  const ctx=c.getContext('2d');
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize,{passive:true});
  const stars=Array.from({length:220},()=>({
    x:Math.random(),y:Math.random(),
    r:Math.random()*1.5+.3,
    a:Math.random(),speed:Math.random()*.0002+.0001
  }));
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(s=>{
      s.a+=s.speed;
      const alpha=.3+.7*Math.abs(Math.sin(s.a));
      ctx.beginPath();
      ctx.arc(s.x*c.width,s.y*c.height,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,240,200,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── FLAME ROW (emoji) ── */
(function(){
  const row=document.getElementById('flame-row');
  if(!row)return;
  const flames=['🔥','🔴','🔥','⭐','🔥','🔴','🔥'];
  flames.forEach((f,i)=>{
    const s=document.createElement('span');
    s.textContent=f;
    s.style.cssText=`font-size:${i%2===0?'28px':'20px'};animation:flameWave 1.8s ${i*.15}s ease-in-out infinite alternate;display:inline-block;`;
    row.appendChild(s);
  });
  const style=document.createElement('style');
  style.textContent='@keyframes flameWave{from{transform:translateY(0) scale(1)}to{transform:translateY(-8px) scale(1.2)}}';
  document.head.appendChild(style);
})();

/* ── FLAME CANVAS (b2b section) ── */
(function(){
  const c=document.getElementById('flame-canvas');
  if(!c)return;
  const ctx=c.getContext('2d');
  function resize(){
    const p=document.getElementById('b2b');
    if(p){c.width=p.offsetWidth;c.height=p.offsetHeight;}
  }
  resize();window.addEventListener('resize',resize,{passive:true});
  const particles=[];
  function spawnFlame(){
    if(particles.length>150)return;
    particles.push({
      x:Math.random()*c.width,y:c.height+10,
      vx:(Math.random()-.5)*1.2,vy:-(Math.random()*3+2),
      life:1,decay:Math.random()*.012+.008,
      size:Math.random()*18+8,hue:Math.random()>0.5?0:30
    });
  }
  function drawFlames(){
    ctx.clearRect(0,0,c.width,c.height);
    particles.forEach((p,i)=>{
      p.x+=p.vx;p.y+=p.vy;
      p.vx+=(Math.random()-.5)*.15;
      p.life-=p.decay;p.size*=.995;
      if(p.life<=0){particles.splice(i,1);return;}
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size);
      g.addColorStop(0,`hsla(${p.hue},100%,70%,${p.life*.6})`);
      g.addColorStop(.5,`hsla(${p.hue},100%,50%,${p.life*.3})`);
      g.addColorStop(1,'transparent');
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=g;ctx.fill();
    });
    requestAnimationFrame(drawFlames);
  }
  setInterval(spawnFlame,40);
  drawFlames();
})();

/* ── FIREWORKS ── */
(function(){
  const c=document.getElementById('fw');
  if(!c)return;
  const ctx=c.getContext('2d');
  function resize(){c.width=window.innerWidth;c.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize,{passive:true});

  const COLORS=['#FF1A2E','#D0021B','#C9982A','#F5C842','#FFE580','#FF6B6B','#FFD700','#FFFFFF','#FF4500'];

  class Spark{
    constructor(x,y,col){
      this.x=x;this.y=y;this.col=col;
      const a=Math.random()*Math.PI*2,sp=Math.random()*7+2;
      this.vx=Math.cos(a)*sp;this.vy=Math.sin(a)*sp;
      this.alpha=1;this.decay=.013+Math.random()*.012;
      this.r=Math.random()*2.5+.5;this.g=.09;
      this.trail=[];
    }
    update(){
      this.trail.push({x:this.x,y:this.y});
      if(this.trail.length>8)this.trail.shift();
      this.vx*=.97;this.vy*=.97;this.vy+=this.g;
      this.x+=this.vx;this.y+=this.vy;
      this.alpha-=this.decay;
    }
    draw(){
      ctx.save();
      this.trail.forEach((t,i)=>{
        const ta=(i/this.trail.length)*this.alpha*.5;
        ctx.globalAlpha=ta;
        ctx.beginPath();ctx.arc(t.x,t.y,this.r*.5,0,Math.PI*2);
        ctx.fillStyle=this.col;ctx.fill();
      });
      ctx.globalAlpha=this.alpha;
      ctx.shadowBlur=8;ctx.shadowColor=this.col;
      ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
      ctx.fillStyle=this.col;ctx.fill();
      ctx.restore();
    }
  }

  class Shell{
    constructor(){
      this.x=Math.random()*c.width;this.y=c.height;
      this.ty=Math.random()*c.height*.5+50;
      this.col=COLORS[Math.floor(Math.random()*COLORS.length)];
      this.sp=Math.random()*5+9;
      const a=-Math.PI/2+(Math.random()-.5)*.45;
      this.vx=Math.cos(a)*this.sp;this.vy=Math.sin(a)*this.sp;
      this.exploded=false;this.sparks=[];this.trail=[];
    }
    update(){
      if(!this.exploded){
        this.trail.push({x:this.x,y:this.y});
        if(this.trail.length>14)this.trail.shift();
        this.vx*=.99;this.vy+=.13;
        this.x+=this.vx;this.y+=this.vy;
        if(this.vy>=0||this.y<=this.ty){
          this.exploded=true;
          const n=70+Math.floor(Math.random()*60);
          for(let i=0;i<n;i++)this.sparks.push(new Spark(this.x,this.y,this.col));
          for(let i=0;i<20;i++){
            const sp=new Spark(this.x,this.y,this.col);
            const a2=(i/20)*Math.PI*2;
            sp.vx=Math.cos(a2)*9;sp.vy=Math.sin(a2)*9;
            this.sparks.push(sp);
          }
        }
      }else{
        this.sparks=this.sparks.filter(s=>s.alpha>0.01);
        this.sparks.forEach(s=>s.update());
      }
    }
    draw(){
      if(!this.exploded){
        ctx.save();
        this.trail.forEach((t,i)=>{
          ctx.globalAlpha=(i/this.trail.length)*.9;
          ctx.beginPath();ctx.arc(t.x,t.y,2,0,Math.PI*2);
          ctx.fillStyle=this.col;ctx.fill();
        });
        ctx.globalAlpha=1;ctx.shadowBlur=12;ctx.shadowColor=this.col;
        ctx.beginPath();ctx.arc(this.x,this.y,3,0,Math.PI*2);
        ctx.fillStyle=this.col;ctx.fill();
        ctx.restore();
      }else{this.sparks.forEach(s=>s.draw());}
    }
    done(){return this.exploded&&this.sparks.length===0;}
  }

  let shells=[];let last=0;
  function frame(ts){
    ctx.clearRect(0,0,c.width,c.height);
    if(ts-last>300+Math.random()*200){
      const n=Math.random()<.35?3:Math.random()<.6?2:1;
      for(let i=0;i<n;i++)shells.push(new Shell());
      last=ts;
    }
    shells=shells.filter(s=>!s.done());
    shells.forEach(s=>{s.update();s.draw();});
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ── SCROLL REVEAL ── */
(function(){
  const revEls=document.querySelectorAll('.rev,.tl-item');
  const ro=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('vis');ro.unobserve(e.target);}
    });
  },{threshold:.08});
  revEls.forEach(el=>ro.observe(el));
})();

/* ── COUNTER ── */
(function(){
  const statEls=document.querySelectorAll('.stat-n[data-target]');
  const co=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target;
      const target=parseInt(el.dataset.target);
      let start=null;
      function step(ts){
        if(!start)start=ts;
        const p=Math.min((ts-start)/1600,1);
        const ease=1-Math.pow(1-p,3);
        el.textContent=Math.floor(ease*target);
        if(p<1)requestAnimationFrame(step);
        else el.textContent=target;
      }
      requestAnimationFrame(step);
      co.unobserve(el);
    });
  },{threshold:.5});
  statEls.forEach(el=>co.observe(el));
})();

/* ── SQUAD CARD STAGGER ── */
(function(){
  const cards=document.querySelectorAll('.pc');
  cards.forEach(c=>{
    c.style.opacity='0';
    c.style.transform='translateY(25px)';
    c.style.transition='opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1),background .3s';
  });
  const sq=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const idx=Array.from(cards).indexOf(e.target);
      setTimeout(()=>{
        e.target.style.opacity='1';
        e.target.style.transform='translateY(0)';
      },idx*60);
      sq.unobserve(e.target);
    });
  },{threshold:.05});
  cards.forEach(c=>sq.observe(c));
})();

/* ── PARALLAX HERO BG TEXT ── */
(function(){
  const bgT=document.querySelector('.hero-bg-text');
  if(!bgT)return;
  window.addEventListener('scroll',()=>{
    const y=window.scrollY;
    bgT.style.transform=`translateY(calc(-50% + ${y*.25}px))`;
  },{passive:true});
})();
