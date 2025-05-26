// ============= Состояние приложения =============
let randomQuestions = [];
let currentQuestion = 0;
let score = 0;
let userData = {
    fullName: '',
    company: '',
    email: ''
};

// Добавляем массив для хранения выбранных ответов
let userAnswers = [];

// ============= DOM элементы =============
const elements = {
    registration: document.getElementById('registration'),
    startQuiz1: document.getElementById('startQuiz1'),
    startQuiz2: document.getElementById('startQuiz2'),
    startQuiz3: document.getElementById('startQuiz3'),
    fullName: document.getElementById('fullName'),
    company: document.getElementById('company'),
    email: document.getElementById('email'),
    agreement: document.getElementById('agreement'),
    question: document.getElementById('question'),
    choices: document.getElementById('choices'),
    submit: document.getElementById('submit'),
    quiz: document.getElementById('quiz'),
    results: document.getElementById('results'),
    resultsContainer: document.getElementById('resultsContainer'),
    score: document.getElementById('score'),
    restart: document.getElementById('restart'),
    quizButtons: [
        document.getElementById('startQuiz1'),
        document.getElementById('startQuiz2'),
        document.getElementById('startQuiz3')
    ],
    progressContainer: document.getElementById('progress-container'),
    currentQuestion: document.getElementById('current-question'),
    totalQuestions: document.getElementById('total-questions'),
    progressFill: document.querySelector('.progress-fill'),
};

// ============= Вспомогательные функции =============
function getRandomQuestionsFromAllSources(questionsPerSource) {
    // Массив всех источников данных
    const allDataSources = [
        quizRostelecomData,
        quizPositiveData,
        quizVkData,
        quizVkladData,
        quizYandexData,
        quizMincifraData,
        quizRosatomData,
        quizAvitoData
    ];
    
    let result = [];
    
    // Получаем вопросы из каждого источника
    allDataSources.forEach(source => {
        let tempArray = [...source.questions];
        
        // Получаем нужное количество случайных вопросов из текущего источника
        for (let i = 0; i < questionsPerSource && tempArray.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tempArray.length);
            result.push({
                ...tempArray[randomIndex],
                logo: source.logo // Добавляем логотип к вопросу
            });
            tempArray.splice(randomIndex, 1);
        }
    });
    
    // Перемешиваем итоговый массив вопросов
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    
    return result;
}

// Объединенная функция проверки формы
function validateForm(showAlert = true) {
    // Убедимся, что все элементы доступны перед проверкой
    if (!elements.fullName || !elements.company || !elements.email || !elements.agreement) {
        console.error("Form elements not ready for validation yet.");
        return false;
    }

    const isFullNameValid = elements.fullName.value.trim() !== '';
    const isCompanyValid = elements.company.value.trim() !== '';
    const isEmailValid = elements.email.value.trim() !== '';
    const isAgreementChecked = elements.agreement.checked;

    const isValid = isFullNameValid && isCompanyValid && isEmailValid && isAgreementChecked;

    // Показываем алерты только если требуется (при отправке формы)
    if (showAlert && !isValid) {
        if (!isFullNameValid) {
            alert('Пожалуйста, введите ФИО');
        } else if (!isCompanyValid) {
            alert('Пожалуйста, введите название компании');
        } else if (!isEmailValid) {
            alert('Пожалуйста, введите email');
        } else if (!isAgreementChecked) {
            alert('Необходимо согласие на обработку персональных данных');
        }
    }

    // Обновляем состояние кнопок
    if (elements.quizButtons) {
        elements.quizButtons.forEach(button => {
            if (button) {
                button.disabled = !isValid;
                if (!isValid) {
                    button.classList.add('disabled');
                } else {
                    button.classList.remove('disabled');
                }
            }
        });
    }

    return isValid;
}

