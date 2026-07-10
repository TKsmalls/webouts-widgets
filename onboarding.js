/* WebOuts Client Onboarding widget — deployed via GitHub + jsDelivr.
 * The Bricks page only holds a tiny loader (see onboarding-loader.html).
 * Edit this file, push to GitHub, purge jsDelivr → the live page updates.
 * No secrets here; it posts to the public n8n onboarding API. */
(function () {
  var API = "https://webouts.app.n8n.cloud/webhook/onboarding-api";
  var UPLOAD = "https://webouts.app.n8n.cloud/webhook/onboarding-upload";
  var MAX = 10 * 1024 * 1024; // 10 MB per file

  var STYLE = `
  #wo-onb{max-width:720px;margin:0 auto;padding:8px 16px 72px;font-family:'Poppins',Arial,Helvetica,sans-serif;color:#1f2430;line-height:1.5}
  #wo-onb h1{color:#07378C;font-size:27px;font-weight:800;margin:6px 0 6px;letter-spacing:-.4px}
  #wo-onb .sub{color:#5b6472;font-size:15px;margin:0 0 22px;max-width:60ch}

  /* resume card (save state + private link) */
  #wo-onb .bar{position:sticky;top:0;z-index:5;background:#fff;border:1px solid #e3e7ee;border-radius:12px;box-shadow:0 4px 16px rgba(7,55,140,.08);padding:12px 14px;margin:0 0 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  #wo-onb .save{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#4b5563;white-space:nowrap}
  #wo-onb .dot{width:9px;height:9px;border-radius:50%;background:#9ca3af;flex:0 0 auto}
  #wo-onb .dot.saved{background:#2F8F5C;box-shadow:0 0 0 3px rgba(47,143,92,.18)}
  #wo-onb .dot.saving{background:#E2A24B;box-shadow:0 0 0 3px rgba(226,162,75,.18)}
  #wo-onb .dot.error{background:#c0392b;box-shadow:0 0 0 3px rgba(192,57,43,.18)}
  #wo-onb .linkwrap{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 260px}
  #wo-onb .linklabel{font-size:10.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#8a93a3}
  #wo-onb .linkbox{font-size:12.5px;color:#07378C;background:#f2f6ff;border:1px solid #d6e3ff;border-radius:7px;padding:7px 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #wo-onb .copy{background:#07378C;color:#fff;flex:0 0 auto}
  #wo-onb .copy:hover{filter:brightness(1.1)}

  /* sections */
  #wo-onb .sec{border:1px solid #e6e9ef;border-radius:12px;padding:20px 22px;margin:0 0 14px;background:#fff}
  #wo-onb .sec h2{display:flex;align-items:center;gap:11px;color:#07378C;font-size:17px;font-weight:700;margin:0 0 4px}
  #wo-onb .num{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#07378C;color:#fff;font-size:13px;font-weight:700;flex:0 0 auto}
  #wo-onb .intro{color:#5b6472;font-size:13.5px;margin:0 0 16px 37px}
  #wo-onb .secbody{margin-top:16px}
  #wo-onb .fld{margin:0 0 16px}
  #wo-onb .fld:last-child{margin-bottom:0}
  #wo-onb label{display:block;font-weight:600;font-size:14px;margin:0 0 5px;color:#E26337}
  #wo-onb .help{color:#6b7280;font-size:12.5px;margin:0 0 7px;line-height:1.5}
  #wo-onb .help strong{color:#4b5563}
  #wo-onb input[type=text],#wo-onb input[type=email],#wo-onb input[type=tel],#wo-onb textarea{
    width:100%;box-sizing:border-box;border:1px solid #d3d8e0;border-radius:9px;padding:11px 13px;font-size:14px;font-family:inherit;color:#1f2430;background:#fff}
  #wo-onb input::placeholder,#wo-onb textarea::placeholder{color:#aab0ba}
  #wo-onb textarea{min-height:92px;resize:vertical}
  #wo-onb input:focus,#wo-onb textarea:focus{outline:none;border-color:#07378C;box-shadow:0 0 0 3px #dbe4f7}
  #wo-onb .row{display:flex;gap:12px;flex-wrap:wrap}
  #wo-onb .row>.fld{flex:1;min-width:190px}

  /* upload */
  #wo-onb .upl{border:1.5px dashed #c9d0da;border-radius:11px;padding:20px 16px;text-align:center;background:#fafbfd}
  #wo-onb .upl input[type=file]{display:none}
  #wo-onb .upl .btn{display:inline-block;background:#eef2fb;color:#07378C;font-weight:700;font-size:14px;padding:11px 20px;border-radius:8px;cursor:pointer}
  #wo-onb .upl .btn:hover{background:#e2e9f8}
  #wo-onb .upl .hint{color:#8a93a3;font-size:12px;margin-top:9px}
  #wo-onb .files{list-style:none;padding:0;margin:12px 0 0}
  #wo-onb .files li{font-size:13px;padding:8px 11px;background:#f2f6ff;border:1px solid #d6e3ff;border-radius:7px;margin:6px 0;display:flex;justify-content:space-between;gap:8px;color:#07378C}
  #wo-onb .files li .st{color:#6b7280;font-weight:600;white-space:nowrap}
  #wo-onb .files li .st.ok{color:#2F8F5C}
  #wo-onb .files li .st.err{color:#b3411f}

  /* buttons + states */
  #wo-onb button{font-family:inherit;font-weight:700;font-size:14px;border:0;border-radius:9px;padding:10px 18px;cursor:pointer}
  #wo-onb .submit{background:#E26337;color:#fff;font-size:16px;padding:16px 22px;width:100%;margin-top:10px}
  #wo-onb .submit:hover{filter:brightness(1.05)}
  #wo-onb .locked{background:#FFF4EF;border:1px solid #f3c9bb;border-radius:11px;padding:14px 16px;color:#7a2e12;margin-bottom:18px;font-size:14px}
  #wo-onb .done{text-align:center;padding:48px 16px}
  #wo-onb .done h1{font-size:28px}
  `;

  var HTML = `
  <div id="wo-onb">
    <div class="bar">
      <span class="save"><span class="dot" id="wo-dot"></span><span id="wo-stat">Loading…</span></span>
      <div class="linkwrap">
        <span class="linklabel">🔖 Your private link — save it to return anytime</span>
        <span class="linkbox" id="wo-link"></span>
      </div>
      <button type="button" class="copy" id="wo-copy">Copy link</button>
    </div>
    <div id="wo-lockmsg" class="locked" style="display:none">This form has been locked by the WebOuts team and is now read-only. Contact us if something needs to change.</div>

    <h1>Welcome — let’s set up your profile videos</h1>
    <p class="sub">Everything you tell us here helps us start filming. Fill in what you can — you don’t need every answer today. Your progress saves automatically, and you can share your link with teammates to help fill it in.</p>

    <div id="wo-form">
      <div class="sec">
        <h2><span class="num">1</span> Your organization</h2>
        <div class="secbody">
          <div class="fld"><label>Organization name</label><input type="text" data-key="identity.displayName" placeholder="e.g. Northwell Health"></div>
          <div class="fld"><label>Website</label><input type="text" data-key="web.site" placeholder="https://…"></div>
          <div class="fld"><label>Provider email domain(s)</label><div class="help">So we recognize your team — separate multiple with commas.</div><input type="text" data-key="identity.emailDomains" placeholder="northwell.edu"></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">2</span> Key people</h2>
        <p class="intro">Who we’ll be working with.</p>
        <div class="secbody">
          <div class="row">
            <div class="fld"><label>Main contact</label><input type="text" data-key="contact.name" placeholder="Full name"></div>
            <div class="fld"><label>Email</label><input type="email" data-key="contact.email"></div>
            <div class="fld"><label>Phone</label><input type="tel" data-key="contact.phone"></div>
          </div>
          <div class="fld"><label>Your team</label><div class="help">Everyone involved — one per line: name, role, and what they handle.</div><textarea data-key="team.roster" placeholder="Dr. Alex Rivera — Marketing Director — final approvals"></textarea></div>
          <div class="fld"><label>Who sends the kickoff email to providers?</label><div class="help">The first announcement lands best from one of your leaders. Name &amp; title — or tell us you’d like WebOuts to send it.</div><input type="text" data-key="rollout.leadershipSender" placeholder="e.g. Dr. Jordan Lee, Chief Medical Officer"></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">3</span> Providers to feature</h2>
        <div class="secbody">
          <div class="help">List the providers you’d like to feature, and include about <strong>50% more than your first-round target</strong> so we can cover scheduling conflicts (targeting 16? list 24 — a full week of 40? list 60). One per line: name and specialty.</div>
          <textarea data-key="providers.launchList" aria-label="Provider list" placeholder="Dr. Sam Okafor — Cardiology"></textarea>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">4</span> Filming logistics</h2>
        <div class="secbody">
          <div class="fld"><label>Filming address</label><div class="help">Where should our crew come to film?</div><input type="text" data-key="filming.location"></div>
          <div class="fld"><label>Anything our crew should know?</label><div class="help">On-site contact, parking or building access, the room we’ll film in, best days and times.</div><textarea data-key="production.details"></textarea></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">5</span> Look, sound &amp; SEO</h2>
        <p class="intro">How you’d like the videos to feel. Share what you have — we’ll fill any gaps.</p>
        <div class="secbody">
          <div class="fld"><label>Graphics</label><div class="help">Lower-thirds, title cards, backgrounds and thumbnails. If you have editable <strong>Adobe or DaVinci Resolve</strong> project files, share them and we’ll match your look exactly — otherwise we’ll design a set from your brand guidelines. What can you provide?</div><textarea data-key="graphics.standards"></textarea></div>
          <div class="fld"><label>Scripting</label><div class="help">Tone and voice, any must-say / never-say, reading level, and legal or compliance notes.</div><textarea data-key="scripting.standards"></textarea></div>
          <div class="fld"><label>SEO</label><div class="help">Target keywords, title &amp; file-naming conventions, and any SEO guidelines you follow.</div><textarea data-key="seo.standards"></textarea></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">6</span> Approvals &amp; process</h2>
        <div class="secbody">
          <div class="fld"><label>Approvals</label><div class="help">Who signs off on scripts, and who gives final approval on finished videos? How many rounds, and a typical turnaround?</div><textarea data-key="approval.process"></textarea></div>
          <div class="fld"><label>How your team works</label><div class="help">How your team is organized and how requests get routed — anything that helps us keep things moving.</div><textarea data-key="process.details"></textarea></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">7</span> Brand guidelines</h2>
        <div class="secbody">
          <div class="help">Upload your brand guidelines — PDF or image, up to 10&nbsp;MB each. Add as many as you like (style guide, logo files, etc.). Something larger? Email it and we’ll attach it.</div>
          <div class="upl">
            <label class="btn" id="wo-uplbtn" for="wo-file">Choose file(s) to upload</label>
            <input type="file" id="wo-file" multiple>
            <div class="hint">Files attach straight to your onboarding record.</div>
          </div>
          <ul class="files" id="wo-files"></ul>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">8</span> Anything else</h2>
        <div class="secbody">
          <div class="help">Anything else we should know that didn’t fit above.</div>
          <textarea data-key="misc.notes" aria-label="Anything else"></textarea>
        </div>
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
  var dotEl = document.getElementById('wo-dot');
  var statEl = document.getElementById('wo-stat');
  var linkEl = document.getElementById('wo-link');
  var fileInput = document.getElementById('wo-file');

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
  var itemId = null;
  var uploaded = []; // [{name, st:'ok'|'up'|'err', msg}]

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function collect() {
    var data = {};
    fields.forEach(function (el) {
      var k = el.getAttribute('data-key');
      if (el.value !== '') data[k] = el.value;
    });
    return data;
  }
  function apply(data) {
    fields.forEach(function (el) {
      var k = el.getAttribute('data-key');
      if (k in data) el.value = data[k];
    });
  }
  function setSave(state, txt) { dotEl.className = 'dot ' + state; statEl.textContent = txt; }

  function postJSON(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }

  var saveTimer = null, saving = false, pending = false;
  function doSave(extra) {
    if (locked) return;
    if (saving) { pending = true; return; }
    saving = true; setSave('saving', 'Saving…');
    var data = collect();
    if (extra) Object.keys(extra).forEach(function (k) { data[k] = extra[k]; });
    postJSON(API, { action: 'save', token: token, data: data })
      .then(function (res) { if (res && res.itemId) itemId = res.itemId; setSave('saved', 'All changes saved'); })
      .catch(function () { setSave('error', 'Couldn’t save — check your connection'); })
      .finally(function () { saving = false; if (pending) { pending = false; doSave(); } });
  }
  function queueSave() { if (locked) return; clearTimeout(saveTimer); setSave('saving', 'Editing…'); saveTimer = setTimeout(doSave, 1200); }

  // Make sure a row exists (and we know its id) before attaching a file.
  function ensureItem() {
    if (itemId) return Promise.resolve(itemId);
    return postJSON(API, { action: 'save', token: token, data: collect() })
      .then(function (res) { if (res && res.itemId) itemId = res.itemId; return itemId; });
  }

  function readB64(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { var s = String(fr.result || ''); var i = s.indexOf(','); resolve(i >= 0 ? s.slice(i + 1) : s); };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function renderFiles() {
    var ul = document.getElementById('wo-files');
    ul.innerHTML = uploaded.map(function (e) {
      var lbl = e.st === 'ok' ? '<span class="st ok">uploaded ✓</span>'
        : e.st === 'up' ? '<span class="st">uploading…</span>'
        : '<span class="st err">' + esc(e.msg || 'failed') + '</span>';
      return '<li><span>' + esc(e.name) + '</span>' + lbl + '</li>';
    }).join('');
  }
  function persistFiles() {
    var names = uploaded.filter(function (e) { return e.st === 'ok'; }).map(function (e) { return e.name; });
    doSave({ 'brandGuide.files': names.join(', ') });
  }

  function uploadOne(file) {
    if (locked) return;
    var entry = { name: file.name, st: 'up' };
    uploaded.push(entry); renderFiles();
    if (file.size > MAX) { entry.st = 'err'; entry.msg = 'too large (max 10 MB)'; renderFiles(); return; }
    ensureItem().then(function (id) {
      if (!id) { entry.st = 'err'; entry.msg = 'type something first, then retry'; renderFiles(); return; }
      return readB64(file).then(function (b64) {
        return postJSON(UPLOAD, { token: token, itemId: id, filename: file.name, mime: file.type || 'application/octet-stream', dataB64: b64 });
      }).then(function (res) {
        if (res && res.ok) { entry.st = 'ok'; renderFiles(); persistFiles(); }
        else { entry.st = 'err'; entry.msg = (res && res.error) || 'upload failed'; renderFiles(); }
      });
    }).catch(function () { entry.st = 'err'; entry.msg = 'upload failed'; renderFiles(); });
  }

  fileInput.addEventListener('change', function () {
    var fs = Array.prototype.slice.call(this.files || []);
    fs.forEach(uploadOne);
    this.value = '';
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
    this.textContent = 'Copied ✓';
    var b = this; setTimeout(function () { b.textContent = 'Copy link'; }, 2000);
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
      fileInput.disabled = true;
      document.getElementById('wo-uplbtn').style.display = 'none';
      document.getElementById('wo-submit').style.display = 'none';
    }
  }

  setSave('saving', 'Loading…');
  postJSON(API, { action: 'load', token: token })
    .then(function (res) {
      var data = (res && res.data) || {};
      if (res && res.itemId) itemId = res.itemId;
      apply(data);
      uploaded = String(data['brandGuide.files'] || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean)
        .map(function (n) { return { name: n, st: 'ok' }; });
      renderFiles();
      lockIfNeeded(data._stage);
      var has = Object.keys(data).length > 0;
      setSave(locked ? 'idle' : (has ? 'saved' : 'idle'), locked ? 'Locked' : (has ? 'All changes saved' : 'Ready — start typing'));
    })
    .catch(function () { setSave('idle', 'Ready — start typing'); });
})();
