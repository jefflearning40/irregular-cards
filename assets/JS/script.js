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

const statisticsButton =
    document.getElementById("statistics-button");

const statisticsBackButton =
    document.getElementById("statistics-back-button");


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


/* ==========================================================
   STATISTIQUES
========================================================== */

statisticsButton.addEventListener(
    "click",
    async () =>
    {
        showStatistics();

        await loadStudentStatistics();
    }
);


statisticsBackButton.addEventListener(
    "click",
    () =>
    {
        if (
            currentRole ===
            "professeur"
        )
        {
            showTeacher();

            return;
        }


        showDeparture();
    }
);


/* ==========================================================
   REDIMENSIONNEMENT
========================================================== */

window.addEventListener(
    "resize",
    handleResize
);


/* ==========================================================
   PROFESSEUR DE DÉPART
========================================================== */

professeurDepart.addEventListener(
    "load",
    initialiseDepartureProfessor
);


/* ==========================================================
   INITIALISATION
========================================================== */

boat.src =
    BOAT_IMAGE;


setBoatDirection();


stopWake();


showDeparture();