// ============= Функции управления квизом =============
function loadQuestion() {
    const questionData = randomQuestions[currentQuestion];
    console.log('currentQuestion:', currentQuestion, 'randomQuestions:', randomQuestions);
    if (!questionData) {
        alert('Нет данных для вопроса!');
        console.error('Нет данных для вопроса', currentQuestion, randomQuestions);
        return;
    }
    const quizContent = document.querySelector('.quiz-content');
    const currentLogoSrc = questionData.logo;

    // --- Подсветка логотипов ---
    const allMarqueeLogos = document.querySelectorAll('.background-marquee .marquee-content img');
    allMarqueeLogos.forEach(img => {
        img.classList.remove('highlighted-logo');
        if (currentLogoSrc && img.src.endsWith(currentLogoSrc)) {
            img.classList.add('highlighted-logo');
        }
    });

    // Полная очистка контента
    quizContent.innerHTML = '';

    if (questionData.image) {
        quizContent.classList.add('layout-two-column');
    } else {
        quizContent.classList.remove('layout-two-column');
    }

    // 1. Контейнер вопроса (лого + текст)
    const questionContainer = document.createElement('div');
    questionContainer.className = 'quiz-question-area';
    // Добавляем логотип компании сверху
    let logoHtml = '';
    if (questionData.logo) {
        logoHtml = `<div class="question-logo" style="display:flex;justify-content:center;margin-bottom:18px;"><img src="${questionData.logo}" alt="logo" style="max-height:60px;max-width:120px;object-fit:contain;"></div>`;
    }
    questionContainer.innerHTML = `
        ${logoHtml}
        <div class="question-text">
            ${questionData.question}
        </div>
    `;
    quizContent.appendChild(questionContainer);
    console.log('Добавлен вопрос');

    // 2. Изображение (если есть)
    if (questionData.image) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'quiz-image-area question-image-container';
        const imgElement = document.createElement('img');
        imgElement.src = questionData.image;
        imgElement.alt = 'Question illustration';
        imageContainer.appendChild(imgElement);
        quizContent.appendChild(imageContainer);
        console.log('Добавлена картинка');
    }

    // 3. Варианты ответов
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices';
    choicesContainer.className = 'quiz-choices-area';
    questionData.choices.forEach((choiceText, index) => {
        const button = document.createElement('button');
        button.className = 'choice';
        button.textContent = choiceText;
        button.addEventListener('click', (event) => selectChoice(button, event));
        choicesContainer.appendChild(button);
    });
    quizContent.appendChild(choicesContainer);
    elements.choices = choicesContainer; // ВАЖНО: обновляем ссылку

    // 4. Прогресс-бар (отдельной строкой)
    let progressContainer = document.createElement('div');
    progressContainer.id = 'progress-container';
    progressContainer.innerHTML = `
        <div class="progress-bar">
            <div class="progress-fill"></div>
            <span class="progress-text">1 из 6</span>
        </div>
    `;
    quizContent.appendChild(progressContainer);
    elements.progressFill = progressContainer.querySelector('.progress-fill');

    // 5. Кнопки действий (отдельной строкой)
    const actionsRow = document.createElement('div');
    actionsRow.className = 'quiz-actions-row';
    actionsRow.innerHTML = `
        <button class="back-button"${currentQuestion === 0 ? ' disabled' : ''} onclick="goToPreviousQuestion()">← Вернуться назад</button>
        <button id="submit">Следующий вопрос</button>
    `;
    const submitButton = actionsRow.querySelector('#submit');
    submitButton.addEventListener('click', handleSubmit);
    quizContent.appendChild(actionsRow);
    elements.submit = submitButton;

    // Проверяем, есть ли сохраненный ответ для текущего вопроса
    const savedAnswer = userAnswers[currentQuestion];
    if (savedAnswer !== undefined) {
        // Если есть сохраненный ответ, выбираем его и показываем результаты
        const choiceButtons = Array.from(elements.choices.children);
        if (choiceButtons[savedAnswer]) {
            // Восстанавливаем выбранный ответ и показываем правильный/неправильный
            const correctIndex = randomQuestions[currentQuestion].correct;
            choiceButtons[savedAnswer].classList.add('selected');
            if (savedAnswer === correctIndex) {
                choiceButtons[savedAnswer].classList.add('correct');
            } else {
                choiceButtons[savedAnswer].classList.add('incorrect');
                choiceButtons[correctIndex].classList.add('correct');
            }
            choiceButtons.forEach(btn => btn.classList.add('disabled'));
            elements.submit.disabled = false;
            elements.submit.classList.remove('disabled');
        }
    } else {
        elements.submit.disabled = true;
        elements.submit.classList.add('disabled');
    }

    updateProgress();
}

