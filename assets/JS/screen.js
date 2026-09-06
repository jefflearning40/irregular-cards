"use strict";

/* ==========================================================
   GESTION DES ÉCRANS
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


/* ==========================================================
   ÉCRAN DE DÉPART
========================================================== */

function showDeparture()
{
    departureScreen.style.display = "flex";

    crossingScreen.style.display = "none";

    arrivalScreen.style.display = "none";
}


/* ==========================================================
   ÉCRAN DE TRAVERSÉE
========================================================== */

function showCrossing()
{
    departureScreen.style.display = "none";

    crossingScreen.style.display = "block";

    arrivalScreen.style.display = "none";
}


/* ==========================================================
   ÉCRAN D'ARRIVÉE
========================================================== */

function showArrival()
{
    departureScreen.style.display = "none";

    crossingScreen.style.display = "none";

    arrivalScreen.style.display = "flex";
}


/* ==========================================================
   FIN
========================================================== */
