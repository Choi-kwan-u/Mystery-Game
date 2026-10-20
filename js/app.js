// 게임 로직. 언어 무관 — 문구는 i18n.js의 t()/pick()으로만 가져온다.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date();
  const TODAY = ymd(now);
  const YESTERDAY = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  // shortcut: 확인용으로 미공개 사건도 열림, 공개 전에 false로
  const PREVIEW = true;
  // 방문 통계(GoatCounter) 코드. 비어 있으면 아무것도 보내지 않는다
  const GC = '';
  if (GC) {
    const s = document.createElement('script');
    s.async = true;
    s.src = '//gc.zgo.at/count.js';
    s.dataset.goatcounter = `https://${GC}.goatcounter.com/count`;
    document.head.append(s);
  }
  // '다음 사건' 수요 측정용 이벤트 (결제 붙이기 전 확인)
  function track(name) {
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true });
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function getJSON(path) {
    return fetch('../' + path, { cache: 'no-cache' }).then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))));
  }

  // 공개된 사건(현지 날짜 기준)을 날짜순으로
  function released(list, all) {
    return list.filter(c => all || c.date <= TODAY).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id));
  }

  function currentStreak() {
    const s = Store.get();
    return s.last === TODAY || s.last === YESTERDAY ? s.streak : 0;
  }

  function gradeOf(score, max) {
    const r = score / max;
    return score === max ? 'sherlock' : r >= 0.7 ? 'detective' : r >= 0.4 ? 'inspector' : 'rookie';
  }

  function setupLangSwitch() {
    const file = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-lang]').forEach(a => {
      const l = a.dataset.lang;
      a.href = `../${l}/${file}${location.search}`;
      if (l === LANG) a.setAttribute('aria-current', 'true');
      a.addEventListener('click', () => { Store.get().lang = l; Store.save(); });
    });
  }

  /* ---------- 오늘의 사건 ---------- */

  function notice(key, withBack) {
    const box = $('#notice');
    box.textContent = t(key);
    if (withBack) {
      const a = el('a', 'btn', t('game.backToday'));
      a.href = 'index.html';
      box.append(el('br'), a);
    }
    box.hidden = false;
    $('#play').hidden = true;
  }

  async function initGame() {
    let list;
    try { list = await getJSON('cases/cases.json'); } catch (e) { return notice('game.loadError'); }
    const rel = released(list);
    const today = rel[rel.length - 1];
    const param = new URLSearchParams(location.search).get('case');
    let entry = today;
    if (param !== null) {
      entry = list.find(c => String(c.id) === param.trim());
      if (!entry) return notice('game.notFound', true);
      if (entry.date > TODAY && !PREVIEW) return notice('game.notReleased', true);
    }
    if (!entry) return notice('game.noCase');
    let data;
    try { data = await getJSON(entry.file); } catch (e) { return notice('game.loadError'); }
    runGame(data, entry === today, list);
  }

  function runGame(c, isToday, list) {
    const viewer = $('#viewer'), stage = $('#stage'), photo = $('#photo'), marks = $('#marks');
    const bubble = $('#bubble');
    const resultBox = $('#result');
    const nq = c.questions.length;

    const store = Store.get();
    // 질문 수가 바뀌기 전의 예전 기록은 무시하고 새로 풀게 한다
    const old = store.cases[c.id];
    const rec = old && old.sel.length === nq ? old : null;
    // 한 문제씩 잠기므로, 새로고침해도 이미 고른 답은 유지한다
    const part = store.partial[c.id];
    let sel = rec ? rec.sel.slice() : part && part.length === nq ? part.slice() : new Array(nq).fill(null);
    let res = rec;      // 제출 결과
    let submitted = !!res;
    let replay = false;
    let activeClue = null;

    $('#notice').hidden = true;
    $('#play').hidden = false;
    $('#caseNo').textContent = t('game.caseNo', { n: c.id, date: c.date });
    $('#caseTitle').textContent = pick(c.title);
    $('#caseIntro').textContent = pick(c.intro);
    // 거짓말 찾기 사건: 인물의 진술을 보여준다
    const st = $('#caseStatement');
    st.hidden = !c.statement;
    if (c.statement) {
      st.textContent = '';
      st.append(el('span', 'statement-label', t('game.statement')), el('p', null, `“${pick(c.statement)}”`));
    }
    photo.alt = t('game.photoAlt', { title: pick(c.title) });
    photo.src = '../' + c.image;

    /* --- 사진 보기: 줌/이동 (transform) --- */
    const view = { s: 1, x: 0, y: 0 };
    function applyView() {
      const w = viewer.clientWidth, h = viewer.clientHeight;
      view.s = Math.min(5, Math.max(1, view.s));
      view.x = Math.min(0, Math.max(w - w * view.s, view.x));
      view.y = Math.min(0, Math.max(h - h * view.s, view.y));
      stage.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
      viewer.style.setProperty('--s', view.s);
    }
    function zoomAt(px, py, ns) {
      ns = Math.min(5, Math.max(1, ns));
      view.x = px - (px - view.x) * (ns / view.s);
      view.y = py - (py - view.y) * (ns / view.s);
      view.s = ns;
      applyView();
    }
    function resetView() { view.s = 1; view.x = 0; view.y = 0; applyView(); }
    function toggleFull(force) {
      const on = viewer.classList.toggle('full', force);
      document.body.classList.toggle('no-scroll', on);
      resetView();
    }

    const pts = new Map();
    let gesture = null;
    viewer.addEventListener('pointerdown', e => {
      if (e.target.closest('button')) return;
      viewer.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) gesture = { sx: e.clientX, sy: e.clientY, moved: false, multi: false };
      else if (gesture) gesture.multi = true;
    });
    viewer.addEventListener('pointermove', e => {
      const prev = pts.get(e.pointerId);
      if (!prev || !gesture) return;
      const before = [...pts.values()];
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const after = [...pts.values()];
      if (pts.size === 1) {
        if (Math.hypot(e.clientX - gesture.sx, e.clientY - gesture.sy) > 6) gesture.moved = true;
        if (gesture.moved) { view.x += e.clientX - prev.x; view.y += e.clientY - prev.y; applyView(); }
      } else if (pts.size === 2) {
        const r = viewer.getBoundingClientRect();
        const dist = p => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        const mid = p => ({ x: (p[0].x + p[1].x) / 2 - r.left, y: (p[0].y + p[1].y) / 2 - r.top });
        const m0 = mid(before), m1 = mid(after);
        view.x += m1.x - m0.x;
        view.y += m1.y - m0.y;
        zoomAt(m1.x, m1.y, view.s * (dist(after) / (dist(before) || 1)));
      }
    });
    function endPointer(e) {
      if (!pts.delete(e.pointerId)) return;
      if (pts.size === 0) {
        if (e.type === 'pointerup' && gesture && !gesture.moved && !gesture.multi) onTap(e.clientX, e.clientY);
        gesture = null;
      }
    }
    viewer.addEventListener('pointerup', endPointer);
    viewer.addEventListener('pointercancel', endPointer);
    viewer.addEventListener('wheel', e => {
      e.preventDefault();
      const r = viewer.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, view.s * Math.exp(-e.deltaY * 0.0015));
    }, { passive: false });
    viewer.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
      const w = viewer.clientWidth / 2, h = viewer.clientHeight / 2;
      const z = b.dataset.zoom;
      if (z === 'in') zoomAt(w, h, view.s * 1.5);
      else if (z === 'out') zoomAt(w, h, view.s / 1.5);
      else if (z === 'reset') resetView();
      else toggleFull();
    }));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && viewer.classList.contains('full')) toggleFull(false); });
    window.addEventListener('resize', resetView);

    // 사진 좌표(%) — x는 너비, y는 높이 기준. 단서 반지름 r은 너비 기준 %.
    function ratio() { return photo.naturalWidth ? photo.naturalHeight / photo.naturalWidth : 1.25; }
    function inClue(p, k) { return Math.hypot(p.x - k.x, (p.y - k.y) * ratio()) <= k.r; }

    function onTap(cx, cy) {
      const r = stage.getBoundingClientRect();
      const p = { x: (cx - r.left) / r.width * 100, y: (cy - r.top) / r.height * 100 };
      if (p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) return;
      if (!submitted) return toggleFull();
      // 제출 후에는 탭한 단서 원의 설명을 보여준다
      const k = c.clues.find(k => inClue(p, k));
      activeClue = k ? k.id : null;
      renderMarks();
    }


    /* --- 렌더링 --- */
    function renderMarks() {
      marks.textContent = '';
      if (submitted) {
        c.clues.forEach((k, i) => {
          const ring = el('div', 'ring' + (activeClue === k.id ? ' active' : ''), String(i + 1));
          ring.style.left = k.x + '%';
          ring.style.top = k.y + '%';
          ring.style.width = k.r * 2 + '%';
          marks.append(ring);
        });
      }
      const k = submitted && c.clues.find(k => k.id === activeClue);
      bubble.hidden = !k;
      if (k) bubble.textContent = `${c.clues.indexOf(k) + 1}. ${pick(k.label)}`;
    }

    function renderQuestions() {
      const box = $('#questions');
      box.textContent = '';
      const current = sel.indexOf(null);
      c.questions.forEach((q, qi) => {
        // 아직 차례가 안 온 질문은 숨긴다 — 뒤 질문이 앞 질문의 답을 흘리지 않게
        if (!submitted && qi > current) return;
        const wrap = el('div', 'q' + (!submitted && qi === current ? ' current' : ''));
        wrap.append(el('p', 'ask', `${qi + 1}. ${pick(q.ask)}`));
        const chips = el('div', 'chips');
        chips.setAttribute('role', 'group');
        q.options.forEach((o, oi) => {
          const b = el('button', 'chip', pick(o));
          b.type = 'button';
          b.setAttribute('aria-pressed', sel[qi] === oi);
          if (submitted) {
            b.disabled = true;
            if (oi === q.answer) b.classList.add('right');
            else if (sel[qi] === oi) b.classList.add('wrong');
          } else if (qi !== current) {
            b.disabled = true;
          } else {
            b.addEventListener('click', () => choose(qi, oi));
          }
          chips.append(b);
        });
        wrap.append(chips);
        if (submitted) {
          const ok = res.correct[qi];
          wrap.append(el('p', 'verdict ' + (ok ? 'ok' : 'no'), ok ? t('result.right') : t('result.wrong', { a: pick(q.options[q.answer]) })));
        }
        box.append(wrap);
      });
      if (!submitted) box.append(el('p', 'small progress', t('q.progress', { n: current + 1, all: nq })));
    }

    function choose(qi, oi) {
      sel[qi] = oi;
      if (!replay) { store.partial[c.id] = sel.slice(); Store.save(); }
      if (sel.indexOf(null) === -1) return submit();
      renderQuestions();
      $('#questions .q.current').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function renderResult() {
      resultBox.textContent = '';
      resultBox.hidden = !submitted;
      $('#lockNote').hidden = submitted;
      if (!submitted) return;

      resultBox.append(el('h2', null, t('result.heading')));
      const card = el('div', 'grade-card grade-' + res.grade);
      card.append(el('p', 'grade', t('grade.' + res.grade)), el('p', 'score', t('result.score', { s: res.score, m: res.max })));
      resultBox.append(card);

      resultBox.append(el('h2', null, t('result.detective')), el('p', 'detective', pick(c.detective)), el('p', 'tap-hint', t('result.tapHint')));

      const shareBtn = el('button', 'btn primary', t('share.button'));
      shareBtn.type = 'button';
      const shareMsg = el('p', 'small share-msg');
      shareMsg.setAttribute('role', 'status');
      shareBtn.addEventListener('click', () => share(shareMsg));
      resultBox.append(shareBtn, shareMsg);

      // 아직 안 푼 공개 사건 중 가장 최근 것으로
      const nextBtn = el('button', 'btn', t('next.button'));
      nextBtn.type = 'button';
      const nextMsg = el('p', 'small');
      nextMsg.setAttribute('role', 'status');
      nextBtn.addEventListener('click', () => {
        const done = Store.get().cases;
        const nx = released(list, PREVIEW).reverse().find(e => e.id !== c.id && !done[e.id]);
        if (!nx) { track('next-none'); nextMsg.textContent = t('next.none'); return; }
        track('next-click');
        // 통계 전송이 페이지 이동에 끊기지 않게 잠깐 기다린다
        setTimeout(() => { location.href = `index.html?case=${nx.id}`; }, 150);
      });
      resultBox.append(nextBtn, nextMsg);

      const cd = el('p', 'countdown');
      resultBox.append(cd);
      startCountdown(cd);

      if (replay) resultBox.append(el('p', 'small', t('replay.note')));
      if (!isToday) {
        const again = el('button', 'btn', t('replay.button'));
        again.type = 'button';
        again.addEventListener('click', () => {
          replay = true; submitted = false; res = null; activeClue = null;
          sel = new Array(nq).fill(null);
          renderAll();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        resultBox.append(again);
      }
    }

    function renderAll() { renderQuestions(); renderMarks(); renderResult(); }

    function submit() {
      const correct = c.questions.map((q, i) => sel[i] === q.answer);
      const score = correct.filter(Boolean).length;
      res = { sel: sel.slice(), correct, score, max: nq, grade: gradeOf(score, nq), at: Date.now() };
      submitted = true;
      if (!replay && !rec) {
        track('case-done');
        store.cases[c.id] = res;
        delete store.partial[c.id];
        store.grades[res.grade] = (store.grades[res.grade] || 0) + 1;
        if (isToday && store.last !== TODAY) {
          store.streak = store.last === YESTERDAY ? store.streak + 1 : 1;
          store.last = TODAY;
          store.best = Math.max(store.best, store.streak);
        }
        Store.save();
      }
      renderAll();
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function shareText() {
      return [
        t('share.head', { n: c.id }),
        res.correct.map(ok => (ok ? '🟩' : '🟥')).join(''),
        `${t('grade.' + res.grade)} · ${t('share.streak', { n: currentStreak() })}`,
        new URL('./', location.href).href
      ].join('\n');
    }

    async function share(msg) {
      const text = shareText();
      if (navigator.share) {
        try { await navigator.share({ text }); return; } catch (e) { if (e.name === 'AbortError') return; }
      }
      try {
        await navigator.clipboard.writeText(text);
        msg.textContent = t('share.copied');
      } catch (e) {
        // 클립보드 API가 막힌 환경: 텍스트를 보여주고 선택해 둔다
        const ta = el('textarea', 'share-text');
        ta.value = text;
        ta.readOnly = true;
        ta.rows = 4;
        msg.textContent = t('share.failed');
        msg.after(ta);
        ta.select();
      }
    }

    if (!submitted && sel.indexOf(null) === -1) submit();
    else renderAll();
  }

  let countdownTimer = null;
  function startCountdown(node) {
    clearInterval(countdownTimer);
    const tick = () => {
      const n = new Date();
      const ms = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1) - n;
      if (ms <= 1000) {
        clearInterval(countdownTimer);
        node.textContent = '';
        const a = el('a', null, t('next.ready'));
        a.href = 'index.html';
        node.append(a);
        return;
      }
      const s = Math.floor(ms / 1000);
      node.textContent = `${t('next.label')} ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* ---------- 지난 사건 ---------- */

  async function initArchive() {
    const box = $('#archiveList');
    let list;
    try { list = await getJSON('cases/cases.json'); } catch (e) { box.textContent = t('game.loadError'); return; }
    const today = released(list).pop();
    const rel = released(list, PREVIEW).reverse();
    if (!rel.length) { box.textContent = t('archive.empty'); return; }
    // shortcut: 사건 파일을 전부 받아 제목을 읽음, 사건이 수백 개가 되면 cases.json에 제목을 넣거나 페이지 나누기
    const files = await Promise.all(rel.map(e => getJSON(e.file).catch(() => null)));
    const store = Store.get();
    const ul = el('ul', 'archive');
    rel.forEach((e, i) => {
      const li = el('li');
      const a = el('a');
      a.href = `index.html?case=${e.id}`;
      a.append(el('span', 'no', '#' + e.id), el('span', 'date', e.date), el('span', 'title', files[i] ? pick(files[i].title) : ''));
      const rec = store.cases[e.id];
      a.append(el('span', 'badge' + (rec ? ' grade-' + rec.grade : ' none'), rec ? t('grade.' + rec.grade) : t('archive.unsolved')));
      if (e === today) a.append(el('span', 'tag', t('archive.today')));
      li.append(a);
      ul.append(li);
    });
    box.textContent = '';
    box.append(ul);
  }

  /* ---------- 내 기록 ---------- */

  function renderStats() {
    const box = $('#stats');
    const s = Store.get();
    const nums = el('div', 'stat-nums');
    [['stats.played', Object.keys(s.cases).length], ['stats.streak', currentStreak()], ['stats.best', s.best]].forEach(([k, v]) => {
      const d = el('div', 'stat');
      d.append(el('b', null, String(v)), el('span', null, t(k)));
      nums.append(d);
    });
    box.append(nums, el('h3', null, t('stats.dist')));
    const total = Math.max(1, ...Object.values(s.grades));
    ['sherlock', 'detective', 'inspector', 'rookie'].forEach(g => {
      const row = el('div', 'dist-row');
      const bar = el('span', 'bar grade-' + g);
      bar.style.width = (s.grades[g] || 0) / total * 100 + '%';
      const track = el('span', 'track');
      track.append(bar);
      row.append(el('span', 'label', t('grade.' + g)), track, el('span', 'count', String(s.grades[g] || 0)));
      box.append(row);
    });
  }

  applyI18n();
  setupLangSwitch();
  const page = document.body.dataset.page;
  if (page === 'game') initGame();
  else if (page === 'archive') initArchive();
  else if (page === 'how') renderStats();
})();
