// ---- year ----
(function(){ var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear(); })();

// ---- typewriter (Broker CRM "You can ___") ----
(function(){
  var el=document.getElementById('typeword'); if(!el) return;
  var words=['Launch.','Automate.','Scale.','Convert.','Dominate.'];
  var w=0,c=0,deleting=false;
  function tick(){
    var word=words[w];
    c += deleting ? -1 : 1;
    el.textContent=word.slice(0,c);
    var delay=deleting?55:95;
    if(!deleting && c===word.length){ deleting=true; delay=1400; }
    else if(deleting && c===0){ deleting=false; w=(w+1)%words.length; delay=350; }
    setTimeout(tick,delay);
  }
  el.textContent=''; setTimeout(tick,600);
})();

// ---- mobile nav ----
(function(){
  var b=document.getElementById('burger'), n=document.getElementById('navLinks');
  if(!b || !n) return;
  b.addEventListener('click',function(){ n.classList.toggle('open'); });
  n.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ n.classList.remove('open'); }); });
})();

// ---- back-to-top + sticky-nav shadow ----
(function(){
  var t=document.getElementById('toTop'), h=document.querySelector('header');
  if(t) t.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  window.addEventListener('scroll',function(){
    if(t) t.classList.toggle('show', window.scrollY>600);
    if(h) h.classList.toggle('scrolled', window.scrollY>12);
  },{passive:true});
})();

// ---- scroll reveal ("glide") ----
(function(){
  var SEL='.sec-head,.svc,.cap,.pkg,.who,.step,.quote,.darkcard,.mock,.wf,.platform,.deep,.phone-stage,.portrait,.vid,.trust-grid .lg,.cap-head,.social-hero .body,.feat,.chk-list li,.center-cta .wrap,.uc,.alc,.monitor,.ai-demo,.lab-card,.terminal,.demo-copy';
  var els=[].slice.call(document.querySelectorAll(SEL));
  if(!els.length) return;
  // stagger children within grids/lists
  ['.svc-grid','.cap-grid','.pkg-grid','.trust-grid','.showcase-grid','.feat-list','.chk-list','.uc-grid','.alc-grid'].forEach(function(gs){
    [].forEach.call(document.querySelectorAll(gs),function(g){
      [].forEach.call(g.children,function(ch,i){ ch.style.transitionDelay=((i%6)*70)+'ms'; });
    });
  });
  if(!('IntersectionObserver' in window)){ els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{rootMargin:'0px 0px -8% 0px',threshold:.08});
  els.forEach(function(e){ io.observe(e); });
})();

// ---- Nova LiveAvatar: vertical on phones, horizontal on larger screens ----
(function(){
  var f=document.getElementById('novaAvatar'); if(!f) return;
  var vertical='https://embed.liveavatar.com/v1/7b891411-cd07-4eee-90da-72de1a8f58df?orientation=vertical';
  var horizontal='https://embed.liveavatar.com/v1/1a0033df-99d4-4b61-ad7b-06bae94462d2?orientation=horizontal';
  f.src=(window.matchMedia && window.matchMedia('(max-width:560px)').matches)?vertical:horizontal;
})();

// ---- Book-a-call form → marketing-inquire (records to the leads dashboard + GHL) ----
// Uses an absolute URL so the form still works if this page is served from its own
// domain (lemniscatemarketingsystems.com) as a separate site.
(function(){
  var form=document.getElementById('demoForm'); if(!form) return;
  var ENDPOINT = (location.hostname.indexOf('elitelivingrealty') !== -1 || location.protocol === 'file:')
    ? '/.netlify/functions/marketing-inquire'
    : 'https://www.elitelivingrealty.com/.netlify/functions/marketing-inquire';
  var msg=document.getElementById('formMsg'), btn=document.getElementById('fSubmit');
  function show(kind,text){ msg.className='form-msg '+kind; msg.textContent=text; msg.scrollIntoView({behavior:'smooth',block:'center'}); }
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    var first=document.getElementById('fFirst').value.trim();
    var email=document.getElementById('fEmail').value.trim();
    var phone=document.getElementById('fPhone').value.trim();
    if(!first || !email || !phone){ show('err','Please add your name, email, and phone so we can reach you.'); return; }
    btn.disabled=true; btn.textContent='Sending…';
    try{
      var res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          first_name:first,
          last_name:document.getElementById('fLast').value.trim(),
          email:email, phone:phone,
          company:document.getElementById('fCompany').value.trim(),
          role:document.getElementById('fRole').value,
          package:'Lemniscate Marketing Systems',
          intent:'book',
          message:document.getElementById('fMsg').value.trim(),
          page_url:location.href
        })});
      var j=await res.json().catch(function(){return {};});
      if(!res.ok || j.ok===false) throw new Error((j&&j.error)||('Error '+res.status));
      form.style.display='none';
      show('ok','You’re booked in — we’ll reach out shortly to lock in a time. Talk soon.');
    }catch(err){
      btn.disabled=false; btn.textContent='Book my call';
      show('err','Something went wrong — please try again, or email hello@lemniscatemarketingsystems.com.');
    }
  });
})();

// ---- A La Carte plan builder (interactive) ----
(function(){
  var grid=document.getElementById('alcGrid'); if(!grid) return;
  var count=document.getElementById('alcCount');
  function update(){
    var n=grid.querySelectorAll('.alc.added').length;
    if(count) count.innerHTML='<b>'+n+'</b> workflow'+(n===1?'':'s')+' selected';
  }
  grid.addEventListener('click',function(e){
    var card=e.target.closest('.alc'); if(!card) return;
    card.classList.toggle('added'); update();
  });
  update();
})();

