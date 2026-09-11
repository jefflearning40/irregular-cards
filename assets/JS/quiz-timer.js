"use strict";


/* ==========================================================
   CHRONOMÈTRE DU QUIZ
========================================================== */

let quizTimer = null;

let quizTimerAnimation = null;

let quizTimeRemaining = 0;

let quizTimerDuration = 0;

let quizTimerStartTime = 0;

let quizTimerExpired = false;


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const quizTimerDisplay =
    document.getElementById("quiz-timer");

const quizClockHand =
    document.getElementById("quiz-clock-hand");


/* ==========================================================
   DÉMARRAGE DU CHRONOMÈTRE
========================================================== */

function startQuizTimer(seconds)
{
    clearQuizTimer();

    quizTimerExpired = false;

    quizTimerDuration =
        seconds;

    quizTimeRemaining =
        seconds;

    quizTimerStartTime =
        performance.now();

    updateQuizTimerDisplay();

    quizClockHand.style.transform =
        "rotate(0deg)";


    quizTimer =
        setInterval(
            () =>
            {
                quizTimeRemaining--;


                if (quizTimeRemaining <= 0)
                {
                    quizTimeRemaining = 0;

                    updateQuizTimerDisplay();

                    quizClockHand.style.transform =
                        "rotate(360deg)";

                    clearQuizTimer();


                    if (!quizTimerExpired)
                    {
                        quizTimerExpired = true;


                        if (
                            typeof handleQuizTimeout ===
                            "function"
                        )
                        {
                            handleQuizTimeout();
                        }
                    }


                    return;
                }


                updateQuizTimerDisplay();
            },
            1000
        );


    animateQuizClock();
}


/* ==========================================================
   ANIMATION DU CHRONOMÈTRE
========================================================== */

function animateQuizClock()
{
    const elapsed =
        performance.now() -
        quizTimerStartTime;

    const duration =
        quizTimerDuration *
        1000;

    const progress =
        Math.min(
            elapsed / duration,
            1
        );

    const angle =
        progress *
        360;


    quizClockHand.style.transform =
        `rotate(${angle}deg)`;


    if (progress < 1)
    {
        quizTimerAnimation =
            requestAnimationFrame(
                animateQuizClock
            );
    }
}


/* ==========================================================
   AFFICHAGE DU TEMPS
========================================================== */

function updateQuizTimerDisplay()
{
    quizTimerDisplay.textContent =
        quizTimeRemaining;

    quizTimerDisplay.setAttribute(
        "aria-label",
        `${quizTimeRemaining} secondes restantes`
    );
}


/* ==========================================================
   ARRÊT DU CHRONOMÈTRE
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


    if (quizTimerAnimation !== null)
    {
        cancelAnimationFrame(
            quizTimerAnimation
        );

        quizTimerAnimation = null;
    }
}