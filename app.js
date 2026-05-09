const STORAGE_KEY = "panchakarma-care-os-state-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const practitioners = [
  { id: "kavya", name: "Dr. Kavya Menon", role: "Panchakarma Physician" },
  { id: "arjun", name: "Arjun Nair", role: "Senior Therapist" },
  { id: "meera", name: "Meera Joshi", role: "Therapy Coordinator" },
  { id: "rehan", name: "Rehan Shah", role: "Rehab Specialist" }
];

const patients = [
  {
    id: "asha",
    name: "Asha Raman",
    age: 38,
    goal: "Stress recovery",
    dosha: "Vata dominant",
    defaultPlan: "rejuvenation"
  },
  {
    id: "vikram",
    name: "Vikram Iyer",
    age: 52,
    goal: "Metabolic detox",
    dosha: "Kapha-Pitta",
    defaultPlan: "detox"
  },
  {
    id: "naina",
    name: "Naina Das",
    age: 45,
    goal: "Joint stiffness",
    dosha: "Vata-Kapha",
    defaultPlan: "chronicPain"
  },
  {
    id: "farah",
    name: "Farah Khan",
    age: 31,
    goal: "Post-travel fatigue",
    dosha: "Pitta dominant",
    defaultPlan: "rejuvenation"
  }
];

const plans = {
  rejuvenation: {
    label: "Rejuvenation Protocol",
    duration: 75,
    sequence: [
      {
        therapy: "Abhyanga",
        stage: "Snehana",
        pre: ["Light warm meal 3 hours before therapy", "Avoid cold drinks and heavy exertion", "Share current sleep and appetite status"],
        post: ["Rest for 45 minutes", "Sip warm water", "Avoid cold shower, heavy food, and late travel"]
      },
      {
        therapy: "Swedana",
        stage: "Sudation",
        pre: ["Hydrate before arrival", "Avoid alcohol and chilled beverages", "Confirm blood pressure at check-in"],
        post: ["Stay warm for the next 2 hours", "Choose light cooked food", "Report dizziness, fatigue, or excessive sweating"]
      },
      {
        therapy: "Shirodhara",
        stage: "Nervous system support",
        pre: ["Keep scalp free from styling products", "Take a light meal", "Reduce screen exposure before therapy"],
        post: ["Avoid direct sun and loud environments", "Delay strenuous work", "Track sleep quality that night"]
      }
    ],
    milestones: ["Clinical intake", "Oil therapy rhythm", "Deep relaxation", "Recovery review"]
  },
  detox: {
    label: "Detox and Digestive Reset",
    duration: 90,
    sequence: [
      {
        therapy: "Deepana-Pachana",
        stage: "Digestive preparation",
        pre: ["Follow assigned warm diet", "Avoid dairy and fried food", "Log bowel pattern before arrival"],
        post: ["Continue light warm meals", "Avoid snacking between meals", "Report acidity, nausea, or bloating"]
      },
      {
        therapy: "Abhyanga and Swedana",
        stage: "Snehana-Swedana",
        pre: ["Arrive hydrated", "Avoid heavy meals", "Bring current medication list"],
        post: ["Rest in a warm room", "Avoid cold water and raw salads", "Track body heaviness and appetite"]
      },
      {
        therapy: "Virechana Support",
        stage: "Elimination support",
        pre: ["Follow physician diet plan", "Keep the day free from travel", "Confirm emergency contact availability"],
        post: ["Begin recovery diet as advised", "Monitor hydration and bowel response", "Notify clinic for cramps or weakness"]
      }
    ],
    milestones: ["Agni baseline", "Mobilization phase", "Elimination day", "Samsarjana diet"]
  },
  chronicPain: {
    label: "Pain and Mobility Care",
    duration: 70,
    sequence: [
      {
        therapy: "Patra Pinda Sweda",
        stage: "Localized relief",
        pre: ["Share pain score and stiffness area", "Avoid pain balms before therapy", "Wear comfortable clothing"],
        post: ["Keep treated area warm", "Avoid sudden lifting", "Track mobility and soreness for 24 hours"]
      },
      {
        therapy: "Kati Basti",
        stage: "Joint and spine support",
        pre: ["Report numbness or radiating pain", "Avoid heavy meal", "Confirm comfortable therapy position"],
        post: ["Avoid bending for 2 hours", "Use warm compress only if advised", "Log pain score before sleep"]
      },
      {
        therapy: "Matra Basti",
        stage: "Vata regulation",
        pre: ["Follow light diet", "Clear schedule after therapy", "Report bowel pattern and abdominal discomfort"],
        post: ["Rest and stay warm", "Avoid raw foods and cold beverages", "Contact clinic for discomfort or unusual symptoms"]
      }
    ],
    milestones: ["Pain baseline", "Mobility gain", "Vata regulation", "Functional review"]
  }
};

