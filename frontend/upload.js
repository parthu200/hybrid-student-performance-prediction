'use strict';

let _parsedRows    = [];
let _resultRows    = [];
let _filteredRows  = [];
let _gradeChart    = null;
let _riskChart     = null;
let _scoreHistChart= null;

const REQUIRED_COLS = [
  'cgpa','prevgrade','examscore','studyhours',
  'attendance','lms','assignments','participation',
  'adaptive','conteval'
];

function downloadTemplate() {
  const lines = [
    'student_id,cgpa,prevGrade,examScore,studyHours,attendance,lms,assignments,participation,adaptive,contEval,semester,programme',
    'S001,8.2,78,74,18,85,7,90,7,7,8,4,BTech',
    'S002,6.5,61,58,10,72,5,75,5,5,6,3,BCA',
    'S003,9.1,88,91,25,95,9,98,9,9,9,5,MCA',
    'S004,5.3,48,44,8,60,4,65,4,4,5,2,BTech',
    'S005,7.8,75,70,20,82,8,88,8,8,7,6,MBA',
    'S006,4.2,35,38,5,50,3,55,3,3,4,1,BTech',
    'S007,8.8,85,82,22,91,8,93,8,8,8,7,BCA',
    'S008,7.0,68,65,14,78,6,80,6,6,7,4,MCA',
    'S009,3.5,28,30,3,40,2,45,2,2,3,3,BTech',
    'S010,9.5,92,95,30,98,10,100,10,10,10,5,MBA',
  ];
  _triggerDownload(lines.join('\n'), 'edupredict_template.csv', 'text/csv');
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.add('drag-over');
}
function handleDragLeave() {
  document.getElementById('dropZone').classList.remove('drag-over');
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) _processFile(file);
}
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) _processFile(file);
}

function _processFile(file) {
  if (!file.name.toLowerCase().endsWith('.csv'))
    return _uploadError('Only .csv files are supported.');
  if (file.size > 5 * 1024 * 1024)
    return _uploadError('File size exceeds 5 MB limit.');

  _setFileInfo(file.name, (file.size/1024).toFixed(1)+' KB', 'Parsing…');

  Papa.parse(file, {
    header: true, skipEmptyLines: true,
    complete: r  => _onParsed(r, file.name),
    error   : err => _uploadError('Parse error: ' + err.message),
  });
}

function _onParsed(result, fname) {
  const raw = result.data;
  if (!raw.length) return _uploadError('The CSV file is empty.');

  const rows = raw.map(r => {
    const out = {};
    Object.keys(r).forEach(k => { out[k.toLowerCase().trim()] = (r[k]||'').trim(); });
    return out;
  });

  const missing = REQUIRED_COLS.filter(c => !(c in rows[0]));
  if (missing.length)
    return _uploadError('Missing columns: ' + missing.join(', ') +
      '\n\nClick "Download CSV Template" to see the correct format.');

  _parsedRows = rows.slice(0, 500);

  _setFileInfo(fname,
    _parsedRows.length + ' rows found · Ready to predict',
    '✓ ' + _parsedRows.length + ' rows loaded');

  _buildPreviewTable(_parsedRows.slice(0, 5));
  document.getElementById('previewCount').textContent            = _parsedRows.length + ' rows';
  document.getElementById('previewSection').style.display        = 'block';
  document.getElementById('batchResultsSection').style.display   = 'none';

  const btn = document.getElementById('batchBtn');
  btn.disabled  = false;
  btn.innerHTML = '⚡ Run Batch Prediction';
}

function _buildPreviewTable(rows) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const th   = keys.map(k => '<th>'+k+'</th>').join('');
  const body = rows.map(r =>
    '<tr>' + keys.map(k => '<td>'+(r[k]||'')+'</td>').join('') + '</tr>'
  ).join('');
  document.getElementById('previewTable').innerHTML =
    '<thead><tr>'+th+'</tr></thead><tbody>'+body+'</tbody>';
}

