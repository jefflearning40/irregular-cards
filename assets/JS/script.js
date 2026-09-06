"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */


const learningButton =
    document.getElementById("learning-button");

const classroomBackButton =
    document.getElementById("classroom-back-button");

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


const boatWake =
    document.getElementById("boat-wake");

const boatWakeImage =
    document.getElementById("boat-wake-image");




/* ==========================================================
   PARAMÈTRES
========================================================== */

const TOTAL_STEPS = 20;

const MOVE_DURATION = 350;

const OUTSIDE_MARGIN = 40;

const OSCILLATION_HEIGHT = 6;

const OSCILLATION_SPEED = 0.008;


/* ==========================================================
   BATEAU
========================================================== */

const BOAT_IMAGE =
    "assets/images/decor/boat.png";


/* ==========================================================
   IMAGES DU SILLAGE INKSCAPE
========================================================== */

const WAKE_IMAGES =
[
    "assets/images/decor/vaguelette-sillage.png",

    "assets/images/decor/vaguelette-sillage2.png",

    "assets/images/decor/vaguelette-sillage3.png",

    "assets/images/decor/vaguelettes1.png"
];


let wakeIndex = 0;

let wakeTimer = null;


/* ==========================================================
   ÉTAT
========================================================== */

let direction =
    "forward";

let currentStep =
    0;

let currentX =
    0;

let targetX =
    0;

let startX =
    0;

let animationStart =
    null;

let animationId =
    null;

let isMoving =
    false;

let boatWidth =
    0;

let maxTravel =
    0;







/* ==========================================================
   ORIENTATION BATEAU + SILLAGE
========================================================== */

function setBoatDirection()
{
    boat.style.transform =
        "scaleX(1)";

    boatWake.style.transform =
        "scaleX(1)";


    if (direction === "forward")
    {
        boatOscillation.style.scale =
            "1 1";

        return;
    }


    boatOscillation.style.scale =
        "-1 1";
}


/* ==========================================================
   ANIMATION DU SILLAGE
========================================================== */

function updateWake()
{
    wakeIndex++;


    if (wakeIndex >= WAKE_IMAGES.length)
    {
        wakeIndex =
            0;
    }


    boatWakeImage.src =
        WAKE_IMAGES[wakeIndex];
}


function startWake()
{
    stopWake();


    wakeIndex =
        0;


    boatWakeImage.src =
        WAKE_IMAGES[0];


    boatWake.style.display =
        "block";


    wakeTimer =
        setInterval(
            updateWake,
            120
        );
}


function stopWake()
{
    if (wakeTimer !== null)
    {
        clearInterval(
            wakeTimer
        );

        wakeTimer =
            null;
    }


    boatWake.style.display =
        "none";
}


/* ==========================================================
   INITIALISATION BATEAU
========================================================== */

function initialiseBoat()
{
    boatWidth =
        boatTranslation.offsetWidth;


    currentStep =
        0;


    maxTravel =
        window.innerWidth +
        boatWidth +
        OUTSIDE_MARGIN * 2;


    if (direction === "forward")
    {
        currentX =
            -boatWidth -
            OUTSIDE_MARGIN;
    }

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


    stopWake();

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
    return -(
        Math.cos(
            Math.PI * progress
        ) - 1
    ) / 2;
}


/* ==========================================================
   PROCHAINE POSITION
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
   AVANCER
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


    startWake();


    animationId =
        requestAnimationFrame(
            animateBoat
        );
}


/* ==========================================================
   ANIMATION BATEAU
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


    currentX =
        targetX;


    updateBoat();


    boatOscillation.style.transform =
        "translateY(0px)";


    isMoving =
        false;


    stopWake();


    if (currentStep >= TOTAL_STEPS)
    {
        finishCrossing();
    }
}


/* ==========================================================
   FIN TRAVERSÉE
========================================================== */

function finishCrossing()
{
    crossingButton.disabled =
        true;


    stopWake();


    if (direction === "forward")
    {
        crossingButton.textContent =
            "Arrivée en Angleterre !";


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
   ALLER
========================================================== */

function startForwardCrossing()
{
    direction =
        "forward";


    boat.src =
        BOAT_IMAGE;


    setBoatDirection();


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
   RETOUR
========================================================== */

function startBackCrossing()
{
    direction =
        "back";


    boat.src =
        BOAT_IMAGE;


    setBoatDirection();


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

learningButton.addEventListener(
    "click",
    showClassroom
);


classroomBackButton.addEventListener(
    "click",
    showDeparture
);


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
   PROFESSEURS
========================================================== */

professeurDepart.addEventListener(
    "load",
    initialiseDepartureProfessor
);


professeurArrivee.addEventListener(
    "load",
    () =>
    {
        setProfessorState(
            professeurArrivee,
            "neutral"
        );
    }
);


/* ==========================================================
   API
========================================================== */

const boatGame =
{
    advance()
    {
        advanceBoat();
    },


    reset()
    {
        if (animationId !== null)
        {
            cancelAnimationFrame(
                animationId
            );
        }


        animationId =
            null;


        isMoving =
            false;


        stopWake();

        initialiseBoat();
    }
};


/* ==========================================================
   INITIALISATION
========================================================== */

boat.src =
    BOAT_IMAGE;


setBoatDirection();


stopWake();


showDeparture();