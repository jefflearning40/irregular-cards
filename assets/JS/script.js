"use strict";

/* ==========================================================
   TRAVERSÉE DE LA MANCHE
   VERSION TEST ALLER / RETOUR
========================================================== */


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const departureScreen =
    document.getElementById("departure-screen");

const crossingScreen =
    document.getElementById("crossing-screen");

const arrivalScreen =
    document.getElementById("arrival-screen");


const departureButton =
    document.getElementById("departure-button");

const returnButton =
    document.getElementById("return-button");

const crossingButton =
    document.getElementById("start-crossing");


const boat =
    document.getElementById("boat");

const boatTranslation =
    document.getElementById("boat-translation");

const boatOscillation =
    document.getElementById("boat-oscillation");


const professeurDepart =
    document.getElementById("professeur-depart");

const professeurArrivee =
    document.getElementById("professeur-arrivee");


/* ==========================================================
   PARAMÈTRES
========================================================== */

const TOTAL_STEPS = 20;

const MOVE_DURATION = 350;

const OUTSIDE_MARGIN = 40;

const OSCILLATION_HEIGHT = 6;

const OSCILLATION_SPEED = 0.008;


/* ==========================================================
   IMAGES DU BATEAU
========================================================== */

const BOAT_FORWARD =
    "assets/images/decor/boat_inkscape.svg";

const BOAT_BACK =
    "assets/images/decor/back-boat_inkscape.svg";


/* ==========================================================
   ÉTAT DU JEU
========================================================== */

/*
    direction :

    "forward" = France -> Angleterre
    "back"    = Angleterre -> France
*/

let direction = "forward";

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
   AFFICHAGE DES ÉCRANS
========================================================== */

function showDeparture()
{
    departureScreen.style.display = "flex";

    crossingScreen.style.display = "none";

    arrivalScreen.style.display = "none";
}


function showCrossing()
{
    departureScreen.style.display = "none";

    crossingScreen.style.display = "block";

    arrivalScreen.style.display = "none";
}


function showArrival()
{
    departureScreen.style.display = "none";

    crossingScreen.style.display = "none";

    arrivalScreen.style.display = "flex";
}


/* ==========================================================
   PROFESSEUR
========================================================== */

function setProfessorState(
    professeur,
    state
)
{
    const svg =
        professeur.contentDocument;

    if (!svg)
    {
        return;
    }


    const brasNeutre =
        svg.getElementById(
            "bras-g-neutre"
        );

    const brasErreur =
        svg.getElementById(
            "bras-g"
        );

    const brasBravo =
        svg.getElementById(
            "animation-bravo"
        );

    const sourcilG =
        svg.getElementById(
            "sourcil-g"
        );

    const sourcilD =
        svg.getElementById(
            "sourcil-d"
        );


    if (
        !brasNeutre ||
        !brasErreur ||
        !brasBravo
    )
    {
        console.error(
            "Les bras du professeur sont introuvables."
        );

        return;
    }


    /*
        On commence par tout masquer.
    */

    brasNeutre.style.display =
        "none";

    brasErreur.style.display =
        "none";

    brasBravo.style.display =
        "none";


    /*
        Sourcils normaux.
    */

    if (sourcilG)
    {
        sourcilG.style.transform =
            "rotate(0deg)";
    }

    if (sourcilD)
    {
        sourcilD.style.transform =
            "rotate(0deg)";
    }


    /*
        NEUTRE
    */

    if (state === "neutral")
    {
        brasNeutre.style.display =
            "inline";

        return;
    }


    /*
        BRAVO
    */

    if (state === "bravo")
    {
        brasBravo.style.display =
            "inline";

        brasBravo.style.transformBox =
            "fill-box";

        brasBravo.style.transformOrigin =
            "0% 50%";

        brasBravo.style.transition =
            "transform 0.3s ease";

        brasBravo.style.transform =
            "rotate(0deg)";


        /*
            Petit mouvement du bras.
        */

        setTimeout(
            () =>
            {
                brasBravo.style.transform =
                    "rotate(-15deg)";
            },
            300
        );

        setTimeout(
            () =>
            {
                brasBravo.style.transform =
                    "rotate(5deg)";
            },
            700
        );

        setTimeout(
            () =>
            {
                brasBravo.style.transform =
                    "rotate(-15deg)";
            },
            1100
        );

        setTimeout(
            () =>
            {
                brasBravo.style.transform =
                    "rotate(0deg)";
            },
            1500
        );
    }
}


/* ==========================================================
   PROFESSEUR DÉPART
========================================================== */

function initialiseDepartureProfessor()
{
    setProfessorState(
        professeurDepart,
        "neutral"
    );
}


/* ==========================================================
   PROFESSEUR ARRIVÉE
========================================================== */

function initialiseArrivalProfessor()
{
    setProfessorState(
        professeurArrivee,
        "bravo"
    );
}


/* ==========================================================
   INITIALISATION DU BATEAU
========================================================== */

function initialiseBoat()
{
    boatWidth =
        boatTranslation.offsetWidth;

    currentStep = 0;

    maxTravel =
        window.innerWidth +
        boatWidth +
        OUTSIDE_MARGIN * 2;


    /*
        ALLER
        bateau hors écran à gauche.
    */

    if (direction === "forward")
    {
        currentX =
            -boatWidth -
            OUTSIDE_MARGIN;
    }


    /*
        RETOUR
        bateau hors écran à droite.
    */

    else
    {
        currentX =
            window.innerWidth +
            OUTSIDE_MARGIN;
    }


    targetX =
        currentX;

    startX =
        currentX;

    updateBoat();
}


/* ==========================================================
   POSITION DU BATEAU
========================================================== */

