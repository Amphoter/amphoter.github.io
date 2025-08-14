// survey-details.js
import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  loadHeaderFooter();
  loadSurveyDetails();
});

function loadHeaderFooter() {
  fetch('header.html')
    .then(r => r.text())
    .then(t => document.getElementById('header').innerHTML = t);

  fetch('footer.html')
    .then(r => r.text())
    .then(t => document.getElementById('footer').innerHTML = t);
}

function loadSurveyDetails() {
  const params = new URLSearchParams(window.location.search);
  const surveyId = params.get('id');
  const content = document.getElementById('content');

  if (!surveyId) {
    content.innerHTML = '<div class="center">ID опитування не вказано.</div>';
    return;
  }

  fetch(`${API_BASE_URL}/questionarries/${surveyId}`, {
    headers: { accept: 'application/json' }
  })
    .then(r => r.json())
    .then(survey => {
      content.innerHTML = `
        <h1>${survey.name || 'Без назви'}</h1>
        <p>${survey.description || 'Опис відсутній.'}</p>
        <a href="survey-flow.html?id=${survey.id}" class="start-button">Почати опитування</a>
      `;
    })
    .catch(error => {
      console.error('Survey fetch error:', error);
      content.innerHTML = '<div class="center">Не вдалося завантажити деталі опитування.</div>';
    });
}
