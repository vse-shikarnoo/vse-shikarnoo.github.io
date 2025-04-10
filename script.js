// ============= Состояние приложения =============
let randomQuestions = [];
let currentQuestion = 0;
let score = 0;
let userData = {
    fullName: '',
    company: '',
    email: ''
};

// ============= DOM элементы =============
const elements = {
    registration: document.getElementById('registration'),
    startQuiz1: document.getElementById('startQuiz1'),
    startQuiz2: document.getElementById('startQuiz2'),
    startQuiz3: document.getElementById('startQuiz3'),
    fullName: document.getElementById('fullName'),
    company: document.getElementById('company'),
    email: document.getElementById('email'),
    agreement1: document.getElementById('agreement1'),
    agreement2: document.getElementById('agreement2'),
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
        quizMincifraData
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

function validateForm() {
    if (!elements.fullName.value.trim()) {
        alert('Пожалуйста, введите ФИО');
        return false;
    }
    if (!elements.company.value.trim()) {
        alert('Пожалуйста, введите название компании');
        return false;
    }
    if (!elements.email.value.trim()) {
        alert('Пожалуйста, введите email');
        return false;
    }
    if (!elements.agreement1.checked && !elements.agreement2.checked) {
        alert('Необходимо согласие на обработку персональных данных');
        return false;
    }
    return true;
}

// ============= Функции управления квизом =============
function loadQuestion() {
    const questionData = randomQuestions[currentQuestion];
    const quizContent = document.querySelector('.quiz-content');
    const currentLogoSrc = questionData.logo;

    // --- Подсветка логотипа в бегущей строке ---
    const allMarqueeLogos = document.querySelectorAll('.background-marquee .marquee-content img');
    allMarqueeLogos.forEach(img => {
        img.classList.remove('highlighted-logo'); // Сначала убираем подсветку со всех
        // Сравниваем конец src, чтобы избежать проблем с абсолютными/относительными путями
        if (currentLogoSrc && img.src.endsWith(currentLogoSrc)) {
            img.classList.add('highlighted-logo'); // Подсвечиваем нужный
        }
    });
    // -------------------------------------------

    quizContent.innerHTML = ''; // Очищаем предыдущее

    // --- Добавляем/удаляем класс для layout ---
    if (questionData.image) {
        quizContent.classList.add('layout-two-column');
    } else {
        quizContent.classList.remove('layout-two-column');
    }

    // --- Создаем и добавляем элементы ---

    // 1. Контейнер вопроса (лого + текст) - класс для grid-area
    const questionContainer = document.createElement('div');
    questionContainer.className = 'quiz-question-area';
    questionContainer.innerHTML = `
        <div class="company-logo">
            <img src="${questionData.logo}" alt="Company logo">
        </div>
        <div class="question-text">
            ${questionData.question}
        </div>
    `;
    quizContent.appendChild(questionContainer);

    // 2. Изображение (если есть) - класс для grid-area
    if (questionData.image) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'quiz-image-area question-image-container'; // Добавляем оба класса
        const imgElement = document.createElement('img');
        imgElement.src = questionData.image;
        imgElement.alt = 'Question illustration';
        imageContainer.appendChild(imgElement);
        quizContent.appendChild(imageContainer);
    }

    // 3. Варианты ответов - ID и класс для grid-area
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices';
    choicesContainer.className = 'quiz-choices-area';
    questionData.choices.forEach((choiceText) => {
        const button = document.createElement('button');
        button.className = 'choice';
        button.textContent = choiceText;
        button.addEventListener('click', () => selectChoice(button));
        choicesContainer.appendChild(button);
    });
    quizContent.appendChild(choicesContainer);

    // 4. Кнопки действий - класс для grid-area
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'quiz-actions-area quiz-actions'; // Добавляем оба класса
    actionsContainer.innerHTML = `
        <button class="back-button" onclick="resetQuiz()">
            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            Вернуться назад
        </button>
        <button id="submit">Следующий вопрос</button>
    `;
    actionsContainer.querySelector('#submit').addEventListener('click', handleSubmit);
    quizContent.appendChild(actionsContainer);

    // Обновляем глобальные ссылки
    // elements.question = questionContainer; // Не используем глобальную ссылку на этот div
    elements.choices = choicesContainer; // Эта ссылка нужна
    elements.submit = actionsContainer.querySelector('#submit'); // Эта ссылка нужна

    // Разблокируем кнопку submit для нового вопроса
    elements.submit.disabled = true; // Блокируем до выбора ответа
    elements.submit.classList.add('disabled');

    updateProgress();
}