const dom = {};
let state = loadState();

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", debounce(() => drawTrendChart(), 120));

function init() {
  bindDom();
  populateSelects();
  bindEvents();
  syncFormWithPatient();
  normalizeSelection();
  render();
}

function bindDom() {
  dom.metricSessions = document.getElementById("metricSessions");
  dom.metricReminders = document.getElementById("metricReminders");
  dom.metricRecovery = document.getElementById("metricRecovery");
  dom.nextSessionCard = document.getElementById("nextSessionCard");
  dom.patientList = document.getElementById("patientList");
  dom.patientSelect = document.getElementById("patientSelect");
  dom.practitionerSelect = document.getElementById("practitionerSelect");
  dom.planSelect = document.getElementById("planSelect");
  dom.startDate = document.getElementById("startDate");
  dom.startTime = document.getElementById("startTime");
  dom.sessionCountInput = document.getElementById("sessionCountInput");
  dom.frequencySelect = document.getElementById("frequencySelect");
  dom.scheduleForm = document.getElementById("scheduleForm");
  dom.sessionSummary = document.getElementById("sessionSummary");
  dom.sessionList = document.getElementById("sessionList");
  dom.progressRing = document.getElementById("progressRing");
  dom.progressValue = document.getElementById("progressValue");
  dom.progressPatient = document.getElementById("progressPatient");
  dom.progressNote = document.getElementById("progressNote");
  dom.trendChart = document.getElementById("trendChart");
  dom.milestoneList = document.getElementById("milestoneList");
  dom.feedbackForm = document.getElementById("feedbackForm");
  dom.feedbackSession = document.getElementById("feedbackSession");
  dom.reliefInput = document.getElementById("reliefInput");
  dom.sleepInput = document.getElementById("sleepInput");
  dom.digestionInput = document.getElementById("digestionInput");
  dom.sideEffectInput = document.getElementById("sideEffectInput");
  dom.feedbackNotes = document.getElementById("feedbackNotes");
  dom.selectedChannels = document.getElementById("selectedChannels");
  dom.selectedTherapy = document.getElementById("selectedTherapy");
  dom.selectedMeta = document.getElementById("selectedMeta");
  dom.preList = document.getElementById("preList");
  dom.postList = document.getElementById("postList");
  dom.alertTimeline = document.getElementById("alertTimeline");
}

function populateSelects() {
  dom.patientSelect.innerHTML = patients.map((patient) => (
    `<option value="${patient.id}">${escapeHtml(patient.name)} - ${escapeHtml(patient.goal)}</option>`
  )).join("");

  dom.practitionerSelect.innerHTML = practitioners.map((practitioner) => (
    `<option value="${practitioner.id}">${escapeHtml(practitioner.name)} - ${escapeHtml(practitioner.role)}</option>`
  )).join("");

  dom.planSelect.innerHTML = Object.entries(plans).map(([key, plan]) => (
    `<option value="${key}">${escapeHtml(plan.label)}</option>`
  )).join("");
}

