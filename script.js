let subjectsContainer = document.getElementById('subjects');
let chart;

// Voice loading
let voices = [];

function loadVoices() {
  voices = speechSynthesis.getVoices();

  if (!voices.length) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
    };
  }
}

loadVoices();

function speakMessage(message, lang = 'en-US') {
  const utterance = new SpeechSynthesisUtterance(message);
  const selectedVoice = voices.find(voice => voice.lang === lang);

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}

function addSubject() {
  const row = document.createElement('div');
  row.className = 'subject-row';

  row.innerHTML = `
    <input type="text" placeholder="বিষয়" class="subject-name">
    <input type="number" placeholder="প্রাপ্ত নম্বর" class="achieved-mark">
    <input type="number" placeholder="পূর্ণ নম্বর" class="total-mark">
  `;

  subjectsContainer.appendChild(row);
}

function generateResult() {
  const subjectNames = document.querySelectorAll('.subject-name');
  const achievedMarks = document.querySelectorAll('.achieved-mark');
  const totalMarks = document.querySelectorAll('.total-mark');
  const dream = document.getElementById('dreamSubject').value.trim();

  let results = [];
  let labels = [];
  let percentages = [];
  let hasLow = false;
  let totalPercentSum = 0;
  let validSubjectsCount = 0;
  let resultHTML = '';

  for (let i = 0; i < subjectNames.length; i++) {
    let name = subjectNames[i].value.trim();
    let achieved = parseFloat(achievedMarks[i].value);
    let total = parseFloat(totalMarks[i].value);

    if (!name || isNaN(achieved) || isNaN(total) || total === 0) continue;

    let percent = Math.round((achieved / total) * 100);
    labels.push(name);
    percentages.push(percent);

    totalPercentSum += percent;
    validSubjectsCount++;

    if (percent < 40) {
      resultHTML += `<p class="low-score">${name}: ${percent}% - নিজেকে আরো ইম্প্রুভ করতে হবে!</p>`;
      hasLow = true;
    } else {
      resultHTML += `<p>${name}: ${percent}%</p>`;
    }

    results.push({ name, achieved, total });
  }

  let avgPercent = validSubjectsCount ? Math.round(totalPercentSum / validSubjectsCount) : 0;

  if (dream) {
    if (avgPercent >= 75) {
      resultHTML += `<p style="color:green;"><strong>🌟 তোমার শিক্ষাগত পারফরম্যান্স ভালো, তুমি তোমার স্বপ্নের <em>${dream}</em> পথে এগিয়ে যাচ্ছো!</strong></p>`;
    } else if (avgPercent >= 40) {
      resultHTML += `<p style="color:orange;">⚠️ শিক্ষাগত পারফরম্যান্স ভালো না হলেও, স্বপ্নের জন্য আরও মনোযোগ দরকার।</p>`;
    } else {
      resultHTML += `<p style="color:red;">❌ শিক্ষাগত পারফরম্যান্স খুব কম, স্বপ্ন পূরণের জন্য কঠোর পরিশ্রম দরকার।</p>`;
    }
  }

  document.getElementById('result').innerHTML = resultHTML;

  if (hasLow) {
    speakMessage("You need to improve more.", "en-US");
  }

  localStorage.setItem('marks', JSON.stringify(results));
  renderChart(labels, percentages);

  document.getElementById('result').scrollIntoView({ behavior: 'smooth' });
}

function renderChart(labels, data) {
  const ctx = document.getElementById('marksChart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'প্রাপ্ত নম্বর (শতকরা)',
        data: data,
        backgroundColor: data.map(percent => percent < 40 ? '#e74c3c' : '#3498db'),
        borderRadius: 8
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}