function selectChoice(button, event) {
    const currentChoicesContainer = button.closest('#choices');
    if (!currentChoicesContainer) return;

    // Снимаем выбор с предыдущей кнопки и удаляем классы correct/incorrect со всех кнопок
    const choiceButtons = Array.from(currentChoicesContainer.children);
    choiceButtons.forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect');
        btn.classList.remove('disabled');
    });

    // Выбираем новую кнопку
    button.classList.add('selected');

    // Получаем индекс выбранного ответа
    const selectedAnswerIndex = choiceButtons.indexOf(button);
    const correctIndex = randomQuestions[currentQuestion].correct;
    
    // Сохраняем ответ пользователя
    const wasAnswered = userAnswers[currentQuestion] !== undefined;
    userAnswers[currentQuestion] = selectedAnswerIndex;

    // Сразу показываем правильный/неправильный ответ
    if (selectedAnswerIndex === correctIndex) {
        // Увеличиваем score только если раньше не было ответа
        if (!wasAnswered) {
            score++;
        }
        button.classList.add('correct');
        // --- Анимация частиц ---
        createParticles(button, 'green', event);
    } else {
        button.classList.add('incorrect');
        // Показываем правильный ответ
        if (choiceButtons[correctIndex]) {
            choiceButtons[correctIndex].classList.add('correct');
        }
        // --- Анимация красных частиц ---
        createParticles(button, 'red', event);
    }

    // Блокируем кнопки после ответа
    choiceButtons.forEach(btn => btn.classList.add('disabled'));

    // Разблокируем кнопку "Следующий вопрос"
    if (elements.submit) {
        elements.submit.disabled = false;
        elements.submit.classList.remove('disabled');
    }
}

function resetHighlightedLogos() {
    // Удаляем класс highlighted-logo со всех логотипов в бегущей строке
    const allMarqueeLogos = document.querySelectorAll('.background-marquee .marquee-content img');
    allMarqueeLogos.forEach(img => {
        img.classList.remove('highlighted-logo');
    });
}

function showResults() {
    resetHighlightedLogos();

    elements.quiz.style.display = 'none';
    elements.results.style.display = 'flex';

    const correctPercent = Math.floor((score / randomQuestions.length) * 100/2);
    let resultText = '';
    let resultColor = '';

    if (correctPercent >= 70) {
        resultText = 'Цифровой гуру';
        resultColor = '#78E150'; // ярко-зелёный
    } else if (correctPercent >= 40) {
        resultText = 'Цифровой хорошист';
        resultColor = '#1A8F2A'; // тёмно-зелёный
    } else {
        resultText = 'Цифровой второгодник';
        resultColor = '#FF0050'; // насыщенный красный
    }

    const total = randomQuestions.length;
    const correct = score/2;
    const angle = (correct / total) * 360;
    const r = 60, cx = 70, cy = 70;
    const largeArc = angle > 180 ? 1 : 0;
    const x = cx + r * Math.cos((angle - 90) * Math.PI / 180);
    const y = cy + r * Math.sin((angle - 90) * Math.PI / 180);
    const piePath = correct === 0
        ? ''
        : `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 ${largeArc},1 ${x},${y} Z`;

    // --- Добавляем эмодзи ---
    let emoji = '';
    if (correct === total && total > 0) {
        emoji = '😎'; // топовый результат
    } else if (correct === 0 && total > 0) {
        emoji = '😔';
    } else {
        emoji = '👍'; // средний результат
    }

    elements.results.innerHTML = `
        <div class="results-header">ТЕСТ ЗАВЕРШЕН</div>
        <div class="results-main">
            <div class="results-left">
                <div class="results-label">Ваш результат:</div>
                <div class="results-title" style="color:${resultColor}">${resultText}</div>
            </div>
            <div class="results-right">
                <div class="results-answers-label">Правильных ответов</div>
                <div class="results-answers-value">
                    <span style='color:#2A3AFF; font-weight:900;'>${score/2}</span>
                    <span style='color:#2A3AFF; font-weight:900;'> / </span>
                    <span style='color:#2A3AFF; font-weight:900;'>${total}</span>
                </div>
            </div>
            <div class="results-pie" style="position:relative;">
                <svg width="240" height="240" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="60" fill="#fff" stroke="#2A3AFF" stroke-width="2"/>
                        ${correct > 0 ? `<path d="${piePath}" fill="#2A3AFF"/>` : ''}
                </svg>
                <div class="pie-emoji" style="
                    position:absolute;
                    left:50%; top:50%;
                    transform:translate(-50%,-50%);
                    font-size:48px;
                    pointer-events:none;
                    user-select:none;
                ">${emoji}</div>
            </div>
            
        </div>
        <div class="results-actions-row">
            <button id="restart" class="results-btn results-btn-outline">Начать заново</button>
            <button id="send-email" class="results-btn results-btn-blue">Отправить результаты на почту</button>
        </div>
        <div class="results-logos-row" style="width:100%;display:flex;justify-content:center;align-items:center;gap:32px;margin:32px 0 0 0;flex-wrap:wrap;">
            <img src="images/logos/mincifra.png" alt="Mincifra" style="height:50px;max-width:120px;object-fit:contain;" />
            <img src="images/logos/rostelecom.png" alt="Rostelecom" style="height:50px;max-width:120px;object-fit:contain;" />
            <img src="images/logos/positive.png" alt="Positive" style="height:50px;max-width:120px;object-fit:contain;" />
            <img src="images/logos/vk.png" alt="VK" style="height:50px;max-width:120px;object-fit:contain;" />
            <img src="images/logos/vklad.png" alt="Vklad" style="height:50px;max-width:120px;object-fit:contain;" />
            <img src="images/logos/yandex.png" alt="Yandex" style="height:50px;max-width:120px;object-fit:contain;" />
            <img src="images/logos/rosatom.png" alt="Rosatom" style="height:50px;max-width:120px;object-fit:contain;" />
            <img src="images/logos/avito.png" alt="Avito" style="height:50px;max-width:120px;object-fit:contain;" />
        </div>
    `;

    elements.results.querySelector('#restart').addEventListener('click', resetQuiz);
    elements.results.querySelector('#send-email').addEventListener('click', sendResultsByEmail);
}

