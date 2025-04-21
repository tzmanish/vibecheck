// DOM Elements
const quizContainer = document.getElementById('quiz');
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const nextButton = document.getElementById('next');
const restartButton = document.getElementById('restart');
const currentQuestionElement = document.getElementById('current');
const totalQuestionsElement = document.getElementById('total');
const scoreElement = document.getElementById('score-value');
const shareButtons = document.getElementById('share-buttons');
const twitterShareButton = document.getElementById('twitter-share');
const facebookShareButton = document.getElementById('facebook-share');
const progressFill = document.querySelector('.progress-fill');

// Quiz state
let currentQuestion = 0;
let score = 0;
let questions = [];
const TOTAL_QUESTIONS = 10;

// Fetch questions from OpenTDB API
async function fetchQuestions() {
    try {
        // Using category 15 for Video Games
        const response = await fetch(`https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&category=15&type=multiple`);
        const data = await response.json();
        questions = data.results.map(question => {
            return {
                question: decodeHTML(question.question),
                choices: [...question.incorrect_answers, question.correct_answer]
                    .map(choice => decodeHTML(choice))
                    .sort(() => Math.random() - 0.5),
                correctAnswer: decodeHTML(question.correct_answer)
            };
        });
        startQuiz();
    } catch (error) {
        console.error('Error fetching questions:', error);
        questionElement.textContent = 'Error loading questions. Please try again.';
    }
}

// Decode HTML entities in questions and answers
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Start the quiz
function startQuiz() {
    currentQuestion = 0;
    score = 0;
    showQuestion();
    updateProgress();
    updateScore();
}

// Display current question
function showQuestion() {
    const question = questions[currentQuestion];
    questionElement.textContent = question.question;
    
    choicesElement.innerHTML = '';
    question.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice';
        button.textContent = choice;
        button.addEventListener('click', () => selectChoice(choice));
        choicesElement.appendChild(button);
    });

    nextButton.style.display = 'none';
}

// Handle choice selection
function selectChoice(choice) {
    const buttons = choicesElement.getElementsByClassName('choice');
    const correct = questions[currentQuestion].correctAnswer;

    Array.from(buttons).forEach(button => {
        button.disabled = true;
        if (button.textContent === correct) {
            button.classList.add('correct');
        }
    });

    if (choice === correct) {
        score++;
        updateScore();
    } else {
        const selectedButton = Array.from(buttons).find(button => button.textContent === choice);
        selectedButton.classList.add('wrong');
    }

    nextButton.style.display = 'block';
}

// Update progress display
function updateProgress() {
    currentQuestionElement.textContent = currentQuestion + 1;
    totalQuestionsElement.textContent = TOTAL_QUESTIONS;
    
    // Update progress bar
    const progressPercentage = ((currentQuestion + 1) / TOTAL_QUESTIONS) * 100;
    progressFill.style.width = `${progressPercentage}%`;
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
}

// Handle next question
function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < TOTAL_QUESTIONS) {
        showQuestion();
        updateProgress();
    } else {
        showResults();
    }
}

// Show final results
function showResults() {
    questionElement.textContent = `Quiz completed! Your score: ${score}/${TOTAL_QUESTIONS}`;
    choicesElement.innerHTML = '';
    nextButton.style.display = 'none';
    restartButton.style.display = 'block';
    shareButtons.style.display = 'block';
    
    // Setup sharing buttons
    setupSharingButtons();
}

// Setup social media sharing
function setupSharingButtons() {
    const shareText = `I scored ${score}/${TOTAL_QUESTIONS} on GameQuest - The Video Game Quiz! Can you beat my score? 🎮`;
    const shareUrl = window.location.href;

    // Twitter share
    twitterShareButton.addEventListener('click', () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    });

    // Facebook share
    facebookShareButton.addEventListener('click', () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    });
}

// Event listeners
nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';
    shareButtons.style.display = 'none';
    fetchQuestions();
});

// Start the quiz when the page loads
fetchQuestions(); 