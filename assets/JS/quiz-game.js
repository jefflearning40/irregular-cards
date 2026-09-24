"use strict";

/* ==========================================================
   CONFIGURATION
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
   TYPES DE QUESTIONS
========================================================== */

const MIXED_QUIZ_TYPES = [
    "preterite",
    "infinitive",
    "pastParticiple",
    "translation"
];


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const quizQuestion =
    document.getElementById(
        "quiz-question"
    );

const quizQuestionNumber =
    document.getElementById(
        "quiz-question-number"
    );

const quizQuestionText =
    document.getElementById(
        "quiz-question-text"
    );

const quizQuestionAnswers =
    document.getElementById(
        "quiz-question-answers"
    );


/* ==========================================================
   ÉTAT DU QUIZ
========================================================== */

let quizScore = 0;

let currentQuestionIndex = 0;

let quizErrors = [];

let currentQuizConfig = null;

let currentQuestionType = null;

let irregularVerbs = [];

let quizVerbs = [];

let currentVerb = null;

let quizQuestionLocked = false;

let quizStartTime = null;

let currentQuizDifficulty = null;


/* ==========================================================
   ÉTAT DU RETOUR
========================================================== */

let returnErrors = [];

let currentReturnErrorIndex = 0;

let returnQuestionLocked = false;

let automaticReturnInterval = null;


/* ==========================================================
   INITIALISATION
========================================================== */

async function initialiseQuizGame(
    difficulty
)
{
    currentQuizConfig =
        QUIZ_CONFIG[difficulty];

    currentQuizDifficulty =
        difficulty;

    quizStartTime =
        Date.now();

    quizScore = 0;

    currentQuestionIndex = 0;

    quizErrors = [];

    currentQuestionType = null;

    quizQuestionLocked = false;

    returnErrors = [];

    currentReturnErrorIndex = 0;

    returnQuestionLocked = false;


    if (automaticReturnInterval)
    {
        clearInterval(
            automaticReturnInterval
        );

        automaticReturnInterval = null;
    }


    clearQuizTimer();


    quizQuestion.style.display =
        "block";


    try
    {
        const response =
            await fetch(
                "assets/data/irregular-verbs.json"
            );


        if (!response.ok)
        {
            throw new Error(
                "Impossible de charger les verbes."
            );
        }


        irregularVerbs =
            await response.json();


        prepareQuizVerbs();


        showQuizQuestion();
    }
    catch (error)
    {
        console.error(
            error
        );


        quizQuestionText.textContent =
            "Erreur lors du chargement des verbes.";


        quizQuestionAnswers.innerHTML =
            "";
    }
}


/* ==========================================================
   PRÉPARATION DES VERBES
========================================================== */

function prepareQuizVerbs()
{
    quizVerbs =
        shuffleArray(
            irregularVerbs
        ).slice(
            0,
            currentQuizConfig.questions
        );
}


/* ==========================================================
   MÉLANGE
========================================================== */

function shuffleArray(
    array
)
{
    const shuffled =
        [...array];


    for (
        let index = shuffled.length - 1;
        index > 0;
        index--
    )
    {
        const randomIndex =
            Math.floor(
                Math.random() *
                (index + 1)
            );


        [
            shuffled[index],
            shuffled[randomIndex]
        ] =
        [
            shuffled[randomIndex],
            shuffled[index]
        ];
    }


    return shuffled;
}


/* ==========================================================
   TYPE DE QUESTION
========================================================== */

function selectQuestionType()
{
    const randomIndex =
        Math.floor(
            Math.random() *
            MIXED_QUIZ_TYPES.length
        );


    currentQuestionType =
        MIXED_QUIZ_TYPES[
            randomIndex
        ];
}


/* ==========================================================
   VARIANTES DE RÉPONSE
========================================================== */

function getAnswerVariants(
    value
)
{
    return value
        .split("/")
        .map(
            (answer) =>
                answer
                    .trim()
                    .toLowerCase()
        );
}


