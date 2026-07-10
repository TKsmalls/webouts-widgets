/* WebOuts Client Onboarding widget — deployed via GitHub + jsDelivr.
 * The Bricks page only holds a tiny loader (see onboarding-loader.html).
 * Edit this file, push to GitHub, purge jsDelivr → the live page updates.
 * No secrets here; it posts to the public n8n onboarding API. */
(function () {
  var API = "https://webouts.app.n8n.cloud/webhook/onboarding-api";
  var UPLOAD = "https://webouts.app.n8n.cloud/webhook/onboarding-upload";
  var MAX = 10 * 1024 * 1024; // 10 MB per file

  var STYLE = `
  #wo-onb{max-width:760px;margin:0 auto;padding:8px 16px 64px;font-family:'Poppins',Arial,Helvetica,sans-serif;color:#111827}
  #wo-onb h1{color:#07378C;font-size:26px;margin:8px 0 4px}
  #wo-onb .sub{color:#6b7280;font-size:14px;margin:0 0 20px}
  #wo-onb .sec{border:1px solid #e6e6e6;border-left:6px solid #07378C;border-radius:10px;padding:16px 18px;margin:0 0 16px;background:#fff}
  #wo-onb .sec h2{color:#07378C;font-size:16px;margin:0 0 12px}
  #wo-onb .fld{margin:0 0 14px}
  #wo-onb label{display:block;font-weight:600;font-size:14px;margin:0 0 4px;color:#E26337}
  #wo-onb .help{color:#6b7280;font-size:12px;margin:0 0 6px;line-height:1.45}
  #wo-onb input[type=text],#wo-onb input[type=email],#wo-onb input[type=tel],#wo-onb textarea{
    width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:8px;padding:10px 12px;font-size:14px;font-family:inherit}
  #wo-onb textarea{min-height:88px;resize:vertical}
  #wo-onb input:focus,#wo-onb textarea:focus{outline:none;border-color:#07378C;box-shadow:0 0 0 3px #dbe4f7}
  #wo-onb .row{display:flex;gap:12px;flex-wrap:wrap}
  #wo-onb .row>.fld{flex:1;min-width:200px}
  #wo-onb .langs label:has(input){display:inline-flex;align-items:center;gap:6px;font-weight:400;margin-right:18px;color:#111827}
  #wo-onb .upl{border:1px dashed #c9ccd1;border-radius:10px;padding:16px;text-align:center;background:#fafbfc}
  #wo-onb .upl input[type=file]{display:none}
  #wo-onb .upl .btn{display:inline-block;background:#eef2fb;color:#07378C;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px;cursor:pointer}
  #wo-onb .upl .hint{color:#6b7280;font-size:12px;margin-top:8px}
  #wo-onb .files{list-style:none;padding:0;margin:10px 0 0}
  #wo-onb .files li{font-size:13px;padding:7px 10px;background:#f3f7ff;border:1px solid #d6e3ff;border-radius:6px;margin:6px 0;display:flex;justify-content:space-between;gap:8px;color:#07378C}
  #wo-onb .files li .st{color:#6b7280;font-weight:600;white-space:nowrap}
  #wo-onb .files li .st.ok{color:#2F8F5C}
  #wo-onb .files li .st.err{color:#b3411f}
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
    <p class="sub">Fill in what you can — you don’t need every answer today. Everything saves automatically, so you can close this and come back anytime using your link above (and share it with teammates who need to help fill it in).</p>

    <div id="wo-form">
      <div class="sec">
        <h2>Your organization</h2>
        <div class="fld"><label>Organization name</label><input type="text" data-key="identity.displayName" placeholder="e.g. Northwell Health"></div>
        <div class="fld"><label>Website</label><input type="text" data-key="web.site" placeholder="https://…"></div>
        <div class="fld"><label>Provider email domain(s)</label><div class="help">So we recognize your team. Separate multiple with commas.</div><input type="text" data-key="identity.emailDomains" placeholder="northwell.edu"></div>
      </div>

      <div class="sec">
        <h2>Your team</h2>
        <div class="fld"><label>Names, roles &amp; responsibilities</label><div class="help">Everyone we’ll be working with. One per line — name, role, and what they’re responsible for (e.g. “Dr. Alex Rivera — Marketing Director — final approvals”).</div><textarea data-key="team.roster" placeholder="Name — Role — Responsible for…"></textarea></div>
        <div class="fld"><label>Who sends the initial leadership email?</label><div class="help">The first announcement to your providers lands best coming from one of your leaders. Who should send it (name &amp; title)? Or tell us if you’d like WebOuts to send it on your behalf.</div><input type="text" data-key="rollout.leadershipSender" placeholder="e.g. Dr. Jordan Lee, Chief Medical Officer"></div>
      </div>

      <div class="sec">
        <h2>Main contact</h2>
        <div class="help">Our day-to-day point of contact for scheduling and questions.</div>
        <div class="row">
          <div class="fld"><label>Name</label><input type="text" data-key="contact.name"></div>
          <div class="fld"><label>Email</label><input type="email" data-key="contact.email"></div>
          <div class="fld"><label>Phone</label><input type="tel" data-key="contact.phone"></div>
        </div>
      </div>

      <div class="sec">
        <h2>Providers for launch</h2>
        <div class="fld"><label>Provider list</label><div class="help">Everyone you’d like featured. Include a few extra beyond your target number so we can cover scheduling conflicts. One per line — name and specialty (e.g. “Dr. Sam Okafor — Cardiology”).</div><textarea data-key="providers.launchList" placeholder="Dr. Name — Specialty"></textarea></div>
      </div>

      <div class="sec">
        <h2>Production &amp; filming</h2>
        <div class="fld"><label>Filming location (address)</label><div class="help">Where should our crew come to film your providers?</div><input type="text" data-key="filming.location"></div>
        <div class="fld langs"><label>Languages needed</label>
          <label><input type="radio" name="wo-lang" data-key="filming.languages" value="EN"> English only</label>
          <label><input type="radio" name="wo-lang" data-key="filming.languages" value="EN,ES"> English &amp; Spanish</label>
        </div>
        <div class="fld"><label>Production &amp; filming details</label><div class="help">On-site contact, parking/building access, the room or space we’ll film in, best days/times, and anything else our crew should know.</div><textarea data-key="production.details"></textarea></div>
      </div>

      <div class="sec">
        <h2>Graphic standards</h2>
        <div class="fld"><label>Video text, branding, backgrounds &amp; thumbnails</label><div class="help">How on-screen text and lower-thirds should look, logo &amp; branding usage, background style, and any thumbnail do’s and don’ts.</div><textarea data-key="graphics.standards"></textarea></div>
      </div>

      <div class="sec">
        <h2>Scripting standards</h2>
        <div class="fld"><label>How scripts should read</label><div class="help">Tone and voice, anything that must always (or must never) be said, reading level, and any legal or compliance requirements.</div><textarea data-key="scripting.standards"></textarea></div>
      </div>

      <div class="sec">
        <h2>SEO standards</h2>
        <div class="fld"><label>Keywords &amp; naming conventions</label><div class="help">Target keywords, how you’d like video titles and file names formatted, and any SEO guidelines your team follows.</div><textarea data-key="seo.standards"></textarea></div>
      </div>

      <div class="sec">
        <h2>Final approval process</h2>
        <div class="fld"><label>Who approves, and how</label><div class="help">Who reviews and signs off on scripts, and who gives final approval on the finished videos? How many review rounds should we expect, and what’s a typical turnaround?</div><textarea data-key="approval.process"></textarea></div>
      </div>

      <div class="sec">
        <h2>Process &amp; organization details</h2>
        <div class="fld"><label>How your team works</label><div class="help">How your team or department is organized, how requests get routed, and any internal processes we should know about to keep things moving smoothly.</div><textarea data-key="process.details"></textarea></div>
      </div>

      <div class="sec">
        <h2>Brand guidelines</h2>
        <div class="help">Upload your brand guidelines — PDF or image, up to 10&nbsp;MB each. You can add more than one file (style guide, logo files, etc.). Have something larger? Email it to us and we’ll attach it for you.</div>
        <div class="upl">
          <label class="btn" id="wo-uplbtn" for="wo-file">Choose file(s) to upload</label>
          <input type="file" id="wo-file" multiple>
          <div class="hint">Your files attach straight to your WebOuts onboarding record.</div>
        </div>
        <ul class="files" id="wo-files"></ul>
      </div>

      <div class="sec">
        <h2>Anything else?</h2>
        <div class="fld"><label>Misc items</label><div class="help">Anything else we should know that didn’t fit above.</div><textarea data-key="misc.notes"></textarea></div>
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
  }
  function setStatus(txt, ok) { statusEl.innerHTML = ok ? '<b>' + txt + '</b>' : txt; }

  function postJSON(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }

  var saveTimer = null, saving = false, pending = false;
  function doSave(extra) {
    if (locked) return;
    if (saving) { pending = true; return; }
    saving = true; setStatus('Saving…');
    var data = collect();
    if (extra) Object.keys(extra).forEach(function (k) { data[k] = extra[k]; });
    postJSON(API, { action: 'save', token: token, data: data })
      .then(function (res) { if (res && res.itemId) itemId = res.itemId; setStatus('Saved ✓', true); })
      .catch(function () { setStatus('Couldn’t save — check your connection'); })
      .finally(function () { saving = false; if (pending) { pending = false; doSave(); } });
  }
  function queueSave() { if (locked) return; clearTimeout(saveTimer); setStatus('Editing…'); saveTimer = setTimeout(doSave, 1200); }

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
      fileInput.disabled = true;
      document.getElementById('wo-uplbtn').style.display = 'none';
      document.getElementById('wo-submit').style.display = 'none';
    }
  }

  setStatus('Loading…');
  postJSON(API, { action: 'load', token: token })
    .then(function (res) {
      var data = (res && res.data) || {};
      if (res && res.itemId) itemId = res.itemId;
      apply(data);
      uploaded = String(data['brandGuide.files'] || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean)
        .map(function (n) { return { name: n, st: 'ok' }; });
      renderFiles();
      lockIfNeeded(data._stage);
      setStatus(locked ? 'Locked' : (Object.keys(data).length ? 'Saved ✓' : 'Ready — start typing'), !locked && Object.keys(data).length > 0);
    })
    .catch(function () { setStatus('Ready — start typing'); });
})();