function updateBoat()
{
    boatTranslation.style.transform =
        `translateX(${currentX}px)`;
}


/* ==========================================================
   COURBE D'ANIMATION
========================================================== */

function ease(progress)
{
    return -(
        Math.cos(
            Math.PI * progress
        ) - 1
    ) / 2;
}


/* ==========================================================
   CALCUL DE LA PROCHAINE POSITION
========================================================== */

function computeTarget()
{
    currentStep++;

    if (currentStep > TOTAL_STEPS)
    {
        currentStep =
            TOTAL_STEPS;
    }


    startX =
        currentX;


    /*
        ALLER
    */

    if (direction === "forward")
    {
        targetX =
            (
                maxTravel /
                TOTAL_STEPS
            ) *
            currentStep -
            boatWidth -
            OUTSIDE_MARGIN;
    }


    /*
        RETOUR
    */

    else
    {
        targetX =
            (
                window.innerWidth +
                OUTSIDE_MARGIN
            ) -
            (
                maxTravel /
                TOTAL_STEPS
            ) *
            currentStep;
    }
}


/* ==========================================================
   FAIRE AVANCER LE BATEAU
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


    animationStart =
        null;

    isMoving =
        true;


    animationId =
        requestAnimationFrame(
            animateBoat
        );
}


/* ==========================================================
   ANIMATION DU BATEAU
========================================================== */

function animateBoat(time)
{
    if (animationStart === null)
    {
        animationStart =
            time;
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


    /*
        Oscillation verticale.
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
        Fin d'une avancée.
    */

    currentX =
        targetX;

    updateBoat();


    boatOscillation.style.transform =
        "translateY(0px)";


    isMoving =
        false;


    /*
        Traversée terminée.
    */

    if (currentStep >= TOTAL_STEPS)
    {
        finishCrossing();
    }
}


/* ==========================================================
   FIN DE TRAVERSÉE
========================================================== */

function finishCrossing()
{
    crossingButton.disabled =
        true;


    /*
        ARRIVÉE EN ANGLETERRE
    */

    if (direction === "forward")
    {
        crossingButton.textContent =
            "Arrivée en Angleterre !";


        /*
            Petite attente avant
            d'afficher la carte.
        */

        setTimeout(
            () =>
            {
                showArrival();

                initialiseArrivalProfessor();
            },
            700
        );

        return;
    }


    /*
        RETOUR EN FRANCE
    */

    crossingButton.textContent =
        "Retour en France !";


    setTimeout(
        () =>
        {
            showDeparture();

            initialiseDepartureProfessor();
        },
        700
    );
}


/* ==========================================================
   DÉPART VERS L'ANGLETERRE
========================================================== */

function startForwardCrossing()
{
    direction =
        "forward";


    boat.src =
        BOAT_FORWARD;


    crossingButton.disabled =
        false;

    crossingButton.textContent =
        "Faire avancer le bateau";


    showCrossing();


    /*
        Il faut attendre que la scène
        soit visible avant de mesurer
        la largeur du bateau.
    */

    requestAnimationFrame(
        initialiseBoat
    );
}


/* ==========================================================
   RETOUR VERS LA FRANCE
========================================================== */

function startBackCrossing()
{
    direction =
        "back";


    boat.src =
        BOAT_BACK;


    crossingButton.disabled =
        false;

    crossingButton.textContent =
        "Faire avancer le bateau";


    showCrossing();


    requestAnimationFrame(
        initialiseBoat
    );
}


/* ==========================================================
   REDIMENSIONNEMENT
========================================================== */

function handleResize()
{
    /*
        Pas besoin de recalculer le bateau
        lorsque la traversée est cachée.
    */

    if (
        crossingScreen.style.display ===
        "none"
    )
    {
        return;
    }


    const ratio =
        currentStep /
        TOTAL_STEPS;


    boatWidth =
        boatTranslation.offsetWidth;


    maxTravel =
        window.innerWidth +
        boatWidth +
        OUTSIDE_MARGIN * 2;


    /*
        ALLER
    */

    if (direction === "forward")
    {
        currentX =
            (
                maxTravel *
                ratio
            ) -
            boatWidth -
            OUTSIDE_MARGIN;
    }


    /*
        RETOUR
    */

    else
    {
        currentX =
            (
                window.innerWidth +
                OUTSIDE_MARGIN
            ) -
            (
                maxTravel *
                ratio
            );
    }


    targetX =
        currentX;

    startX =
        currentX;


    updateBoat();
}


/* ==========================================================
   ÉVÉNEMENTS
========================================================== */

departureButton.addEventListener(
    "click",
    startForwardCrossing
);


returnButton.addEventListener(
    "click",
    startBackCrossing
);


crossingButton.addEventListener(
    "click",
    advanceBoat
);


window.addEventListener(
    "resize",
    handleResize
);


/* ==========================================================
   CHARGEMENT DES PROFESSEURS
========================================================== */

professeurDepart.addEventListener(
    "load",
    initialiseDepartureProfessor
);


professeurArrivee.addEventListener(
    "load",
    () =>
    {
        /*
            On le prépare sans lancer
            Bravo tant que la carte
            d'arrivée n'est pas affichée.
        */

        setProfessorState(
            professeurArrivee,
            "neutral"
        );
    }
);


/* ==========================================================
   API DU BATEAU
========================================================== */

/*
    Plus tard le QCM pourra simplement faire :

    boatGame.advance();

    à chaque bonne réponse.
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

        animationId =
            null;

        isMoving =
            false;

        initialiseBoat();
    }
};


/* ==========================================================
   INITIALISATION GÉNÉRALE
========================================================== */

showDeparture();


/* ==========================================================
   FIN
========================================================== */