function selectChoice(button) {
    const currentChoicesContainer = button.closest('#choices');
    if (!currentChoicesContainer) return;

    const selectedButton = currentChoicesContainer.querySelector('.selected');

    // Снимаем выбор с предыдущей кнопки
    if (selectedButton) {
        selectedButton.classList.remove('selected');
    }

    // Выбираем новую кнопку (без correct/incorrect - это будет в handleSubmit)
    button.classList.add('selected');

    // Разблокируем кнопку "Следующий вопрос", если она была заблокирована
    if (elements.submit && elements.submit.disabled) {
        elements.submit.disabled = false;
         elements.submit.classList.remove('disabled');
    }
}

function showResults() {
    elements.quiz.style.display = 'none';
    elements.results.style.display = 'block';
    
    // Вычисляем процент правильных ответов
    const correctPercent = Math.floor((score / randomQuestions.length) * 100);
    const scoreText = `Правильных ответов: ${score} из ${randomQuestions.length}`;
    
    // Определяем сообщение в зависимости от процента
    let resultMessage = '';
    let resultClass = '';
    
    if (correctPercent >= 70) {
        resultMessage = 'Цифровой гуру';
        resultClass = 'result-excellent';
    } else if (correctPercent >= 40) {
        resultMessage = 'Цифровой ученик';
        resultClass = 'result-average';
    } else {
        resultMessage = 'Цифровой невежда';
        resultClass = 'result-poor';
    }
    
    // Обновляем содержимое блока результатов
    const resultsContainer = elements.results;
    resultsContainer.innerHTML = `
        <h2>Результаты</h2>
        <div class="score-container ${resultClass}">
            <div class="score-circle">
                <div class="score-number">${correctPercent}%</div>
            </div>
            <div class="score-text">${scoreText}</div>
        </div>
        <p class="result-message">${resultMessage}</p>
        <div class="results-actions">
            <button class="email-button">Отправить результаты на почту</button>
            <button id="restart" class="restart-button">Начать заново</button>
        </div>
    `;
    
    // Добавляем обработчики событий для новых кнопок
    resultsContainer.querySelector('#restart').addEventListener('click', resetQuiz);
    resultsContainer.querySelector('.email-button').addEventListener('click', sendResultsByEmail);
}

function resetQuiz() {
    // Очистка формы
    elements.fullName.value = '';
    elements.company.value = '';
    elements.email.value = '';
    elements.agreement1.checked = false;
    elements.agreement2.checked = false;
    
    // Сброс данных
    userData = { fullName: '', company: '', email: '' };
    currentQuestion = 0;
    score = 0;
    randomQuestions = [];
    
    // Управление отображением
    elements.registration.style.display = 'block';
    elements.quiz.style.display = 'none';
    elements.results.style.display = 'none';
    
    // Сброс состояния кнопок
    checkFormValidity();
}

// ============= Функция для начала квиза =============
function startQuiz(totalQuestions) {
    if (validateForm()) {
        userData = {
            fullName: elements.fullName.value.trim(),
            company: elements.company.value.trim(),
            email: elements.email.value.trim()
        };
        
        elements.registration.style.display = 'none';
        elements.quiz.style.display = 'block';
        elements.progressContainer.style.display = 'block';
        
        // Определяем количество вопросов из каждого источника
        const questionsPerSource = totalQuestions / 6;
        randomQuestions = getRandomQuestionsFromAllSources(questionsPerSource);
        
        // Обновляем счетчик и прогресс-бар
        elements.totalQuestions.textContent = totalQuestions;
        updateProgress();
        
        loadQuestion();
    }
}

// ============= Обработчики событий =============
elements.startQuiz1.addEventListener('click', () => startQuiz(6));  // 3 минуты - 6 вопросов (по 1 из каждого источника)
elements.startQuiz2.addEventListener('click', () => startQuiz(12)); // 5 минут - 12 вопросов (по 2 из каждого источника)
elements.startQuiz3.addEventListener('click', () => startQuiz(18)); // 7 минут - 18 вопросов (по 3 из каждого источника)

elements.restart?.addEventListener('click', resetQuiz);

