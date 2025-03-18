// ============= Конфигурация и данные =============
const quizData = [
    {
        question: 'Вопрос 1',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 1
    },
    {
        question: 'Вопрос 2',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 0
    },
    {
        question: 'Вопрос 3',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 2
    },
    {
        question: 'Вопрос 4',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 3
    },
    {
        question: 'Вопрос 5',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 0
    },
    {
        question: 'Вопрос 6',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 1
    },
    {
        question: 'Вопрос 7',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 2
    },
    {
        question: 'Вопрос 8',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 3
    },
    {
        question: 'Вопрос 9',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 0
    },
    {
        question: 'Вопрос 10',
        choices: ['Ответ 1', 'Ответ 2', 'Ответ 3', 'Ответ 4'],
        correct: 1
    }
];

const questionNumber = 3;

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
    agreement: document.getElementById('agreement'),
    question: document.getElementById('question'),
    choices: document.getElementById('choices'),
    submit: document.getElementById('submit'),
    quiz: document.getElementById('quiz'),
    results: document.getElementById('results'),
    score: document.getElementById('score'),
    restart: document.getElementById('restart'),
    quizButtons: [
        document.getElementById('startQuiz1'),
        document.getElementById('startQuiz2'),
        document.getElementById('startQuiz3')
    ]
};

// ============= Вспомогательные функции =============
function getRandomQuestions(sourceArray, neededCount) {
    let tempArray = [...sourceArray];
    let result = [];
    
    for (let i = 0; i < neededCount && tempArray.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * tempArray.length);
        result.push(tempArray[randomIndex]);
        tempArray.splice(randomIndex, 1);
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
    if (!elements.agreement.checked) {
        alert('Необходимо согласие на обработку персональных данных');
        return false;
    }
    return true;
}

// ============= Функции управления квизом =============
function loadQuestion() {
    const question = randomQuestions[currentQuestion];
    elements.question.innerText = question.question;
    
    elements.choices.innerHTML = '';
    question.choices.forEach((choice, index) => {
        const button = document.createElement('div');
        button.innerText = choice;
        button.classList.add('choice');
        button.addEventListener('click', () => selectChoice(index));
        elements.choices.appendChild(button);
    });
}

function selectChoice(index) {
    if (elements.choices.querySelector('.selected')) return;

    const choices = elements.choices.getElementsByClassName('choice');
    const correctIndex = randomQuestions[currentQuestion].correct;
    
    if (correctIndex >= 0 && correctIndex < choices.length) {
        choices[index].classList.add('selected');
        
        if (index === correctIndex) {
            choices[index].classList.add('correct');
        } else {
            choices[index].classList.add('incorrect');
            choices[correctIndex].classList.add('correct');
        }
        
        Array.from(choices).forEach(choice => {
            choice.classList.add('disabled');
        });
    }
}

function showResults() {
    elements.quiz.style.display = 'none';
    elements.results.style.display = 'block';
    elements.score.innerText = `${score} из ${randomQuestions.length}`;
}

function resetQuiz() {
    // Очистка формы
    elements.fullName.value = '';
    elements.company.value = '';
    elements.email.value = '';
    elements.agreement.checked = false;
    
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
function startQuiz(questionCount) {
    if (validateForm()) {
        userData = {
            fullName: elements.fullName.value.trim(),
            company: elements.company.value.trim(),
            email: elements.email.value.trim()
        };
        
        elements.registration.style.display = 'none';
        elements.quiz.style.display = 'block';
        
        randomQuestions = getRandomQuestions(quizData, questionCount);
        loadQuestion();
    }
}

// ============= Обработчики событий =============
elements.startQuiz1.addEventListener('click', () => startQuiz(5));  // 3 минуты - 5 вопросов
elements.startQuiz2.addEventListener('click', () => startQuiz(10)); // 5 минут - 10 вопросов
elements.startQuiz3.addEventListener('click', () => startQuiz(15)); // 10 минут - 15 вопросов

elements.submit.addEventListener('click', () => {
    const selectedChoice = elements.choices.querySelector('.selected');
    if (!selectedChoice) return;
    
    const selectedAnswer = Array.from(elements.choices.children).indexOf(selectedChoice);
    if (selectedAnswer === randomQuestions[currentQuestion].correct) {
        score++;
    }
    
    currentQuestion++;
    if (currentQuestion < randomQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

elements.restart.addEventListener('click', resetQuiz);

// ============= Инициализация =============
// Убираем автоматический запуск квиза
// randomQuestions = getRandomQuestions(quizData, questionNumber);
// loadQuestion(); 

// Добавим функцию проверки формы для активации/деактивации кнопок
function checkFormValidity() {
    const isValid = 
        elements.fullName.value.trim() !== '' &&
        elements.company.value.trim() !== '' &&
        elements.email.value.trim() !== '' &&
        elements.agreement.checked;

    elements.quizButtons.forEach(button => {
        button.disabled = !isValid;
        if (!isValid) {
            button.classList.add('disabled');
        } else {
            button.classList.remove('disabled');
        }
    });
}

// Добавим слушатели событий для всех полей формы
elements.fullName.addEventListener('input', checkFormValidity);
elements.company.addEventListener('input', checkFormValidity);
elements.email.addEventListener('input', checkFormValidity);
elements.agreement.addEventListener('change', checkFormValidity);

// Вызовем функцию при загрузке страницы
checkFormValidity(); 