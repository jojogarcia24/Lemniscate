/* Lemniscate backend helper — lead capture + page-dwell tracking (no external deps).
   Uses the Supabase PostgREST endpoint directly with the publishable (anon) key.
   Security is enforced server-side by RLS: anon may INSERT leads/page_events only. */
window.LM = (function(){
  var URL = 'https://tdivoeaffojenockwxbp.supabase.co';
  var KEY = 'sb_publishable_EoWSOlCov5Cyocv84Ojb9Q_LLWiwNhH';
  var REST = URL + '/rest/v1/';

  function headers(extra){
    return Object.assign({ apikey:KEY, Authorization:'Bearer '+KEY, 'Content-Type':'application/json' }, extra||{});
  }
  function insert(table, row, opts){
    return fetch(REST+table, Object.assign({ method:'POST', headers:headers({ Prefer:(opts&&opts.rep)?'return=representation':'return=minimal' }), body:JSON.stringify(row) }, (opts&&opts.fetch)||{})).catch(function(){ return null; });
  }
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function sid(){ var s=ls('lm_sid'); if(!s){ s='s_'+Math.random().toString(36).slice(2)+Date.now().toString(36); ls('lm_sid',s);} return s; }
  function uid(){ return ls('lm_uid')||null; }
  function leadId(){ return ls('lm_lead')||null; }

  // Insert a lead; remember its id so later page views attach to it.
  function insertLead(row){
    return insert('leads', row, {rep:true}).then(function(r){ return r.json().catch(function(){return[];}); })
      .then(function(rows){ var id=rows&&rows[0]&&rows[0].id; if(id) ls('lm_lead', id); return id; })
      .catch(function(){ return null; });
  }

  // Page-dwell tracking → page_events (feeds the heat-map + hot-lead alerts).
  function track(){
    if(document.body.hasAttribute('data-lm-notrack')) return;
    var path = (location.pathname.split('/').pop() || 'index.html');
    var start = Date.now();
    function payload(type, secs){ return { session_id:sid(), user_id:uid(), lead_id:leadId(), path:path, event_type:type, dwell_seconds:secs||0 }; }
    insert('page_events', payload('enter',0));
    var hb = setInterval(function(){
      if(document.hidden) return;
      insert('page_events', payload('heartbeat', Math.round((Date.now()-start)/1000)));
    }, 15000);
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){
        insert('page_events', payload('leave', Math.round((Date.now()-start)/1000)), {fetch:{keepalive:true}});
      }
    });
  }

  return { URL:URL, KEY:KEY, insert:insert, insertLead:insertLead, track:track, sid:sid, uid:uid };
})();

// auto-start tracking
if(window.LM) window.LM.track();
