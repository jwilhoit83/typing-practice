const word = document.getElementById('word')
const text = document.getElementById('text')
const scoreEl = document.getElementById('score')
const timeEl = document.getElementById('time')
const wpm = document.getElementById('wpm')
const accuracy = document.getElementById('accuracy')

// container elements
const settingsContainer = document.getElementById('settings')
const endGameContainer = document.getElementById('end-game-container')
const confirmationModal = document.getElementById('confirmation-modal')

// button elements
const startBtn = document.getElementById('start-btn')
const cancelBtn = document.getElementById('cancel-btn')
const resetBtn = document.getElementById('reset')
const settingsBtn = document.getElementById('settings-btn')
const clearBtn = document.getElementById('clear-data-btn')
const modalCancelBtn = document.getElementById('modal-cancel')
const modalConfirmBtn = document.getElementById('modal-confirm')

// select elements
const durationSelect = document.getElementById('duration')
const themeSelect = document.getElementById('theme')

// chart area stat elements
const avgWPM = document.getElementById('avg-wpm')
const maxWPM = document.getElementById('max-wpm')
const minWPM = document.getElementById('min-wpm')
const avgAcc = document.getElementById('avg-acc')
const maxAcc = document.getElementById('max-acc')
const minAcc = document.getElementById('min-acc')

// initialization of variables for the test
let randomWords
let charCount
let correctCount
let score
let time
let timeInterval
let index

// initialization of variables for chart and data
let progressChart
let scoresArr = localStorage.getItem('scores') ? JSON.parse(localStorage.getItem('scores')) : []
let dateArr = scoresArr.map(item => item.date)
let wpmArr = scoresArr.map(item => item.score)
let accuracyArr = scoresArr.map(item => item.accuracy)

// set the color theme from local storage or system preference, default will be dark in absence of the first two

const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const userPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
const userPreference = userPrefersLight ? 'light' : 'dark'

document.documentElement.classList = localStorage.getItem('prevTheme')
  ? localStorage.getItem('prevTheme')
  : userPreference

themeSelect.value = localStorage.getItem('prevTheme')
  ? localStorage.getItem('prevTheme')
  : userPreference

// list of 500 most popular words in english language
const wordList =
  'the of to and a in is it you that he was for on are with as I his they be at one have this from or had by hot but some what there we can out other were all your when up use word how said an each she which do their time if will way about many then them would write like so these her long make thing see him two has look more day could go come did my sound no most number who over know water than call first people may down side been now find any new work part take get place made live where after back little only round man year came show every good me give our under name very through just form much great think say help low line before turn cause same mean differ move right boy old too does tell sentence set three want air well also play small end put home read hand port large spell add even land here must big high such follow act why ask men change went light kind off need house picture try us again animal point mother world near build self earth father head stand own page should country found answer school grow study still learn plant cover food sun four thought let keep eye never last door between city tree cross since hard start might story saw far sea draw left late run while press close night real life few stop open seem together next white children begin got walk example ease paper often always music those both mark book letter until mile river car feet care second group carry took rain eat room friend began idea fish mountain north once base hear horse cut sure watch color face wood main enough plain girl usual young ready above ever red list though feel talk bird soon body dog family direct pose leave song measure state product black short numeral class wind question happen complete ship area half rock order fire south problem piece told knew pass farm top whole king size heard best hour better true during hundred am remember step early hold west ground interest reach fast five sing listen six table travel less morning ten simple several vowel toward war lay against pattern slow center love person money serve appear road map science rule govern pull cold notice voice fall power town fine certain fly unit lead cry dark machine note wait plan figure star box noun field rest correct able pound done beauty drive stood contain front teach week final gave green oh quick develop sleep warm free minute strong special mind behind clear tail produce fact street inch lot nothing course stay wheel full force blue object decide surface deep moon island foot yet busy test record boat common gold possible plane age dry wonder laugh thousand ago ran check game shape yes hot miss brought heat snow bed bring sit perhaps fill east weight language among'.split(
    ' '
  )

// initial population of chart, background, and stats

setBackground()
createChart()
updateStats()

