// survey-flow.js
import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  loadHeaderFooter();
  initSurveyFlow();
});

function loadHeaderFooter() {
  fetch('header.html')
    .then(r => r.text())
    .then(t => document.getElementById('header').innerHTML = t);

  fetch('footer.html')
    .then(r => r.text())
    .then(t => document.getElementById('footer').innerHTML = t);
}

function initSurveyFlow() {
  const params = new URLSearchParams(window.location.search);
  const surveyId = parseInt(params.get('id'), 10);
  const content = document.getElementById('content');

  if (!surveyId) {
    content.innerHTML = '<div class="center">ID опитування не вказано.</div>';
    return;
  }

  let survey = null;
  let currentIndex = 0;
  let selectedAnswerId = null;
  let userAnswers = [];

  function renderQuestion() {
    const question = survey.questions[currentIndex];
    content.innerHTML = `
      <div class="counter">Питання ${currentIndex + 1} з ${survey.questions.length}</div>
      <div class="subject">${question.subject}</div>
      <div class="text">${question.text}</div>
      <div id="answers"></div>
      <a class="button button-next button-disabled">Далі</a>
    `;

    const answersDiv = document.getElementById('answers');
    const nextButton = document.querySelector('.button-next');

    question.answers.forEach(answer => {
      const btn = document.createElement('div');
      btn.className = 'answer-button';
      btn.textContent = answer.displayText;
      btn.onclick = () => {
        selectedAnswerId = answer.id;
        document.querySelectorAll('.answer-button').forEach(b => b.classList.remove('selected-answer'));
        btn.classList.add('selected-answer');
        nextButton.classList.remove('button-disabled');
        nextButton.classList.add('button');
        nextButton.style.pointerEvents = 'auto';
      };
      answersDiv.appendChild(btn);
    });

    nextButton.onclick = () => {
      if (!selectedAnswerId) return;

      userAnswers.push({
        questionId: question.id,
        answerId: selectedAnswerId
      });

      selectedAnswerId = null;

      if (currentIndex + 1 < survey.questions.length) {
        currentIndex++;
        renderQuestion();
      } else {
        submitAnswers();
      }
    };

    nextButton.style.pointerEvents = 'none';
    nextButton.classList.add('button-disabled');
  }

  function submitAnswers() {
    content.innerHTML = '<div class="center">Обробка результатів...</div>';

    const payload = {
      questionaryId: surveyId,
      answers: userAnswers
    };

    fetch(`${API_BASE_URL}/questionarries/calculate-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(result => {
        showResult(result);
      })
      .catch(error => {
        console.error('Score submission error:', error);
        content.innerHTML = '<div class="center">Не вдалося надіслати результати.</div>';
      });
  }

  function showResult({ score, message }) {
    content.innerHTML = `
      <h1>Результат опитування</h1>
      <p><strong>Оцінка:</strong> ${score}</p>
      <p><strong>Повідомлення:</strong> ${message}</p>
      <a href="index.html" class="button">Повернутися на головну</a>
    `;
  }

  fetch(`${API_BASE_URL}/questionarries/${surveyId}`, {
    headers: { accept: 'application/json' }
  })
    .then(r => r.json())
    .then(data => {
      survey = data;
      if (!survey.questions || survey.questions.length === 0) {
        content.innerHTML = '<div class="center">Це опитування не містить питань.</div>';
        return;
      }
      renderQuestion();
    })
    .catch(error => {
      console.error('Survey fetch error:', error);
      content.innerHTML = '<div class="center">Не вдалося завантажити опитування.</div>';
    });
}
