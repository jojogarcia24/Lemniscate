// ---- year ----
(function(){ var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear(); })();

// ---- mobile nav ----
(function(){
  var b=document.getElementById('burger'), n=document.getElementById('navLinks');
  if(!b || !n) return;
  b.addEventListener('click',function(){ n.classList.toggle('open'); });
  n.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ n.classList.remove('open'); }); });
})();

// ---- back-to-top visibility ----
(function(){
  var t=document.getElementById('toTop'); if(!t) return;
  t.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
  window.addEventListener('scroll',function(){ t.classList.toggle('show', window.scrollY>600); },{passive:true});
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