// start the game, resetting counters, score, and index as well as randomizing the word list for each round.
function startRound() {
  text.value = ''
  text.focus()
  settingsContainer.classList.add('slide')
  reset()
  randomWords = Array.from(
    { length: wordList.length },
    () => wordList[Math.floor(Math.random() * wordList.length)] + ' '
  )

  text.addEventListener('input', textListener)

  startBtn.classList.add('hidden')
  cancelBtn.classList.remove('hidden')

  setTimeout(() => {
    addWordToDOM(index)
    time = durationSelect.value
    timeEl.innerText = time + 's'
    timeInterval = setInterval(updateTime, 1000)
  }, 3000)
}

// adds 5 words to the wordlist, updates with every checked input
function addWordToDOM(i) {
  word.innerHTML = randomWords
    .slice(i, i + 4)
    .map(word =>
      word
        .split('')
        .map(letter => `<span class='letter'>${letter}</span>`)
        .join('')
    )
    .join('')
}

// subtracts 1 second from the time left and updates the time field in the test container
function updateTime() {
  time--
  timeEl.innerText = time + 's'

  if (time <= 5) {
    timeEl.classList.add('warning')
  }

  if (time <= 0) {
    clearInterval(timeInterval)
    roundOver()
    timeEl.className = ''
  }
}

// calculates an updated score after every word check
function updateScore() {
  score = ((charCount / 5 / (durationSelect.value - time)) * 60).toFixed(0)
  scoreEl.innerText = score
}

// final word checking and updating of all score/data/stats, displays endgame scoreboard
function roundOver() {
  text.blur()
  text.removeEventListener('input', textListener)
  checkPartialWord()
  text.value = ''
  updateScore()
  updateData()
  updateStats()
  wpm.innerText = score
  accuracy.innerText = isNaN(((correctCount / charCount) * 100).toFixed(0))
    ? 0
    : ((correctCount / charCount) * 100).toFixed(0) + '%'
  endGameContainer.style.display = 'flex'
  settingsContainer.classList.remove('slide')
  startBtn.classList.remove('hidden')
  cancelBtn.classList.add('hidden')
}

// resets all variables after a round is over and sets up for the next round
function reset() {
  endGameContainer.style.display = 'none'
  word.innerText = String.fromCharCode(160)
  index = 0
  charCount = 0
  correctCount = 0
  score = 0
  timeEl.innerText = ''
  scoreEl.innerText = ''
}

// cancels current round and resets allowing for new round to be started
function cancel() {
  clearInterval(timeInterval)
  text.blur()
  text.value = ''
  text.removeEventListener('input', textListener)
  word.innerText = String.fromCharCode(160)  
  timeEl.className = ''
  timeEl.innerText = ''
  scoreEl.innerText = ''
  settingsContainer.classList.remove('slide')
  startBtn.classList.remove('hidden')
  cancelBtn.classList.add('hidden')
}

