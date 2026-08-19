const _charts = {};

function destroyChart(id) {
  if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
}

function renderAccuracyChart() {
  if (_charts['accChart']) return;
  const ctx = document.getElementById('accChart').getContext('2d');
  _charts['accChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Lin. Reg', 'Dec. Tree', 'Rnd. Forest', 'SVR', 'ANN', 'Hybrid'],
      datasets: [{
        label: 'Accuracy (%)',
        data: MODEL_DATA.map(m => m.acc),
        backgroundColor: MODEL_COLORS,
        borderRadius: 7,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + ctx.raw + '%' } },
      },
      scales: {
        y: {
          min: 85, max: 98,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 11 }, callback: v => v + '%' },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 11 } },
        },
      },
    },
  });
}

function renderPieChart() {
  if (_charts['pieChart']) return;
  const ctx = document.getElementById('pieChart').getContext('2d');
  _charts['pieChart'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: FEATURE_IMPORTANCE.map(f => f.label),
      datasets: [{
        data: FEATURE_IMPORTANCE.map(f => f.value),
        backgroundColor: FEATURE_IMPORTANCE.map(f => f.color),
        borderWidth: 0,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` } },
      },
    },
  });

  const container = document.getElementById('pieLegend');
  if (container) {
    container.innerHTML = FEATURE_IMPORTANCE.map(f =>
      `<div class="pie-legend-item">
        <span class="pie-legend-swatch" style="background:${f.color}"></span>
        ${f.label} <strong>${f.value}%</strong>
       </div>`
    ).join('');
  }
}

function renderTrainingChart() {
  if (_charts['trainChart']) return;
  const ctx = document.getElementById('trainChart').getContext('2d');
  _charts['trainChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: TRAINING_DATA.epochs,
      datasets: [
        {
          label: 'Training',
          data: TRAINING_DATA.training,
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0,212,170,0.08)',
          tension: 0.4,
          pointRadius: 4,
          fill: true,
        },
        {
          label: 'Testing',
          data: TRAINING_DATA.testing,
          borderColor: '#4f8ef7',
          backgroundColor: 'rgba(79,142,247,0.08)',
          tension: 0.4,
          pointRadius: 4,
          fill: true,
          borderDash: [5, 4],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } },
      },
      scales: {
        y: {
          min: 70, max: 100,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 11 }, callback: v => v + '%' },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 11 } },
          title: { display: true, text: 'Epoch', color: '#64748b', font: { size: 11 } },
        },
      },
    },
  });
}

function renderDistChart() {
  if (_charts['distChart']) return;
  const ctx = document.getElementById('distChart').getContext('2d');
  _charts['distChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DIST_DATA.labels,
      datasets: [{
        label: 'No. of Students',
        data: DIST_DATA.values,
        backgroundColor: 'rgba(79,142,247,0.7)',
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
      },
    },
  });
}

function renderMultiChart() {
  if (_charts['multiChart']) return;
  const ctx = document.getElementById('multiChart').getContext('2d');
  _charts['multiChart'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Lin. Reg', 'Dec. Tree', 'Rnd. Forest', 'SVR', 'ANN', 'Hybrid'],
      datasets: [
        { label: 'Accuracy',  data: MODEL_DATA.map(m => m.acc),  backgroundColor: 'rgba(0,212,170,0.8)',   borderRadius: 4 },
        { label: 'Precision', data: MODEL_DATA.map(m => m.prec), backgroundColor: 'rgba(79,142,247,0.8)',  borderRadius: 4 },
        { label: 'Recall',    data: MODEL_DATA.map(m => m.rec),  backgroundColor: 'rgba(245,158,11,0.8)', borderRadius: 4 },
        { label: 'F1-Score',  data: MODEL_DATA.map(m => m.f1),   backgroundColor: 'rgba(167,139,250,0.8)',borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#94a3b8', font: { size: 11 }, usePointStyle: true } },
      },
      scales: {
        y: {
          min: 80, max: 100,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#64748b', font: { size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { size: 11 } },
        },
      },
    },
  });
}

let radarChartInst = null;
function renderRadarChart(featureScores) {
  if (radarChartInst) { radarChartInst.destroy(); }
  const ctx = document.getElementById('radarChart').getContext('2d');
  radarChartInst = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['CGPA', 'Attendance', 'LMS Activity', 'Assignments', 'Adaptive', 'Participation'],
      datasets: [{
        label: 'Student Profile',
        data: featureScores,
        borderColor: '#00d4aa',
        backgroundColor: 'rgba(0,212,170,0.12)',
        pointBackgroundColor: '#00d4aa',
        borderWidth: 2,
        pointRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 10,
          grid: { color: 'rgba(255,255,255,0.08)' },
          angleLines: { color: 'rgba(255,255,255,0.08)' },
          ticks: { display: false },
          pointLabels: { color: '#94a3b8', font: { size: 10 } },
        },
      },
    },
  });
}

function buildConfusionMatrix() {
  const { tp, fp, fn, tn } = CONFUSION;
  const total = tp + fp + fn + tn;
  const accuracy  = ((tp + tn) / total * 100).toFixed(1);
  const precision = (tp / (tp + fp) * 100).toFixed(1);
  const recall    = (tp / (tp + fn) * 100).toFixed(1);

  document.getElementById('confusionMatrix').innerHTML = `
    <div class="cm-wrap">
      <div></div>
      <div class="cm-label">Pred: Pass</div>
      <div class="cm-label">Pred: Fail</div>

      <div class="cm-label">Act: Pass</div>
      <div class="cm-cell cm-tp"><div class="cm-val">${tp}</div><div class="cm-type">TP</div></div>
      <div class="cm-cell cm-fp"><div class="cm-val">${fp}</div><div class="cm-type">FP</div></div>

      <div class="cm-label">Act: Fail</div>
      <div class="cm-cell cm-fn"><div class="cm-val">${fn}</div><div class="cm-type">FN</div></div>
      <div class="cm-cell cm-tn"><div class="cm-val">${tn}</div><div class="cm-type">TN</div></div>
    </div>`;

  document.getElementById('cmStats').innerHTML = `
    <div class="cm-stat" style="background:rgba(0,212,170,.08)">
      <div style="font-size:16px;font-weight:700;color:#00d4aa">${accuracy}%</div>
      <div style="font-size:10px;color:#64748b">Accuracy</div>
    </div>
    <div class="cm-stat" style="background:rgba(79,142,247,.08)">
      <div style="font-size:16px;font-weight:700;color:#4f8ef7">${precision}%</div>
      <div style="font-size:10px;color:#64748b">Precision</div>
    </div>
    <div class="cm-stat" style="background:rgba(245,158,11,.08)">
      <div style="font-size:16px;font-weight:700;color:#f59e0b">${recall}%</div>
      <div style="font-size:10px;color:#64748b">Recall</div>
    </div>`;
}
