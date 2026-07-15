(() => {
  'use strict';

  const STORAGE_KEY = 'density.v1';
  const TARGET_REPS = 100;
  const DEFAULT_REST = 30;
  const RING_CIRCUMFERENCE = 2 * Math.PI * 90;

  const DAY_LABELS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const ISO_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Lunedì -> Domenica, values are JS getDay() indices

  const DEFAULT_GROUPS = [
    { id: 'biceps', name: 'Bicipiti' },
    { id: 'triceps', name: 'Tricipiti' },
    { id: 'back', name: 'Dorsali' },
    { id: 'shoulders', name: 'Spalle' },
    { id: 'chest', name: 'Petto' },
    { id: 'quads', name: 'Quadricipiti' },
    { id: 'hamstrings', name: 'Femorali/Glutei' },
    { id: 'calves', name: 'Polpacci' },
    { id: 'abs', name: 'Addominali' },
  ];

  const DEFAULT_EXERCISES = {
    biceps: [
      { name: 'Curl con bilanciere', tip: 'In piedi, gomiti fermi ai fianchi: solleva il bilanciere piegando gli avambracci senza slanciare la schiena.' },
      { name: 'Curl manubri alternato', tip: 'In piedi o seduto, solleva un manubrio alla volta ruotando il polso verso la spalla.' },
      { name: 'Curl a martello', tip: 'Impugnatura neutra (palmi verso il corpo): solleva i manubri senza ruotare il polso.' },
      { name: 'Curl concentrato', tip: 'Seduto, gomito appoggiato all\'interno della coscia: solleva il manubrio isolando il bicipite.' },
      { name: 'Curl inverso', tip: 'Impugnatura prona (palmi verso il basso) sul bilanciere: utile anche per gli avambracci.' },
    ],
    triceps: [
      { name: 'French press', tip: 'Sdraiato o in piedi, bilanciere/manubrio dietro la testa: estendi i gomiti mantenendoli fermi.' },
      { name: 'Push down ai cavi', tip: 'Ai cavi alti, gomiti fissi ai fianchi: spingi la barra verso il basso fino a estendere le braccia.' },
      { name: 'Dip su panca', tip: 'Mani su una panca dietro di te: piega i gomiti abbassando il bacino, poi spingi per risalire.' },
      { name: 'Estensioni sopra la testa', tip: 'Manubrio sopra la testa a due mani: piega i gomiti dietro la nuca e poi estendi.' },
      { name: 'Kickback ai cavi', tip: 'Busto inclinato in avanti, gomito fermo: estendi il braccio all\'indietro.' },
    ],
    back: [
      { name: 'Trazioni alla sbarra', tip: 'Presa prona più larga delle spalle: tira il corpo verso l\'alto fino al mento sopra la sbarra.' },
      { name: 'Lat machine avanti', tip: 'Presa larga: tira la barra verso il petto portando indietro i gomiti.' },
      { name: 'Rematore con bilanciere', tip: 'Busto inclinato in avanti: tira il bilanciere verso l\'addome mantenendo la schiena dritta.' },
      { name: 'Rematore manubrio', tip: 'Un ginocchio e una mano appoggiati alla panca: tira il manubrio verso il fianco.' },
      { name: 'Pulley basso', tip: 'Seduto: tira la maniglia verso l\'addome mantenendo il busto eretto.' },
    ],
    shoulders: [
      { name: 'Military press', tip: 'In piedi o seduto: spingi il bilanciere/manubri sopra la testa partendo dalle spalle.' },
      { name: 'Alzate laterali', tip: 'Manubri ai fianchi: solleva le braccia lateralmente fino all\'altezza delle spalle.' },
      { name: 'Alzate frontali', tip: 'Manubri davanti alle cosce: solleva le braccia in avanti fino all\'altezza delle spalle.' },
      { name: 'Alzate posteriori', tip: 'Busto inclinato in avanti: solleva i manubri lateralmente per colpire i deltoidi posteriori.' },
      { name: 'Arnold press', tip: 'Parti con i palmi verso di te e ruota i polsi mentre spingi i manubri verso l\'alto.' },
    ],
    chest: [
      { name: 'Panca piana', tip: 'Sdraiato su panca: abbassa il bilanciere al petto e spingi verso l\'alto controllando il movimento.' },
      { name: 'Panca inclinata', tip: 'Come la panca piana ma su piano inclinato, per la parte alta del petto.' },
      { name: 'Croci con manubri', tip: 'Sdraiato, braccia leggermente piegate: apri e chiudi i manubri come in un abbraccio.' },
      { name: 'Dip per pettorali', tip: 'Alle parallele, busto inclinato in avanti: scendi piegando i gomiti e risali.' },
      { name: 'Push-up', tip: 'Mani leggermente più larghe delle spalle: scendi mantenendo il corpo in linea e risali.' },
    ],
    quads: [
      { name: 'Squat', tip: 'Piedi larghezza spalle: scendi piegando le ginocchia mantenendo la schiena dritta, poi risali.' },
      { name: 'Leg press', tip: 'Seduto sulla macchina: spingi la pedana con i piedi estendendo le ginocchia senza bloccarle.' },
      { name: 'Affondi', tip: 'Fai un passo avanti e scendi finché entrambe le ginocchia sono piegate a 90°, poi torna su.' },
      { name: 'Leg extension', tip: 'Seduto sulla macchina: estendi le ginocchia sollevando il carico con la parte anteriore della coscia.' },
      { name: 'Squat bulgaro', tip: 'Piede posteriore appoggiato su una panca: scendi con la gamba anteriore piegando il ginocchio.' },
    ],
    hamstrings: [
      { name: 'Stacco rumeno', tip: 'Gambe quasi tese: fai scorrere il bilanciere lungo le gambe piegando l\'anca, schiena dritta.' },
      { name: 'Leg curl', tip: 'Sdraiato o seduto sulla macchina: piega le ginocchia portando i talloni verso i glutei.' },
      { name: 'Hip thrust', tip: 'Schiena appoggiata a una panca: spingi il bacino verso l\'alto contraendo i glutei.' },
      { name: 'Good morning', tip: 'Bilanciere sulle spalle: piega il busto in avanti mantenendo la schiena dritta e le ginocchia morbide.' },
      { name: 'Ponte glutei', tip: 'Sdraiato a terra, ginocchia piegate: solleva il bacino contraendo i glutei.' },
    ],
    calves: [
      { name: 'Calf raise in piedi', tip: 'In piedi: solleva i talloni il più possibile e scendi controllando il movimento.' },
      { name: 'Calf raise seduto', tip: 'Seduto con il carico sulle ginocchia: solleva i talloni sollevando l\'avampiede.' },
      { name: 'Calf su leg press', tip: 'Piedi sul bordo della pedana della leg press: spingi con gli avampiedi estendendo le caviglie.' },
    ],
    abs: [
      { name: 'Crunch', tip: 'Sdraiato, ginocchia piegate: solleva le spalle da terra contraendo l\'addome.' },
      { name: 'Plank', tip: 'Appoggiato su avambracci e punte dei piedi: mantieni il corpo dritto e l\'addome contratto.' },
      { name: 'Sit-up', tip: 'Sdraiato, ginocchia piegate: solleva l\'intero busto fino a sedersi.' },
      { name: 'Leg raise', tip: 'Sdraiato: solleva le gambe tese fino a 90° mantenendo la zona lombare a contatto col pavimento.' },
      { name: 'Russian twist', tip: 'Seduto con busto inclinato indietro: ruota il busto da un lato all\'altro.' },
    ],
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

  // ---------- State ----------

  function freshExercisesFor(groupId) {
    const list = DEFAULT_EXERCISES[groupId];
    if (!list) return [];
    return list.map(ex => ({ id: uid(), name: ex.name, tip: ex.tip, custom: false }));
  }

  function loadState() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { raw = null; }
    if (raw && typeof raw === 'object') {
      raw.groups = raw.groups || [];
      raw.exercisesByGroup = raw.exercisesByGroup || {};
      raw.history = raw.history || [];
      raw.activeSession = raw.activeSession || null;
      raw.restDay = (typeof raw.restDay === 'number') ? raw.restDay : 0;
      return raw;
    }
    return { groups: [], exercisesByGroup: {}, history: [], activeSession: null, restDay: 0 };
  }

  let state = loadState();

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ---------- Plan math ----------

  function computePlan(max, restSeconds) {
    max = Math.max(1, Math.floor(Number(max) || 0));
    const setSize = Math.max(1, Math.floor(max / 2));
    const sets = [];
    let remaining = TARGET_REPS;
    while (remaining > 0) {
      const size = Math.min(setSize, remaining);
      sets.push(size);
      remaining -= size;
    }
    return { setSize, sets, restSeconds: restSeconds || DEFAULT_REST };
  }

  function planBadgeLabel(plan) {
    const last = plan.sets[plan.sets.length - 1];
    const uniformCount = last === plan.setSize ? plan.sets.length : plan.sets.length - 1;
    if (uniformCount === plan.sets.length) return `${uniformCount} × ${plan.setSize}`;
    return `${uniformCount}×${plan.setSize} +1×${last}`;
  }

  function populateDaySelect(select) {
    select.innerHTML = '';
    ISO_DAY_ORDER.forEach(dayIndex => {
      const opt = document.createElement('option');
      opt.value = String(dayIndex);
      opt.textContent = DAY_LABELS[dayIndex];
      select.appendChild(opt);
    });
    select.value = String(state.restDay);
  }

  function computeWeeklySchedule() {
    const groups = state.groups;
    const trainingDays = [];
    for (let k = 1; k <= 6; k++) trainingDays.push((state.restDay + k) % 7);
    const assignment = {};
    trainingDays.forEach(d => { assignment[d] = []; });
    const G = groups.length;
    for (let i = 0; i < G; i++) {
      const slot = Math.min(5, Math.floor((i * 6) / G));
      assignment[trainingDays[slot]].push(groups[i]);
    }
    return assignment;
  }

  function exerciseObjFor(group) {
    const list = state.exercisesByGroup[group.id] || [];
    return list.find(e => e.id === group.exerciseId) || null;
  }

  function exerciseNameFor(group) {
    const ex = exerciseObjFor(group);
    return ex ? ex.name : 'Esercizio da definire';
  }

  const TUTORIAL_CHANNEL_HANDLE = 'vladmatvey';

  function youtubeSearchUrl(exerciseName) {
    return `https://www.youtube.com/@${TUTORIAL_CHANNEL_HANDLE}/search?query=` + encodeURIComponent(exerciseName);
  }

  function tutorialLinkHtml(exerciseName, withLabel) {
    if (!exerciseName) return '';
    const url = youtubeSearchUrl(exerciseName);
    const label = withLabel ? '<span>Guarda tutorial</span>' : '';
    return `<a class="tutorial-link" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Cerca un tutorial video per ${escapeHtml(exerciseName)} sul canale Vlad Matvey">
      <svg class="icon" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"/></svg>${label}
    </a>`;
  }

  // ---------- Navigation ----------

  const VIEWS = ['onboarding', 'dashboard', 'workout', 'complete', 'week', 'exercises', 'history', 'settings'];
  const NAV_VIEWS = ['dashboard', 'week', 'exercises', 'history', 'settings'];

  function showView(name) {
    VIEWS.forEach(v => $('#view-' + v).classList.toggle('active', v === name));
    const nav = $('#bottom-nav');
    if (NAV_VIEWS.includes(name)) {
      nav.classList.remove('hidden');
      $$('.nav-item', nav).forEach(btn => btn.classList.toggle('active', btn.dataset.nav === name));
    } else {
      nav.classList.add('hidden');
    }
    window.scrollTo(0, 0);
  }

  function goDashboard() { renderDashboard(); showView('dashboard'); }
  function goWeek() { renderWeek(); showView('week'); }
  function goExercises() { renderExercises(); showView('exercises'); }
  function goHistory() { renderHistory(); showView('history'); }
  function goSettings() { renderSettings(); showView('settings'); }

  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'dashboard') goDashboard();
      else if (target === 'week') goWeek();
      else if (target === 'exercises') goExercises();
      else if (target === 'history') goHistory();
      else if (target === 'settings') goSettings();
    });
  });

  // ---------- Group row editor (shared by onboarding + settings) ----------

  function buildRowsFromState() {
    return state.groups.map(g => ({
      id: g.id,
      name: g.name,
      max: String(g.max),
      exerciseId: g.exerciseId,
      exercises: state.exercisesByGroup[g.id] || [],
    }));
  }

  function buildDefaultRows() {
    return DEFAULT_GROUPS.map(g => {
      const exercises = freshExercisesFor(g.id);
      return { id: g.id, name: g.name, max: '', exerciseId: exercises[0] ? exercises[0].id : null, exercises };
    });
  }

  function renderGroupRows(container, rows) {
    container.innerHTML = '';
    const tpl = $('#tpl-group-row');
    rows.forEach(row => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.rowId = row.id;
      node.querySelector('[data-field="name"]').value = row.name;
      node.querySelector('[data-field="max"]').value = row.max;
      const select = node.querySelector('[data-field="exercise"]');
      if (row.exercises.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Aggiungi esercizi in "Esercizi"';
        select.appendChild(opt);
      } else {
        row.exercises.forEach(ex => {
          const opt = document.createElement('option');
          opt.value = ex.id;
          opt.textContent = ex.name;
          if (ex.id === row.exerciseId) opt.selected = true;
          select.appendChild(opt);
        });
      }
      container.appendChild(node);
    });
  }

  // ---------- Onboarding ----------

  let onboardingRows = [];

  function renderOnboarding() {
    onboardingRows = buildDefaultRows();
    const container = $('#onboarding-groups');
    renderGroupRows(container, onboardingRows);
    populateDaySelect($('#onboarding-rest-day'));
  }

  $('#onboarding-groups').addEventListener('input', e => {
    const rowEl = e.target.closest('[data-group-row]');
    if (!rowEl) return;
    const row = onboardingRows.find(r => r.id === rowEl.dataset.rowId);
    if (!row) return;
    const field = e.target.dataset.field;
    if (field === 'name') row.name = e.target.value;
    if (field === 'max') row.max = e.target.value;
    if (field === 'exercise') row.exerciseId = e.target.value;
  });

  $('#onboarding-groups').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove-group"]');
    if (!btn) return;
    const rowEl = e.target.closest('[data-group-row]');
    const idx = onboardingRows.findIndex(r => r.id === rowEl.dataset.rowId);
    if (idx >= 0) {
      onboardingRows.splice(idx, 1);
      renderGroupRows($('#onboarding-groups'), onboardingRows);
    }
  });

  $('#btn-add-group').addEventListener('click', () => {
    onboardingRows.push({ id: uid(), name: '', max: '', exerciseId: null, exercises: [] });
    renderGroupRows($('#onboarding-groups'), onboardingRows);
  });

  $('#onboarding-form').addEventListener('submit', e => {
    e.preventDefault();
    const validRows = onboardingRows.filter(r => r.name.trim() && Number(r.max) > 0);
    if (validRows.length === 0) {
      alert('Inserisci almeno un massimale valido per procedere.');
      return;
    }
    state.groups = validRows.map(r => ({
      id: r.id, name: r.name.trim(), max: Number(r.max), exerciseId: r.exerciseId || null, restSeconds: DEFAULT_REST,
    }));
    state.exercisesByGroup = {};
    onboardingRows.forEach(r => { state.exercisesByGroup[r.id] = r.exercises; });
    state.restDay = Number($('#onboarding-rest-day').value);
    saveState();
    goDashboard();
  });

  // ---------- Dashboard ----------

  function renderTodayBanner() {
    const banner = $('#today-banner');
    const todayIndex = new Date().getDay();
    if (state.groups.length === 0) { banner.innerHTML = ''; return; }
    if (todayIndex === state.restDay) {
      banner.className = 'today-banner is-rest';
      banner.innerHTML = `
        <div>
          <div class="today-banner-label">Oggi · ${DAY_LABELS[todayIndex]}</div>
          <div class="today-banner-value">Giorno di riposo</div>
        </div>`;
      return;
    }
    const schedule = computeWeeklySchedule();
    const todayGroups = schedule[todayIndex] || [];
    banner.className = 'today-banner';
    if (todayGroups.length === 0) {
      banner.innerHTML = `
        <div>
          <div class="today-banner-label">Oggi · ${DAY_LABELS[todayIndex]}</div>
          <div class="today-banner-value">Nessun gruppo in programma</div>
        </div>`;
      return;
    }
    banner.innerHTML = `
      <div>
        <div class="today-banner-label">Oggi · ${DAY_LABELS[todayIndex]}</div>
        <div class="today-banner-value">${todayGroups.map(g => escapeHtml(g.name)).join(' + ')}</div>
      </div>
      <button type="button" class="btn btn-primary btn-sm" data-start="${todayGroups[0].id}">Inizia</button>
    `;
  }

  function renderDashboard() {
    renderTodayBanner();
    const container = $('#dashboard-cards');
    container.innerHTML = '';
    if (state.groups.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg class="icon" viewBox="0 0 24 24"><path d="M6.5 6.5l11 11M4 8l4-4 2 2-4 4-2-2zm10 10l4-4 2 2-4 4-2-2z"/></svg>
          <p>Nessun gruppo muscolare configurato.</p>
        </div>`;
      return;
    }
    state.groups.forEach(g => {
      const plan = computePlan(g.max, g.restSeconds);
      const exObj = exerciseObjFor(g);
      const card = document.createElement('div');
      card.className = 'plan-card';
      card.innerHTML = `
        <div class="plan-card-top">
          <div class="plan-card-title">
            <h2>${escapeHtml(g.name)}</h2>
            <p class="subtitle exercise-name-row">${escapeHtml(exObj ? exObj.name : 'Esercizio da definire')} ${tutorialLinkHtml(exObj && exObj.name)}</p>
          </div>
          <span class="plan-badge">${planBadgeLabel(plan)}</span>
        </div>
        <div class="plan-card-meta">
          <div><strong>${g.max}</strong>massimale</div>
          <div><strong>${TARGET_REPS}</strong>rip. totali</div>
          <div><strong>${plan.restSeconds}s</strong>riposo</div>
        </div>
        <button type="button" class="btn btn-primary btn-block" data-start="${g.id}">Inizia allenamento</button>
      `;
      container.appendChild(card);
    });
  }

  $('#dashboard-cards').addEventListener('click', e => {
    const btn = e.target.closest('[data-start]');
    if (!btn) return;
    startWorkout(btn.dataset.start);
  });

  $('#today-banner').addEventListener('click', e => {
    const btn = e.target.closest('[data-start]');
    if (!btn) return;
    startWorkout(btn.dataset.start);
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Workout engine ----------

  let restTimerHandle = null;

  function startWorkout(groupId) {
    const group = state.groups.find(g => g.id === groupId);
    if (!group) return;
    const plan = computePlan(group.max, group.restSeconds);
    state.activeSession = {
      groupId,
      sets: plan.sets,
      restSeconds: plan.restSeconds,
      currentIndex: 0,
      phase: 'ready',
      restEndsAt: null,
      completedReps: 0,
    };
    saveState();
    enterWorkoutView();
  }

  function enterWorkoutView() {
    if (!state.activeSession) { goDashboard(); return; }
    settleRestIfElapsed();
    renderWorkout();
    showView('workout');
    tickRestTimerLoop();
  }

  function settleRestIfElapsed() {
    const s = state.activeSession;
    if (!s || s.phase !== 'resting') return;
    if (Date.now() >= s.restEndsAt) {
      s.phase = 'ready';
      s.restEndsAt = null;
      saveState();
    }
  }

  function renderWorkout() {
    const s = state.activeSession;
    if (!s) return;
    const group = state.groups.find(g => g.id === s.groupId);
    if (!group) { state.activeSession = null; saveState(); goDashboard(); return; }

    const exObj = exerciseObjFor(group);
    $('#workout-muscle-name').textContent = group.name;
    $('#workout-exercise-name').innerHTML = `${escapeHtml(exObj ? exObj.name : 'Esercizio da definire')} ${tutorialLinkHtml(exObj && exObj.name)}`;
    const tipEl = $('#workout-exercise-tip');
    if (exObj && exObj.tip) {
      tipEl.textContent = exObj.tip;
      tipEl.classList.remove('hidden');
    } else {
      tipEl.classList.add('hidden');
    }

    const isLast = s.currentIndex === s.sets.length - 1;
    $('#workout-banner-last').classList.toggle('hidden', !isLast);

    const pct = Math.min(100, Math.round((s.completedReps / TARGET_REPS) * 100));
    $('#workout-progress-fill').style.width = pct + '%';
    $('#workout-progress-label').textContent = `${s.completedReps} / ${TARGET_REPS} ripetizioni`;

    $('#workout-set-count').textContent = `Serie ${s.currentIndex + 1} / ${s.sets.length}`;

    const ring = $('#timer-ring-fg');
    const stateLabel = $('#timer-state-label');
    const mainValue = $('#timer-main-value');
    const subValue = $('#timer-sub-value');
    const doneBtn = $('#btn-set-done');
    const skipBtn = $('#btn-skip-rest');

    if (s.phase === 'ready') {
      ring.style.stroke = 'var(--color-primary)';
      ring.style.strokeDashoffset = '0';
      stateLabel.textContent = isLast ? 'ULTIMA SERIE' : 'SERIE';
      mainValue.textContent = s.sets[s.currentIndex];
      subValue.textContent = 'ripetizioni';
      doneBtn.classList.remove('hidden');
      doneBtn.disabled = false;
      doneBtn.textContent = 'Serie completata';
      skipBtn.classList.add('hidden');
    } else if (s.phase === 'resting') {
      const remaining = Math.max(0, Math.ceil((s.restEndsAt - Date.now()) / 1000));
      const frac = Math.max(0, Math.min(1, remaining / s.restSeconds));
      ring.style.stroke = 'var(--color-accent)';
      ring.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - frac));
      stateLabel.textContent = 'RIPOSO';
      mainValue.textContent = remaining;
      subValue.textContent = 'secondi';
      doneBtn.classList.add('hidden');
      skipBtn.classList.remove('hidden');
    }
  }

  function tickRestTimerLoop() {
    if (restTimerHandle) clearInterval(restTimerHandle);
    restTimerHandle = setInterval(() => {
      const s = state.activeSession;
      if (!s || !document.getElementById('view-workout').classList.contains('active')) {
        clearInterval(restTimerHandle);
        return;
      }
      if (s.phase === 'resting') {
        if (Date.now() >= s.restEndsAt) {
          s.phase = 'ready';
          s.restEndsAt = null;
          saveState();
          notifyRestOver();
        }
        renderWorkout();
      }
    }, 250);
  }

  function notifyRestOver() {
    if (navigator.vibrate) navigator.vibrate([180, 60, 180]);
    playBeep();
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) { /* audio not available */ }
  }

  $('#btn-set-done').addEventListener('click', () => {
    const s = state.activeSession;
    if (!s || s.phase !== 'ready') return;
    s.completedReps += s.sets[s.currentIndex];
    const isLast = s.currentIndex === s.sets.length - 1;
    if (isLast) {
      finishWorkout();
    } else {
      s.currentIndex += 1;
      s.phase = 'resting';
      s.restEndsAt = Date.now() + s.restSeconds * 1000;
      saveState();
      renderWorkout();
    }
  });

  $('#btn-skip-rest').addEventListener('click', () => {
    const s = state.activeSession;
    if (!s || s.phase !== 'resting') return;
    s.phase = 'ready';
    s.restEndsAt = null;
    saveState();
    renderWorkout();
  });

  $('#btn-workout-back').addEventListener('click', () => {
    if (!confirm('Vuoi uscire? La sessione in corso andrà persa.')) return;
    state.activeSession = null;
    saveState();
    if (restTimerHandle) clearInterval(restTimerHandle);
    goDashboard();
  });

  function finishWorkout() {
    const s = state.activeSession;
    const group = state.groups.find(g => g.id === s.groupId);
    state.history.unshift({
      id: uid(),
      date: new Date().toISOString(),
      groupName: group ? group.name : '—',
      exerciseName: group ? exerciseNameFor(group) : '—',
      totalSets: s.sets.length,
      totalReps: s.completedReps,
    });
    state.activeSession = null;
    saveState();
    if (restTimerHandle) clearInterval(restTimerHandle);
    $('#complete-summary').textContent = `Hai completato ${s.completedReps} ripetizioni in ${s.sets.length} serie.`;
    showView('complete');
  }

  $('#btn-complete-done').addEventListener('click', goDashboard);

  // ---------- Exercises library ----------

  function renderExercises() {
    const container = $('#exercises-list');
    container.innerHTML = '';
    if (state.groups.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Configura prima i tuoi gruppi muscolari nelle Impostazioni.</p>
        </div>`;
      return;
    }
    state.groups.forEach(g => {
      const list = state.exercisesByGroup[g.id] || [];
      const block = document.createElement('div');
      block.className = 'exercise-group';
      block.dataset.groupId = g.id;
      block.innerHTML = `
        <h2>${escapeHtml(g.name)}</h2>
        <div class="exercise-item-list">
          ${list.map(ex => `
            <div class="exercise-item ${ex.custom ? 'is-custom' : ''}" data-ex-id="${ex.id}">
              <div class="exercise-item-main">
                <div class="exercise-item-name">${escapeHtml(ex.name)}</div>
                ${ex.tip ? `<p class="exercise-item-tip">${escapeHtml(ex.tip)}</p>` : ''}
              </div>
              <div class="exercise-item-actions">
                ${tutorialLinkHtml(ex.name, true)}
                <button type="button" class="icon-btn icon-btn-danger" data-action="remove-exercise" aria-label="Rimuovi esercizio">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>`).join('') || '<span class="subtitle">Nessun esercizio ancora.</span>'}
        </div>
        <div class="add-exercise-row">
          <input type="text" class="input" placeholder="Nuovo esercizio…" data-new-exercise-input>
          <button type="button" class="btn btn-secondary" data-action="add-exercise">Aggiungi</button>
        </div>
      `;
      container.appendChild(block);
    });
  }

  $('#exercises-list').addEventListener('click', e => {
    const removeBtn = e.target.closest('[data-action="remove-exercise"]');
    const addBtn = e.target.closest('[data-action="add-exercise"]');
    const block = e.target.closest('[data-group-id]');
    if (!block) return;
    const groupId = block.dataset.groupId;

    if (removeBtn) {
      const chip = removeBtn.closest('[data-ex-id]');
      const exId = chip.dataset.exId;
      const list = state.exercisesByGroup[groupId] || [];
      state.exercisesByGroup[groupId] = list.filter(ex => ex.id !== exId);
      const group = state.groups.find(g => g.id === groupId);
      if (group && group.exerciseId === exId) {
        group.exerciseId = state.exercisesByGroup[groupId][0] ? state.exercisesByGroup[groupId][0].id : null;
      }
      saveState();
      renderExercises();
    }

    if (addBtn) {
      const input = block.querySelector('[data-new-exercise-input]');
      const name = input.value.trim();
      if (!name) return;
      state.exercisesByGroup[groupId] = state.exercisesByGroup[groupId] || [];
      const newEx = { id: uid(), name, custom: true };
      state.exercisesByGroup[groupId].push(newEx);
      const group = state.groups.find(g => g.id === groupId);
      if (group && !group.exerciseId) group.exerciseId = newEx.id;
      saveState();
      renderExercises();
    }
  });

  // ---------- Weekly schedule ----------

  function renderWeek() {
    const container = $('#week-list');
    container.innerHTML = '';
    if (state.groups.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Configura prima i tuoi gruppi muscolari nelle Impostazioni.</p>
        </div>`;
      return;
    }
    const schedule = computeWeeklySchedule();
    const todayIndex = new Date().getDay();
    ISO_DAY_ORDER.forEach(dayIndex => {
      const isRest = dayIndex === state.restDay;
      const isToday = dayIndex === todayIndex;
      const card = document.createElement('div');
      card.className = `day-card ${isRest ? 'is-rest' : ''} ${isToday ? 'is-today' : ''}`;
      let bodyHtml;
      if (isRest) {
        bodyHtml = `<div class="day-rest-label">Riposo — nessun allenamento</div>`;
      } else {
        const groups = schedule[dayIndex] || [];
        bodyHtml = groups.length === 0
          ? `<span class="subtitle">Nessun gruppo in programma.</span>`
          : groups.map(g => {
              const exObj = exerciseObjFor(g);
              return `
              <div class="day-group-row">
                <div class="day-group-info">
                  <div class="muscle">${escapeHtml(g.name)}</div>
                  <div class="exercise exercise-name-row">${escapeHtml(exObj ? exObj.name : 'Esercizio da definire')} ${tutorialLinkHtml(exObj && exObj.name)}</div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" data-start="${g.id}">Inizia</button>
              </div>
            `;
            }).join('');
      }
      card.innerHTML = `
        <div class="day-card-head">
          <h2>${DAY_LABELS[dayIndex]}</h2>
          ${isToday ? '<span class="day-tag-today">OGGI</span>' : ''}
        </div>
        ${bodyHtml}
      `;
      container.appendChild(card);
    });
  }

  $('#week-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-start]');
    if (!btn) return;
    startWorkout(btn.dataset.start);
  });

  // ---------- History ----------

  function renderHistory() {
    const container = $('#history-list');
    container.innerHTML = '';
    if (state.history.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>Nessun allenamento completato ancora.</p>
        </div>`;
      return;
    }
    const fmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    state.history.forEach(h => {
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <div class="history-card-info">
          <div class="muscle">${escapeHtml(h.groupName)}</div>
          <div class="exercise">${escapeHtml(h.exerciseName)}</div>
        </div>
        <div class="history-card-date">
          ${h.totalReps} rip · ${h.totalSets} serie<br>${fmt.format(new Date(h.date))}
        </div>
      `;
      container.appendChild(card);
    });
  }

  // ---------- Settings ----------

  let settingsRows = [];

  function renderSettings() {
    settingsRows = buildRowsFromState();
    renderGroupRows($('#settings-groups'), settingsRows);
    populateDaySelect($('#settings-rest-day'));
  }

  $('#settings-groups').addEventListener('input', e => {
    const rowEl = e.target.closest('[data-group-row]');
    if (!rowEl) return;
    const row = settingsRows.find(r => r.id === rowEl.dataset.rowId);
    if (!row) return;
    const field = e.target.dataset.field;
    if (field === 'name') row.name = e.target.value;
    if (field === 'max') row.max = e.target.value;
    if (field === 'exercise') row.exerciseId = e.target.value;
  });

  $('#settings-groups').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="remove-group"]');
    if (!btn) return;
    const rowEl = e.target.closest('[data-group-row]');
    const idx = settingsRows.findIndex(r => r.id === rowEl.dataset.rowId);
    if (idx >= 0) {
      settingsRows.splice(idx, 1);
      renderGroupRows($('#settings-groups'), settingsRows);
    }
  });

  $('#btn-settings-add-group').addEventListener('click', () => {
    const id = uid();
    settingsRows.push({ id, name: '', max: '', exerciseId: null, exercises: [] });
    state.exercisesByGroup[id] = state.exercisesByGroup[id] || [];
    renderGroupRows($('#settings-groups'), settingsRows);
  });

  $('#settings-form').addEventListener('submit', e => {
    e.preventDefault();
    const validRows = settingsRows.filter(r => r.name.trim() && Number(r.max) > 0);
    if (validRows.length === 0) {
      alert('Inserisci almeno un massimale valido per procedere.');
      return;
    }
    state.groups = validRows.map(r => ({
      id: r.id, name: r.name.trim(), max: Number(r.max), exerciseId: r.exerciseId || null, restSeconds: DEFAULT_REST,
    }));
    state.restDay = Number($('#settings-rest-day').value);
    saveState();
    goDashboard();
  });

  // ---------- Boot ----------

  function boot() {
    if (state.groups.length === 0) {
      renderOnboarding();
      showView('onboarding');
      return;
    }
    if (state.activeSession) {
      enterWorkoutView();
      return;
    }
    goDashboard();
  }

  boot();
})();
