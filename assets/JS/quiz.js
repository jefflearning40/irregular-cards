"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const difficultyButtons =
    document.querySelectorAll(
        "[data-difficulty]"
    );

const quizButton =
    document.getElementById(
        "quiz-button"
    );

const quizModal =
    document.getElementById(
        "quiz-modal"
    );

const quizStartButton =
    document.getElementById(
        "quiz-start-button"
    );


/* ==========================================================
   ÉTAT DU QUIZ
========================================================== */

let selectedDifficulty = null;


/* ==========================================================
   VALIDATION
========================================================== */

function updateQuizStartButton()
{
    quizStartButton.disabled =
        !selectedDifficulty;
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
        if (!selectedDifficulty)
        {
            return;
        }


        const questionCount =
            QUIZ_CONFIG[
                selectedDifficulty
            ].questions;


        quizModal.classList.remove(
            "quiz-modal--open"
        );


        quizModal.setAttribute(
            "aria-hidden",
            "true"
        );


        initialiseQuizGame(
            selectedDifficulty
        );


        startForwardCrossing(
            questionCount,
            false
        );
    }
);