// ============= Инициализация =============
// Добавим функцию проверки формы для активации/деактивации кнопок
function checkFormValidity() {
    // Убедимся, что все элементы доступны перед проверкой
    if (!elements.fullName || !elements.company || !elements.email || !elements.agreement1 || !elements.agreement2 || !elements.quizButtons) {
        console.error("Form elements not ready for validation yet.");
        return;
    }

    const isValid =
        elements.fullName.value.trim() !== '' &&
        elements.company.value.trim() !== '' &&
        elements.email.value.trim() !== '' &&
        (elements.agreement1.checked || elements.agreement2.checked);

    elements.quizButtons.forEach(button => {
        // Проверяем, что button не null (на всякий случай)
        if (button) {
            button.disabled = !isValid;
            if (!isValid) {
                button.classList.add('disabled');
            } else {
                button.classList.remove('disabled');
            }
        } else {
             console.error("Quiz button element is null during validation.");
        }
    });
}

// Добавим слушатели событий для всех полей формы
elements.fullName?.addEventListener('input', checkFormValidity);
elements.company?.addEventListener('input', checkFormValidity);
elements.email?.addEventListener('input', checkFormValidity);
elements.agreement1?.addEventListener('change', checkFormValidity);
elements.agreement2?.addEventListener('change', checkFormValidity);

// Вызовем функцию при загрузке страницы, убедившись, что DOM готов
// Если скрипт в конце body, DOM обычно готов, но для надежности можно обернуть
document.addEventListener('DOMContentLoaded', () => {
     console.log("DOM fully loaded and parsed. Running initial checkFormValidity...");
     checkFormValidity();
});

// Добавляем новую функцию для отправки результатов
async function sendResultsByEmail() {
    try {
        const response = await fetch('http://localhost:5000/generate-certificate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                full_name: userData.fullName,
                company: userData.company,
                email: userData.email
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
    // Проверяем наличие всех необходимых элементов и данных
    const questionsExist = randomQuestions && Array.isArray(randomQuestions) && randomQuestions.length > 0;
    const elementsExist = elements.currentQuestion && elements.totalQuestions && elements.progressFill;

    if (elementsExist && questionsExist) {
        const currentQIndex = typeof currentQuestion === 'number' ? currentQuestion : 0;
        const totalQ = randomQuestions.length;

        // Обновляем текстовые счетчики
        elements.currentQuestion.textContent = currentQIndex + 1;
        elements.totalQuestions.textContent = totalQ; // Убедимся, что общее число обновляется

        // Вычисляем процент
        // Делаем +1, так как currentQuestion начинается с 0
        const progressPercentage = ((currentQIndex + 1) / totalQ) * 100;

        // Отладочный вывод в консоль
        console.log(`Updating progress: Q ${currentQIndex + 1}/${totalQ}, Progress: ${progressPercentage}%`);

        // Применяем стиль ширины
        elements.progressFill.style.width = `${progressPercentage}%`;

    } else {
        // Логируем, если что-то пошло не так
        console.warn("Could not update progress bar. Details:", {
             elementsFound: elementsExist,
             questionsAvailable: questionsExist,
             totalQuestionsCount: randomQuestions?.length,
             currentQuestionIndex: currentQuestion,
             progressFillElement: elements.progressFill // Проверяем сам элемент
        });
        // Сбрасываем прогресс, если элементы есть, но данных нет
        if (elements.progressFill) {
             elements.progressFill.style.width = '0%';
        }
         if (elements.currentQuestion) {
             elements.currentQuestion.textContent = '1'; // Начнем с 1
         }
         if (elements.totalQuestions) {
             elements.totalQuestions.textContent = '??'; // Или 0, если вопросов нет
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

    if (selectedAnswerIndex === randomQuestions[currentQuestion].correct) {
        score++;
    }

    // --- Логика подсветки правильного/неправильного ---
    const correctIndex = randomQuestions[currentQuestion].correct;
    if (selectedAnswerIndex === correctIndex) {
        selectedChoice.classList.add('correct');
    } else {
        selectedChoice.classList.add('incorrect');
        // Показываем правильный ответ
        if (choiceButtons[correctIndex]) {
             choiceButtons[correctIndex].classList.add('correct');
        }
    }
    // Блокируем кнопки после ответа
    choiceButtons.forEach(button => button.classList.add('disabled'));
    // Блокируем кнопку "Следующий вопрос" временно, чтобы показать результат
    if (elements.submit) { // Проверка на существование кнопки
        elements.submit.disabled = true;
        elements.submit.classList.add('disabled'); // Визуальная блокировка
    }


    // Переходим к следующему вопросу с небольшой задержкой
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < randomQuestions.length) {
            loadQuestion();
            // updateProgress вызывается внутри loadQuestion теперь
        } else {
            showResults();
        }
    }, 1000); // Уменьшил задержку до 1 секунды
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