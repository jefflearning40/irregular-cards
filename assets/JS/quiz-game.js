"use strict";


/* ==========================================================
   CONFIGURATION DU QUIZ
========================================================== */

const QUIZ_CONFIG = {

    easy: {
        questions: 20,
        time: 20
    },

    medium: {
        questions: 30,
        time: 15
    },

    hard: {
        questions: 50,
        time: 10
    }

};


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const quizQuestion =
    document.getElementById("quiz-question");

const quizQuestionNumber =
    document.getElementById("quiz-question-number");

const quizQuestionText =
    document.getElementById("quiz-question-text");

const quizQuestionAnswers =
    document.getElementById("quiz-question-answers");


/* ==========================================================
   ÉTAT DE LA PARTIE
========================================================== */

let quizScore = 0;

let currentQuestionIndex = 0;

let quizErrors = [];

let currentQuizConfig = null;

let currentQuizType = null;


/* ==========================================================
   INITIALISATION DE LA PARTIE
========================================================== */

function initialiseQuizGame(
    difficulty,
    quizType
)
{
    currentQuizConfig =
        QUIZ_CONFIG[difficulty];

    currentQuizType =
        quizType;

    quizScore = 0;

    currentQuestionIndex = 0;

    quizErrors = [];

    clearQuizTimer();

    showQuizQuestion();
}


/* ==========================================================
   AFFICHAGE D'UNE QUESTION
========================================================== */

function showQuizQuestion()
{
    quizQuestionNumber.textContent =
        `Question ${currentQuestionIndex + 1} / ${currentQuizConfig.questions}`;

    quizQuestionText.textContent =
        "Quel est le prétérit de GO ?";

    quizQuestionAnswers.innerHTML =
        "";

    const answers = [
        "went",
        "gone",
        "go",
        "goed"
    ];

    answers.forEach(
        (answer) =>
        {
            const button =
                document.createElement("button");

            button.type =
                "button";

            button.className =
                "quiz-answer-button";

            button.textContent =
                answer;

            button.addEventListener(
                "click",
                () =>
                {
                    checkQuizAnswer(
                        answer
                    );
                }
            );

            quizQuestionAnswers.appendChild(
                button
            );
        }
    );

    startQuizTimer(
        currentQuizConfig.time
    );
}


/* ==========================================================
   VÉRIFICATION DE LA RÉPONSE
========================================================== */

function checkQuizAnswer(answer)
{
    clearQuizTimer();

    if (answer === "went")
    {
        quizScore++;
    }
    else
    {
        quizErrors.push({
            questionIndex:
                currentQuestionIndex,

            question:
                "Quel est le prétérit de GO ?",

            answer:
                answer,

            correctAnswer:
                "went"
        });
    }

    console.log(
        "Score :",
        quizScore
    );

    console.log(
        "Erreurs :",
        quizErrors
    );
}