async function runBatchPrediction() {
  if (!_parsedRows.length) return _uploadError('No data loaded. Upload a CSV first.');

  const btn = document.getElementById('batchBtn');
  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner" style="border-color:rgba(0,0,0,.2);border-top-color:#000"></span>&nbsp;Predicting…';

  _resultRows   = [];
  _filteredRows = [];
  _showProgress(0, _parsedRows.length);

  const useAPI = await _testAPI();
  _updateProgressLabel(useAPI
    ? 'Running real ML models (Flask backend)…'
    : 'Running local formula predictions…');

  for (let i = 0; i < _parsedRows.length; i++) {
    const inputs = _normaliseRow(_parsedRows[i]);
    let result;

    if (useAPI) {
      result = await _apiPredict(inputs).catch(() => _localScore(inputs));
    } else {
      result = _localScore(inputs);
    }

    _resultRows.push({
      rowNum     : i + 1,
      studentId  : _studentId(_parsedRows[i], i),
      cgpa       : inputs.cgpa,
      attendance : inputs.attendance,
      examScore  : inputs.examScore,
      lms        : inputs.lms,
      adaptive   : inputs.adaptive,
      studyHours : inputs.studyHours,
      assignments: inputs.assignments,
      ...result,
    });

    if ((i+1) % 10 === 0 || i === _parsedRows.length-1) {
      _updateProgress(i+1, _parsedRows.length);
      await new Promise(r => setTimeout(r, 0));
    }
  }

  _hideProgress();
  _filteredRows = [..._resultRows];
  _renderResults();

  btn.disabled  = false;
  btn.innerHTML = '✓ Done — Re-run Prediction';
}

async function _testAPI() {
  try {
    const r = await fetch('http://localhost:5000/api/health', {
      signal: AbortSignal.timeout(3000),
    });
    return r.ok;
  } catch { return false; }
}

