import { inputs } from "./input&calcs.js";
import { ALL_PHRASES } from "./phrases.js";


document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container');
  const dateDisplay = document.getElementById('date-display');
  const pauseDate = document.getElementById('pause-date');
  const playDate = document.getElementById('play-date');
  const solvedPopup = document.getElementById("solved-popup");
  const scoreValue = document.getElementById("score-value");
  const solvedScore = document.getElementById('solved-score');
  const solvedToBlur = document.querySelectorAll("body > :not(#solved-popup):not(#share-button-pop):not(#logo):not(#date-display):not(#container):not(#solved-score)");
  const infoToBlur = document.querySelectorAll("body > :not(#info-popup):not(#pause-popup):not(#solved-popup):not(#play-popup)");
  const clueValue = document.getElementById('clue-value')
  const infoButton = document.getElementById('info-button')
  const infoPopup = document.getElementById("info-popup");
  const shareButtonPop = document.getElementById("share-button-pop")
  const pauseButton = document.getElementById("pause-button")
  const pausePopup = document.getElementById("pause-popup")
  const pauseToBlur = document.querySelectorAll("body > :not(#pause-popup):not(#info-popup):not(#solved-popup):not(#logo):not(#date-display):not(#info-button):not(#play-popup)");
  const playPopup = document.getElementById("play-popup")
  const playToBlur = document.querySelectorAll("body > :not(#play-popup):not(#info-popup):not(#solved-popup):not(#logo):not(#date-display):not(#info-button):not(#pause-popup)");

  let cur_phrase, lin_idx, formattedDateX, puzScore, play_showing, LA_Typed, RA_Typed, num_arrX, str_arrX, guess_arrX,
      BOXROWS, BOXCOLS, last_lins, first_lins, underline1, underline2, prev_lin_idx;
  let puzzle_solved, info_showing, pause_showing = false;
  let intervalId = null;

  function initialize() {
    const today = new Date().toLocaleDateString('en-CA');
    const formattedDate = today.replace(/-/g, '');
    const formattedDate1 = formatDate(formattedDate);
    setDateDisplay(formattedDate1);
    handleDatePickerChange({ target: { value: today } });
  }

  function updateDisplay() {
    container.innerHTML = '';
    for (let idx = 0; idx < num_arrX.length; idx++) {
      const box = document.createElement('div');
      box.classList.add('box');
      box.dataset.index = idx;

      if (idx == lin_idx) {
        box.classList.add('blip');
        if (puzzle_solved) {
          box.classList.remove('blip');
        }
      }

      if (num_arrX[idx] == 2) {
        if ((idx >= underline1[cur_phrase] && idx <= underline2[cur_phrase]) || puzzle_solved) {
          box.classList.add('key');
        } else {
          box.classList.add('trans_key');
        }
      } else if (num_arrX[idx] == 1) {
        if ((idx >= underline1[cur_phrase] && idx <= underline2[cur_phrase]) || puzzle_solved) {
          box.classList.add('nokey');
        } else {
          box.classList.add('trans_nokey');
        }
      } else {
        box.classList.add('blank');
      }

      box.addEventListener('click', () => {
        lin_idx = idx;
        if (prev_lin_idx == lin_idx && num_arrX[lin_idx] == 2) {
          if (cur_phrase == 0) {
            cur_phrase = 1;
          } else if (cur_phrase == last_lins.length - 1) {
            cur_phrase = last_lins.length - 2;
          } else if (prev_lin_idx >= underline1[cur_phrase + 1]) {
            cur_phrase ++;
          } else {
            cur_phrase --;
          }
        }
        let log1 = true;
        if (lin_idx <= underline2[cur_phrase] && lin_idx >= underline1[cur_phrase]){
          log1 = false;
        }
        while (log1) {
          for (let phrase_idx = 0; phrase_idx < last_lins.length; phrase_idx++) {
            if (lin_idx >= underline1[phrase_idx]) {
              cur_phrase = phrase_idx;
              log1 = false;
            }
          }
        }
        updateDisplay();
        updateClue();
        prev_lin_idx = lin_idx;
      });

      container.appendChild(box);

      const content = guess_arrX[idx];
      if (content && content !== 0) {
        box.textContent = content;
      }
    }
  }

  function createKeyboard() {
    keyboard.innerHTML = '';

    const rows = [
      { keys: '↑↓      ←→', arrow: true, backspace: false },
      { keys: 'QWERTYUIOP', arrow: false, backspace: false },
      { keys: 'ASDFGHJKL', arrow: false, backspace: false },
      { keys: 'ZXCVBNM', arrow: false, backspace: true }
    ];

    rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('keyboard-row');

      if (row.backspace) {
        const delFwdButton = document.createElement('button');
        delFwdButton.classList.add('del-btn');
        delFwdButton.textContent = '⌦';
        delFwdButton.addEventListener('click', () => handleKeyPress('Delete'));
        rowDiv.appendChild(delFwdButton);
      }

      row.keys.split('').forEach(key => {
        if (row.arrow) {
          if (key == ' ') {
            const button = document.createElement('button');
            button.classList.add('blank-keyboard-btn');
            button.textContent = key;
            rowDiv.appendChild(button);
          }
          else {
            const button = document.createElement('button');
            button.classList.add('arrow-keyboard-btn');
            button.textContent = key;
            if (key == '↑') {
              button.addEventListener('click', () => handleKeyPress('ArrowUp'));
            } else if (key == '↓') {
              button.addEventListener('click', () => handleKeyPress('ArrowDown'));
            } else if (key == '←') {
              button.addEventListener('click', () => handleKeyPress('ArrowLeft'));
            } else if (key == '→') {
              button.addEventListener('click', () => handleKeyPress('ArrowRight'));
            }
            rowDiv.appendChild(button);
          }
        } else {
          const button = document.createElement('button');
          button.classList.add('keyboard-btn');
          button.textContent = key;
          button.addEventListener('click', () => handleKeyPress(key));
          rowDiv.appendChild(button);
        }
      });

      if (row.backspace) {
        const backspaceButton = document.createElement('button');
        backspaceButton.classList.add('backspace-btn');
        backspaceButton.textContent = '⌦';
        backspaceButton.addEventListener('click', () => handleKeyPress('Backspace'));
        rowDiv.appendChild(backspaceButton);
      }

      keyboard.appendChild(rowDiv);
    });
  }

  function handleKeyPress(key) {
    const event = new KeyboardEvent('keydown', { key: key });
    document.dispatchEvent(event);
  }

  function handleBackspace(LA_Typed) {
    if (!LA_Typed) {
      if (guess_arrX[lin_idx] == 0) {
        lin_idx --;
        let log1 = true;
        while (log1) {
          if (num_arrX[lin_idx] == 0) {
            lin_idx --;
          }
          else {
            log1 = false;
          }
        }
      }
      lin_idx = Math.max(lin_idx, 0);
      const currentBox = document.querySelectorAll('.box')[lin_idx];
      currentBox.textContent = '';
      guess_arrX[lin_idx] = 0;
      }
    else {
      lin_idx --;
      let log1 = true;
      while (log1) {
        if (num_arrX[lin_idx] == 0) {
          lin_idx --;
        }
        else {
          log1 = false;
        }
      }
      lin_idx = Math.max(lin_idx, 0);
    }
    if (lin_idx < underline1[cur_phrase] && cur_phrase != 0) {
      cur_phrase --;
    }
  }

  function handleTyping(RA_Typed) {
    const currentBox = document.querySelectorAll('.box')[lin_idx];
    if (!RA_Typed) {
      currentBox.textContent = event.key.toUpperCase();
      guess_arrX[lin_idx] = event.key.toUpperCase();
    }
    if (lin_idx < last_lins[cur_phrase]) {
      lin_idx ++;
      let log1 = true;
      while (log1) {
        if (num_arrX[lin_idx] == 0) {
          lin_idx ++;
        }
        else {
          log1 = false;
        }
      }
    }
    else if (lin_idx < last_lins[last_lins.length - 1]) {
      cur_phrase ++;
      lin_idx = first_lins[cur_phrase];
    }
    checkIfCorrect();
  }

  function handleUA() {
    if (cur_phrase > 0) {
      cur_phrase--;
      let log1 = true;
      while (log1) {
        if (lin_idx > underline1[cur_phrase]) {
          lin_idx--;
        } else {
          log1 = false;
        }
      }
    }
    else {
      lin_idx = underline1[cur_phrase];
    }
  }

  function handleDA() {
    if (cur_phrase < last_lins.length - 1) {
      cur_phrase++;
      let log1 = true;
      while (log1) {
        if (lin_idx < underline1[cur_phrase]) {
          lin_idx++;
        } else {
          log1 = false;
        }
      }
    }
    else {
      lin_idx = underline2[cur_phrase];
    }
  }

  function handleDelFwd() {
    if (lin_idx < last_lins[cur_phrase]) {
      lin_idx ++;
      let log1 = true;
      while (log1) {
        if (num_arrX[lin_idx] == 0) {
          lin_idx ++;
        }
        else {
          log1 = false;
        }
      }
    }
    else if (lin_idx < last_lins[last_lins.length - 1]) {
      cur_phrase ++;
      lin_idx = first_lins[cur_phrase];
    }
    const currentBox = document.querySelectorAll('.box')[lin_idx];
    currentBox.textContent = '';
    guess_arrX[lin_idx] = 0;
  }
  
  function checkIfCorrect() {
    let correct = true;
    for (let idx = 0; idx < last_lins[last_lins.length - 1] + 1; idx++) {
      if (guess_arrX[idx] != str_arrX[idx]) {
        correct = false;
      }
    }
    if (correct) {
      puzzle_solved = true;
      updateDisplay();
      solvedPopup.style.display = "block";
      shareButtonPop.style.display = "block";
      let minutes = Math.floor(puzScore / 60);
      let seconds = puzScore % 60;
      solvedScore.textContent = minutes.toString() + ':' + seconds.toString().padStart(2, '0');
      solvedBlur(true);
      let audio = document.getElementById("solveSound");
      audio.load();
      audio.play();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  function handleDatePickerChange(event) {
    const selectedDate = event.target.value;
    const formattedDate = selectedDate.replace(/-/g, '');
    let currentString = ALL_PHRASES[formattedDate];
    ({BOXROWS, BOXCOLS, last_lins, first_lins, underline1, underline2, num_arrX, str_arrX, guess_arrX} = inputs(currentString));
    cur_phrase = 0;
    lin_idx = first_lins[cur_phrase];
    prev_lin_idx = first_lins[cur_phrase];
    puzScore = 0;
    formattedDateX = formattedDate;
    document.documentElement.style.setProperty('--BOXROWS', BOXROWS);
    document.documentElement.style.setProperty('--BOXCOLS', BOXCOLS);
    pause_showing = false;
    pausePopup.style.display = "none";
    pauseBlur(false);
    puzzle_solved = false;
    solvedPopup.style.display = "none";
    solvedBlur(false);
    play_showing = true;
    playPopup.style.display = "block";
    playBlur(true);
    shareButtonPop.style.display = "none";
    solvedScore.textContent = "";
    updateDisplay();
    createKeyboard();
    updateScoreDisplay(puzScore);
    updateClue();
  }

  function setDateDisplay(date) {
    dateDisplay.textContent = date;
    let shareDate5 = date.replace(/ /g, "");
    pauseDate.textContent = shareDate5;
    playDate.textContent = shareDate5;
  }

  function updateClue() {
    let clue1 = cur_phrase.toString();
    let clue2 = formattedDateX;
    let clue3 = clue2 + "_" + clue1;
    clueValue.textContent = ALL_PHRASES[clue3];
  }

  function formatDate(date) {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    return `${month} / ${day} / ${year}`;
  }

  function updateScoreDisplay(scoreInSeconds) {
    let minutes = Math.floor(scoreInSeconds / 60);
    let seconds = scoreInSeconds % 60;
    scoreValue.textContent = minutes.toString() + ':' + seconds.toString().padStart(2, '0');
  }

  function solvedBlur(show) {
    solvedToBlur.forEach(element => {
      if (show) {
        element.classList.add('solvedBlur');
      } else {
        element.classList.remove('solvedBlur');
      }
    });
  }

  function infoBlur(show) {
    infoToBlur.forEach(element => {
      if (show) {
        element.classList.add('infoBlur');
      } else {
        element.classList.remove('infoBlur');
      }
    });
  }

  function pauseBlur(show) {
    pauseToBlur.forEach(element => {
      if (show) {
        element.classList.add('pauseBlur');
      } else {
        element.classList.remove('pauseBlur');
      }
    });
  }

  function playBlur(show) {
    playToBlur.forEach(element => {
      if (show) {
        element.classList.add('playBlur');
      } else {
        element.classList.remove('playBlur');
      }
    });
  }

  function handleTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      }
    intervalId = setInterval(() => {
      if (!puzzle_solved && !pause_showing && !info_showing && !play_showing) {
          puzScore += 1;
          updateScoreDisplay(puzScore);
      }
    }, 1000);
  }

  const fp = flatpickr("#date-display", {
    yearSelectorType: 'dropdown',
    disableMobile: true,
    onChange: function(selectedDates, dateStr, instance) {
      const formattedDate = dateStr.replace(/-/g, '');
      const formattedDate1 = formatDate(formattedDate);
      setDateDisplay(formattedDate1);
      handleDatePickerChange({ target: { value: dateStr } });
    },

    onOpen: function(selectedDates, dateStr, instance) {
      const rect = dateDisplay.getBoundingClientRect();
      instance.calendarContainer.style.top = `${rect.bottom + window.scrollY}px`;
      instance.calendarContainer.style.left = `${rect.left + window.scrollX}px`;

      const todayButton = document.createElement('button');
      todayButton.textContent = 'Today';
      todayButton.className = 'flatpickr-today-btn';
      todayButton.addEventListener('click', () => {
        const today = new Date().toLocaleDateString('en-CA');
        instance.setDate(today, true);
        const formattedDate = dateStr.replace(/-/g, '');
        const formattedDate1 = formatDate(formattedDate);
        setDateDisplay(formattedDate1);
        handleDatePickerChange({ target: { value: today } });
        instance.close();
      });
      instance.calendarContainer.appendChild(todayButton);
    },

    onClose: function(selectedDates, dateStr, instance) {
      const formattedDate = dateStr.replace(/-/g, '');
      const formattedDate1 = formatDate(formattedDate);
      setDateDisplay(formattedDate1);
    },

    minDate: "2024-09-22",
    maxDate: "today"
  });
  
  document.addEventListener('keydown', (event) => {
    if ((puzzle_solved || info_showing || pause_showing || play_showing) && event.key !== 'Escape') {
      return;
    }

    else if (event.key === 'Escape') {
      playPopup.style.display = "none";
      playBlur(false);
      play_showing = false;
      infoPopup.style.display = "none";
      infoBlur(false);
      info_showing = false;
      pausePopup.style.display = "none";
      pauseBlur(false);
      pause_showing = false;
      handleTimer();
    }

    else {
      if (event.key === 'Backspace') {
        LA_Typed = false;
        handleBackspace(LA_Typed);
      } 

      else if (event.key === 'Delete') {
        handleDelFwd();
      } 

      else if (/^[a-zA-Z]$/.test(event.key)) {
        RA_Typed = false;
        handleTyping(RA_Typed);
      }

      else if (event.key === 'ArrowRight') {
        RA_Typed = true;
        handleTyping(RA_Typed);
      }

      else if (event.key === 'ArrowLeft') {
        LA_Typed = true;
        handleBackspace(LA_Typed);
      }

      else if (event.key === 'ArrowUp') {
        handleUA();
      }

      else if (event.key === 'ArrowDown') {
        handleDA();
      }
      
      updateDisplay();
      updateClue();
      createKeyboard();
    }
  });

  dateDisplay.addEventListener('click', () => {
    fp.open();
  });

  infoButton.addEventListener('click', () => {
    infoPopup.style.display = "block";
    infoBlur(true);
    info_showing = true;
    handleTimer();
  })

  document.querySelector(".infoClose").addEventListener("click", function() {
    infoPopup.style.display = "none";
    infoBlur(false);
    info_showing = false;
    handleTimer();
  });

  shareButtonPop.addEventListener('click', () => {
    let shareDate = dateDisplay.textContent;
    let shareDate1 = shareDate.replace(/ /g, "");
    if (puzzle_solved) {
      if (navigator.share) {
        navigator.share({
            text: "I solved the " + shareDate1 + " Caphrase in " + scoreValue.textContent + "\nPlay at caphrase.com"
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
      } else {
        alert('Sharing Not Avaliable.');
      }
    }
  })

  pauseButton.addEventListener('click', () => {
    pausePopup.style.display = "block";
    pauseBlur(true);
    pause_showing = true;
    handleTimer();
  })

  document.querySelector(".continueButton").addEventListener("click", function() {
    pausePopup.style.display = "none";
    pauseBlur(false);
    pause_showing = false;
    infoPopup.style.display = "none";
    infoBlur(false);
    info_showing = false;
    handleTimer();
  });

  document.querySelector(".playButton").addEventListener("click", function() {
    playPopup.style.display = "none";
    playBlur(false);
    play_showing = false;
    infoPopup.style.display = "none";
    infoBlur(false);
    info_showing = false;
    handleTimer();
  });

  document.addEventListener('visibilitychange', () => {
    if (!puzzle_solved && !info_showing && !play_showing) {
      if (document.visibilityState === 'hidden') {
        pausePopup.style.display = "block";
        pauseBlur(true);
        pause_showing = true;
        handleTimer();
      }
    }
  });

  initialize();

});