// ---- AI Smart Lab (interactive simulation) ----
(function(){
  var wrap=document.getElementById('smartLab'); if(!wrap) return;
  var mods=wrap.querySelectorAll('.lab-mod'),
      ta=wrap.querySelector('#labInput'),
      desc=wrap.querySelector('#labDesc'),
      run=wrap.querySelector('#labRun'),
      reset=wrap.querySelector('#labReset'),
      term=wrap.querySelector('#labTerm');
  var MODULES={
    'lead-triage':{
      desc:'Automatically qualify and route inbound leads based on intent.',
      sample:"Hi, I'm looking for a listing agent for my condo in Uptown. Budget is around $650k. Can we talk this week?",
      steps:['> booting NOVA lead-triage…','> parsing message intent…','  intent = SELLER_INQUIRY (0.94)','  budget = $650,000  ·  area = Uptown','> scoring lead…  HOT ✓','> routing → Luxury Team (round-robin)','> drafting SMS reply + booking link…','✓ Lead qualified, assigned & follow-up queued in 1.2s']
    },
    'visual-architect':{
      desc:'Turn a listing into on-brand visuals and a short video.',
      sample:'New listing: 3bd/2ba modern loft, downtown, $780k. Make me a launch post + reel.',
      steps:['> booting NOVA visual-architect…','> reading listing details…','  3bd/2ba · loft · $780,000','> generating hero image (brand palette)…','> writing caption + hashtags…','> rendering 15s reel from photos…','✓ Launch post + reel ready for approval']
    },
    'content-architect':{
      desc:'Draft a full content suite from one prompt.',
      sample:'Write me a week of content about buying vs. renting in this market.',
      steps:['> booting NOVA content-architect…','> researching market data…','> outlining 5-post series…','  blog + 5 captions + 1 video script','> generating avatar voiceover…','✓ A week of content drafted & scheduled']
    }
  };
  var current='lead-triage', timer=null;
  function load(key){
    current=key; var m=MODULES[key];
    mods.forEach(function(x){ x.classList.toggle('on', x.getAttribute('data-mod')===key); });
    if(desc) desc.textContent=m.desc;
    if(ta){ ta.value=''; ta.placeholder=m.sample; }
    resetTerm();
  }
  function resetTerm(){
    if(timer){ clearInterval(timer); timer=null; }
    term.innerHTML='<span class="muted">> Awaiting workflow initialization…</span><span class="cur"></span>';
  }
  function simulate(){
    if(timer) clearInterval(timer);
    var steps=MODULES[current].steps.slice();
    var input=(ta && (ta.value.trim()||ta.placeholder))||'';
    var lines=['$ nova run '+current+' --input "'+input.slice(0,54)+(input.length>54?'…':'')+'"',''].concat(steps);
    term.innerHTML=''; var i=0;
    timer=setInterval(function(){
      if(i>=lines.length){ clearInterval(timer); timer=null; term.innerHTML+='<span class="cur"></span>'; return; }
      var ln=lines[i++];
      var cls = /^\$|^>|^\s{2}/.test(ln) ? '' : (/^✓/.test(ln)?'':'muted');
      term.innerHTML += (ln?('<span class="'+cls+'">'+ln.replace(/</g,'&lt;')+'</span>'):'')+'\n';
      term.scrollTop=term.scrollHeight;
    },260);
  }
  mods.forEach(function(x){ x.addEventListener('click',function(){ load(x.getAttribute('data-mod')); }); });
  if(run) run.addEventListener('click',simulate);
  if(reset) reset.addEventListener('click',resetTerm);
  load('lead-triage');
})();

// ---- Pre-market signup (footer) → marketing-inquire ----
(function(){
  var form=document.getElementById('preForm'); if(!form) return;
  var ENDPOINT = (location.hostname.indexOf('elitelivingrealty') !== -1 || location.protocol === 'file:')
    ? '/.netlify/functions/marketing-inquire'
    : 'https://www.elitelivingrealty.com/.netlify/functions/marketing-inquire';
  var msg=document.getElementById('preMsg'), btn=document.getElementById('pSubmit');
  function show(kind,text){ msg.className='pl-msg '+kind; msg.textContent=text; }
  form.addEventListener('submit', async function(e){
    e.preventDefault();
    var name=document.getElementById('pName').value.trim();
    var email=document.getElementById('pEmail').value.trim();
    var phone=document.getElementById('pPhone').value.trim();
    if(!name || !email){ show('err','Please add your name and email to join the list.'); return; }
    var parts=name.split(/\s+/); var first=parts.shift()||name; var last=parts.join(' ');
    btn.disabled=true; btn.textContent='Joining…';
    try{
      var res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          first_name:first, last_name:last, email:email, phone:phone,
          package:'Lemniscate Marketing Systems', intent:'prelaunch',
          message:'Pre-market list signup', page_url:location.href
        })});
      var j=await res.json().catch(function(){return {};});
      if(!res.ok || j.ok===false) throw new Error((j&&j.error)||('Error '+res.status));
      form.reset(); show('ok','You’re on the list — we’ll be in touch with early access. 🎉');
      btn.disabled=false; btn.textContent='Join the list';
    }catch(err){
      btn.disabled=false; btn.textContent='Join the list';
      show('err','Something went wrong — please try again, or email hello@lemniscatemarketingsystems.com.');
    }
  });
})();
