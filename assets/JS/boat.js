"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

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
   PARAMÈTRES DU BATEAU
========================================================== */

let TOTAL_STEPS = 20;

const MOVE_DURATION = 350;

const AUTOMATIC_RETURN_DURATION = 7000;

const OUTSIDE_MARGIN = 40;

const OSCILLATION_HEIGHT = 6;

const OSCILLATION_SPEED = 0.008;


/* ==========================================================
   IMAGE DU BATEAU
========================================================== */

const BOAT_IMAGE =
    "assets/images/decor/boat.png";


/* ==========================================================
   IMAGES DU SILLAGE
========================================================== */

const WAKE_IMAGES =
[
    "assets/images/decor/vaguelette-sillage.png",
    "assets/images/decor/vaguelette-sillage2.png",
    "assets/images/decor/vaguelette-sillage3.png",
    "assets/images/decor/vaguelettes1.png"
];


/* ==========================================================
   ÉTAT DU SILLAGE
========================================================== */

let wakeIndex = 0;

let wakeTimer = null;


/* ==========================================================
   ÉTAT DU BATEAU
========================================================== */

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

let currentMoveDuration =
    MOVE_DURATION;


/* ==========================================================
   MODE QUIZ
========================================================== */

let boatAutoFinish = true;


/* ==========================================================
   NOMBRE D'ÉTAPES
========================================================== */

function setBoatTotalSteps(
    totalSteps
)
{
    const parsedSteps =
        Number(
            totalSteps
        );


    if (
        !Number.isInteger(
            parsedSteps
        ) ||
        parsedSteps <= 0
    )
    {
        TOTAL_STEPS = 20;

        return;
    }


    TOTAL_STEPS =
        parsedSteps;
}


/* ==========================================================
   ORIENTATION BATEAU + SILLAGE
========================================================== */

function setBoatDirection()
{
    boat.style.transform =
        "scaleX(1)";


    boatWake.style.transform =
        "scaleX(1)";


    if (
        direction ===
        "forward"
    )
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


    if (
        wakeIndex >=
        WAKE_IMAGES.length
    )
    {
        wakeIndex = 0;
    }


    boatWakeImage.src =
        WAKE_IMAGES[
            wakeIndex
        ];
}


function startWake()
{
    stopWake();


    wakeIndex = 0;


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
    if (
        wakeTimer !== null
    )
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


    currentStep = 0;


    maxTravel =
        window.innerWidth +
        boatWidth +
        OUTSIDE_MARGIN * 2;


    if (
        direction ===
        "forward"
    )
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
   POSITION DU BATEAU
========================================================== */

function updateBoat()
{
    boatTranslation.style.transform =
        `translateX(${currentX}px)`;
}


/* ==========================================================
   COURBE
========================================================== */

function ease(
    progress
)
{
    return -(
        Math.cos(
            Math.PI *
            progress
        ) - 1
    ) / 2;
}


/* ==========================================================
   PROCHAINE POSITION
========================================================== */

function computeTarget()
{
    currentStep++;


    if (
        currentStep >
        TOTAL_STEPS
    )
    {
        currentStep =
            TOTAL_STEPS;
    }


    startX =
        currentX;


    if (
        direction ===
        "forward"
    )
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


    if (
        currentStep >=
        TOTAL_STEPS
    )
    {
        return;
    }


    currentMoveDuration =
        MOVE_DURATION;


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

function animateBoat(
    time
)
{
    if (
        animationStart ===
        null
    )
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
            currentMoveDuration,
            1
        );


    const smooth =
        ease(
            progress
        );


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


    if (
        progress < 1
    )
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


    if (
        currentStep >=
            TOTAL_STEPS &&
        boatAutoFinish
    )
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


    if (
        direction ===
        "forward"
    )
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

function startForwardCrossing(
    totalSteps = 20,
    autoFinish = true
)
{
    setBoatTotalSteps(
        totalSteps
    );


    boatAutoFinish =
        autoFinish;


    currentMoveDuration =
        MOVE_DURATION;


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
   RETOUR AVEC CORRECTIONS
========================================================== */

function startBackCrossing(
    totalSteps = 20
)
{
    setBoatTotalSteps(
        totalSteps
    );


    boatAutoFinish =
        true;


    currentMoveDuration =
        MOVE_DURATION;


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
   RETOUR AUTOMATIQUE CONTINU
========================================================== */

function startAutomaticBackCrossing()
{
    setBoatTotalSteps(
        1
    );


    boatAutoFinish =
        true;


    direction =
        "back";


    boat.src =
        BOAT_IMAGE;


    setBoatDirection();


    crossingButton.disabled =
        true;


    crossingButton.textContent =
        "Retour en France";


    showCrossing();


    requestAnimationFrame(
        () =>
        {
            initialiseBoat();


            requestAnimationFrame(
                () =>
                {
                    currentMoveDuration =
                        AUTOMATIC_RETURN_DURATION;


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
            );
        }
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


    if (
        direction ===
        "forward"
    )
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
   API DU BATEAU
========================================================== */

const boatGame =
{
    advance()
    {
        advanceBoat();
    },


    reset()
    {
        if (
            animationId !== null
        )
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
    },


    setTotalSteps(
        totalSteps
    )
    {
        setBoatTotalSteps(
            totalSteps
        );
    }
};