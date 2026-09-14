"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const learningButton =
    document.getElementById("learning-button");

const classroomBackButton =
    document.getElementById("classroom-back-button");

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


returnButton.addEventListener(
    "click",
    startQuizReturn
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