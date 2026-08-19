function showTab(tab, btn) {
  ['dashboard','predict','analytics','upload','about'].forEach(t => {
    document.getElementById('tab-' + t).style.display = (t === tab) ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (tab === 'analytics') {
    buildConfusionMatrix();
    renderTrainingChart();
    renderDistChart();
    renderMultiChart();
  }
}

function buildRangeField(f) {
  return `
    <div class="field">
      <label for="${f.id}">${f.label}</label>
      <div class="range-wrap">
        <input type="range" id="${f.id}"
          min="${f.min}" max="${f.max}" step="${f.step}" value="${f.def}"
          oninput="document.getElementById('${f.id}-v').textContent = (${f.fmt.toString()})(this.value)" />
        <div class="range-val" id="${f.id}-v">${f.fmt(f.def)}</div>
      </div>
    </div>`;
}

function buildSelectField(f) {
  const opts = f.options.map(o =>
    `<option value="${o.value}"${o.value === f.def ? ' selected' : ''}>${o.label}</option>`
  ).join('');
  return `
    <div class="field">
      <label for="${f.id}">${f.label}</label>
      <select id="${f.id}">${opts}</select>
    </div>`;
}

function buildFormFields(containerId, fields) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = fields.map(f =>
    f.type === 'select' ? buildSelectField(f) : buildRangeField(f)
  ).join('');
}

function buildModelTable() {
  const tbody = document.getElementById('modelTableBody');
  if (!tbody) return;
  tbody.innerHTML = MODEL_DATA.map((m, i) => {
    const pct = ((m.acc - 85) / (97 - 85) * 100).toFixed(1);
    return `
      <tr>
        <td>${m.name}</td>
        <td>${m.acc}%</td>
        <td>${m.prec}</td>
        <td>${m.rec}</td>
        <td>${m.f1}</td>
        <td style="min-width:100px">
          <div class="acc-bar">
            <div class="acc-fill" style="width:${pct}%;background:${MODEL_COLORS[i]}"></div>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function buildTags() {
  const el = document.getElementById('tagContainer');
  if (!el) return;
  el.innerHTML = INDEX_TERMS.map(t => `<span class="tag">${t}</span>`).join('');
}

function buildPipeline() {
  const el = document.getElementById('pipelineContainer');
  if (!el) return;
  el.innerHTML = PIPELINE_STEPS.map((step, i) => `
    <div class="pipeline-step">
      <div class="pipeline-icon" style="background:${step.color};border:1px solid ${step.border}">
        ${step.icon}
      </div>
      <div style="flex:1">
        <div class="pipeline-name">${step.name}</div>
        <div class="pipeline-sub">${step.sub}</div>
      </div>
      ${i < PIPELINE_STEPS.length - 1
        ? `<div class="pipeline-arrow" style="color:var(--${step.arrow})">→</div>`
        : `<div class="pipeline-arrow" style="color:var(--green)">✓</div>`}
    </div>`
  ).join('');
}

function buildGaps() {
  const el = document.getElementById('gapsContainer');
  if (!el) return;
  el.innerHTML = RESEARCH_GAPS.map(g => `
    <div class="gap-item">
      <span class="gap-dot" style="background:${g.dot}"></span>
      <span>${g.text}</span>
    </div>`
  ).join('');
}

function buildRefs() {
  const el = document.getElementById('refsContainer');
  if (!el) return;
  el.innerHTML = REFERENCES.map(r => `<div class="ref-item">${r}</div>`).join('');
}

(function init() {

  buildFormFields('academicInputs',  ACADEMIC_FIELDS);
  buildFormFields('behavioralInputs',BEHAVIORAL_FIELDS);
  buildFormFields('learningInputs',  LEARNING_FIELDS);
  buildFormFields('metaInputs',      META_FIELDS);

  buildModelTable();
  renderAccuracyChart();
  renderPieChart();

  buildTags();
  buildPipeline();
  buildGaps();
  buildRefs();
})();
