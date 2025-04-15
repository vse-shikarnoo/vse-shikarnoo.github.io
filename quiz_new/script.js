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
    const quizContent = document.querySelector('.quiz-content');
    const currentLogoSrc = questionData.logo;

    // --- Подсветка логотипа в бегущей строке ---
    const allMarqueeLogos = document.querySelectorAll('.background-marquee .marquee-content img');
    allMarqueeLogos.forEach(img => {
        img.classList.remove('highlighted-logo');
        if (currentLogoSrc && img.src.endsWith(currentLogoSrc)) {
            img.classList.add('highlighted-logo');
        }
    });

    quizContent.innerHTML = '';

    if (questionData.image) {
        quizContent.classList.add('layout-two-column');
    } else {
        quizContent.classList.remove('layout-two-column');
    }

    // 1. Контейнер вопроса (лого + текст)
    const questionContainer = document.createElement('div');
    questionContainer.className = 'quiz-question-area';
    questionContainer.innerHTML = `
        <div class="question-text">
            ${questionData.question}
        </div>
    `;
    quizContent.appendChild(questionContainer);

    // 2. Изображение (если есть)
    if (questionData.image) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'quiz-image-area question-image-container';
        const imgElement = document.createElement('img');
        imgElement.src = questionData.image;
        imgElement.alt = 'Question illustration';
        imageContainer.appendChild(imgElement);
        quizContent.appendChild(imageContainer);
    }

    // 3. Варианты ответов
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'choices';
    choicesContainer.className = 'quiz-choices-area';
    questionData.choices.forEach((choiceText, index) => {
        const button = document.createElement('button');
        button.className = 'choice';
        button.textContent = choiceText;
        button.addEventListener('click', () => selectChoice(button));
        choicesContainer.appendChild(button);
    });
    quizContent.appendChild(choicesContainer);

    // 4. Кнопки действий
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'quiz-actions-area';
    
    // Создаем HTML для кнопок
    actionsContainer.innerHTML = `
        <div class="nav-buttons">
            ${currentQuestion > 0 ? `
                <button class="back-button" onclick="goToPreviousQuestion()">
                    <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                    Вернуться назад
                </button>
            ` : '<div></div>'}
            <button id="submit">Следующий вопрос</button>
        </div>
    `;

    // Добавляем обработчик для кнопки "Следующий вопрос"
    const submitButton = actionsContainer.querySelector('#submit');
    submitButton.addEventListener('click', handleSubmit);
    
    quizContent.appendChild(actionsContainer);

    elements.choices = choicesContainer;
    elements.submit = submitButton;
    
    // Проверяем, есть ли сохраненный ответ для текущего вопроса
    const savedAnswer = userAnswers[currentQuestion];
    if (savedAnswer !== undefined) {
        // Если есть сохраненный ответ, выбираем его и показываем результаты
        const choiceButtons = Array.from(elements.choices.children);
        if (choiceButtons[savedAnswer]) {
            // Восстанавливаем выбранный ответ и показываем правильный/неправильный
            const correctIndex = randomQuestions[currentQuestion].correct;
            
            // Применяем классы для отображения результата
            choiceButtons[savedAnswer].classList.add('selected');
            
            if (savedAnswer === correctIndex) {
                choiceButtons[savedAnswer].classList.add('correct');
            } else {
                choiceButtons[savedAnswer].classList.add('incorrect');
                choiceButtons[correctIndex].classList.add('correct');
            }
            
            // Блокируем все варианты ответов
            choiceButtons.forEach(btn => btn.classList.add('disabled'));
            
            // Активируем кнопку "Далее"
            elements.submit.disabled = false;
            elements.submit.classList.remove('disabled');
        }
    } else {
        // Если нет сохраненного ответа, кнопка "Далее" должна быть неактивна
        elements.submit.disabled = true;
        elements.submit.classList.add('disabled');
    }

    updateProgress();
}

function selectChoice(button) {
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
    userAnswers[currentQuestion] = selectedAnswerIndex;

    // Сразу показываем правильный/неправильный ответ
    if (selectedAnswerIndex === correctIndex) {
        button.classList.add('correct');
    } else {
        button.classList.add('incorrect');
        // Показываем правильный ответ
        if (choiceButtons[correctIndex]) {
            choiceButtons[correctIndex].classList.add('correct');
        }
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
    // Сбрасываем выделение логотипов
    resetHighlightedLogos();

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