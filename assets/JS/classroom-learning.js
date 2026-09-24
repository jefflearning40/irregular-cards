"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const classroomVerbTitle =
    document.getElementById(
        "classroom-verb-title"
    );

const classroomVerbTranslation =
    document.getElementById(
        "classroom-verb-translation"
    );

const classroomVerbInfinitive =
    document.getElementById(
        "classroom-verb-infinitive"
    );

const classroomVerbPreterite =
    document.getElementById(
        "classroom-verb-preterite"
    );

const classroomVerbParticiple =
    document.getElementById(
        "classroom-verb-participle"
    );

const classroomPreviousVerbButton =
    document.getElementById(
        "classroom-previous-verb"
    );

const classroomNextVerbButton =
    document.getElementById(
        "classroom-next-verb"
    );

const classroomVerbCounter =
    document.getElementById(
        "classroom-verb-counter"
    );

const classroomVerbForms =
    document.querySelector(
        ".classroom-board__verb"
    );

const classroomReviewButton =
    document.getElementById(
        "classroom-review-button"
    );


/* ==========================================================
   ÉTAT
========================================================== */

let classroomAllVerbs = [];

let classroomVerbs = [];

let classroomVerbIndex = 0;

let classroomReviewMode = false;


/* ==========================================================
   CHARGEMENT DU JSON
========================================================== */

async function loadClassroomVerbs()
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


        classroomAllVerbs =
            await response.json();


        if (
            !Array.isArray(classroomAllVerbs) ||
            classroomAllVerbs.length === 0
        )
        {
            throw new Error(
                "Aucun verbe disponible."
            );
        }


        classroomVerbs =
            [...classroomAllVerbs];


        classroomVerbIndex = 0;


        displayClassroomVerb();
    }
    catch (error)
    {
        console.error(
            "Erreur apprentissage :",
            error
        );
    }
}


/* ==========================================================
   NORMALISATION D'UN INFINITIF
========================================================== */

function normalizeClassroomInfinitive(
    infinitive
)
{
    return String(
        infinitive ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /^to\s+/,
            ""
        );
}


/* ==========================================================
   VERBES À REVOIR
========================================================== */

async function showClassroomReviewVerbs()
{
    if (classroomReviewMode)
    {
        classroomReviewMode =
            false;

        classroomVerbs =
            [...classroomAllVerbs];

        classroomVerbIndex =
            0;

        classroomReviewButton.textContent =
            "Verbes à revoir";

        displayClassroomVerb();

        return;
    }


    try
    {
        classroomReviewButton.disabled =
            true;


        const errors =
            await getQuizErrors();


        const reviewInfinitives =
            new Set(
                errors.map(
                    (error) =>
                        normalizeClassroomInfinitive(
                            error.infinitif
                        )
                )
            );


        const reviewVerbs =
            classroomAllVerbs.filter(
                (verb) =>
                    reviewInfinitives.has(
                        normalizeClassroomInfinitive(
                            verb.infinitive
                        )
                    )
            );


        if (reviewVerbs.length === 0)
        {
            classroomVerbTitle.textContent =
                "AUCUN VERBE À REVOIR";

            classroomVerbTranslation.textContent =
                "Aucune erreur enregistrée";

            classroomVerbInfinitive.textContent =
                "";

            classroomVerbPreterite.textContent =
                "";

            classroomVerbParticiple.textContent =
                "";

            classroomVerbCounter.textContent =
                "0 / 0";

            return;
        }


        classroomReviewMode =
            true;

        classroomVerbs =
            reviewVerbs;

        classroomVerbIndex =
            0;

        classroomReviewButton.textContent =
            "Tous les verbes";


        displayClassroomVerb();
    }
    catch (error)
    {
        console.error(
            "Erreur verbes à revoir :",
            error
        );


        classroomVerbTitle.textContent =
            "ERREUR";

        classroomVerbTranslation.textContent =
            "Impossible de charger les verbes à revoir";
    }
    finally
    {
        classroomReviewButton.disabled =
            false;
    }
}


/* ==========================================================
   DÉTECTION DES FORMES LONGUES
========================================================== */

function hasLongVerbForms(
    verb
)
{
    const infinitive =
        verb.infinitive.trim();

    const preterite =
        verb.preterite.trim();

    const pastParticiple =
        verb.pastParticiple.trim();


    /*
       Passage en colonne si une forme est longue
       ou contient plusieurs possibilités.
    */

    return (
        infinitive.length > 12 ||
        preterite.length > 12 ||
        pastParticiple.length > 12 ||
        preterite.includes("/") ||
        pastParticiple.includes("/")
    );
}


/* ==========================================================
   AFFICHAGE DU VERBE
========================================================== */

function displayClassroomVerb()
{
    if (
        !classroomVerbTitle ||
        !classroomVerbTranslation ||
        !classroomVerbInfinitive ||
        !classroomVerbPreterite ||
        !classroomVerbParticiple ||
        !classroomVerbCounter ||
        !classroomVerbForms
    )
    {
        console.error(
            "Un élément du tableau d'apprentissage est absent du HTML."
        );

        return;
    }


    if (classroomVerbs.length === 0)
    {
        return;
    }


    const verb =
        classroomVerbs[
            classroomVerbIndex
        ];


    classroomVerbTitle.textContent =
        `TO ${verb.infinitive.toUpperCase()}`;


    classroomVerbTranslation.textContent =
        verb.translation;


    classroomVerbInfinitive.textContent =
        verb.infinitive.toUpperCase();


    classroomVerbPreterite.textContent =
        verb.preterite.toUpperCase();


    classroomVerbParticiple.textContent =
        verb.pastParticiple.toUpperCase();


    classroomVerbCounter.textContent =
        `${classroomVerbIndex + 1} / ${classroomVerbs.length}`;


    /* ======================================================
       AFFICHAGE LIGNE / COLONNE
    ====================================================== */

    classroomVerbForms.classList.toggle(
        "classroom-board__verb--column",
        hasLongVerbForms(verb)
    );
}


/* ==========================================================
   VERBE PRÉCÉDENT
========================================================== */

function showPreviousClassroomVerb()
{
    if (classroomVerbs.length === 0)
    {
        return;
    }


    classroomVerbIndex--;


    if (classroomVerbIndex < 0)
    {
        classroomVerbIndex =
            classroomVerbs.length - 1;
    }


    displayClassroomVerb();
}


/* ==========================================================
   VERBE SUIVANT
========================================================== */

function showNextClassroomVerb()
{
    if (classroomVerbs.length === 0)
    {
        return;
    }


    classroomVerbIndex++;


    if (
        classroomVerbIndex >=
        classroomVerbs.length
    )
    {
        classroomVerbIndex = 0;
    }


    displayClassroomVerb();
}


/* ==========================================================
   ÉVÉNEMENTS
========================================================== */

if (classroomPreviousVerbButton)
{
    classroomPreviousVerbButton.addEventListener(
        "click",
        showPreviousClassroomVerb
    );
}


if (classroomNextVerbButton)
{
    classroomNextVerbButton.addEventListener(
        "click",
        showNextClassroomVerb
    );
}


if (classroomReviewButton)
{
    classroomReviewButton.addEventListener(
        "click",
        showClassroomReviewVerbs
    );
}


/* ==========================================================
   INITIALISATION
========================================================== */

loadClassroomVerbs();