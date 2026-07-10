/* WebOuts Client Onboarding widget, deployed via GitHub + jsDelivr.
 * The Bricks page only holds a tiny loader (see onboarding-loader.html).
 * Edit this file, push to GitHub, purge jsDelivr, the live page updates.
 * No secrets here; it posts to the public n8n onboarding API. */
(function () {
  var API = "https://webouts.app.n8n.cloud/webhook/onboarding-api";
  var UPLOAD = "https://webouts.app.n8n.cloud/webhook/onboarding-upload";
  var MAX = 10 * 1024 * 1024; // 10 MB per file

  // ---- table definitions (rendered + wired generically) ----
  var TABLES = {
    contacts: { key: 'contacts.list', cols: [
      { c: 'Name', ph: 'Full name' },
      { c: 'Title / role', ph: 'Practice Manager' },
      { c: 'Email', ph: 'name@org.com' },
      { c: 'Phone', ph: '(555) 555-5555' }
    ] },
    team: { key: 'team.list', cols: [
      { c: 'Name', ph: 'Full name' },
      { c: 'Title / role', ph: 'Marketing Director' },
      { c: 'Email', ph: 'name@org.com' },
      { c: 'Phone', ph: '(555) 555-5555' }
    ] },
    providers: { key: 'providers.launchList', cols: [
      { c: 'Provider name', ph: 'Dr. Jane Smith' },
      { c: 'Specialty', ph: 'Cardiology' },
      { c: 'Email', ph: 'jane@org.com' }
    ] },
    approvals: { key: 'approval.process', cols: [
      { c: 'Name', ph: 'Full name' },
      { c: 'What they review or approve', ph: 'e.g. Reviews scripts' }
    ], seed: [
      ['', 'Reviews scripts'],
      ['', 'Gives final approval on scripts'],
      ['', 'Reviews videos'],
      ['', 'Gives final approval on videos']
    ] }
  };

  var STYLE = `
  #wo-onb{max-width:720px;margin:0 auto;padding:8px 16px 72px;font-family:'Poppins',Arial,Helvetica,sans-serif;color:#1f2430;line-height:1.5}
  #wo-onb h1{color:#07378C;font-size:27px;font-weight:800;margin:6px 0 6px;letter-spacing:-.4px;text-align:center}
  #wo-onb .sub{color:#5b6472;font-size:15px;margin:0 auto 22px;max-width:60ch;text-align:center}

  /* resume card (save state + private link) */
  #wo-onb .bar{position:sticky;top:0;z-index:5;background:#fff;border:2px solid #E26337;border-radius:12px;box-shadow:0 4px 16px rgba(226,99,55,.15);padding:12px 14px;margin:0 0 24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
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
  #wo-onb .sec h2{display:flex;align-items:center;gap:11px;color:#07378C;font-size:17px;font-weight:700;margin:0 0 4px;width:100%;max-width:none;box-sizing:border-box}
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

  /* tables */
  #wo-onb .ss{border:1px solid #d3d8e0;border-radius:9px;overflow-x:auto}
  #wo-onb .sstab{width:100%;border-collapse:collapse;font-size:14px}
  #wo-onb .sstab th{background:#f2f6ff;color:#07378C;font-size:11.5px;font-weight:700;text-align:left;padding:9px 13px;border-bottom:1px solid #d6e3ff;letter-spacing:.3px;white-space:nowrap}
  #wo-onb .sstab th.rmc{width:40px}
  #wo-onb .sstab td{padding:0;border-bottom:1px solid #eef0f4}
  #wo-onb .sstab tr:last-child td{border-bottom:0}
  #wo-onb .sstab td:not(:last-child){border-right:1px solid #eef0f4}
  #wo-onb .sstab td input{width:100%;box-sizing:border-box;border:0;border-radius:0;padding:10px 13px;font-size:14px;font-family:inherit;background:transparent;color:#1f2430}
  #wo-onb .sstab td input:focus{outline:none;box-shadow:inset 0 0 0 2px #dbe4f7;background:#fbfcfe}
  #wo-onb .sstab .rm{background:transparent;color:#b3bac4;font-size:17px;line-height:1;padding:8px 10px;font-weight:400;width:100%}
  #wo-onb .sstab .rm:hover{color:#c0392b}

  /* upload */
  #wo-onb .upl{border:1.5px dashed #c9d0da;border-radius:11px;padding:20px 16px;text-align:center;background:#fafbfd}
  #wo-onb .upl input[type=file]{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);border:0}
  #wo-onb .upl:focus-within .btn{outline:2px solid #07378C;outline-offset:2px}
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

  /* collapsible sections */
  #wo-onb .sec h2{cursor:pointer;user-select:none}
  #wo-onb .sec .done-toggle{margin-left:auto;flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;cursor:pointer}
  #wo-onb .sec .check{flex:0 0 auto;width:22px;height:22px;border:2px solid #cdd4df;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;color:transparent;font-size:14px;font-weight:800;line-height:1;transition:background .15s,border-color .15s,color .15s}
  #wo-onb .sec .done-label{font-size:12px;font-weight:600;color:#9aa4b4;letter-spacing:.2px;white-space:nowrap}
  #wo-onb .sec .done-toggle:hover .check{border-color:#2F8F5C}
  #wo-onb .sec .done-toggle:hover .done-label{color:#2F8F5C}
  #wo-onb .sec.filled .check{background:#2F8F5C;border-color:#2F8F5C;color:#fff}
  #wo-onb .sec.filled .done-label{color:#2F8F5C}
  #wo-onb .sec .chev{width:9px;height:9px;border-right:2px solid #9aa4b4;border-bottom:2px solid #9aa4b4;transform:rotate(-45deg);transition:transform .2s ease;flex:0 0 auto;margin-top:-3px}
  #wo-onb .sec.open .chev{transform:rotate(45deg)}
  #wo-onb .sec:not(.open) .intro,#wo-onb .sec:not(.open) .secbody{display:none}
  #wo-onb .sec:not(.open) h2{margin-bottom:0}

  /* paste from spreadsheet */
  #wo-onb .pastebox{margin:12px 0 0}
  #wo-onb .pastetoggle{background:#eef2fb;color:#07378C;font-weight:600;font-size:13px;padding:8px 14px}
  #wo-onb .pastetoggle:hover{background:#e2e9f8}
  #wo-onb .pastewrap{margin-top:12px}
  #wo-onb .pastewrap textarea{width:100%;box-sizing:border-box;border:1px solid #d3d8e0;border-radius:9px;padding:11px 13px;font-size:13px;font-family:inherit;min-height:88px;resize:vertical}
  #wo-onb .pasteadd{background:#07378C;color:#fff;font-size:13px;margin-top:10px}
  `;

  function tableHTML(id, cfg) {
    var ths = cfg.cols.map(function (c) { return '<th>' + c.c + '</th>'; }).join('') + '<th class="rmc"></th>';
    return '<div class="ss"><table class="sstab"><thead><tr>' + ths + '</tr></thead>'
      + '<tbody id="wo-' + id + '"></tbody></table></div>'
      + '<input type="hidden" data-key="' + cfg.key + '" id="wo-' + id + '-val">';
  }
  function uploadHTML(id, hint) {
    return '<div class="upl"><label class="btn" id="wo-' + id + '-btn" for="wo-' + id + '-file">Choose file(s) to upload</label>'
      + '<input type="file" id="wo-' + id + '-file" multiple>'
      + '<div class="hint">' + hint + '</div></div>'
      + '<ul class="files" id="wo-' + id + '-files"></ul>';
  }

  var HTML = `
  <div id="wo-onb">
    <div class="bar">
      <span class="save"><span class="dot" id="wo-dot"></span><span id="wo-stat" role="status" aria-live="polite">Loading…</span></span>
      <div class="linkwrap">
        <span class="linklabel">Your private link — save it, or share it with your team</span>
        <span class="linkbox" id="wo-link"></span>
      </div>
      <button type="button" class="copy" id="wo-copy">Copy link</button>
    </div>
    <div id="wo-lockmsg" class="locked" style="display:none">This form has been locked by the WebOuts team and is now read-only. Contact us if something needs to change.</div>

    <h1>Welcome! Let’s set up your profile videos</h1>
    <p class="sub">This is how we get ready to film your providers. It takes about 10 minutes, and you don’t need every answer today. This works best as a team effort: copy your private link above and pass it around so the right person fills in each section. Everything saves as you go, so anyone can stop and pick up later.</p>

    <div id="wo-form">
      <div class="sec">
        <h2><span class="num">1</span> Your organization</h2>
        <div class="secbody">
          <div class="fld"><label>Organization name</label><input type="text" data-key="identity.displayName"></div>
          <div class="fld"><label>Website</label><input type="text" data-key="web.site" placeholder="https://…"></div>
          <div class="fld"><label>Provider email domain(s)</label><div class="help">So we recognize your team. Separate multiple with commas.</div><input type="text" data-key="identity.emailDomains" placeholder="@healthorganization.com"></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">2</span> Key people &amp; approvals</h2>
        <p class="intro">Who we’ll be working with, and who signs off.</p>
        <div class="secbody">
          <div class="fld"><label>Main contact(s)</label><div class="help">Your day-to-day point(s) of contact. Add as many as you need.</div>${tableHTML('contacts', TABLES.contacts)}</div>
          <div class="fld"><label>Your wider team</label><div class="help">Anyone else involved, so we route things to the right person.</div>${tableHTML('team', TABLES.team)}</div>
          <div class="fld"><label>Who sends the kickoff email to providers?</label><div class="help">This should come from a senior leader, ideally someone in the C-suite or the president, someone with real sway over your providers. When the ask comes from the top, providers treat it as a priority instead of a nice-to-have from marketing or communications, and participation goes way up. Give us their name and title, or tell us you’d like WebOuts to send it.</div><input type="text" data-key="rollout.leadershipSender" placeholder="e.g. Dr. Jordan Lee, Chief Medical Officer"></div>
          <div class="fld"><label>Approvals</label><div class="help">Who signs off at each step? Add each person, and add any other checks your videos go through before they’re final.</div>${tableHTML('approvals', TABLES.approvals)}</div>
          <div class="fld"><label>Anything else we should know about your team?</label><div class="help">Optional and open-ended. Anything about how your team is set up or likes to work that helps us serve you better.</div><textarea data-key="process.details"></textarea></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">3</span> Providers to feature</h2>
        <div class="secbody">
          <div class="help">List the providers you’d like to feature, and include about <strong>50% more than your first-round target</strong> so we can cover scheduling conflicts (targeting 16? list 24. A full week of 40? list 60). Type directly, or paste your whole list from a spreadsheet.</div>
          ${tableHTML('providers', TABLES.providers)}
          <div class="pastebox">
            <button type="button" class="pastetoggle pasteui" id="wo-prov-paste-toggle">Paste from a spreadsheet</button>
            <div class="pastewrap" id="wo-prov-paste" style="display:none">
              <div class="help">Copy the name, specialty, and email columns from Excel or Google Sheets, then paste below. One provider per line — we’ll fill in the rows for you.</div>
              <textarea class="pasteui" id="wo-prov-paste-txt" placeholder="Dr. Jane Smith, Cardiology, jane@org.com"></textarea>
              <button type="button" class="pasteadd pasteui" id="wo-prov-paste-add">Add to table</button>
            </div>
          </div>
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
        <p class="intro">How you’d like the videos to feel. Share what you have, and we’ll fill any gaps.</p>
        <div class="secbody">
          <div class="fld"><label>Graphics</label><div class="help">The on-screen graphics for your videos, like lower-thirds and title cards. If you have editable <strong>Adobe or DaVinci Resolve</strong> project files, upload them below and we’ll use those files directly. If not, we’ll design a set from your brand guidelines.</div>${uploadHTML('gfx', 'Upload your Adobe or DaVinci Resolve project files. Something larger? Email it and we’ll add it.')}</div>
          <div class="fld"><label>Scripting</label><div class="help">Tone and voice, any must-say or never-say, reading level, and legal or compliance notes.</div><textarea data-key="scripting.standards"></textarea></div>
          <div class="fld"><label>SEO</label><div class="help">If you follow an SEO formula for titles, descriptions or file names, paste it here, or drop in a couple of real examples from past videos. We’ll build off your exact pattern.</div><textarea data-key="seo.standards" placeholder="e.g. [Provider Name], [Specialty] | [Organization] — [City, State]"></textarea></div>
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">6</span> Brand guidelines</h2>
        <div class="secbody">
          <div class="help">Upload your brand guidelines (PDF or image, up to 10&nbsp;MB each). Add as many as you like: style guide, logo files, colors and fonts. Something larger? Email it and we’ll attach it.</div>
          ${uploadHTML('brand', 'Files attach straight to your onboarding record.')}
        </div>
      </div>

      <div class="sec">
        <h2><span class="num">7</span> Anything else</h2>
        <div class="secbody">
          <div class="help">Anything else we should know that didn’t fit above.</div>
          <textarea data-key="misc.notes" aria-label="Anything else"></textarea>
        </div>
      </div>

      <button type="button" class="submit" id="wo-submit">I’m done, submit for review</button>
    </div>

    <div class="done" id="wo-done" style="display:none">
      <h1>Thank you!</h1>
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
      .catch(function () { setSave('error', 'Couldn’t save, check your connection'); })
      .finally(function () { saving = false; if (pending) { pending = false; doSave(); } });
  }
  function queueSave() { if (locked) return; clearTimeout(saveTimer); setSave('saving', 'Editing…'); saveTimer = setTimeout(doSave, 1200); }

  // ---- generic auto-expanding table (rows -> " | "-joined lines in a hidden input) ----
  function tableCtl(cfg, bodyEl, valEl) {
    function rowEmpty(tr) { return Array.prototype.every.call(tr.querySelectorAll('input'), function (i) { return !i.value.trim(); }); }
    function serialize() {
      var lines = [];
      Array.prototype.forEach.call(bodyEl.querySelectorAll('tr'), function (tr) {
        if (rowEmpty(tr)) return;
        var vals = Array.prototype.map.call(tr.querySelectorAll('input'), function (i) { return i.value.trim().replace(/ \| /g, ' / '); });
        lines.push(vals.join(' | '));
      });
      valEl.value = lines.join('\n');
    }
    function ensureBlank() {
      var rows = bodyEl.querySelectorAll('tr');
      var last = rows[rows.length - 1];
      if (!last || !rowEmpty(last)) bodyEl.appendChild(row([]));
    }
    function onInput() { ensureBlank(); serialize(); queueSave(); }
    function row(vals) {
      var tr = document.createElement('tr');
      var html = cfg.cols.map(function (c) { return '<td><input type="text" placeholder="' + esc(c.ph || '') + '"></td>'; }).join('');
      html += '<td><button type="button" class="rm" aria-label="Remove row">×</button></td>';
      tr.innerHTML = html;
      var inputs = tr.querySelectorAll('input');
      cfg.cols.forEach(function (c, idx) { if (vals[idx]) inputs[idx].value = vals[idx]; });
      Array.prototype.forEach.call(inputs, function (inp) {
        inp.addEventListener('input', onInput);
        inp.addEventListener('blur', function () { clearTimeout(saveTimer); serialize(); doSave(); });
      });
      tr.querySelector('.rm').addEventListener('click', function () {
        if (locked) return;
        tr.parentNode.removeChild(tr);
        if (!bodyEl.querySelector('tr')) bodyEl.appendChild(row([]));
        ensureBlank(); serialize(); queueSave();
      });
      return tr;
    }
    function build(str) {
      bodyEl.innerHTML = '';
      var lines = String(str || '').split('\n').filter(function (l) { return l.trim(); });
      if (!lines.length && cfg.seed) { cfg.seed.forEach(function (s) { bodyEl.appendChild(row(s)); }); }
      else lines.forEach(function (line) { bodyEl.appendChild(row(line.split(' | '))); });
      ensureBlank();
    }
    function addRows(rowsVals) {
      var rows = bodyEl.querySelectorAll('tr');
      var last = rows[rows.length - 1];
      if (last && rowEmpty(last)) bodyEl.removeChild(last);
      rowsVals.forEach(function (v) { bodyEl.appendChild(row(v)); });
      ensureBlank(); serialize(); doSave();
    }
    return { build: build, addRows: addRows };
  }

  var tableCtls = {};
  Object.keys(TABLES).forEach(function (id) {
    var body = document.getElementById('wo-' + id);
    var val = document.getElementById('wo-' + id + '-val');
    tableCtls[id] = tableCtl(TABLES[id], body, val);
    tableCtls[id].build('');
  });

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

  // ---- generic upload widget (one per Monday Files column) ----
  function uploadCtl(kind, dataKey, id) {
    var inputEl = document.getElementById('wo-' + id + '-file');
    var listEl = document.getElementById('wo-' + id + '-files');
    var btnEl = document.getElementById('wo-' + id + '-btn');
    var items = [];
    function render() {
      listEl.innerHTML = items.map(function (e) {
        var lbl = e.st === 'ok' ? '<span class="st ok">uploaded</span>'
          : e.st === 'up' ? '<span class="st">uploading…</span>'
          : '<span class="st err">' + esc(e.msg || 'failed') + '</span>';
        return '<li><span>' + esc(e.name) + '</span>' + lbl + '</li>';
      }).join('');
    }
    function persist() {
      var names = items.filter(function (e) { return e.st === 'ok'; }).map(function (e) { return e.name; });
      var o = {}; o[dataKey] = names.join(', '); doSave(o);
    }
    function one(file) {
      if (locked) return;
      var entry = { name: file.name, st: 'up' };
      items.push(entry); render();
      if (file.size > MAX) { entry.st = 'err'; entry.msg = 'too large (max 10 MB)'; render(); return; }
      ensureItem().then(function (rid) {
        if (!rid) { entry.st = 'err'; entry.msg = 'type something first, then retry'; render(); return; }
        return readB64(file).then(function (b64) {
          return postJSON(UPLOAD, { token: token, itemId: rid, kind: kind, filename: file.name, mime: file.type || 'application/octet-stream', dataB64: b64 });
        }).then(function (res) {
          if (res && res.ok) { entry.st = 'ok'; render(); persist(); }
          else { entry.st = 'err'; entry.msg = (res && res.error) || 'upload failed'; render(); }
        });
      }).catch(function () { entry.st = 'err'; entry.msg = 'upload failed'; render(); });
    }
    inputEl.addEventListener('change', function () {
      Array.prototype.slice.call(this.files || []).forEach(one);
      this.value = '';
    });
    return {
      load: function (str) {
        items = String(str || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean)
          .map(function (n) { return { name: n, st: 'ok' }; });
        render();
      },
      disable: function () { inputEl.disabled = true; if (btnEl) btnEl.style.display = 'none'; }
    };
  }

  var gfxUp = uploadCtl('graphics', 'graphics.files', 'gfx');
  var brandUp = uploadCtl('brand', 'brandGuide.files', 'brand');

  // ---- collapsible sections + user-clickable "done" checks ----
  var SEC_SLUGS = ['org', 'people', 'providers', 'filming', 'look', 'brand', 'misc'];
  var secs = Array.prototype.slice.call(root.querySelectorAll('#wo-form > .sec'));
  var doneSecs = {};
  secs.forEach(function (sec, i) {
    sec.setAttribute('data-sec', SEC_SLUGS[i] || ('s' + i));
    var h = sec.querySelector('h2');
    h.setAttribute('role', 'button');
    h.setAttribute('tabindex', '0');
    h.setAttribute('aria-expanded', 'false');
    h.insertAdjacentHTML('beforeend', '<span class="done-toggle" role="checkbox" tabindex="0" aria-checked="false" aria-label="Mark this section completed"><span class="check" aria-hidden="true">✓</span><span class="done-label">Completed</span></span><span class="chev" aria-hidden="true"></span>');
    var toggle = h.querySelector('.done-toggle');
    function toggleDone() {
      if (locked) return;
      var slug = sec.getAttribute('data-sec');
      var on = sec.classList.toggle('filled');
      if (on) doneSecs[slug] = 1; else delete doneSecs[slug];
      toggle.setAttribute('aria-checked', on ? 'true' : 'false');
      doSave({ _done: Object.keys(doneSecs).join(',') });
    }
    toggle.addEventListener('click', function (e) { e.stopPropagation(); toggleDone(); });
    toggle.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleDone(); } });
    function toggleOpen() {
      var wasOpen = sec.classList.contains('open');
      secs.forEach(function (s) { s.classList.remove('open'); s.querySelector('h2').setAttribute('aria-expanded', 'false'); });
      if (!wasOpen) { sec.classList.add('open'); h.setAttribute('aria-expanded', 'true'); }
    }
    h.addEventListener('click', toggleOpen);
    h.addEventListener('keydown', function (e) { if (e.target === h && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleOpen(); } });
  });
  if (secs[0]) { secs[0].classList.add('open'); secs[0].querySelector('h2').setAttribute('aria-expanded', 'true'); }
  function applyDone(str) {
    doneSecs = {};
    String(str || '').split(',').filter(Boolean).forEach(function (slug) { doneSecs[slug] = 1; });
    secs.forEach(function (sec) {
      var on = !!doneSecs[sec.getAttribute('data-sec')];
      sec.classList.toggle('filled', on);
      var t = sec.querySelector('.done-toggle'); if (t) t.setAttribute('aria-checked', on ? 'true' : 'false');
    });
  }

  // ---- provider bulk paste (Excel / Sheets -> table rows) ----
  var provPasteWrap = document.getElementById('wo-prov-paste');
  document.getElementById('wo-prov-paste-toggle').addEventListener('click', function () {
    provPasteWrap.style.display = provPasteWrap.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('wo-prov-paste-add').addEventListener('click', function () {
    var txt = document.getElementById('wo-prov-paste-txt');
    var text = txt.value;
    if (!text.trim()) return;
    var delim = text.indexOf('\t') >= 0 ? '\t' : ',';
    var rows = text.split(/\r?\n/).map(function (l) { return l.split(delim).map(function (c) { return c.trim(); }); })
      .filter(function (c) { return c.some(function (x) { return x; }); });
    if (rows.length > 1) { var head = rows[0].join(' ').toLowerCase(); if ((head.indexOf('name') >= 0 || head.indexOf('special') >= 0) && head.indexOf('@') < 0) rows.shift(); }
    tableCtls.providers.addRows(rows);
    txt.value = ''; provPasteWrap.style.display = 'none';
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
    this.textContent = 'Copied';
    var b = this; setTimeout(function () { b.textContent = 'Copy link'; }, 2000);
  });

  document.getElementById('wo-submit').addEventListener('click', function () {
    if (!confirm('Submit your onboarding info for review? You can still make changes until the WebOuts team locks it in.')) return;
    doSave({ _stage: 'Submitted for Review' });
    document.getElementById('wo-form').style.display = 'none';
    document.getElementById('wo-done').style.display = 'block';
  });

  function lockIfNeeded(stage) {
    if (stage === 'Locked' || stage === 'Provisioned' || stage === 'WebOuts Review') {
      locked = true;
      document.getElementById('wo-lockmsg').style.display = 'block';
      fields.forEach(function (el) { el.disabled = true; });
      Array.prototype.forEach.call(root.querySelectorAll('.sstab input, .sstab button, .pasteui'), function (el) { el.disabled = true; });
      gfxUp.disable(); brandUp.disable();
      document.getElementById('wo-submit').style.display = 'none';
    }
  }

  function handleLoad(res) {
    var data = (res && res.data) || {};
    if (res && res.itemId) itemId = res.itemId;
    apply(data);
    Object.keys(TABLES).forEach(function (id) { tableCtls[id].build(data[TABLES[id].key] || ''); });
    gfxUp.load(data['graphics.files']);
    brandUp.load(data['brandGuide.files']);
    applyDone(data._done);
    lockIfNeeded(data._stage);
    var has = Object.keys(data).length > 0;
    if (locked) setSave('idle', 'Locked');
    else if (has) setSave('saved', 'All changes saved');
    else setSave('idle', 'Ready to start typing');
  }
  function loadForm(attempt) {
    setSave('saving', 'Loading…');
    postJSON(API, { action: 'load', token: token })
      .then(handleLoad)
      .catch(function () {
        if (attempt < 2) setTimeout(function () { loadForm(attempt + 1); }, 700 * (attempt + 1));
        else setSave('error', 'Couldn’t load your info — check your connection and refresh');
      });
  }
  loadForm(0);
})();
