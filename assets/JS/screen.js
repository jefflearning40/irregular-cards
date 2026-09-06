"use strict";


/* ==========================================================
   GESTION DES ÉCRANS
========================================================== */


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const departureScreen =
    document.getElementById("departure-screen");

const classroomScreen =
    document.getElementById("classroom-screen");

const crossingScreen =
    document.getElementById("crossing-screen");

const arrivalScreen =
    document.getElementById("arrival-screen");


/* ==========================================================
   MASQUER TOUS LES ÉCRANS
========================================================== */

function hideAllScreens()
{
    departureScreen.style.display =
        "none";

    classroomScreen.style.display =
        "none";

    crossingScreen.style.display =
        "none";

    arrivalScreen.style.display =
        "none";
}


/* ==========================================================
   ÉCRAN DE DÉPART
========================================================== */

function showDeparture()
{
    hideAllScreens();

    departureScreen.style.display =
        "flex";
}


/* ==========================================================
   ÉCRAN CLASSE / APPRENTISSAGE
========================================================== */

function showClassroom()
{
    hideAllScreens();

    classroomScreen.style.display =
        "flex";
}


/* ==========================================================
   ÉCRAN DE TRAVERSÉE
========================================================== */

function showCrossing()
{
    hideAllScreens();

    crossingScreen.style.display =
        "block";
}


/* ==========================================================
   ÉCRAN D'ARRIVÉE
========================================================== */

function showArrival()
{
    hideAllScreens();

    arrivalScreen.style.display =
        "flex";
}