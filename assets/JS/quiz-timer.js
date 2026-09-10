"use strict";


/* ==========================================================
   CHRONO DU QUIZ
========================================================== */

let quizTimer = null;

let quizTimeRemaining = 0;

const quizTimerDisplay =
    document.getElementById("quiz-timer");


/* ==========================================================
   DÉMARRAGE DU CHRONO
========================================================== */

function startQuizTimer(seconds)
{
    clearQuizTimer();

    quizTimeRemaining =
        seconds;

    quizTimerDisplay.textContent =
        quizTimeRemaining;

    quizTimer =
        setInterval(
            () =>
            {
                quizTimeRemaining--;

                quizTimerDisplay.textContent =
                    quizTimeRemaining;

                if (quizTimeRemaining <= 0)
                {
                    clearQuizTimer();

                    quizTimeRemaining = 0;

                    quizTimerDisplay.textContent =
                        quizTimeRemaining;
                }
            },
            1000
        );
}


/* ==========================================================
   ARRÊT DU CHRONO
========================================================== */

function clearQuizTimer()
{
    if (quizTimer !== null)
    {
        clearInterval(
            quizTimer
        );

        quizTimer = null;
    }
}