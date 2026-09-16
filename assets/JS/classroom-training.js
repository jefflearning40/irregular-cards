"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const classroomExerciseButton =
    document.getElementById(
        "classroom-exercise-button"
    );

const classroomTrainingTitle =
    document.getElementById(
        "classroom-verb-title"
    );

const classroomTrainingTranslation =
    document.getElementById(
        "classroom-verb-translation"
    );

const classroomTrainingForms =
    document.querySelector(
        ".classroom-board__verb"
    );

const classroomTrainingPreviousButton =
    document.getElementById(
        "classroom-previous-verb"
    );

const classroomTrainingNextButton =
    document.getElementById(
        "classroom-next-verb"
    );

const classroomTrainingCounter =
    document.getElementById(
        "classroom-verb-counter"
    );


/* ==========================================================
   ÉTAT
========================================================== */

let classroomTrainingVerbs = [];

let classroomTrainingVerb = null;

let classroomTrainingActive = false;

let classroomTrainingTimer = null;


/* ==========================================================
   CHARGEMENT DES VERBES
========================================================== */

async function loadClassroomTrainingVerbs()
{
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


        classroomTrainingVerbs =
            await response.json();


        if (
            !Array.isArray(classroomTrainingVerbs) ||
            classroomTrainingVerbs.length === 0
        )
        {
            throw new Error(
                "Aucun verbe disponible."
            );
        }
    }
    catch (error)
    {
        console.error(
            "Erreur entraînement :",
            error
        );
    }
}


/* ==========================================================
   CHOIX ALÉATOIRE D'UN VERBE
========================================================== */

function getRandomClassroomTrainingVerb()
{
    if (classroomTrainingVerbs.length === 0)
    {
        return null;
    }


    const index =
        Math.floor(
            Math.random() *
            classroomTrainingVerbs.length
        );


    return classroomTrainingVerbs[index];
}


/* ==========================================================
   ANNULATION DU TIMER
========================================================== */

function clearClassroomTrainingTimer()
{
    if (classroomTrainingTimer === null)
    {
        return;
    }


    clearTimeout(
        classroomTrainingTimer
    );


    classroomTrainingTimer = null;
}


/* ==========================================================
   DÉMARRAGE D'UN EXERCICE
========================================================== */

function startClassroomTraining()
{
    clearClassroomTrainingTimer();


    classroomTrainingVerb =
        getRandomClassroomTrainingVerb();


    if (!classroomTrainingVerb)
    {
        return;
    }


    classroomTrainingActive =
        true;


    /* ======================================================
       PROFESSEUR : NEUTRE
    ====================================================== */

    if (
        typeof professeurClasseNeutre ===
        "function"
    )
    {
        professeurClasseNeutre();
    }


    /* ======================================================
       TEXTE DU TABLEAU
    ====================================================== */

    classroomTrainingTitle.textContent =
        classroomTrainingVerb.translation;


    classroomTrainingTranslation.textContent =
        "Complète les trois formes";


    classroomTrainingForms.classList.remove(
        "classroom-board__verb--column"
    );


    /* ======================================================
       CHAMPS DE RÉPONSES
    ====================================================== */

    classroomTrainingForms.innerHTML = `
        <input
            class="classroom-training-input"
            id="classroom-training-infinitive"
            type="text"
            placeholder="Infinitif"
            autocomplete="off"
        >

        <input
            class="classroom-training-input"
            id="classroom-training-preterite"
            type="text"
            placeholder="Prétérit"
            autocomplete="off"
        >

        <input
            class="classroom-training-input"
            id="classroom-training-participle"
            type="text"
            placeholder="Participe passé"
            autocomplete="off"
        >
    `;


    /* ======================================================
       NAVIGATION
    ====================================================== */

    if (classroomTrainingPreviousButton)
    {
        classroomTrainingPreviousButton.disabled =
            true;
    }


    if (classroomTrainingNextButton)
    {
        classroomTrainingNextButton.disabled =
            true;
    }


    if (classroomTrainingCounter)
    {
        classroomTrainingCounter.textContent =
            "Apprentissage";
    }


    /* ======================================================
       BOUTON VALIDER
    ====================================================== */

    if (classroomExerciseButton)
    {
        classroomExerciseButton.disabled =
            false;

        classroomExerciseButton.textContent =
            "Valider";
    }


    /* ======================================================
       FOCUS
    ====================================================== */

    const infinitiveInput =
        document.getElementById(
            "classroom-training-infinitive"
        );


    if (infinitiveInput)
    {
        infinitiveInput.focus();
    }
}


/* ==========================================================
   RETOUR À L'APPRENTISSAGE
========================================================== */

function returnToClassroomLearning()
{
    clearClassroomTrainingTimer();


    classroomTrainingActive =
        false;

    classroomTrainingVerb =
        null;


    /* ======================================================
       RÉACTIVATION NAVIGATION
    ====================================================== */

    if (classroomTrainingPreviousButton)
    {
        classroomTrainingPreviousButton.disabled =
            false;
    }


    if (classroomTrainingNextButton)
    {
        classroomTrainingNextButton.disabled =
            false;
    }


    /* ======================================================
       RESTAURATION DU BOUTON EXERCICE
    ====================================================== */

    if (classroomExerciseButton)
    {
        classroomExerciseButton.disabled =
            false;

        classroomExerciseButton.textContent =
            "Exercice";
    }


    /* ======================================================
       RESTAURATION DU LEARNING
    ====================================================== */

    if (
        typeof displayClassroomVerb ===
        "function"
    )
    {
        displayClassroomVerb();
    }


    /* ======================================================
       PROFESSEUR : NEUTRE
    ====================================================== */

    if (
        typeof professeurClasseNeutre ===
        "function"
    )
    {
        professeurClasseNeutre();
    }
}