function resetQuiz() {
    // Сбрасываем массив ответов
    userAnswers = [];
    currentQuestion = 0;
    score = 0;
    
    // Сбрасываем выделение логотипов
    resetHighlightedLogos();
    
    // Очистка формы
    elements.fullName.value = '';
    elements.company.value = '';
    elements.email.value = '';
    elements.agreement.checked = false;
    
    // Сброс данных
    userData = { fullName: '', company: '', email: '' };
    
    // Управление отображением
    elements.registration.style.display = 'block';
    elements.quiz.style.display = 'none';
    elements.results.style.display = 'none';
    
    // Сброс состояния кнопок
    validateForm(false);
}

// ============= Функция для начала квиза =============
function startQuiz(totalQuestions) {
    if (validateForm(true)) {
        userData = {
            fullName: elements.fullName.value.trim(),
            company: elements.company.value.trim(),
            email: elements.email.value.trim()
        };
        
        elements.registration.style.display = 'none';
        elements.quiz.style.display = 'block';
        // elements.progressContainer.style.display = 'block';
        
        // Определяем количество вопросов из каждого источника
        const questionsPerSource = totalQuestions / 8;
        randomQuestions = getRandomQuestionsFromAllSources(questionsPerSource);
        
        loadQuestion();
    }
}

// ============= Обработчики событий =============
elements.startQuiz1.addEventListener('click', () => startQuiz(8));  // 3 минуты - 8 вопросов (по 1 из каждого источника)
elements.startQuiz2.addEventListener('click', () => startQuiz(16)); // 5 минут - 16 вопросов (по 2 из каждого источника)
elements.startQuiz3.addEventListener('click', () => startQuiz(24)); // 7 минут - 24 вопросов (по 3 из каждого источника)

elements.restart?.addEventListener('click', resetQuiz);

// ============= Инициализация =============
// Вызовем функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Running initial form validation...");
    
    // Явно деактивируем кнопки начала квиза при загрузке страницы
    if (elements.quizButtons) {
        elements.quizButtons.forEach(button => {
            if (button) {
                button.disabled = true;
                button.classList.add('disabled');
            }
        });
    }
    
    validateForm(false);
});

// Добавляем новую функцию для отправки результатов
async function sendResultsByEmail() {
    try {
        // Вычисляем тип результата
        let type;
        const percent = Math.floor((score / randomQuestions.length) * 100/2);
        if (percent >= 70) {
            type = 1;
        } else if (percent >= 40) {
            type = 2;
        } else {
            type = 3;
        }
        const response = await fetch('http://localhost:5000/generate-certificate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: userData.fullName,
                company: userData.company,
                email: userData.email,
                score: score/2,
                total: randomQuestions.length,
                type: type // добавляем тип
            })
        });

        if (response.ok) {
            alert('Результаты успешно отправлены на почту!');
        } else {
            throw new Error('Ошибка при отправке результатов');
        }
    } catch (error) {
        alert('Произошла ошибка при отправке результатов: ' + error.message);
    }
}

