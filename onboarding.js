/* WebOuts Client Onboarding widget — deployed via GitHub + jsDelivr.
 * The Bricks page only holds a tiny loader (see onboarding-loader.html).
 * Edit this file, push to GitHub, purge jsDelivr → the live page updates.
 * No secrets here; it posts to the public n8n onboarding API. */
(function () {
  var API = "https://webouts.app.n8n.cloud/webhook/onboarding-api";

  var STYLE = `
  #wo-onb{max-width:760px;margin:0 auto;padding:8px 16px 64px;font-family:'Poppins',Arial,Helvetica,sans-serif;color:#111827}
  #wo-onb h1{color:#07378C;font-size:26px;margin:8px 0 4px}
  #wo-onb .sub{color:#6b7280;font-size:14px;margin:0 0 20px}
  #wo-onb .sec{border:1px solid #e6e6e6;border-left:6px solid #07378C;border-radius:10px;padding:16px 18px;margin:0 0 16px;background:#fff}
  #wo-onb .sec h2{color:#07378C;font-size:16px;margin:0 0 12px}
  #wo-onb .fld{margin:0 0 14px}
  #wo-onb label{display:block;font-weight:600;font-size:14px;margin:0 0 4px;color:#E26337}
  #wo-onb .help{color:#6b7280;font-size:12px;margin:0 0 6px}
  #wo-onb input[type=text],#wo-onb input[type=email],#wo-onb input[type=tel],#wo-onb textarea{
    width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:8px;padding:10px 12px;font-size:14px;font-family:inherit}
  #wo-onb textarea{min-height:80px;resize:vertical}
  #wo-onb input:focus,#wo-onb textarea:focus{outline:none;border-color:#07378C;box-shadow:0 0 0 3px #dbe4f7}
  #wo-onb .row{display:flex;gap:12px;flex-wrap:wrap}
  #wo-onb .row>.fld{flex:1;min-width:200px}
  #wo-onb .colorwrap{display:flex;gap:8px;align-items:center}
  #wo-onb input[type=color]{width:44px;height:38px;border:1px solid #d1d5db;border-radius:8px;background:#fff;padding:2px}
  #wo-onb .langs label:has(input){display:inline-flex;align-items:center;gap:6px;font-weight:400;margin-right:18px;color:#111827}
  #wo-onb .bar{position:sticky;top:0;z-index:5;background:#f6f6f6;padding:10px 0;display:flex;align-items:center;gap:12px;flex-wrap:wrap;border-bottom:1px solid #e6e6e6;margin-bottom:16px}
  #wo-onb .status{font-size:13px;color:#6b7280}
  #wo-onb .status b{color:#2F8F5C}
  #wo-onb .link{font-size:12px;color:#07378C;word-break:break-all}
  #wo-onb button{font-family:inherit;font-weight:700;font-size:14px;border:0;border-radius:8px;padding:9px 16px;cursor:pointer}
  #wo-onb .copy{background:#eef2fb;color:#07378C}
  #wo-onb .submit{background:#E26337;color:#fff;font-size:16px;padding:14px 22px;width:100%;margin-top:6px}
  #wo-onb .locked{background:#FFF4EF;border:1px solid #f3c9bb;border-radius:10px;padding:14px 16px;color:#7a2e12;margin-bottom:16px;font-size:14px}
  #wo-onb .done{text-align:center;padding:40px 16px}
  #wo-onb .done h1{font-size:28px}
  `;

  var HTML = `
  <div id="wo-onb">
    <div class="bar">
      <span class="status" id="wo-status">Loading…</span>
      <button type="button" class="copy" id="wo-copy">Copy my resume link</button>
      <span class="link" id="wo-link"></span>
    </div>
    <div id="wo-lockmsg" class="locked" style="display:none">This form has been locked by the WebOuts team and is now read-only. Contact us if something needs to change.</div>

    <h1>Welcome — let’s set up your WebOuts profile videos</h1>
    <p class="sub">Fill in what you can. Your answers save automatically — you can close this and come back anytime using your link above.</p>

    <div id="wo-form">
      <div class="sec">
        <h2>Your organization</h2>
        <div class="fld"><label>Organization name</label><input type="text" data-key="identity.displayName" placeholder="e.g. Northwell Health"></div>
        <div class="fld"><label>Website</label><input type="text" data-key="web.site" placeholder="https://…"></div>
        <div class="fld"><label>Provider email domain(s)</label><div class="help">So we recognize your team. Separate multiple with commas.</div><input type="text" data-key="identity.emailDomains" placeholder="northwell.edu"></div>
      </div>

      <div class="sec">
        <h2>Main contact</h2>
        <div class="row">
          <div class="fld"><label>Name</label><input type="text" data-key="contact.name"></div>
          <div class="fld"><label>Email</label><input type="email" data-key="contact.email"></div>
          <div class="fld"><label>Phone</label><input type="tel" data-key="contact.phone"></div>
        </div>
      </div>

      <div class="sec">
        <h2>Filming</h2>
        <div class="fld"><label>Filming location (address)</label><div class="help">Where should our crew come to film your providers?</div><input type="text" data-key="filming.location"></div>
        <div class="fld langs"><label>Languages needed</label>
          <label><input type="radio" name="wo-lang" data-key="filming.languages" value="EN"> English only</label>
          <label><input type="radio" name="wo-lang" data-key="filming.languages" value="EN,ES"> English &amp; Spanish</label>
        </div>
      </div>

      <div class="sec">
        <h2>Brand look (optional)</h2>
        <div class="help">If you know your brand colors, add them — otherwise leave blank and we’ll pull them from your brand guide.</div>
        <div class="row">
          <div class="fld"><label>Main color</label><div class="colorwrap"><input type="color" data-colorfor="brandColors.accent"><input type="text" data-key="brandColors.accent" placeholder="#00A0DF"></div></div>
          <div class="fld"><label>Light shade</label><div class="colorwrap"><input type="color" data-colorfor="brandColors.accentBg"><input type="text" data-key="brandColors.accentBg" placeholder="#E0F4FB"></div></div>
          <div class="fld"><label>Dark shade</label><div class="colorwrap"><input type="color" data-colorfor="brandColors.accentDark"><input type="text" data-key="brandColors.accentDark" placeholder="#66C6EC"></div></div>
        </div>
      </div>

      <div class="sec">
        <h2>Voice &amp; preferences (optional)</h2>
        <div class="fld"><label>How should your videos sound?</label><div class="help">Tone, do’s and don’ts, anything specific about how you want to come across.</div><textarea data-key="content.voice"></textarea></div>
        <div class="fld"><label>Anything else we should know?</label><textarea data-key="content.notes"></textarea></div>
      </div>

      <button type="button" class="submit" id="wo-submit">I’m done — submit for review</button>
    </div>

    <div class="done" id="wo-done" style="display:none">
      <h1>Thank you! 🎬</h1>
      <p class="sub">Your information is in with the WebOuts team. We’ll review it and follow up with next steps. You can still reopen your link to make changes until we lock it in.</p>
    </div>
  </div>
  `;

  // ---- inject ----
  var st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
  var mount = document.getElementById('wo-onboarding-root');
  if (!mount) { mount = document.createElement('div'); document.body.appendChild(mount); }
  mount.innerHTML = HTML;

  var root = document.getElementById('wo-onb');
  var statusEl = document.getElementById('wo-status');
  var linkEl = document.getElementById('wo-link');

  var params = new URLSearchParams(location.search);
  var token = params.get('c');
  if (!token) {
    token = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2));
    params.set('c', token);
    history.replaceState(null, '', location.pathname + '?' + params.toString());
  }
  linkEl.textContent = location.href;

  var fields = Array.prototype.slice.call(root.querySelectorAll('[data-key]'));
  var locked = false;

  function collect() {
    var data = {};
    fields.forEach(function (el) {
      var k = el.getAttribute('data-key');
      if (el.type === 'radio') { if (el.checked) data[k] = el.value; }
      else if (el.value !== '') data[k] = el.value;
    });
    return data;
  }
  function apply(data) {
    fields.forEach(function (el) {
      var k = el.getAttribute('data-key');
      if (!(k in data)) return;
      if (el.type === 'radio') el.checked = (el.value === data[k]);
      else el.value = data[k];
    });
    root.querySelectorAll('[data-colorfor]').forEach(function (cp) {
      var t = root.querySelector('[data-key="' + cp.getAttribute('data-colorfor') + '"]');
      if (t && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t.value)) cp.value = t.value;
    });
  }
  function setStatus(txt, ok) { statusEl.innerHTML = ok ? '<b>' + txt + '</b>' : txt; }

  function post(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }

  var saveTimer = null, saving = false, pending = false;
  function doSave(extra) {
    if (locked) return;
    if (saving) { pending = true; return; }
    saving = true; setStatus('Saving…');
    var data = collect();
    if (extra) Object.keys(extra).forEach(function (k) { data[k] = extra[k]; });
    post({ action: 'save', token: token, data: data })
      .then(function () { setStatus('Saved ✓', true); })
      .catch(function () { setStatus('Couldn’t save — check your connection'); })
      .finally(function () { saving = false; if (pending) { pending = false; doSave(); } });
  }
  function queueSave() { if (locked) return; clearTimeout(saveTimer); setStatus('Editing…'); saveTimer = setTimeout(doSave, 1200); }

  root.querySelectorAll('[data-colorfor]').forEach(function (cp) {
    cp.addEventListener('input', function () {
      var t = root.querySelector('[data-key="' + cp.getAttribute('data-colorfor') + '"]');
      if (t) { t.value = cp.value; queueSave(); }
    });
  });
  fields.forEach(function (el) {
    el.addEventListener('input', queueSave);
    el.addEventListener('change', queueSave);
    el.addEventListener('blur', function () { clearTimeout(saveTimer); doSave(); });
  });
  window.addEventListener('beforeunload', function () {
    if (locked) return;
    try { navigator.sendBeacon(API, new Blob([JSON.stringify({ action: 'save', token: token, data: collect() })], { type: 'application/json' })); } catch (e) {}
  });

  document.getElementById('wo-copy').addEventListener('click', function () {
    navigator.clipboard && navigator.clipboard.writeText(location.href);
    this.textContent = 'Link copied ✓';
    var b = this; setTimeout(function () { b.textContent = 'Copy my resume link'; }, 2000);
  });

  document.getElementById('wo-submit').addEventListener('click', function () {
    doSave({ _stage: 'Submitted for Review' });
    document.getElementById('wo-form').style.display = 'none';
    document.getElementById('wo-done').style.display = 'block';
  });

  function lockIfNeeded(stage) {
    if (stage === 'Locked' || stage === 'Provisioned' || stage === 'WebOuts Review') {
      locked = true;
      document.getElementById('wo-lockmsg').style.display = 'block';
      fields.forEach(function (el) { el.disabled = true; });
      root.querySelectorAll('[data-colorfor]').forEach(function (c) { c.disabled = true; });
      document.getElementById('wo-submit').style.display = 'none';
    }
  }

  setStatus('Loading…');
  post({ action: 'load', token: token })
    .then(function (res) {
      var data = (res && res.data) || {};
      apply(data);
      lockIfNeeded(data._stage);
      setStatus(locked ? 'Locked' : (Object.keys(data).length ? 'Saved ✓' : 'Ready — start typing'), !locked && Object.keys(data).length > 0);
    })
    .catch(function () { setStatus('Ready — start typing'); });
})();