// setting the correct theme colors for the svg background
function setBackground() {
  let bgAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').slice(1)
  document.body.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23${bgAccent}' stroke-width='1' stroke-opacity='0.3'%3E%3Crect x='-40' y='40' width='75' height='75'/%3E%3Crect x='-35' y='45' width='65' height='65'/%3E%3Crect x='-30' y='50' width='55' height='55'/%3E%3Crect x='-25' y='55' width='45' height='45'/%3E%3Crect x='-20' y='60' width='35' height='35'/%3E%3Crect x='-15' y='65' width='25' height='25'/%3E%3Crect x='-10' y='70' width='15' height='15'/%3E%3Crect x='-5' y='75' width='5' height='5'/%3E%3Crect width='35' height='35'/%3E%3Crect x='5' y='5' width='25' height='25'/%3E%3Crect x='10' y='10' width='15' height='15'/%3E%3Crect x='15' y='15' width='5' height='5'/%3E%3Crect x='40' width='75' height='75'/%3E%3Crect x='45' y='5' width='65' height='65'/%3E%3Crect x='50' y='10' width='55' height='55'/%3E%3Crect x='55' y='15' width='45' height='45'/%3E%3Crect x='60' y='20' width='35' height='35'/%3E%3Crect x='65' y='25' width='25' height='25'/%3E%3Crect x='70' y='30' width='15' height='15'/%3E%3Crect x='75' y='35' width='5' height='5'/%3E%3Crect x='40' y='80' width='35' height='35'/%3E%3Crect x='45' y='85' width='25' height='25'/%3E%3Crect x='50' y='90' width='15' height='15'/%3E%3Crect x='55' y='95' width='5' height='5'/%3E%3Crect x='120' y='-40' width='75' height='75'/%3E%3Crect x='125' y='-35' width='65' height='65'/%3E%3Crect x='130' y='-30' width='55' height='55'/%3E%3Crect x='135' y='-25' width='45' height='45'/%3E%3Crect x='140' y='-20' width='35' height='35'/%3E%3Crect x='145' y='-15' width='25' height='25'/%3E%3Crect x='150' y='-10' width='15' height='15'/%3E%3Crect x='155' y='-5' width='5' height='5'/%3E%3Crect x='120' y='40' width='35' height='35'/%3E%3Crect x='125' y='45' width='25' height='25'/%3E%3Crect x='130' y='50' width='15' height='15'/%3E%3Crect x='135' y='55' width='5' height='5'/%3E%3Crect y='120' width='75' height='75'/%3E%3Crect x='5' y='125' width='65' height='65'/%3E%3Crect x='10' y='130' width='55' height='55'/%3E%3Crect x='15' y='135' width='45' height='45'/%3E%3Crect x='20' y='140' width='35' height='35'/%3E%3Crect x='25' y='145' width='25' height='25'/%3E%3Crect x='30' y='150' width='15' height='15'/%3E%3Crect x='35' y='155' width='5' height='5'/%3E%3Crect x='200' y='120' width='75' height='75'/%3E%3Crect x='40' y='200' width='75' height='75'/%3E%3Crect x='80' y='80' width='75' height='75'/%3E%3Crect x='85' y='85' width='65' height='65'/%3E%3Crect x='90' y='90' width='55' height='55'/%3E%3Crect x='95' y='95' width='45' height='45'/%3E%3Crect x='100' y='100' width='35' height='35'/%3E%3Crect x='105' y='105' width='25' height='25'/%3E%3Crect x='110' y='110' width='15' height='15'/%3E%3Crect x='115' y='115' width='5' height='5'/%3E%3Crect x='80' y='160' width='35' height='35'/%3E%3Crect x='85' y='165' width='25' height='25'/%3E%3Crect x='90' y='170' width='15' height='15'/%3E%3Crect x='95' y='175' width='5' height='5'/%3E%3Crect x='120' y='160' width='75' height='75'/%3E%3Crect x='125' y='165' width='65' height='65'/%3E%3Crect x='130' y='170' width='55' height='55'/%3E%3Crect x='135' y='175' width='45' height='45'/%3E%3Crect x='140' y='180' width='35' height='35'/%3E%3Crect x='145' y='185' width='25' height='25'/%3E%3Crect x='150' y='190' width='15' height='15'/%3E%3Crect x='155' y='195' width='5' height='5'/%3E%3Crect x='160' y='40' width='75' height='75'/%3E%3Crect x='165' y='45' width='65' height='65'/%3E%3Crect x='170' y='50' width='55' height='55'/%3E%3Crect x='175' y='55' width='45' height='45'/%3E%3Crect x='180' y='60' width='35' height='35'/%3E%3Crect x='185' y='65' width='25' height='25'/%3E%3Crect x='190' y='70' width='15' height='15'/%3E%3Crect x='195' y='75' width='5' height='5'/%3E%3Crect x='160' y='120' width='35' height='35'/%3E%3Crect x='165' y='125' width='25' height='25'/%3E%3Crect x='170' y='130' width='15' height='15'/%3E%3Crect x='175' y='135' width='5' height='5'/%3E%3Crect x='200' y='200' width='35' height='35'/%3E%3Crect x='200' width='35' height='35'/%3E%3Crect y='200' width='35' height='35'/%3E%3C/g%3E%3C/svg%3E")`
}

// creating and drawing the chart with correct data and theme colors
function createChart() {
  const chart = document.getElementById('score-chart')
  const text = getComputedStyle(document.documentElement).getPropertyValue('--chart-text')
  const lines = getComputedStyle(document.documentElement).getPropertyValue('--chart-text-faded')
  const primary = getComputedStyle(document.documentElement).getPropertyValue('--chart-primary')
  const secondary = getComputedStyle(document.documentElement).getPropertyValue('--chart-secondary')
  const point = getComputedStyle(document.documentElement).getPropertyValue('--chart-point')

  Chart.defaults.color = text
  Chart.defaults.borderColor = lines
  progressChart = new Chart(chart, {
    type: 'line',
    data: {
      labels: dateArr,
      datasets: [
        {
          label: 'WPM',
          data: wpmArr,
          borderColor: primary,
          borderWidth: 1,
          pointBackgroundColor: point,
          tension: 0.3,
        },
        {
          label: 'Accuracy',
          data: accuracyArr,
          borderColor: secondary,
          borderWidth: 1,
          pointBackgroundColor: point,
          tension: 0.3,
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Past Scores On This Machine',
        },
      },
      scales: {
        xAxis: {
          display: false,
        },
      },
    },
  })
}

