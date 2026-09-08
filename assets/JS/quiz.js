"use strict";


/* ==========================================================
   QUIZ
========================================================== */


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */
const difficultyButtons =
    document.querySelectorAll("[data-difficulty]");

const quizTypeButtons =
    document.querySelectorAll( "[data-quiz-type]");

const quizButton =
    document.getElementById("quiz-button");

const quizModal =
    document.getElementById("quiz-modal");

const quizStartButton =
    document.getElementById("quiz-start-button");
   
   
/* ==========================================================
   ÉTAT DU QUIZ
========================================================== */

let selectedDifficulty = null;
let selectedQuizType = null;

/* ==========================================================
   VALIDATION DES CHOIX
========================================================== */

function updateQuizStartButton()
{
    quizStartButton.disabled =
        !selectedDifficulty ||
        !selectedQuizType;
}


/* ==========================================================
   SÉLECTION DE LA DIFFICULTÉ
========================================================== */

difficultyButtons.forEach(
    (button) =>
    {
        button.addEventListener(
            "click",
            () =>
            {
                selectedDifficulty =
                    button.dataset.difficulty;

                difficultyButtons.forEach(
                    (item) =>
                    {
                        item.classList.remove(
                            "quiz-choice--selected"
                        );
                    }
                );

                button.classList.add(
                    "quiz-choice--selected"
                );
                updateQuizStartButton();
            }
        );
    }
);

/* ==========================================================
   SÉLECTION DU TYPE DE QUESTIONS
========================================================== */

quizTypeButtons.forEach(
    (button) =>
    {
        button.addEventListener(
            "click",
            () =>
            {
                selectedQuizType =
                    button.dataset.quizType;

                quizTypeButtons.forEach(
                    (item) =>
                    {
                        item.classList.remove(
                            "quiz-choice--selected"
                        );
                    }
                );

                button.classList.add(
                    "quiz-choice--selected"
                );
                updateQuizStartButton();
            }
        );
    }
);
    /* ==========================================================
   OUVERTURE DE LA MODALE
========================================================== */

quizButton.addEventListener(
    "click",
    () =>
    {
        quizModal.classList.add(
            "quiz-modal--open"
        );

        quizModal.setAttribute(
            "aria-hidden",
            "false"
        );
    }
);
/* ==========================================================
   DÉMARRAGE DU QUIZ
========================================================== */

quizStartButton.addEventListener(
    "click",
    () =>
    {
        if (
            !selectedDifficulty ||
            !selectedQuizType
        )
        {
            return;
        }

        quizModal.classList.remove(
            "quiz-modal--open"
        );

        quizModal.setAttribute(
            "aria-hidden",
            "true"
        );

        startForwardCrossing();
    }
);