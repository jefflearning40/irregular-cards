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

const statisticsScreen =
    document.getElementById("statistics-screen");

const teacherScreen =
    document.getElementById("teacher-screen");


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

    statisticsScreen.style.display =
        "none";

    teacherScreen.style.display =
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


/* ==========================================================
   ÉCRAN STATISTIQUES ÉLÈVE
========================================================== */

function showStatistics()
{
    hideAllScreens();

    statisticsScreen.style.display =
        "block";
}


/* ==========================================================
   ÉCRAN PROFESSEUR
========================================================== */

function showTeacher()
{
    hideAllScreens();

    teacherScreen.style.display =
        "block";


    if (
        typeof loadTeacherDashboard ===
        "function"
    )
    {
        loadTeacherDashboard();
    }
}