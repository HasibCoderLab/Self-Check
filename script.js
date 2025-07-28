let subjectsContainer = document.getElementById('subjects');
let chart;

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
  if (selectedVoice) utterance.voice = selectedVoice;
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}

function showSwalWithVoice({ icon, title, text, voiceText, color = 'black' }) {
  Swal.fire({
    icon: icon,
    title: title,
    html: `<p style="color:${color}; font-weight:bold;">${text}</p>`,
  }).then(() => {
    if (voiceText) speakMessage(voiceText);
  });
}

function addSubject() {
  const row = document.createElement('div');
  row.className = 'subject-row';
  row.innerHTML = `
    <input type="text" placeholder="বিষয়" class="subject-name" />
    <input type="number" placeholder="প্রাপ্ত নম্বর" class="achieved-mark" />
    <input type="number" placeholder="পূর্ণ নম্বর" class="total-mark" />
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
  document.getElementById('result').innerHTML = '';

  for (let i = 0; i < subjectNames.length; i++) {
    let name = subjectNames[i].value.trim();
    let achieved = parseFloat(achievedMarks[i].value);
    let total = parseFloat(totalMarks[i].value);

    if (!name || isNaN(achieved) || isNaN(total)) {
      showSwalWithVoice({
        icon: 'warning',
        title: 'ফর্ম অসম্পূর্ণ',
        text: 'অনুগ্রহ করে সব ইনপুট পূরণ করুন।',
        voiceText: 'Please fill all the inputs correctly.'
      });
      return;
    }

    if (achieved > total) {
      showSwalWithVoice({
        icon: 'error',
        title: 'Oops...',
        text: `"${name}" এর প্রাপ্ত নম্বর পূর্ণ নম্বরের চেয়ে বেশি হতে পারে না!`,
        voiceText: `"${name}" er prapto nombor purno nomborer cheye beshi hote pare na!`
      });
      return;
    }

    let percent = Math.round((achieved / total) * 100);
    labels.push(name);
    percentages.push(percent);
    totalPercentSum += percent;
    validSubjectsCount++;

    if (percent < 40) {
      document.getElementById('result').innerHTML += `<p class="low-score">${name}: ${percent}% - নিজেকে আরো ইম্প্রুভ করতে হবে!</p>`;
      hasLow = true;
    } else {
      document.getElementById('result').innerHTML += `<p>${name}: ${percent}%</p>`;
    }

    results.push({ name, achieved, total });
  }

  let avgPercent = validSubjectsCount ? Math.round(totalPercentSum / validSubjectsCount) : 0;

  if (dream) {
    if (avgPercent >= 75) {
      showSwalWithVoice({
        icon: 'success',
        title: 'অভিনন্দন!',
        text: `🌟 তোমার শিক্ষাগত পারফরম্যান্স ভালো, তুমি তোমার স্বপ্নের <em>${dream}</em> পথে এগিয়ে যাচ্ছো!`,
        voiceText: 'Your academic performance is good. You are progressing towards your dream.',
        color: 'green'
      });
    } else if (avgPercent >= 40) {
      showSwalWithVoice({
        icon: 'warning',
        title: 'মনোযোগ দিন',
        text: '⚠️ শিক্ষাগত পারফরম্যান্স ভালো না হলেও, স্বপ্নের জন্য আরও মনোযোগ দরকার।',
        voiceText: 'Academic performance is not very good. More attention is needed for your dream.',
        color: 'orange'
      });
    } else {
      showSwalWithVoice({
        icon: 'error',
        title: 'সতর্কতা!',
        text: '❌ শিক্ষাগত পারফরম্যান্স খুব কম, স্বপ্ন পূরণের জন্য কঠোর পরিশ্রম দরকার।',
        voiceText: 'Academic performance is very low. Hard work is required to achieve your dream.',
        color: 'red'
      });
    }
  }

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

const messageBox = document.getElementById('performanceMessage');
messageBox.className = 'performance-message'; // reset

if (dream) {
  if (avgPercent >= 75) {
    messageBox.textContent = `🌟 তোমার শিক্ষাগত পারফরম্যান্স ভালো, তুমি তোমার স্বপ্নের ${dream} পথে এগিয়ে যাচ্ছো!`;
    messageBox.classList.add('good');
  } else if (avgPercent >= 40) {
    messageBox.textContent = `⚠️ শিক্ষাগত পারফরম্যান্স ভালো না হলেও, স্বপ্নের জন্য আরও মনোযোগ দরকার।`;
    messageBox.classList.add('moderate');
  } else {
    messageBox.textContent = `❌ শিক্ষাগত পারফরম্যান্স খুব কম, স্বপ্ন পূরণের জন্য কঠোর পরিশ্রম দরকার।`;
    messageBox.classList.add('low');
  }
} else {
  messageBox.textContent = '';  // If you don't dream, don't show anything.
}

