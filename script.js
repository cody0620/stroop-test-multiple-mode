const colorNames = ['紅','綠','藍','橙','黑'];
const colorValues = ['#ff0000','#00ff00','#0000ff','#ffa500','#000000'];
const englishNames = ['RED','GREEN','BLUE','ORANGE','BLACK'];
const negativeWords = [
  '悲憤','畏懼','恐慌','煩悶','悔恨','懊惱','擔心','哀愁','懊悔','害怕',
  '傷心','死亡','傷害','毀滅','戰爭','火災','警戒','隱瞞','謊言','溺水',
  '冤獄','窒息','強暴','斷裂','撕裂','背叛','出軌','抽離','肢解','瘟疫','虛假'
];

let mode, numQ, currentQ, startTime, correctCount, wrongQuestions;
let usedNegative = [];
const modeLabels = {
  classic: '經典stroop',
  reverse: '反向stroop',
  frenzy: '經典stroop+選項顏色干擾',
  english: '英語模式',
  rotate: '轉動模式',
  emotion: '進階情緒模式',
  basicEmotion: '情緒模式'
};
const fullOptions = [10,20,30,40,50,60];
const emotionOptions = [10,20,30];

document.addEventListener('DOMContentLoaded', () => {
  const modeSelect = document.getElementById('mode');
  const numSelect = document.getElementById('numQuestions');
  modeSelect.addEventListener('change', () => updateNumOptions(modeSelect.value));
  updateNumOptions(modeSelect.value);
  document.getElementById('startBtn').onclick = startTest;
  document.getElementById('restartBtn').onclick = restart;
  document.getElementById('copyBtn').onclick = copyReport;
});

function updateNumOptions(selectedMode) {
  const numSelect = document.getElementById('numQuestions');
  numSelect.innerHTML = '';
  const opts = (selectedMode === 'emotion' || selectedMode === 'basicEmotion')
    ? emotionOptions : fullOptions;
  opts.forEach(n => {
    const opt = document.createElement('option');
    opt.value = n; opt.textContent = `${n} 題`;
    numSelect.appendChild(opt);
  });
}

function startTest() {
  mode = document.getElementById('mode').value;
  numQ = parseInt(document.getElementById('numQuestions').value);
  document.getElementById('settings').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('copyBtn').style.display = 'none';
  document.getElementById('test').style.display = 'block';

  currentQ = 0; correctCount = 0; wrongQuestions = []; usedNegative = [];
  startTime = performance.now();
  showNext();
}

function showNext() {
  if (currentQ >= numQ) return finishTest();
  const qNum = currentQ + 1;
  document.getElementById('progress').textContent = `${qNum}/${numQ}`;

  let text, correctIdx;
  const colorIdx = Math.floor(Math.random()*colorValues.length);
  const stim = document.getElementById('stimulus');
  stim.style = '';

  if (mode === 'reverse') {
    text = '';
    stim.style.background = colorValues[colorIdx];
    stim.style.filter = 'brightness(0.6)';
    stim.style.width = '200px'; stim.style.height = '200px';
    correctIdx = colorIdx;
  } else if (mode === 'english') {
    const idx = Math.floor(Math.random()*englishNames.length);
    text = englishNames[idx];
    stim.style.color = colorValues[colorIdx];
    correctIdx = idx;
  } else if (mode === 'rotate') {
    const idx = Math.floor(Math.random()*colorNames.length);
    text = colorNames[idx];
    stim.style.color = colorValues[colorIdx];
    const r = Math.random();
    if (r<0.4) stim.style.transform='rotate(90deg)';
    else if (r<0.8) stim.style.transform='rotate(-90deg)';
    else if (r<0.9) stim.style.transform='scaleX(-1)';
    else stim.style.transform='scaleY(-1)';
    correctIdx = idx;
  } else if (mode === 'emotion' || mode === 'basicEmotion') {
    if (usedNegative.length >= negativeWords.length) usedNegative=[];
    const available = negativeWords.map((_,i)=>i).filter(i=>!usedNegative.includes(i));
    const idx = available[Math.floor(Math.random()*available.length)];
    usedNegative.push(idx);
    text = negativeWords[idx];
    stim.style.color = colorValues[colorIdx];
    correctIdx = colorIdx;
  } else {
    const idx = Math.floor(Math.random()*colorNames.length);
    text = colorNames[idx];
    stim.style.color = colorValues[colorIdx];
    correctIdx = idx;
  }

  stim.textContent = text;
  generateOptions(correctIdx);
  currentQ++;
}

function generateOptions(correctIdx) {
  const opts = document.getElementById('options'); opts.innerHTML = '';
  const fixed = [0,1,2,3,4];
  const indices = (mode==='classic' || mode==='basicEmotion') ? fixed : shuffleArray(fixed.slice());
  const colors = shuffleArray(colorValues.slice());
  indices.forEach(idx => {
    const btn = document.createElement('button');
    btn.textContent = colorNames[idx];
    btn.style.color = (mode==='classic' || mode==='basicEmotion') ? '#000' : colors.pop();
    btn.onclick = () => {
      if (idx===correctIdx) correctCount++; else wrongQuestions.push(currentQ);
      showNext();
    };
    opts.appendChild(btn);
  });
}

function finishTest() {
  const duration = ((performance.now()-startTime)/1000).toFixed(2);
  const wrong = wrongQuestions.length;
  const acc = (((numQ-wrong)/numQ)*100).toFixed(1);
  document.getElementById('test').style.display='none';
  document.getElementById('resultText').textContent =
    `完成 ${numQ} 題，用時 ${duration} 秒，正確率 ${acc}%。`;
  document.getElementById('wrongDetail').textContent =
    wrong ? `你第 ${wrongQuestions.join('、')} 題回答錯誤，共錯了 ${wrong} 題` : '全部答對！';
  document.getElementById('result').style.display='block';
  document.getElementById('copyBtn').style.display='inline-block';
  window.lastReport =
    `我在${modeLabels[mode]}模式下 回答${numQ}題耗時的秒數為:${duration} 正確率為:${acc}%`;
}

function copyReport(){navigator.clipboard.writeText(window.lastReport).then(()=>alert('報告已複製！'));}
function restart(){document.getElementById('settings').style.display='block';document.getElementById('result').style.display='none';}
function shuffleArray(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