/* ==========================================================
   RÉPONSE AFFICHÉE
========================================================== */

function getDisplayAnswer(
    value
)
{
    return value
        .split("/")[0]
        .trim();
}


/* ==========================================================
   NORMALISATION
========================================================== */

function normaliseAnswer(
    value
)
{
    return value
        .trim()
        .toLowerCase();
}


/* ==========================================================
   RÉPONSE CORRECTE
========================================================== */

function getCorrectAnswer(
    verb
)
{
    switch (currentQuestionType)
    {
        case "infinitive":

            return verb.infinitive;


        case "pastParticiple":

            return verb.pastParticiple;


        case "translation":

            return verb.translation;


        case "preterite":

        default:

            return verb.preterite;
    }
}


/* ==========================================================
   TEXTE DE LA QUESTION
========================================================== */

function getQuestionText(
    verb
)
{
    switch (currentQuestionType)
    {
        case "infinitive":

            return (
                `Quel est l'infinitif de ` +
                `${getDisplayAnswer(
                    verb.preterite
                ).toUpperCase()} ?`
            );


        case "pastParticiple":

            return (
                `Quel est le participe passé de ` +
                `${verb.infinitive.toUpperCase()} ?`
            );


        case "translation":

            return (
                `Quelle est la traduction de ` +
                `${verb.infinitive.toUpperCase()} ?`
            );


        case "preterite":

        default:

            return (
                `Quel est le prétérit de ` +
                `${verb.infinitive.toUpperCase()} ?`
            );
    }
}


/* ==========================================================
   FAUSSES RÉPONSES DU JSON
========================================================== */

function getWrongAnswers(
    verb,
    validAnswers
)
{
    if (
        !verb.wrongAnswers ||
        !verb.wrongAnswers[
            currentQuestionType
        ]
    )
    {
        console.error(
            "Fausses réponses manquantes :",
            verb.infinitive,
            currentQuestionType
        );

        return [];
    }


    const wrongAnswers =
        verb.wrongAnswers[
            currentQuestionType
        ];


    const candidates = [];


    wrongAnswers.forEach(
        (answer) =>
        {
            if (
                !answer ||
                typeof answer !== "string"
            )
            {
                return;
            }


            const displayAnswer =
                answer.trim();


            const normalisedAnswer =
                normaliseAnswer(
                    displayAnswer
                );


            if (
                validAnswers.includes(
                    normalisedAnswer
                )
            )
            {
                return;
            }


            const alreadyExists =
                candidates.some(
                    (candidate) =>
                        normaliseAnswer(
                            candidate
                        ) ===
                        normalisedAnswer
                );


            if (!alreadyExists)
            {
                candidates.push(
                    displayAnswer
                );
            }
        }
    );


    return shuffleArray(
        candidates
    ).slice(
        0,
        3
    );
}


/* ==========================================================
   AFFICHAGE QUESTION
========================================================== */

