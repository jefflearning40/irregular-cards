
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
   ANNONCES VOCALES DE LA MODALE
========================================================== */

function speakQuizModalLabel(message)
{
    if (
        !window.irregularAudio ||
        !window.irregularAudio.isVoiceEnabled() ||
        !("speechSynthesis" in window)
    )
    {
        return;
    }

    try
    {
        const utterance =
            new SpeechSynthesisUtterance(
                message
            );

        const settings =
            window.irregularAudio.getSettings();

        utterance.lang = "fr-FR";

        utterance.rate = 0.8;

        utterance.volume =
            settings.voiceVolume / 100;

        const voices =
            window.speechSynthesis.getVoices();

        utterance.voice =
            voices.find(
                voice =>
                    voice.name ===
                    "Microsoft Paul - French (France)"
            ) ||
            voices.find(
                voice =>
                    voice.lang === "fr-FR"
            ) ||
            null;

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
            utterance
        );
    }
    catch (error)
    {
        console.error(
            "[AUDIO] Modale du quiz :",
            error
        );
    }
}


/* ==========================================================
   TITRE DE LA MODALE AU SURVOL
========================================================== */

const quizModalTitle =
    quizModal.querySelector("h2");

if (quizModalTitle)
{
    quizModalTitle.addEventListener(
        "mouseenter",
        () =>
        {
            speakQuizModalLabel(
                "Prépare ton quiz"
            );
        }
    );
}


/* ==========================================================
   DIFFICULTÉS AU SURVOL
========================================================== */

const difficultyVoiceLabels = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile"
};

difficultyButtons.forEach(
    (button) =>
    {
        button.addEventListener(
            "mouseenter",
            () =>
            {
                const difficulty =
                    button.dataset.difficulty;

                const message =
                    difficultyVoiceLabels[difficulty];

                if (message)
                {
                    speakQuizModalLabel(
                        message
                    );
                }
            }
        );
    }
);


/* ==========================================================
   BOUTON DÉMARRER LE QUIZ AU SURVOL
========================================================== */

quizStartButton.addEventListener(
    "mouseenter",
    () =>
    {
        speakQuizModalLabel(
            "Démarrer le quiz"
        );
    }
);


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
