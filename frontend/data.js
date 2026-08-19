const MODEL_DATA = [
  { name: 'Linear Regression',        acc: 88.5, prec: 85.2, rec: 83.6, f1: 84.3 },
  { name: 'Decision Tree',            acc: 91.7, prec: 89.5, rec: 88.2, f1: 88.8 },
  { name: 'Random Forest',            acc: 95.4, prec: 93.8, rec: 92.6, f1: 93.2 },
  { name: 'Support Vector Regression',acc: 93.2, prec: 91.4, rec: 90.1, f1: 90.7 },
  { name: 'ANN',                      acc: 94.6, prec: 92.9, rec: 91.7, f1: 92.3 },
  { name: 'Hybrid Model',             acc: 96.2, prec: 94.8, rec: 93.9, f1: 94.3 },
];

const MODEL_COLORS = ['#4f8ef7','#f59e0b','#22c55e','#a78bfa','#f97316','#00d4aa'];

const TRAINING_DATA = {
  epochs  : ['1.0','1.5','2.0','2.5','3.0','3.5','4.0','4.5','5.0'],
  training: [75, 79, 83, 87, 89, 91, 93, 94.5, 95.2],
  testing : [73, 77, 81, 84, 87, 89, 91, 92.8, 94.1],
};

const DIST_DATA = {
  labels: ['30–40','40–50','50–60','60–70','70–80','80–90'],
  values: [45, 95, 185, 160, 105, 60],
};

const CONFUSION = { tp: 480, fp: 20, fn: 15, tn: 485 };

const FEATURE_IMPORTANCE = [
  { label: 'Learning Coeff.', value: 35, color: '#00d4aa' },
  { label: 'Academic',        value: 30, color: '#4f8ef7' },
  { label: 'Behavioral',      value: 25, color: '#f59e0b' },
  { label: 'Demographics',    value: 10, color: '#a78bfa' },
];

const INDEX_TERMS = [
  'Student Performance','Machine Learning','Educational Data Mining',
  'Learning Coefficients','Hybrid Model','ANN','Random Forest',
  'SVR','Decision Tree','Feature Engineering',
];

const PIPELINE_STEPS = [
  { icon:'📥', color:'rgba(0,212,170,.15)', border:'rgba(0,212,170,.3)', arrow:'teal',   name:'Input Student Data',      sub:'Attendance, marks, LMS logs' },
  { icon:'🔧', color:'rgba(79,142,247,.15)',border:'rgba(79,142,247,.3)', arrow:'blue',   name:'Preprocessing',           sub:'Cleaning, normalisation, imputation' },
  { icon:'⚙️', color:'rgba(245,158,11,.15)',border:'rgba(245,158,11,.3)', arrow:'amber',  name:'Feature Engineering',     sub:'Learning coefficients extraction' },
  { icon:'🤖', color:'rgba(167,139,250,.15)',border:'rgba(167,139,250,.3)',arrow:'purple', name:'Apply Hybrid ML Model',   sub:'LR + DT + RF + SVR + ANN ensemble' },
  { icon:'📊', color:'rgba(34,197,94,.15)', border:'rgba(34,197,94,.3)', arrow:'green',  name:'Predict Performance',     sub:'Score · Grade · Risk · Recommendations' },
];

const RESEARCH_GAPS = [
  { dot: '#22c55e', text: 'Static-only features → Added temporal learning coefficients' },
  { dot: '#22c55e', text: 'Single model bias    → Hybrid ensemble approach' },
  { dot: '#22c55e', text: 'Black-box output     → Decision Tree interpretability layer' },
  { dot: '#f59e0b', text: 'Real-time integration → Planned in future work (LMS streams)' },
];

const REFERENCES = [
  '[1] P. Cortez & A. Silva — Using Data Mining to Predict Student Performance, 2008',
  '[2] C. Romero & S. Ventura — Educational Data Mining: A Review, IEEE, 2010',
  '[3] S. B. Kotsiantis et al. — Predicting Students\' Performance, 2004',
  '[4] R. Baker & K. Yacef — State of Educational Data Mining, 2009',
  '[5] A. Shahiri et al. — A Review on Predicting Student Performance, 2015',
  '[6] Y. Baashar et al. — Predicting Student Performance using ML, 2021',
  '[7] P. Asthana et al. — Learning Coefficient-Based Prediction, IEEE Access, 2023',
  '[8] A. Ashraf et al. — Comparative Study of ML Models, 2018',
];

const ACADEMIC_FIELDS = [
  { id:'cgpa',       label:'CGPA (0–10)',         type:'range', min:0,  max:10, step:0.1, def:7.5, unit:'',  fmt: v => parseFloat(v).toFixed(1) },
  { id:'prevgrade',  label:'Previous Grade (%)',   type:'range', min:0,  max:100,step:1,   def:72,  unit:'%', fmt: v => v+'%' },
  { id:'examscore',  label:'Exam Score (%)',        type:'range', min:0,  max:100,step:1,   def:68,  unit:'%', fmt: v => v+'%' },
  { id:'studyhours', label:'Study Hours/Week',      type:'range', min:0,  max:40, step:1,   def:15,  unit:'h', fmt: v => v+'h' },
];

const BEHAVIORAL_FIELDS = [
  { id:'attendance', label:'Attendance (%)',        type:'range', min:0,  max:100,step:1,   def:80,  unit:'%', fmt: v => v+'%' },
  { id:'lms',        label:'LMS Activity (1–10)',   type:'range', min:1,  max:10, step:1,   def:6,   unit:'',  fmt: v => v },
  { id:'assign',     label:'Assignments Done (%)',  type:'range', min:0,  max:100,step:1,   def:85,  unit:'%', fmt: v => v+'%' },
  { id:'participation',label:'Participation (1–10)',type:'range', min:1,  max:10, step:1,   def:5,   unit:'',  fmt: v => v },
];

const LEARNING_FIELDS = [
  { id:'adaptive',   label:'Adaptive Assessment (1–10)', type:'range', min:1, max:10, step:1, def:6, unit:'', fmt: v => v },
  { id:'conteval',   label:'Continuous Eval (1–10)',     type:'range', min:1, max:10, step:1, def:7, unit:'', fmt: v => v },
];

const META_FIELDS = [
  {
    id: 'semester', label: 'Semester', type: 'select',
    options: ['1','2','3','4','5','6','7','8'].map(v => ({ value:v, label:`Semester ${v}` })),
    def: '4',
  },
  {
    id: 'programme', label: 'Programme', type: 'select',
    options: [
      { value:'BTech', label:'B.Tech CS / AI' },
      { value:'BCA',   label:'BCA' },
      { value:'MCA',   label:'MCA' },
      { value:'MBA',   label:'MBA' },
    ],
    def: 'BTech',
  },
];
