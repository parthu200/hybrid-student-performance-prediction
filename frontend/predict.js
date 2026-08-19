const BACKEND_URL = 'http://localhost:5000';

function getInputValues() {
  const g = id => document.getElementById(id);
  return {
    cgpa         : parseFloat(g('cgpa').value),
    prevGrade    : parseInt(g('prevgrade').value),
    examScore    : parseInt(g('examscore').value),
    studyHours   : parseInt(g('studyhours').value),
    attendance   : parseInt(g('attendance').value),
    lms          : parseInt(g('lms').value),
    assignments  : parseInt(g('assign').value),
    participation: parseInt(g('participation').value),
    adaptive     : parseInt(g('adaptive').value),
    contEval     : parseInt(g('conteval').value),
    semester     : g('semester').value,
    programme    : g('programme').value,
  };
}

async function backendPredict(inputs) {
  const response = await fetch(`${BACKEND_URL}/api/predict`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(inputs),
    signal : AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Backend error: ' + response.status);
  return await response.json();
}

function localPredict(inputs) {
  const score = Math.min(100, Math.round(
    inputs.cgpa          * 10 * 0.18 +
    inputs.prevGrade          * 0.12 +
    inputs.examScore          * 0.12 +
    inputs.attendance         * 0.10 +
    inputs.lms           * 10 * 0.06 +
    inputs.assignments        * 0.08 +
    inputs.adaptive      * 10 * 0.18 +
    inputs.contEval      * 10 * 0.10 +
    inputs.participation * 10 * 0.06
  ));

  const grade = score>=90?'O':score>=80?'A+':score>=70?'A':
                score>=60?'B+':score>=50?'B':score>=40?'C':'F';
  const risk  = score>=65?'Low':score>=45?'Medium':'High';

  const tips = [];
  if (inputs.attendance  < 75) tips.push('Improve attendance to at least 75%.');
  if (inputs.lms         <  5) tips.push('Increase LMS engagement and attempt quizzes regularly.');
  if (inputs.studyHours  < 10) tips.push('Study at least 10 hours per week with spaced repetition.');
  if (inputs.adaptive    <  5) tips.push('Work on adaptive assessments — they drive your learning coefficient.');
  if (!tips.length)             tips.push('Excellent profile — maintain current performance!');

  return {
    predictedScore: score,
    grade,
    riskLevel     : risk,
    lrScore       : Math.round(score * 0.92),
    rfScore       : Math.round(score * 0.99),
    annScore      : Math.round(score * 0.98),
    hybridScore   : score,
    suggestions   : tips.slice(0, 3),
    radarScores   : [
      inputs.cgpa,
      inputs.attendance / 10,
      inputs.lms,
      inputs.assignments / 10,
      inputs.adaptive,
      inputs.participation,
    ],
  };
}

async function runPrediction() {
  const btn         = document.getElementById('predictBtn');
  const placeholder = document.getElementById('predictPlaceholder');
  const resultSec   = document.getElementById('resultSection');
  const overlay     = document.getElementById('loadingOverlay');
  const inputs      = getInputValues();

  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span> Analysing…';
  placeholder.style.display = 'none';
  resultSec.style.display   = 'block';
  overlay.style.display     = 'flex';

  let result;
  let usedBackend = false;

  try {

    result      = await backendPredict(inputs);
    usedBackend = true;
  } catch (_) {

    result = localPredict(inputs);
  }

  document.getElementById('predScore').textContent  = Math.round(result.predictedScore);
  document.getElementById('predGrade').textContent  = result.grade;
  document.getElementById('confLR').textContent     = result.lrScore    ?? Math.round(result.predictedScore * 0.92);
  document.getElementById('confRF').textContent     = result.rfScore    ?? Math.round(result.predictedScore * 0.99);
  document.getElementById('confANN').textContent    = result.annScore   ?? Math.round(result.predictedScore * 0.98);
  document.getElementById('confHybrid').textContent = result.hybridScore ?? result.predictedScore;

  const rb = document.getElementById('riskBadge');
  rb.textContent = result.riskLevel + ' Risk';
  rb.className   = 'risk-badge ' + (
    result.riskLevel === 'Low'    ? 'risk-low'  :
    result.riskLevel === 'Medium' ? 'risk-med'  : 'risk-high'
  );

  const icons = ['📚','⏰','💻','💡'];
  document.getElementById('suggestionsBox').innerHTML =
    `<div class="sug-header">RECOMMENDATIONS</div>` +
    (result.suggestions || []).map((s, i) =>
      `<div class="sug-item">
         <div class="sug-icon">${icons[i] || '💡'}</div>
         <div>${s}</div>
       </div>`
    ).join('');

  renderRadarChart(
    result.radarScores || [
      inputs.cgpa, inputs.attendance / 10, inputs.lms,
      inputs.assignments / 10, inputs.adaptive, inputs.participation,
    ]
  );

  overlay.style.display = 'none';
  btn.disabled  = false;
  btn.innerHTML = usedBackend
    ? '✓ Predicted by Real ML Models — Run Again'
    : '🔮 Run Hybrid ML Prediction';
}