// Добавляем функцию обновления прогресса
function updateProgress() {
    const questionsExist = randomQuestions && Array.isArray(randomQuestions) && randomQuestions.length > 0;
    if (questionsExist && elements.progressFill) {
        const currentQIndex = typeof currentQuestion === 'number' ? currentQuestion : 0;
        const totalQ = randomQuestions.length;

        // Вычисляем процент
        const progressPercentage = ((currentQIndex + 1) / totalQ) * 100;
        elements.progressFill.style.width = `${progressPercentage}%`;

        // Обновляем текст только в актуальном progress-bar
        let progressContainer = document.getElementById('progress-container');
        const progressText = progressContainer ? progressContainer.querySelector('.progress-text') : null;
        if (progressText) {
            progressText.textContent = `${currentQIndex + 1} из ${totalQ}`;
        }
    } else {
        // Сброс прогресса, если нет данных
        if (elements.progressFill) {
            elements.progressFill.style.width = '0%';
        }
        let progressContainer = document.getElementById('progress-container');
        const progressText = progressContainer ? progressContainer.querySelector('.progress-text') : null;
        if (progressText) {
            progressText.textContent = `1 из ??`;
        }
    }
}

// Выносим обработчик submit в отдельную функцию
function handleSubmit() {
    // Используем глобальную ссылку elements.choices, которая обновляется в loadQuestion
    const selectedChoice = elements.choices?.querySelector('.selected');
    if (!selectedChoice) return; // Не даем перейти дальше без выбора

    const choiceButtons = Array.from(elements.choices.children);
    const selectedAnswerIndex = choiceButtons.indexOf(selectedChoice);

    // Добавляем очко, если ответ правильный
    if (selectedAnswerIndex === randomQuestions[currentQuestion].correct) {
        score++;
    }

    // Переходим к следующему вопросу без таймера
    currentQuestion++;
    if (currentQuestion < randomQuestions.length) {
        loadQuestion();
        // updateProgress вызывается внутри loadQuestion
    } else {
        showResults();
    }
}

// Функция для отображения политики обработки персональных данных
function showPrivacyPolicy() {
    // Создаем модальное окно
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Непосредственно добавляем HTML-содержимое без использования fetch
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3>Политика обработки персональных данных</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body pdf-container">
            <iframe src="https://files.data-economy.ru/Docs/privacy.pdf" width="100%" height="500px" frameborder="0"></iframe>
        </div>
        <div class="modal-footer">
            <button class="modal-accept">Принять</button>
        </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Добавляем обработчики событий
    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.querySelector('.modal-accept').addEventListener('click', closeModal);
    
    // Закрытие при клике вне окна
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Функция для закрытия модального окна
function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        document.body.removeChild(modalOverlay);
    }
}

function goToPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

// Добавим слушатели событий для всех полей формы
elements.fullName?.addEventListener('input', () => validateForm(false));
elements.company?.addEventListener('input', () => validateForm(false));
elements.email?.addEventListener('input', () => validateForm(false));
elements.agreement?.addEventListener('change', () => validateForm(false));

// Функция для создания анимации частиц
function createParticles(targetButton, colorType = 'green', event = null) {
    const rect = targetButton.getBoundingClientRect();
    // Центр взрыва — по клику, если есть event
    let centerX, centerY;
    if (event && event.clientX && event.clientY) {
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        centerX = event.clientX + scrollX;
        centerY = event.clientY + scrollY;
    } else {
        // fallback: центр кнопки
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        centerX = rect.left + rect.width / 2 + scrollX;
        centerY = rect.top + rect.height / 2 + scrollY;
    }
    const numParticles = 18;
    // Цвета для разных типов
    const greenColors = ['#78E150', '#A6F77B', '#B6FFB0', '#4FCB2B', '#C6FFDD'];
    const redColors = ['#FF0050', '#FF4B7B', '#FF7B9C', '#DC0048', '#FFB6C1'];
    const colors = colorType === 'red' ? redColors : greenColors;
    // Радиус для старта с границы (берём половину меньшей стороны кнопки)
    const buttonRadius = Math.min(rect.width, rect.height) / 2;
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'answer-particle';
        document.body.appendChild(particle);
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = color;
        // Анимация разлёта
        const angle = (2 * Math.PI * i) / numParticles;
        // Стартовая позиция — из центра взрыва (точка клика)
        const startX = centerX;
        const startY = centerY;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        // Размер
        const size = Math.random() * 8 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        // Дистанция разлёта (от центра наружу)
        const distance = 200 + Math.random() * 30;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        particle.animate([
            { transform: 'translate(0,0)', opacity: 1 },
            { transform: `translate(${dx}px,${dy}px) scale(0.7)`, opacity: 0 }
        ], {
            duration: 700 + Math.random() * 300,
            easing: 'cubic-bezier(0.4,0.7,0.6,1)',
            fill: 'forwards'
        });
        setTimeout(() => {
            particle.remove();
        }, 900);
    }
} 