async function _apiPredict(inp) {
  const r = await fetch('http://localhost:5000/api/predict', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(inp),
    signal : AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error('Backend error');
  return await r.json();
}

function _localScore(inp) {
  const raw = Math.min(100,
    inp.cgpa          * 10 * 0.18 +
    inp.prevGrade          * 0.12 +
    inp.examScore          * 0.12 +
    inp.attendance         * 0.10 +
    inp.lms           * 10 * 0.06 +
    inp.assignments        * 0.06 +
    inp.participation * 10 * 0.03 +
    inp.adaptive      * 10 * 0.18 +
    inp.contEval      * 10 * 0.10 +
    inp.studyHours    * (100/40) * 0.05
  );
  const score = Math.round(raw);
  const grade = score>=90?'O':score>=80?'A+':score>=70?'A':
                score>=60?'B+':score>=50?'B':score>=40?'C':'F';
  const risk  = score>=65?'Low':score>=45?'Medium':'High';

  const tips = [];
  if (inp.attendance  < 75) tips.push('Attendance below 75% — attend every session.');
  if (inp.lms         <  5) tips.push('Low LMS activity — engage with online materials.');
  if (inp.assignments < 80) tips.push('Submit all assignments on time.');
  if (inp.studyHours  < 10) tips.push('Study at least 10 hours per week.');
  if (inp.adaptive    <  5) tips.push('Revise concepts to improve adaptive assessment scores.');
  if (!tips.length)          tips.push('Excellent profile — maintain current performance!');

  return { predictedScore:score, grade, riskLevel:risk, suggestions:tips.slice(0,3) };
}

function _normaliseRow(raw) {
  const n = k => parseFloat(raw[k]) || 0;
  return {
    cgpa:n('cgpa'), prevGrade:n('prevgrade'), examScore:n('examscore'),
    studyHours:n('studyhours'), attendance:n('attendance'), lms:n('lms'),
    assignments:n('assignments'), participation:n('participation'),
    adaptive:n('adaptive'), contEval:n('conteval'),
    semester:raw['semester']||'4', programme:raw['programme']||'BTech',
  };
}
function _studentId(raw, i) {
  return raw['student_id']||raw['studentid']||raw['id']||
         'S'+String(i+1).padStart(3,'0');
}

function _renderResults() {
  const sec = document.getElementById('batchResultsSection');
  sec.style.display = 'block';
  sec.scrollIntoView({behavior:'smooth',block:'start'});
  document.getElementById('resultsCount').textContent = _resultRows.length+' students';

  const total    = _resultRows.length;
  const avgScore = (_resultRows.reduce((a,r)=>a+r.predictedScore,0)/total).toFixed(1);
  const highRisk = _resultRows.filter(r=>r.riskLevel==='High').length;
  const passCount= _resultRows.filter(r=>r.predictedScore>=50).length;

  document.getElementById('batchStatCards').innerHTML =
    _statCard('Total Students', total,       'blue',  'Processed in batch') +
    _statCard('Average Score',  avgScore,    'teal',  'Hybrid model') +
    _statCard('High Risk',      highRisk,    'red',   ((highRisk/total)*100).toFixed(0)+'% need help') +
    _statCard('Pass Rate',      ((passCount/total)*100).toFixed(0)+'%', 'green', passCount+' of '+total+' passing');

  _renderBatchCharts();
  _renderTable(_filteredRows);
}

function _statCard(label, val, color, sub) {
  return '<div class="card-sm">'+
    '<div class="stat-label">'+label+'</div>'+
    '<div class="stat-val '+color+'">'+val+'</div>'+
    '<div class="stat-sub">'+sub+'</div></div>';
}

function _renderBatchCharts() {
  const GRADES  = ['O','A+','A','B+','B','C','F'];
  const GCOLS   = ['#00d4aa','#22c55e','#4f8ef7','#a78bfa','#f59e0b','#f97316','#ef4444'];
  const gcounts = Object.fromEntries(GRADES.map(g=>[g,0]));
  _resultRows.forEach(r => { if(r.grade in gcounts) gcounts[r.grade]++; });

  if (_gradeChart) _gradeChart.destroy();
  _gradeChart = new Chart(document.getElementById('batchGradeChart').getContext('2d'),{
    type:'bar',
    data:{labels:GRADES, datasets:[{label:'Students',data:GRADES.map(g=>gcounts[g]),
      backgroundColor:GCOLS,borderRadius:6}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#64748b',font:{size:11}}},
              x:{grid:{display:false},ticks:{color:'#64748b',font:{size:11}}}}},
  });

  const rc = {High:0,Medium:0,Low:0};
  _resultRows.forEach(r => rc[r.riskLevel]++);

  if (_riskChart) _riskChart.destroy();
  _riskChart = new Chart(document.getElementById('batchRiskChart').getContext('2d'),{
    type:'doughnut',
    data:{labels:['High Risk','Medium Risk','Low Risk'],
          datasets:[{data:[rc.High,rc.Medium,rc.Low],
            backgroundColor:['#ef4444','#f59e0b','#22c55e'],borderWidth:0,hoverOffset:6}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'60%',
             plugins:{legend:{display:false}}},
  });

  document.getElementById('riskLegend').innerHTML =
    [['High Risk','#ef4444',rc.High],
     ['Medium Risk','#f59e0b',rc.Medium],
     ['Low Risk','#22c55e',rc.Low]]
    .map(([l,c,v])=>'<div class="pie-legend-item"><span class="pie-legend-swatch" style="background:'+c+'"></span>'+l+' <strong>'+v+'</strong></div>')
    .join('');

  const binL = ['0-9','10-19','20-29','30-39','40-49','50-59','60-69','70-79','80-89','90-100'];
  const binC = new Array(10).fill(0);
  _resultRows.forEach(r => binC[Math.min(Math.floor(r.predictedScore/10),9)]++);

  if (_scoreHistChart) _scoreHistChart.destroy();
  _scoreHistChart = new Chart(document.getElementById('batchScoreChart').getContext('2d'),{
    type:'bar',
    data:{labels:binL,datasets:[{label:'Students',data:binC,
      backgroundColor:'rgba(79,142,247,.75)',borderRadius:5}]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#64748b',font:{size:11}}},
              x:{grid:{display:false},ticks:{color:'#64748b',font:{size:11}}}}},
  });
}

const _GPILL = {'O':'grade-O','A+':'grade-Ap','A':'grade-A',
                'B+':'grade-Bp','B':'grade-B','C':'grade-C','F':'grade-F'};
const _RCOL  = {'High':'color:#ef4444','Medium':'color:#f59e0b','Low':'color:#22c55e'};

function _renderTable(rows) {
  const tbody = document.getElementById('resultsTableBody');
  const empty = document.getElementById('noResultsMsg');
  if (!rows.length) { tbody.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = rows.map(r =>
    '<tr>'+
    '<td style="color:var(--muted)">'+r.rowNum+'</td>'+
    '<td style="font-weight:600">'+r.studentId+'</td>'+
    '<td>'+r.cgpa+'</td>'+
    '<td>'+r.attendance+'%</td>'+
    '<td>'+r.examScore+'%</td>'+
    '<td>'+r.lms+'/10</td>'+
    '<td>'+r.adaptive+'/10</td>'+
    '<td style="font-weight:700;color:var(--teal);font-size:14px">'+r.predictedScore+'</td>'+
    '<td><span class="grade-pill '+(_GPILL[r.grade]||'')+'">'+r.grade+'</span></td>'+
    '<td style="font-weight:600;'+(_RCOL[r.riskLevel]||'')+'">'+r.riskLevel+'</td>'+
    '<td class="sug-cell">'+(r.suggestions[0]||'—')+'</td>'+
    '</tr>'
  ).join('');
}

function filterResults() {
  const search = (document.getElementById('resultsSearch').value||'').toLowerCase().trim();
  const risk   = document.getElementById('riskFilter').value||'';
  _filteredRows = _resultRows.filter(r =>
    (!search || r.studentId.toLowerCase().includes(search)) &&
    (!risk   || r.riskLevel === risk));
  _renderTable(_filteredRows);
}

function exportResultsCSV() {
  if (!_resultRows.length) { alert('Run a batch prediction first.'); return; }
  const hdr  = 'student_id,cgpa,attendance,exam_score,lms,adaptive,predicted_score,grade,risk_level,suggestion';
  const rows = _resultRows.map(r =>
    [r.studentId,r.cgpa,r.attendance,r.examScore,r.lms,r.adaptive,
     r.predictedScore,r.grade,r.riskLevel,
     '"'+(r.suggestions[0]||'').replace(/"/g,'""')+'"'].join(','));
  _triggerDownload([hdr,...rows].join('\n'),
    'edupredict_results_'+new Date().toISOString().slice(0,10)+'.csv','text/csv');
}

function clearUpload() {
  _parsedRows=[]; _resultRows=[]; _filteredRows=[];
  document.getElementById('csvFileInput').value                  = '';
  document.getElementById('fileInfoBar').style.display           = 'none';
  document.getElementById('previewSection').style.display        = 'none';
  document.getElementById('batchResultsSection').style.display   = 'none';
  const pw = document.getElementById('batchProgressWrap');
  if (pw) pw.style.display = 'none';
  if (_gradeChart)     { _gradeChart.destroy();     _gradeChart=null; }
  if (_riskChart)      { _riskChart.destroy();      _riskChart=null; }
  if (_scoreHistChart) { _scoreHistChart.destroy();  _scoreHistChart=null; }
}

function _showProgress(done, total) {
  let el = document.getElementById('batchProgressWrap');
  if (!el) {
    el = document.createElement('div');
    el.id='batchProgressWrap'; el.className='batch-progress-wrap';
    el.innerHTML =
      '<div class="batch-progress-label">'+
        '<span id="batchProgressText">Preparing…</span>'+
        '<span id="batchProgressPct">0%</span></div>'+
      '<div class="batch-progress-bar">'+
        '<div class="batch-progress-fill" id="batchProgressFill" style="width:0%"></div></div>';
    document.getElementById('previewSection').after(el);
  }
  el.style.display='block';
  _updateProgress(done, total);
}
function _updateProgress(done, total) {
  const pct = Math.round((done/total)*100);
  const f=document.getElementById('batchProgressFill');
  const p=document.getElementById('batchProgressPct');
  const t=document.getElementById('batchProgressText');
  if(f) f.style.width=pct+'%';
  if(p) p.textContent=pct+'%';
  if(t) t.textContent='Processing '+done+' / '+total+' students…';
}
function _updateProgressLabel(text) {
  const el=document.getElementById('batchProgressText');
  if(el) el.textContent=text;
}
function _hideProgress() {
  const el=document.getElementById('batchProgressWrap');
  if(el) el.style.display='none';
}

function _setFileInfo(name, meta, status) {
  document.getElementById('fileInfoBar').style.display='flex';
  document.getElementById('fileName').textContent=name;
  document.getElementById('fileMeta').textContent=meta;
  document.getElementById('fileStatus').textContent=status;
}

function _triggerDownload(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content],{type}));
  const a   = Object.assign(document.createElement('a'),{href:url,download:filename});
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function _uploadError(msg) {
  const dz=document.getElementById('dropZone');
  if(dz){dz.style.borderColor='var(--red)';setTimeout(()=>dz.style.borderColor='',2500);}
  alert('⚠ Upload Error\n\n'+msg);
}
