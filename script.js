const colorNames = ['紅','綠','藍','橙','黑'];
const colorValues = ['#ff0000','#00ff00','#0000ff','#ffa500','#000000'];
const englishNames = ['RED','GREEN','BLUE','ORANGE','BLACK'];

let mode, numQ, currentQ, startTime, correctCount, wrongQuestions;
const modeLabels = {
  classic: '經典stroop',
  reverse: '反向stroop',
  frenzy: '經典stroop+選項顏色干擾',
  english: '英語模式',
  rotate: '轉動模式'
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startBtn').onclick = startTest;
  document.getElementById('restartBtn').onclick = restart;
  document.getElementById('copyBtn').onclick = copyReport;
});

function startTest() {
  mode = document.getElementById('mode').value;
  numQ = parseInt(document.getElementById('numQuestions').value);
  document.getElementById('settings').style.display = 'none';
  document.getElementById('result').style.display = 'none';
  document.getElementById('copyBtn').style.display = 'none';
  document.getElementById('test').style.display = 'block';

  currentQ = 0;
  correctCount = 0;
  wrongQuestions = [];
  startTime = performance.now();
  showNext();
}

function showNext() {
  if (currentQ >= numQ) return finishTest();
  const qNumber = currentQ + 1;
  updateProgress(qNumber);

  // 隨機選答案索引
  const textIdx = Math.floor(Math.random() * colorNames.length);
  const colorIdx = Math.floor(Math.random() * colorValues.length);
  const stim = document.getElementById('stimulus');

  // 重置樣式
  stim.style.background = 'none';
  stim.style.color = '#000';
  stim.style.filter = '';
  stim.style.transform = 'none';
  stim.style.width = 'auto';
  stim.style.height = 'auto';

  let correctIdx;
  if (mode === 'reverse') {
    // 反轉模式色塊
    stim.textContent = '';
    stim.style.background = colorValues[colorIdx];
    stim.style.filter = 'brightness(0.6)';
    stim.style.width = '200px';
    stim.style.height = '200px';
    correctIdx = colorIdx;
  } else if (mode === 'english') {
    // 英語模式
    stim.textContent = englishNames[textIdx];
    stim.style.color = colorValues[colorIdx];
    correctIdx = textIdx;
  } else {
    // classic, frenzy, rotate 基底
    stim.textContent = colorNames[textIdx];
    stim.style.color = colorValues[colorIdx];
    correctIdx = textIdx;
    if (mode === 'rotate') {
      // 隨機旋轉或翻轉
      const r = Math.random();
      if (r < 0.4) stim.style.transform = 'rotate(90deg)';
      else if (r < 0.8) stim.style.transform = 'rotate(-90deg)';
      else if (r < 0.9) stim.style.transform = 'scaleX(-1)';
      else stim.style.transform = 'scaleY(-1)';
    }
  }

  generateOptions(correctIdx);
  currentQ++;
}

function updateProgress(num) {
  document.getElementById('progress').textContent = `${num}/${numQ}`;
}

function generateOptions(correctIdx) {
  const optsDiv = document.getElementById('options');
  optsDiv.innerHTML = '';

  // 選項順序: classic 固定, 其餘隨機
  const indices = (mode === 'classic')
    ? [...Array(colorNames.length).keys()]
    : shuffleArray([...Array(colorNames.length).keys()]);

  // 打亂干擾顏色
  const shuffledColors = shuffleArray(colorValues.slice());

  indices.forEach(idx => {
    const btn = document.createElement('button');
    btn.textContent = colorNames[idx];
    btn.style.color = (mode === 'classic') ? '#000' : shuffledColors.pop();
    btn.onclick = () => {
      if (idx === correctIdx) correctCount++; else wrongQuestions.push(currentQ+1);
      showNext();
    };
    optsDiv.appendChild(btn);
  });
}

function finishTest() {
  const used = ((performance.now() - startTime) / 1000).toFixed(2);
  const wrongCount = wrongQuestions.length;
  const accuracy = (((numQ - wrongCount) / numQ) * 100).toFixed(1);
  document.getElementById('test').style.display = 'none';
  document.getElementById('resultText').textContent =
    `完成 ${numQ} 題，用時 ${used} 秒，正確率 ${accuracy}%。`;
  document.getElementById('wrongDetail').textContent =
    wrongCount ? `你第 ${wrongQuestions.join('、')} 題回答錯誤，共錯了 ${wrongCount} 題` : '全部答對！';
  document.getElementById('result').style.display = 'block';
  document.getElementById('copyBtn').style.display = 'inline-block';
  window.lastReport =
    `我在${modeLabels[mode]}模式下 回答${numQ}題耗時的秒數為:${used} 正確率為:${accuracy}%`;
}

function copyReport() {
  if (navigator.clipboard && window.lastReport) {
    navigator.clipboard.writeText(window.lastReport).then(() => alert('報告已複製！'));
  }
}

function restart() {
  document.getElementById('settings').style.display = 'block';
  document.getElementById('result').style.display = 'none';
}

// Fisher–Yates 隨機打亂
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