function bindEvents() {
  dom.patientSelect.addEventListener("change", () => {
    state.selectedPatientId = dom.patientSelect.value;
    syncFormWithPatient(false);
    normalizeSelection();
    saveState();
    render();
  });

  dom.practitionerSelect.addEventListener("change", () => {
    if (state.viewMode === "practitioner") {
      normalizeSelection();
      saveState();
      render();
    }
  });

  dom.patientList.addEventListener("click", (event) => {
    const card = event.target.closest("[data-patient-id]");
    if (!card) return;
    state.selectedPatientId = card.dataset.patientId;
    syncFormWithPatient(false);
    normalizeSelection();
    saveState();
    render();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.viewMode = button.dataset.view;
      document.querySelectorAll("[data-view]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      normalizeSelection();
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
      });
      normalizeSelection();
      saveState();
      render();
    });
  });

  dom.scheduleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const channels = getFormChannels();
    const patientId = dom.patientSelect.value;
    const newSessions = createSchedule({
      patientId,
      practitionerId: dom.practitionerSelect.value,
      planKey: dom.planSelect.value,
      startDate: dom.startDate.value,
      startTime: dom.startTime.value,
      count: Number(dom.sessionCountInput.value),
      frequency: Number(dom.frequencySelect.value),
      channels: channels.length ? channels : ["In-app"]
    });

    state.sessions = state.sessions.filter((session) => (
      session.patientId !== patientId || session.status === "completed"
    )).concat(newSessions);
    state.selectedPatientId = patientId;
    state.selectedSessionId = newSessions[0]?.id || state.selectedSessionId;
    saveState();
    render();
  });

  dom.sessionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const card = event.target.closest("[data-session-id]");
    const session = card ? findSession(card.dataset.sessionId) : null;
    if (!session) return;

    if (button.dataset.action === "select") {
      state.selectedSessionId = session.id;
    }

    if (button.dataset.action === "complete") {
      session.status = "needs-feedback";
      state.selectedSessionId = session.id;
    }

    if (button.dataset.action === "delay") {
      shiftSession(session, DAY_MS);
      session.status = session.status === "completed" ? "completed" : "scheduled";
      state.selectedSessionId = session.id;
    }

    saveState();
    render();
  });

  dom.sessionList.addEventListener("change", (event) => {
    if (!event.target.matches("[data-session-time]")) return;
    const card = event.target.closest("[data-session-id]");
    const session = card ? findSession(card.dataset.sessionId) : null;
    if (!session || !event.target.value) return;
    const start = new Date(event.target.value);
    const plan = plans[session.planKey];
    session.start = start.toISOString();
    session.end = new Date(start.getTime() + plan.duration * 60 * 1000).toISOString();
    state.selectedSessionId = session.id;
    saveState();
    render();
  });

  dom.feedbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const session = findSession(dom.feedbackSession.value);
    if (!session) return;

    const relief = Number(dom.reliefInput.value);
    const sleep = Number(dom.sleepInput.value);
    const digestion = Number(dom.digestionInput.value);
    const sideEffects = Number(dom.sideEffectInput.value);
    const score = Math.round(((relief + sleep + digestion + (10 - sideEffects)) / 40) * 100);

    session.status = "completed";
    session.feedback = {
      relief,
      sleep,
      digestion,
      sideEffects,
      score,
      notes: dom.feedbackNotes.value.trim(),
      savedAt: new Date().toISOString()
    };
    state.selectedSessionId = session.id;

    const history = state.responses[session.patientId] || [];
    state.responses[session.patientId] = history.concat(score).slice(-8);

    if (sideEffects >= 6) {
      adaptCarePlan(session, sideEffects);
    }

    dom.feedbackNotes.value = "";
    saveState();
    render();
  });
}

function render() {
  renderControlState();
  renderMetrics();
  renderPatients();
  renderSessions();
  renderProgress();
  renderFeedbackSelect();
  renderNotifications();
}

function renderControlState() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.viewMode);
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.filter);
  });
}

function renderMetrics() {
  const now = new Date();
  const activeSessions = state.sessions.filter((session) => session.status !== "cancelled");
  const upcoming = activeSessions.filter((session) => new Date(session.start) >= now && session.status !== "completed");
  const withReminders = activeSessions.filter((session) => session.channels.length > 0);
  const reminderCoverage = activeSessions.length
    ? Math.round((withReminders.length / activeSessions.length) * 100)
    : 0;
  const recoveryScores = Object.values(state.responses)
    .map((series) => series[series.length - 1])
    .filter((score) => Number.isFinite(score));
  const recovery = recoveryScores.length
    ? Math.round(recoveryScores.reduce((sum, score) => sum + score, 0) / recoveryScores.length)
    : 0;

  dom.metricSessions.textContent = upcoming.length;
  dom.metricReminders.textContent = `${reminderCoverage}%`;
  dom.metricRecovery.textContent = `${recovery}%`;

  const next = upcoming.sort(byStartDate)[0];
  if (!next) {
    dom.nextSessionCard.innerHTML = `
      <span class="eyebrow">Next Session</span>
      <strong>No upcoming therapy</strong>
      <span>Schedule generation is ready.</span>
    `;
    return;
  }

  dom.nextSessionCard.innerHTML = `
    <span class="eyebrow">Next Session</span>
    <strong>${escapeHtml(next.therapy)}</strong>
    <span>${escapeHtml(getPatient(next.patientId).name)} with ${escapeHtml(getPractitioner(next.practitionerId).name)} at ${formatDateTime(next.start)}</span>
  `;
}

