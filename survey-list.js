// survey-list.js
import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  loadHeaderFooter();
  loadSurveys();
});

function loadHeaderFooter() {
  fetch('header.html')
    .then(r => r.text())
    .then(t => document.getElementById('header').innerHTML = t);

  fetch('footer.html')
    .then(r => r.text())
    .then(t => document.getElementById('footer').innerHTML = t);
}

async function loadSurveys() {
  const list = document.getElementById('surveyList');
  const loading = document.getElementById('loading');

  try {
    const response = await fetch(`${API_BASE_URL}/questionarries`, {
      headers: { accept: 'application/json' }
    });
    const data = await response.json();
    const surveys = data.items || [];

    loading.style.display = 'none';

    if (surveys.length === 0) {
      list.innerHTML = '<div class="center">Немає доступних опитувань.</div>';
      return;
    }

    surveys.forEach(survey => {
      const link = document.createElement('a');
      link.href = `survey-details.html?id=${survey.id}`;
      link.style.textDecoration = 'none';
      link.style.color = 'inherit';

      const card = document.createElement('div');
      card.className = 'survey-card';
      card.style.cursor = 'pointer';

      const title = document.createElement('div');
      title.className = 'survey-title';
      title.textContent = survey.name || 'Без назви';

      card.appendChild(title);
      link.appendChild(card);
      list.appendChild(link);
    });
  } catch (error) {
    loading.textContent = 'Не вдалося завантажити опитування.';
    console.error('Survey fetch error:', error);
  }
}