/* ==========================================================
   NORMALISATION D'UNE RÉPONSE
========================================================== */

function normalizeClassroomTrainingAnswer(
    value
)
{
    return value
        .trim()
        .toLowerCase();
}


/* ==========================================================
   COMPARAISON D'UNE RÉPONSE
========================================================== */

function isClassroomTrainingAnswerCorrect(
    answer,
    expected
)
{
    const normalizedAnswer =
        normalizeClassroomTrainingAnswer(
            answer
        );


    const acceptedAnswers =
        expected
            .toLowerCase()
            .split("/")
            .map(
                value =>
                    value.trim()
            );


    return acceptedAnswers.includes(
        normalizedAnswer
    );
}


/* ==========================================================
   ÉTAT VISUEL D'UN CHAMP
========================================================== */

function setClassroomTrainingInputState(
    input,
    isCorrect
)
{
    input.classList.toggle(
        "is-correct",
        isCorrect
    );


    input.classList.toggle(
        "is-error",
        !isCorrect
    );
}


/* ==========================================================
   VALIDATION
========================================================== */

function validateClassroomTraining()
{
    if (
        !classroomTrainingActive ||
        !classroomTrainingVerb
    )
    {
        return;
    }


    const infinitiveInput =
        document.getElementById(
            "classroom-training-infinitive"
        );

    const preteriteInput =
        document.getElementById(
            "classroom-training-preterite"
        );

    const participleInput =
        document.getElementById(
            "classroom-training-participle"
        );


    if (
        !infinitiveInput ||
        !preteriteInput ||
        !participleInput
    )
    {
        return;
    }


    /* ======================================================
       VÉRIFICATION DES TROIS RÉPONSES
    ====================================================== */

    const infinitiveCorrect =
        isClassroomTrainingAnswerCorrect(
            infinitiveInput.value,
            classroomTrainingVerb.infinitive
        );


    const preteriteCorrect =
        isClassroomTrainingAnswerCorrect(
            preteriteInput.value,
            classroomTrainingVerb.preterite
        );


    const participleCorrect =
        isClassroomTrainingAnswerCorrect(
            participleInput.value,
            classroomTrainingVerb.pastParticiple
        );


    /* ======================================================
       AFFICHAGE VERT / ROUGE
    ====================================================== */

    setClassroomTrainingInputState(
        infinitiveInput,
        infinitiveCorrect
    );


    setClassroomTrainingInputState(
        preteriteInput,
        preteriteCorrect
    );


    setClassroomTrainingInputState(
        participleInput,
        participleCorrect
    );


    /* ======================================================
       BONNE RÉPONSE
    ====================================================== */

    if (
        infinitiveCorrect &&
        preteriteCorrect &&
        participleCorrect
    )
    {
        classroomTrainingActive =
            false;


        classroomTrainingTranslation.textContent =
            "Bravo !";


        if (
            typeof professeurClasseBravo ===
            "function"
        )
        {
            professeurClasseBravo();
        }


        if (classroomExerciseButton)
        {
            classroomExerciseButton.disabled =
                true;
        }


        classroomTrainingTimer =
            setTimeout(
                () =>
                {
                    classroomTrainingTimer =
                        null;

                    startClassroomTraining();
                },
                1800
            );


        return;
    }


    /* ======================================================
       MAUVAISE RÉPONSE
    ====================================================== */

    classroomTrainingTranslation.textContent =
        "Corrige les réponses en rouge.";


    if (
        typeof professeurClasseErreur ===
        "function"
    )
    {
        professeurClasseErreur();
    }
}


/* ==========================================================
   CLIC EXERCICE / VALIDER
========================================================== */

function handleClassroomExerciseButton()
{
    if (!classroomTrainingActive)
    {
        startClassroomTraining();

        return;
    }


    validateClassroomTraining();
}


/* ==========================================================
   CLIC APPRENTISSAGE
   LE COMPTEUR DEVIENT LE BOUTON DE RETOUR
========================================================== */

function handleClassroomTrainingCounter()
{
    if (!classroomTrainingActive)
    {
        return;
    }


    returnToClassroomLearning();
}


/* ==========================================================
   TOUCHE ENTRÉE
========================================================== */

document.addEventListener(
    "keydown",
    event =>
    {
        if (
            event.key !== "Enter" ||
            !classroomTrainingActive
        )
        {
            return;
        }


        const activeElement =
            document.activeElement;


        if (
            activeElement &&
            activeElement.classList.contains(
                "classroom-training-input"
            )
        )
        {
            event.preventDefault();

            validateClassroomTraining();
        }
    }
);


/* ==========================================================
   BOUTON EXERCICE
========================================================== */

if (classroomExerciseButton)
{
    classroomExerciseButton.addEventListener(
        "click",
        handleClassroomExerciseButton
    );
}


/* ==========================================================
   RETOUR APPRENTISSAGE
========================================================== */

if (classroomTrainingCounter)
{
    classroomTrainingCounter.addEventListener(
        "click",
        handleClassroomTrainingCounter
    );
}


/* ==========================================================
   INITIALISATION
========================================================== */

loadClassroomTrainingVerbs();