function renderPatients() {
  dom.patientList.innerHTML = patients.map((patient) => {
    const patientSessions = state.sessions.filter((session) => session.patientId === patient.id && session.status !== "cancelled");
    const next = patientSessions.filter((session) => new Date(session.start) >= new Date() && session.status !== "completed").sort(byStartDate)[0];
    const active = patient.id === state.selectedPatientId ? "active" : "";
    return `
      <button class="patient-card ${active}" type="button" data-patient-id="${patient.id}">
        <strong>${escapeHtml(patient.name)}</strong>
        <span>${patient.age} yrs - ${escapeHtml(patient.goal)}</span>
        <small>${escapeHtml(patient.dosha)}${next ? ` - Next: ${escapeHtml(next.therapy)}` : " - Plan ready"}</small>
      </button>
    `;
  }).join("");
}

function renderSessions() {
  const sessions = getVisibleSessions();
  dom.sessionSummary.textContent = `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"} shown`;

  if (!sessions.length) {
    dom.sessionList.innerHTML = `<div class="empty-state">No sessions in this view.</div>`;
    return;
  }

  dom.sessionList.innerHTML = sessions.map((session) => {
    const patient = getPatient(session.patientId);
    const practitioner = getPractitioner(session.practitionerId);
    const selected = session.id === state.selectedSessionId ? "selected" : "";
    const statusClass = session.status === "needs-feedback" ? "needs-feedback" : session.status;
    const statusLabel = session.status === "needs-feedback" ? "Feedback due" : titleCase(session.status);
    const statusTone = session.status === "needs-feedback" ? "coral" : session.status === "completed" ? "" : "saffron";
    const channelTags = session.channels.map((channel) => `<span class="tag">${escapeHtml(channel)}</span>`).join("");

    return `
      <article class="session-card ${selected} ${statusClass}" data-session-id="${session.id}">
        <div class="session-title">
          <strong>${escapeHtml(session.therapy)}</strong>
          <span>${escapeHtml(plans[session.planKey].label)} - ${escapeHtml(session.stage)}</span>
          <div class="tag-row">
            <span class="tag ${statusTone}">${statusLabel}</span>
            ${channelTags}
          </div>
        </div>
        <div class="session-meta">
          <span>${escapeHtml(patient.name)} - ${escapeHtml(patient.goal)}</span>
          <span>${escapeHtml(practitioner.name)} - ${escapeHtml(practitioner.role)}</span>
          <span>${formatDateTime(session.start)} - ${formatTime(session.end)}</span>
        </div>
        <div class="session-actions">
          <input aria-label="Modify session time" data-session-time type="datetime-local" value="${toDateTimeLocal(session.start)}">
          <button type="button" data-action="select">View</button>
          <button type="button" data-action="delay">+1 day</button>
          <button type="button" data-action="complete">Done</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderProgress() {
  const patient = getPatient(state.selectedPatientId);
  const history = state.responses[patient.id] || [60];
  const current = history[history.length - 1] || 0;
  const previous = history[history.length - 2] ?? current;
  const delta = current - previous;
  const patientSessions = state.sessions.filter((session) => session.patientId === patient.id && session.status !== "cancelled");
  const completed = patientSessions.filter((session) => session.status === "completed").length;
  const total = Math.max(patientSessions.length, 1);

  dom.progressRing.style.setProperty("--progress", current);
  dom.progressValue.textContent = `${current}%`;
  dom.progressPatient.textContent = `${patient.name} response`;
  dom.progressNote.textContent = `${completed}/${total} sessions completed, ${formatDelta(delta)} response shift`;

  renderMilestones(patientSessions, completed, total);
  drawTrendChart();
}

function renderMilestones(patientSessions, completed, total) {
  const selectedSession = findSession(state.selectedSessionId);
  const plan = selectedSession ? plans[selectedSession.planKey] : plans[getPatient(state.selectedPatientId).defaultPlan];
  const progressRatio = completed / total;
  const currentIndex = Math.min(plan.milestones.length - 1, Math.floor(progressRatio * plan.milestones.length));

  dom.milestoneList.innerHTML = plan.milestones.map((milestone, index) => {
    const done = index < currentIndex || completed === total;
    const current = !done && index === currentIndex;
    const className = done ? "done" : current ? "current" : "";
    const label = done ? "Complete" : current ? "Active" : "Upcoming";
    return `
      <div class="milestone-item ${className}">
        <span class="milestone-dot" aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(milestone)}</strong>
          <span>${label}</span>
        </div>
      </div>
    `;
  }).join("");
}

function renderFeedbackSelect() {
  const options = state.sessions
    .filter((session) => session.patientId === state.selectedPatientId && session.status !== "cancelled")
    .sort(byStartDate);

  dom.feedbackSession.innerHTML = options.map((session) => (
    `<option value="${session.id}">${escapeHtml(session.therapy)} - ${formatShortDate(session.start)}</option>`
  )).join("");

  if (options.some((session) => session.id === state.selectedSessionId)) {
    dom.feedbackSession.value = state.selectedSessionId;
  }
}

function renderNotifications() {
  const session = findSession(state.selectedSessionId) || getVisibleSessions()[0];
  if (!session) {
    dom.selectedTherapy.textContent = "No therapy selected";
    dom.selectedMeta.textContent = "Active schedule details";
    dom.selectedChannels.innerHTML = "";
    dom.preList.innerHTML = "";
    dom.postList.innerHTML = "";
    dom.alertTimeline.innerHTML = `<div class="empty-state">No alerts scheduled.</div>`;
    return;
  }

  const patient = getPatient(session.patientId);
  const practitioner = getPractitioner(session.practitionerId);
  state.selectedSessionId = session.id;
  dom.selectedTherapy.textContent = session.therapy;
  dom.selectedMeta.textContent = `${patient.name} - ${formatDateTime(session.start)} - ${practitioner.name}`;
  dom.selectedChannels.innerHTML = session.channels.map((channel) => (
    `<span class="tag">${escapeHtml(channel)}</span>`
  )).join("");
  dom.preList.innerHTML = session.pre.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  dom.postList.innerHTML = session.post.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  const start = new Date(session.start);
  const end = new Date(session.end);
  const alerts = [
    { title: "Pre-care reminder", time: new Date(start.getTime() - DAY_MS), detail: "Diet, hydration, medication check" },
    { title: "Arrival reminder", time: new Date(start.getTime() - 2 * 60 * 60 * 1000), detail: "Check-in, vitals, active symptoms" },
    { title: "Post-care guidance", time: new Date(end.getTime() + 30 * 60 * 1000), detail: "Rest, warmth, diet, side-effect watch" },
    { title: "Recovery check", time: new Date(end.getTime() + 8 * 60 * 60 * 1000), detail: "Feedback request and milestone update" }
  ];

  dom.alertTimeline.innerHTML = alerts.map((alert) => `
    <div class="alert-item">
      <strong>${escapeHtml(alert.title)}</strong>
      <span>${formatDateTime(alert.time)} - ${escapeHtml(alert.detail)}</span>
    </div>
  `).join("");
}

function drawTrendChart() {
  if (!dom.trendChart) return;
  const canvas = dom.trendChart;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, rect.width);
  const height = Math.max(150, rect.height);
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const history = state.responses[state.selectedPatientId] || [60, 64, 68];
  const padding = { left: 34, right: 18, top: 20, bottom: 28 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.strokeStyle = "#d9e2de";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (chartHeight / 4) * index;
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
  }
  ctx.stroke();

  ctx.fillStyle = "#64706f";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("100", 4, padding.top + 4);
  ctx.fillText("50", 10, padding.top + chartHeight / 2 + 4);
  ctx.fillText("0", 18, padding.top + chartHeight + 4);

  const points = history.map((value, index) => {
    const x = padding.left + (history.length === 1 ? chartWidth : (chartWidth / (history.length - 1)) * index);
    const y = padding.top + chartHeight - (value / 100) * chartHeight;
    return { x, y, value };
  });

  const gradient = ctx.createLinearGradient(padding.left, 0, width - padding.right, 0);
  gradient.addColorStop(0, "#247b89");
  gradient.addColorStop(0.6, "#2f6f5e");
  gradient.addColorStop(1, "#d8902f");

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2f6f5e";
    ctx.stroke();
  });

  ctx.fillStyle = "#1d2626";
  ctx.font = "700 12px system-ui, sans-serif";
  const last = points[points.length - 1];
  ctx.fillText(`${last.value}%`, Math.min(last.x + 8, width - 54), Math.max(last.y - 8, 18));
}

function syncFormWithPatient(useDefaults = true) {
  const patient = getPatient(state.selectedPatientId);
  dom.patientSelect.value = patient.id;
  dom.planSelect.value = patient.defaultPlan;

  if (useDefaults || !dom.startDate.value) {
    const tomorrow = new Date(Date.now() + DAY_MS);
    dom.startDate.value = toDateInput(tomorrow);
  }

  if (useDefaults || !dom.startTime.value) {
    dom.startTime.value = "09:30";
  }

  const upcoming = state.sessions
    .filter((session) => session.patientId === patient.id && session.status !== "cancelled" && new Date(session.start) >= new Date())
    .sort(byStartDate)[0];

  if (upcoming) {
    dom.practitionerSelect.value = upcoming.practitionerId;
    dom.planSelect.value = upcoming.planKey;
  }
}

function normalizeSelection() {
  const visible = getVisibleSessions();
  const selectedVisible = visible.some((session) => session.id === state.selectedSessionId);
  if (!selectedVisible) {
    state.selectedSessionId = visible[0]?.id || state.sessions.find((session) => session.patientId === state.selectedPatientId)?.id || "";
  }
}

function getVisibleSessions() {
  let sessions = state.sessions.filter((session) => session.status !== "cancelled");

  if (state.viewMode === "practitioner") {
    sessions = sessions.filter((session) => session.practitionerId === dom.practitionerSelect.value);
  } else {
    sessions = sessions.filter((session) => session.patientId === state.selectedPatientId);
  }

  if (state.filter === "today") {
    sessions = sessions.filter((session) => isSameDay(new Date(session.start), new Date()));
  }

  if (state.filter === "feedback") {
    sessions = sessions.filter((session) => session.status === "needs-feedback");
  }

  return sessions.sort(byStartDate);
}

function createSchedule({ patientId, practitionerId, planKey, startDate, startTime, count, frequency, channels }) {
  const plan = plans[planKey];
  const start = parseLocalDateTime(startDate, startTime);
  const safeCount = Math.max(3, Math.min(21, Number.isFinite(count) ? count : 7));
  const safeFrequency = Math.max(1, Number.isFinite(frequency) ? frequency : 1);

  return Array.from({ length: safeCount }, (_, index) => {
    const therapy = plan.sequence[index % plan.sequence.length];
    const sessionStart = new Date(start.getTime() + index * safeFrequency * DAY_MS);
    const sessionEnd = new Date(sessionStart.getTime() + plan.duration * 60 * 1000);
    const progressPoint = Math.min(plan.milestones.length - 1, Math.floor((index / safeCount) * plan.milestones.length));

    return {
      id: createId(),
      patientId,
      practitionerId,
      planKey,
      therapy: therapy.therapy,
      stage: therapy.stage,
      start: sessionStart.toISOString(),
      end: sessionEnd.toISOString(),
      status: "scheduled",
      channels,
      pre: [...therapy.pre],
      post: [...therapy.post],
      milestone: plan.milestones[progressPoint],
      createdAt: new Date().toISOString()
    };
  });
}

function createDefaultState() {
  const first = createSchedule({
    patientId: "asha",
    practitionerId: "kavya",
    planKey: "rejuvenation",
    startDate: toDateInput(new Date()),
    startTime: "09:30",
    count: 7,
    frequency: 1,
    channels: ["In-app", "SMS", "Email"]
  });
  first[0].status = "completed";
  first[0].feedback = { relief: 7, sleep: 7, digestion: 6, sideEffects: 1, score: 72 };
  first[1].status = "needs-feedback";

  const second = createSchedule({
    patientId: "vikram",
    practitionerId: "meera",
    planKey: "detox",
    startDate: toDateInput(new Date(Date.now() + DAY_MS)),
    startTime: "11:00",
    count: 6,
    frequency: 1,
    channels: ["In-app", "SMS"]
  });

  const third = createSchedule({
    patientId: "naina",
    practitionerId: "rehan",
    planKey: "chronicPain",
    startDate: toDateInput(new Date(Date.now() + 2 * DAY_MS)),
    startTime: "15:00",
    count: 5,
    frequency: 2,
    channels: ["In-app", "Email"]
  });

  return {
    selectedPatientId: "asha",
    selectedSessionId: first[1].id,
    viewMode: "patient",
    filter: "all",
    sessions: first.concat(second, third),
    responses: {
      asha: [58, 62, 66, 72],
      vikram: [52, 55, 59],
      naina: [46, 50, 57],
      farah: [64, 67, 69]
    }
  };
}

function adaptCarePlan(session, sideEffects) {
  const hasReview = state.sessions.some((item) => item.parentSessionId === session.id);
  session.post = uniqueList(session.post.concat([
    "Extend rest window to 24 hours",
    "Practitioner review required before next intensive therapy"
  ]));

  const nextSession = state.sessions
    .filter((item) => (
      item.patientId === session.patientId &&
      item.status === "scheduled" &&
      new Date(item.start) > new Date(session.start)
    ))
    .sort(byStartDate)[0];

  if (nextSession) {
    shiftSession(nextSession, DAY_MS);
    nextSession.pre = uniqueList(nextSession.pre.concat([
      "Confirm side-effect recovery before check-in",
      "Use gentler heat intensity unless physician approves"
    ]));
  }

  if (!hasReview) {
    const reviewStart = new Date(new Date(session.end).getTime() + DAY_MS);
    reviewStart.setHours(10, 30, 0, 0);
    const reviewEnd = new Date(reviewStart.getTime() + 30 * 60 * 1000);
    state.sessions.push({
      id: createId(),
      parentSessionId: session.id,
      patientId: session.patientId,
      practitionerId: "kavya",
      planKey: session.planKey,
      therapy: "Clinical review and recovery check",
      stage: `Side-effect score ${sideEffects}/10`,
      start: reviewStart.toISOString(),
      end: reviewEnd.toISOString(),
      status: "scheduled",
      channels: session.channels,
      pre: ["Share symptom log before the review", "Avoid new diet changes until review"],
      post: ["Follow updated precautions", "Continue recovery tracking for the next session"],
      milestone: "Care adjustment",
      createdAt: new Date().toISOString()
    });
  }
}

function shiftSession(session, amountMs) {
  const start = new Date(session.start);
  const end = new Date(session.end);
  session.start = new Date(start.getTime() + amountMs).toISOString();
  session.end = new Date(end.getTime() + amountMs).toISOString();
}

function getFormChannels() {
  return Array.from(dom.scheduleForm.querySelectorAll('input[name="channel"]:checked'))
    .map((input) => input.value);
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultState();
    const parsed = JSON.parse(stored);
    if (!parsed || !Array.isArray(parsed.sessions) || !parsed.responses) return createDefaultState();
    return parsed;
  } catch (error) {
    return createDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to save local schedule state", error);
  }
}

function getPatient(id) {
  return patients.find((patient) => patient.id === id) || patients[0];
}

function getPractitioner(id) {
  return practitioners.find((practitioner) => practitioner.id === id) || practitioners[0];
}

function findSession(id) {
  return state.sessions.find((session) => session.id === id);
}

function parseLocalDateTime(dateValue, timeValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function toDateInput(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeLocal(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDelta(delta) {
  if (delta > 0) return `+${delta}%`;
  if (delta < 0) return `${delta}%`;
  return "0%";
}

function byStartDate(a, b) {
  return new Date(a.start) - new Date(b.start);
}

function isSameDay(left, right) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function createId() {
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function uniqueList(items) {
  return Array.from(new Set(items));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}
