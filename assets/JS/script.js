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
   INITIALISATION
========================================================== */

boat.src =
    BOAT_IMAGE;


setBoatDirection();


stopWake();


showDeparture();
