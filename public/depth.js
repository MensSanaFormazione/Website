(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(pointer:fine)');
  let paused = media.matches || document.documentElement.classList.contains('motion-paused');
  let frame = 0;
  const states = [...document.querySelectorAll('[data-depth]')].map(el => ({el,x:0,y:0,tx:0,ty:0}));
  const tick = () => {
    frame = 0;
    let moving = false;
    for (const s of states) {
      s.x += (s.tx-s.x)*.095;
      s.y += (s.ty-s.y)*.095;
      if (Math.abs(s.tx-s.x)+Math.abs(s.ty-s.y)>.001) moving = true;
      s.el.style.setProperty('--depth-x',s.x.toFixed(4));
      s.el.style.setProperty('--depth-y',s.y.toFixed(4));
      s.el.style.setProperty('--light-x',`${50+s.x*45}%`);
      s.el.style.setProperty('--light-y',`${50+s.y*45}%`);
    }
    if(moving && !paused && !document.hidden) frame=requestAnimationFrame(tick);
  };
  const request=()=>{if(!frame)frame=requestAnimationFrame(tick);};
  for(const s of states){
    s.el.addEventListener('pointermove',event=>{
      if(paused||media.matches||!fine.matches||event.pointerType==='touch')return;
      const r=s.el.getBoundingClientRect();
      s.tx=Math.max(-1,Math.min(1,(event.clientX-r.left)/r.width*2-1));
      s.ty=Math.max(-1,Math.min(1,(event.clientY-r.top)/r.height*2-1));
      s.el.classList.add('is-pointed');request();
    });
    s.el.addEventListener('pointerleave',()=>{s.tx=0;s.ty=0;s.el.classList.remove('is-pointed');request();});
  }
  window.addEventListener('msf-motion',event=>{
    paused=event.detail.paused||media.matches;
    if(paused){for(const s of states){s.x=s.y=s.tx=s.ty=0;s.el.classList.remove('is-pointed');}request();}
  });
  // The 3D library is loaded only as the method approaches the viewport.
  const method=document.querySelector('.method-grid');
  if (!method) return;
  let loaded=false;
  const loadModels=()=>{
    if(loaded)return;loaded=true;
    const script=document.createElement('script');
    script.src='/models.bundle.js';script.defer=true;
    document.body.append(script);
  };
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadModels();observer.disconnect();}},{rootMargin:'350px'});
    observer.observe(method);
  }else loadModels();
})();