// update the data for the chart and redrawing the chart
function updateData() {
  scoresArr.push({
    date: new Date(Date.now()).toDateString(),
    score,
    accuracy: isNaN(((correctCount / charCount) * 100).toFixed(0))
      ? 0
      : ((correctCount / charCount) * 100).toFixed(0),
  })
  localStorage.setItem('scores', JSON.stringify(scoresArr))
  dateArr = scoresArr.map(item => item.date)
  wpmArr = scoresArr.map(item => item.score)
  accuracyArr = scoresArr.map(item => item.accuracy)

  // destoying and rebuilding chart to update to latest data
  progressChart.destroy()
  createChart()
}

// update the stats accompaning the chart
function updateStats() {
  avgWPM.innerText =
    wpmArr.length > 0
      ? (wpmArr.map(Number).reduce((a, c) => (a += c)) / wpmArr.length).toFixed(0)
      : 0
  maxWPM.innerText = wpmArr.length > 0 ? wpmArr.slice().sort((a, b) => b - a)[0] : 0
  minWPM.innerText = wpmArr.length > 0 ? wpmArr.slice().sort((a, b) => a - b)[0] : 0
  avgAcc.innerText =
    accuracyArr.length > 0
      ? (accuracyArr.map(Number).reduce((a, c) => (a += c)) / accuracyArr.length).toFixed(0)
      : 0
  maxAcc.innerText = accuracyArr.length > 0 ? accuracyArr.slice().sort((a, b) => b - a)[0] : 0
  minAcc.innerText = accuracyArr.length > 0 ? accuracyArr.slice().sort((a, b) => a - b)[0] : 0
}

// event listener function for the text input that allows for checking of input strings against the word key
function textListener() {
  const insertedText = text.value
  const letterArray = [...document.querySelectorAll('.letter')]

  if (insertedText.length <= randomWords[index].length) {
    for (let i = 0; i < insertedText.length; i++) {
      if (insertedText[i] === randomWords[index][i]) {
        letterArray[i].classList.add('success')
      } else {
        letterArray[i].classList.add('warning')
        correctCount--
      }
    }
  }

  letterArray.slice(insertedText.length).forEach(letter => (letter.className = 'letter'))

  if (insertedText === randomWords[index]) {
    charCount += randomWords[index].length
    correctCount += randomWords[index].length
    index++
    addWordToDOM(index)
    updateScore()
    text.value = ''
  } else if (insertedText.slice(1).includes(' ')) {
    checkPartialWord()
    index++
    addWordToDOM(index)
    updateScore()
    text.value = ''
  }
}

// checking accuracy of a partial or non matching word
function checkPartialWord() {
  const insertedText = text.value
  if (insertedText > 0) {
    let length =
      insertedText.length >= randomWords[index].length
        ? randomWords[index].length
        : insertedText.length
    charCount += length
    if (insertedText.length > length) correctCount -= insertedText.length - length
    for (let i = 0; i < length; i++) {
      if (insertedText[i] === randomWords[index][i]) {
        correctCount++
      }
    }
  }
}

// event listeners

startBtn.addEventListener('click', startRound)

cancelBtn.addEventListener('click', cancel)

settingsBtn.addEventListener('click', () => {
  settingsContainer.classList.toggle('slide')
})

resetBtn.addEventListener('click', reset)

themeSelect.addEventListener('change', e => {
  document.documentElement.className = e.target.value
  localStorage.setItem('prevTheme', e.target.value)
  setBackground()

  //destroying and creating a new chart to update colors for new theme
  progressChart.destroy()
  createChart()
})

clearBtn.addEventListener('click', () => {
  confirmationModal.style.display = 'flex'
})

modalCancelBtn.addEventListener('click', () => {
  confirmationModal.style.display = 'none'
})

modalConfirmBtn.addEventListener('click', () => {
  localStorage.clear()
  progressChart.destroy()
  scoresArr = []
  dateArr = []
  accuracyArr = []
  wpmArr = []
  createChart()
  confirmationModal.style.display = 'none'
})