function showQuizQuestion()
{
    quizQuestion.style.display =
        "block";


    quizQuestionLocked =
        false;


    currentVerb =
        quizVerbs[
            currentQuestionIndex
        ];


    if (!currentVerb)
    {
        finishQuiz();

        return;
    }


    selectQuestionType();


    quizQuestionNumber.textContent =
        `Question ${currentQuestionIndex + 1} / ` +
        `${currentQuizConfig.questions}`;


    quizQuestionText.textContent =
        getQuestionText(
            currentVerb
        );


    quizQuestionAnswers.innerHTML =
        "";


    const correctAnswer =
        getCorrectAnswer(
            currentVerb
        );


    const correctDisplayAnswer =
        getDisplayAnswer(
            correctAnswer
        );


    const validAnswers =
        getAnswerVariants(
            correctAnswer
        );


    const wrongAnswers =
        getWrongAnswers(
            currentVerb,
            validAnswers
        );


    if (wrongAnswers.length < 3)
    {
        console.error(
            `Le verbe "${currentVerb.infinitive}" ` +
            `ne possède pas 3 fausses réponses valides ` +
            `pour "${currentQuestionType}".`
        );
    }


    const answers = [
        correctDisplayAnswer,
        ...wrongAnswers
    ];


    shuffleArray(
        answers
    ).forEach(
        (answer) =>
        {
            const button =
                document.createElement(
                    "button"
                );


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
   VÉRIFICATION
========================================================== */

function checkQuizAnswer(
    answer
)
{
    if (quizQuestionLocked)
    {
        return;
    }


    quizQuestionLocked =
        true;


    clearQuizTimer();


    disableQuizAnswers();


    const correctAnswer =
        getCorrectAnswer(
            currentVerb
        );


    const validAnswers =
        getAnswerVariants(
            correctAnswer
        );


    const userAnswer =
        normaliseAnswer(
            answer
        );


    if (
        validAnswers.includes(
            userAnswer
        )
    )
    {
        quizScore++;
    }
    else
    {
        quizErrors.push(
            {
                verb:
                    currentVerb.infinitive,

                type:
                    currentQuestionType,

                answer:
                    answer,

                correctAnswer:
                    correctAnswer,

                reason:
                    "wrong"
            }
        );
    }


    finishCurrentQuestion();
}


/* ==========================================================
   TEMPS ÉCOULÉ
========================================================== */

function handleQuizTimeout()
{
    if (quizQuestionLocked)
    {
        return;
    }


    quizQuestionLocked =
        true;


    disableQuizAnswers();


    quizErrors.push(
        {
            verb:
                currentVerb.infinitive,

            type:
                currentQuestionType,

            answer:
                null,

            correctAnswer:
                getCorrectAnswer(
                    currentVerb
                ),

            reason:
                "timeout"
        }
    );


    finishCurrentQuestion();
}


/* ==========================================================
   DÉSACTIVATION DES RÉPONSES
========================================================== */

function disableQuizAnswers()
{
    const buttons =
        quizQuestionAnswers.querySelectorAll(
            ".quiz-answer-button"
        );


    buttons.forEach(
        (button) =>
        {
            button.disabled =
                true;
        }
    );
}


/* ==========================================================
   FIN DE QUESTION
========================================================== */

function finishCurrentQuestion()
{
    advanceQuizBoat();


    currentQuestionIndex++;


    setTimeout(
        () =>
        {
            if (
                currentQuestionIndex >=
                quizVerbs.length
            )
            {
                finishQuiz();

                return;
            }


            showQuizQuestion();
        },

        700
    );
}


/* ==========================================================
   AVANCEMENT DU BATEAU
========================================================== */

function advanceQuizBoat()
{
    if (
        typeof advanceBoat ===
        "function"
    )
    {
        advanceBoat();
    }
}


/* ==========================================================
   ÉTAT DU PROFESSEUR SELON LE SCORE
========================================================== */

function getProfessorResultState()
{
    const totalQuestions =
        currentQuizConfig.questions;


    const ratio =
        quizScore /
        totalQuestions;


    if (ratio < 0.5)
    {
        return "error";
    }


    if (ratio > 0.75)
    {
        return "bravo";
    }


    return "neutral";
}


/* ==========================================================
   PROFESSEUR D'ARRIVÉE
========================================================== */

function updateArrivalProfessor()
{
    const professor =
        document.getElementById(
            "professeur-arrivee"
        );


    if (!professor)
    {
        return;
    }


    const state =
        getProfessorResultState();


    if (state === "error")
    {
        professor.data =
            "assets/images/decor/personnages/professeur_pasgif_animation.svg";

        return;
    }


    if (state === "neutral")
    {
        professor.data =
            "assets/images/decor/personnages/professeur_pasgif_animation_neutre.svg";

        return;
    }


    professor.data =
        "assets/images/decor/personnages/professeur_pasgif_animation_bravo.svg";
}


/* ==========================================================
   FIN DU QUIZ
========================================================== */

async function finishQuiz()
{
    clearQuizTimer();


    quizQuestionLocked =
        true;


    quizQuestion.style.display =
        "none";


    quizQuestionAnswers.innerHTML =
        "";


    /* ======================================================
       DURÉE DU QUIZ
    ====================================================== */

    const quizEndTime =
        Date.now();


    const durationInSeconds =
        quizStartTime
            ? Math.round(
                (quizEndTime - quizStartTime) /
                1000
            )
            : null;


    /* ======================================================
       ENREGISTREMENT API
    ====================================================== */

    try
    {
        const session =
            await createQuizSession(
                currentQuizDifficulty,
                "mixte",
                quizScore,
                currentQuizConfig.questions,
                durationInSeconds
            );


        await createQuizErrors(
            session.id,
            quizErrors
        );
    }
    catch (error)
    {
        console.error(
            "Erreur lors de l'enregistrement du quiz :",
            error
        );
    }


    /* ======================================================
       AFFICHAGE DU SCORE
    ====================================================== */

    const arrivalScore =
        document.getElementById(
            "arrival-score"
        );


    const arrivalScoreValue =
        document.getElementById(
            "arrival-score-value"
        );


    if (arrivalScoreValue)
    {
        arrivalScoreValue.textContent =
            `${quizScore} / ${currentQuizConfig.questions}`;
    }


    if (arrivalScore)
    {
        arrivalScore.style.display =
            "block";
    }


    updateArrivalProfessor();


    showArrival();


    initialiseArrivalProfessorFromScore(
        quizScore,
        currentQuizConfig.questions
    );
}


/* ==========================================================
   RETOUR VERS LA FRANCE
========================================================== */

function startQuizReturn()
{
    clearQuizTimer();


    returnErrors =
        [...quizErrors];


    currentReturnErrorIndex =
        0;


    returnQuestionLocked =
        false;


    /*
     * AUCUNE ERREUR :
     * RETOUR AUTOMATIQUE
     */

    if (returnErrors.length === 0)
    {
        startAutomaticReturn();

        return;
    }


    /*
     * ERREURS :
     * UNE ERREUR = UNE ÉTAPE
     */

    startBackCrossing(
        returnErrors.length
    );


    setTimeout(
        () =>
        {
            showReturnError();
        },

        500
    );
}


/* ==========================================================
   RETOUR AUTOMATIQUE
========================================================== */

function startAutomaticReturn()
{
    if (automaticReturnInterval)
    {
        clearInterval(
            automaticReturnInterval
        );

        automaticReturnInterval =
            null;
    }


    startAutomaticBackCrossing();
}


/* ==========================================================
   AFFICHAGE D'UNE ERREUR
========================================================== */

function showReturnError()
{
    const error =
        returnErrors[
            currentReturnErrorIndex
        ];


    if (!error)
    {
        finishReturnRevision();

        return;
    }


    returnQuestionLocked =
        false;


    quizQuestion.style.display =
        "block";


    quizQuestionNumber.textContent =
        `Correction ${currentReturnErrorIndex + 1} / ` +
        `${returnErrors.length}`;


    quizQuestionText.textContent =
        getReturnQuestionText(
            error
        );


    quizQuestionAnswers.innerHTML =
        "";


    createReturnCorrection(
        error
    );
}


/* ==========================================================
   TEXTE DE LA QUESTION À CORRIGER
========================================================== */

function getReturnQuestionText(
    error
)
{
    const verb =
        irregularVerbs.find(
            (item) =>
                item.infinitive ===
                error.verb
        );


    if (!verb)
    {
        return error.verb;
    }


    switch (error.type)
    {
        case "infinitive":

            return (
                `Quel est l'infinitif de ` +
                `${getDisplayAnswer(
                    verb.preterite
                ).toUpperCase()} ?`
            );


        case "pastParticiple":

            return (
                `Quel est le participe passé de ` +
                `${verb.infinitive.toUpperCase()} ?`
            );


        case "translation":

            return (
                `Quelle est la traduction de ` +
                `${verb.infinitive.toUpperCase()} ?`
            );


        case "preterite":

        default:

            return (
                `Quel est le prétérit de ` +
                `${verb.infinitive.toUpperCase()} ?`
            );
    }
}


/* ==========================================================
   CRÉATION DE LA CORRECTION
========================================================== */

function createReturnCorrection(
    error
)
{
    const verb =
        irregularVerbs.find(
            (item) =>
                item.infinitive ===
                error.verb
        );


    if (!verb)
    {
        finishReturnRevision();

        return;
    }


    const previousQuestionType =
        currentQuestionType;


    currentQuestionType =
        error.type;


    const correctAnswer =
        getCorrectAnswer(
            verb
        );


    const correctDisplayAnswer =
        getDisplayAnswer(
            correctAnswer
        );


    const validAnswers =
        getAnswerVariants(
            correctAnswer
        );


    const wrongAnswers =
        getWrongAnswers(
            verb,
            validAnswers
        );


    currentQuestionType =
        previousQuestionType;


    const answers = [
        correctDisplayAnswer,
        ...wrongAnswers
    ];


    shuffleArray(
        answers
    ).forEach(
        (answer) =>
        {
            const button =
                document.createElement(
                    "button"
                );


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
                    checkReturnAnswer(
                        answer,
                        correctAnswer
                    );
                }
            );


            quizQuestionAnswers.appendChild(
                button
            );
        }
    );
}


/* ==========================================================
   VALIDATION D'UNE CORRECTION
========================================================== */

function checkReturnAnswer(
    answer,
    correctAnswer
)
{
    if (returnQuestionLocked)
    {
        return;
    }


    const validAnswers =
        getAnswerVariants(
            correctAnswer
        );


    const userAnswer =
        normaliseAnswer(
            answer
        );


    /*
     * ERREUR :
     * LE BATEAU NE BOUGE PAS
     */

    if (
        !validAnswers.includes(
            userAnswer
        )
    )
    {
        return;
    }


    /*
     * BONNE RÉPONSE
     */

    returnQuestionLocked =
        true;


    disableQuizAnswers();


    advanceReturnBoat();


    currentReturnErrorIndex++;


    setTimeout(
        () =>
        {
            if (
                currentReturnErrorIndex >=
                returnErrors.length
            )
            {
                finishReturnRevision();

                return;
            }


            showReturnError();
        },

        700
    );
}


/* ==========================================================
   FIN DES CORRECTIONS
========================================================== */

function finishReturnRevision()
{
    quizQuestion.style.display =
        "none";


    quizQuestionAnswers.innerHTML =
        "";


    returnQuestionLocked =
        true;
}


/* ==========================================================
   RÉINITIALISATION DU QUIZ
========================================================== */

function resetQuizGame()
{
    clearQuizTimer();


    if (automaticReturnInterval)
    {
        clearInterval(
            automaticReturnInterval
        );

        automaticReturnInterval =
            null;
    }


    quizScore =
        0;

    currentQuestionIndex =
        0;

    quizErrors =
        [];

    currentQuizConfig =
        null;

    currentQuestionType =
        null;

    quizVerbs =
        [];

    currentVerb =
        null;

    quizQuestionLocked =
        false;

    quizStartTime =
        null;

    currentQuizDifficulty =
        null;


    returnErrors =
        [];

    currentReturnErrorIndex =
        0;

    returnQuestionLocked =
        false;


    quizQuestion.style.display =
        "none";

    quizQuestionAnswers.innerHTML =
        "";
}