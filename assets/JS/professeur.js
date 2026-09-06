"use strict";


/* ==========================================================
   PROFESSEUR
========================================================== */


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const professeurDepart =
    document.getElementById("professeur-depart");

const professeurArrivee =
    document.getElementById("professeur-arrivee");


/* ==========================================================
   ÉTAT DU PROFESSEUR
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
        return;
    }


    brasNeutre.style.display =
        "none";

    brasErreur.style.display =
        "none";

    brasBravo.style.display =
        "none";


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


    if (state === "neutral")
    {
        brasNeutre.style.display =
            "inline";

        return;
    }


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