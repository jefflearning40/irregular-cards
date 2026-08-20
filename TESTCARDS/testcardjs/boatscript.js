"use strict";

/* ==========================================================
   TRAVERSÉE DE LA MANCHE
   Version 1.0

   Partie 1 / 3

   Cette partie contient :

   ✔ constantes
   ✔ récupération du DOM
   ✔ variables globales
   ✔ fonctions utilitaires

   >>> COLLER LA PARTIE 2 ICI <<<
========================================================== */


/* ==========================================================
   ELEMENTS HTML
========================================================== */

const boat =
    document.getElementById("boat");

const boatTranslation =
    document.getElementById("boat-translation");

const button =
    document.getElementById("start-crossing");


/* ==========================================================
   IMAGES
========================================================== */

const BOAT_GO =
    "assets/images/logos/boat_inkscape.svg";

const BOAT_BACK =
    "assets/images/logos/back-boat_inkscape.svg";


/* ==========================================================
   PARAMETRES
========================================================== */

/*
    durée d'une traversée
*/

const CROSSING_DURATION = 16000;

/*
    pause au port
*/

const PORT_STOP = 2000;

/*
    marge hors écran
*/

const OUTSIDE_MARGIN = 50;


/* ==========================================================
   ETAT DU JEU
========================================================== */

let currentDirection = "go";

let animationId = null;

let animationStart = null;

let boatWidth = 0;

let startPosition = 0;

let endPosition = 0;

let isMoving = false;


/* ==========================================================
   INITIALISATION
========================================================== */

function initialiseBoat()
{

    boatWidth =
        boatTranslation.offsetWidth;

    startPosition =
        -boatWidth - OUTSIDE_MARGIN;

    endPosition =
        window.innerWidth +
        OUTSIDE_MARGIN;

    boatTranslation.style.transform =
        `translateX(${startPosition}px)`;

    boat.src =
        BOAT_GO;

}


/* ==========================================================
   COURBE D'ACCELERATION

   Accélération
   Croisière
   Ralentissement

========================================================== */

function easeInOut(progress)
{

    return -(Math.cos(Math.PI * progress) - 1) / 2;

}


/* ==========================================================
   POSITION DU BATEAU
========================================================== */

function setBoatPosition(position)
{

    boatTranslation.style.transform =
        `translateX(${position}px)`;

}


/* ==========================================================
   REMISE A ZERO
========================================================== */

function resetBoat()
{

    cancelAnimationFrame(animationId);

    animationId = null;

    animationStart = null;

    currentDirection = "go";

    boat.src = BOAT_GO;

    initialiseBoat();

}


/* ==========================================================
   EVENEMENTS
========================================================== */

window.addEventListener(
    "resize",
    initialiseBoat
);

window.addEventListener(
    "load",
    initialiseBoat
);


/* ==========================================================
   DEMARRAGE DE LA TRAVERSEE
========================================================== */

function startJourney()
{

    if (isMoving)
    {
        return;
    }

    isMoving = true;

    button.disabled = true;

    button.textContent =
        "Traversée en cours...";

    animationStart = null;

    currentDirection = "go";

    boat.src = BOAT_GO;

    animationId =
        requestAnimationFrame(
            animate
        );

}


/* ==========================================================
   ANIMATION PRINCIPALE
========================================================== */

function animate(currentTime)
{

    if (animationStart === null)
    {
        animationStart = currentTime;
    }

    const elapsed =
        currentTime - animationStart;

    const progress =
        Math.min(
            elapsed /
            CROSSING_DURATION,
            1
        );

    /*
        Courbe d'accélération /
        croisière /
        ralentissement
    */

    const smooth =
        easeInOut(progress);

    let x;

    if (currentDirection === "go")
    {

        x =
            startPosition +
            (
                endPosition -
                startPosition
            ) *
            smooth;

    }
    else
    {

        x =
            endPosition +
            (
                startPosition -
                endPosition
            ) *
            smooth;

    }

    setBoatPosition(x);

    if (progress < 1)
    {

        animationId =
            requestAnimationFrame(
                animate
            );

        return;

    }

    /*
        Arrivé au port
    */

    if (
        currentDirection ===
        "go"
    )
    {

        arriveInEngland();

    }
    else
    {

        arriveInFrance();

    }

}


/* ==========================================================
   ARRIVEE EN ANGLETERRE
========================================================== */

function arriveInEngland()
{

    cancelAnimationFrame(
        animationId
    );

    animationId = null;

    button.textContent =
        "Escale en Angleterre...";

    /*
        Petite pause
    */

    setTimeout(
        prepareReturn,
        PORT_STOP
    );

}


/* ==========================================================
   PREPARATION DU RETOUR
========================================================== */

function prepareReturn()
{

    /*
        On change le SVG
    */

    boat.src =
        BOAT_BACK;

    currentDirection =
        "back";

    /*
        On repartira depuis
        la droite.
    */

    animationStart =
        null;

    button.textContent =
        "Retour vers la France...";

    animationId =
        requestAnimationFrame(
            animate
        );

}


/* ==========================================================
   ARRIVEE EN FRANCE
========================================================== */

function arriveInFrance()
{

    cancelAnimationFrame(
        animationId
    );

    animationId = null;

    isMoving = false;

    button.disabled = false;

    button.textContent =
        "Recommencer la traversée";

    /*
        On remet le bateau
        dans son état initial
        pour la prochaine
        traversée.
    */

    setTimeout(
        () =>
        {

            boat.src =
                BOAT_GO;

            currentDirection =
                "go";

            initialiseBoat();

        },
        1000
    );

}


/* ==========================================================
   BOUTON
========================================================== */

button.addEventListener(
    "click",
    startJourney
);


/* ==========================================================
   INITIALISATION
========================================================== */

initialiseBoat();


/* ==========================================================
   FIN DU SCRIPT
========================================================== */