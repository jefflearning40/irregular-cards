"use strict";

/* ==========================================================
   TRAVERSEE DE LA MANCHE
   VERSION 2.0
========================================================== */

/* ==========================================================
   ELEMENTS HTML
========================================================== */

const boat =
    document.getElementById("boat");

const boatTranslation =
    document.getElementById("boat-translation");

const boatOscillation =
    document.getElementById("boat-oscillation");

const button =
    document.getElementById("start-crossing");

/* ==========================================================
   PARAMETRES
========================================================== */

/*
    nombre de déplacements
    nécessaires pour traverser
    toute la Manche.
*/

const TOTAL_STEPS = 20;

/*
    durée d'une avancée.
*/

const MOVE_DURATION = 350;

/*
    marge de départ
*/

const OUTSIDE_MARGIN = 40;

/*
    oscillation
*/

const OSCILLATION_HEIGHT = 6;
const OSCILLATION_SPEED = 0.008;

/* ==========================================================
   ETAT
========================================================== */

let currentStep = 0;

let currentX = 0;

let targetX = 0;

let startX = 0;

let animationStart = null;

let animationId = null;

let isMoving = false;

let boatWidth = 0;

let maxTravel = 0;

/* ==========================================================
   INITIALISATION
========================================================== */

function initialiseBoat()
{

    boatWidth =
        boatTranslation.offsetWidth;

    currentStep = 0;

    currentX =
        -boatWidth -
        OUTSIDE_MARGIN;

    targetX =
        currentX;

    startX =
        currentX;

    maxTravel =
        window.innerWidth +
        boatWidth +
        OUTSIDE_MARGIN * 2;

    updateBoat();

}

/* ==========================================================
   POSITION
========================================================== */

function updateBoat()
{

    boatTranslation.style.transform =
        `translateX(${currentX}px)`;

}

/* ==========================================================
   COURBE
========================================================== */

function ease(progress)
{

    return -(Math.cos(Math.PI * progress) - 1) / 2;

}

/*2222222222222222222222222222222222222222222222222222222222222222222222222

/* ==========================================================
   CALCUL DE LA PROCHAINE POSITION
========================================================== */

function computeTarget()
{

    currentStep++;

    if (currentStep > TOTAL_STEPS)
    {
        currentStep = TOTAL_STEPS;
    }

    startX = currentX;

    targetX =
        (
            maxTravel /
            TOTAL_STEPS
        ) *
        currentStep -
        boatWidth -
        OUTSIDE_MARGIN;

}

/* ==========================================================
   DEMARRER UNE AVANCEE
========================================================== */

function advanceBoat()
{

    if (isMoving)
    {
        return;
    }

    if (currentStep >= TOTAL_STEPS)
    {
        return;
    }

    computeTarget();

    animationStart = null;

    isMoving = true;

    animationId =
        requestAnimationFrame(
            animateBoat
        );

}

/* ==========================================================
   ANIMATION
========================================================== */

function animateBoat(time)
{

    if (animationStart === null)
    {
        animationStart = time;
    }

    const elapsed =
        time -
        animationStart;

    const progress =
        Math.min(
            elapsed /
            MOVE_DURATION,
            1
        );

    const smooth =
        ease(progress);

    currentX =
        startX +
        (
            targetX -
            startX
        ) *
        smooth;

    updateBoat();
    
    
    /*333333333333333333333333333333333333
    /*
        Oscillation verticale
    */

    const wave =
        Math.sin(
            time *
            OSCILLATION_SPEED
        ) *
        OSCILLATION_HEIGHT;

    boatOscillation.style.transform =
        `translateY(${wave}px)`;

    if (progress < 1)
    {

        animationId =
            requestAnimationFrame(
                animateBoat
            );

        return;

    }

    /*
        Fin de l'animation
    */

    currentX =
        targetX;

    updateBoat();

    boatOscillation.style.transform =
        "translateY(0px)";

    isMoving = false;

    /*
        Traversée terminée
    */

    if (
        currentStep >=
        TOTAL_STEPS
    )
    {

        button.disabled = true;

        button.textContent =
            "Arrivée en Angleterre !";

    }

}
/*44444444444444444444444444444444444444444444444444444
/* ==========================================================
   EVENEMENTS
========================================================== */

button.addEventListener(
    "click",
    advanceBoat
);

window.addEventListener(
    "resize",
    () =>
    {

        const ratio =
            currentStep /
            TOTAL_STEPS;

        boatWidth =
            boatTranslation.offsetWidth;

        maxTravel =
            window.innerWidth +
            boatWidth +
            OUTSIDE_MARGIN * 2;

        currentX =
            (
                maxTravel *
                ratio
            ) -
            boatWidth -
            OUTSIDE_MARGIN;

        targetX =
            currentX;

        startX =
            currentX;

        updateBoat();

    }
);

window.addEventListener(
    "load",
    initialiseBoat
);

/* ==========================================================
   API DU BATEAU
========================================================== */

/*
    Cette fonction sera appelée
    plus tard par le QCM.

    Exemple :

    if (bonneReponse)
    {
        boatGame.advance();
    }
*/

const boatGame =
{

    advance()
    {

        advanceBoat();

    },

    reset()
    {

        cancelAnimationFrame(
            animationId
        );

        animationId = null;

        isMoving = false;

        initialiseBoat();

        button.disabled = false;

        button.textContent =
            "Démarrer la traversée";

    }

};

/* ==========================================================
   INITIALISATION
========================================================== */

initialiseBoat();

/* ==========================================================
   FIN
========================================================== */
