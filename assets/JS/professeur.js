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
        !brasBravo ||
        !sourcilG ||
        !sourcilD
    )
    {
        return;
    }


    /* ======================================================
       PRÉPARATION DES SOURCILS
    ====================================================== */

    sourcilG.style.transformBox =
        "fill-box";

    sourcilD.style.transformBox =
        "fill-box";

    sourcilG.style.transformOrigin =
        "center";

    sourcilD.style.transformOrigin =
        "center";

    sourcilG.style.transition =
        "transform 0.3s ease";

    sourcilD.style.transition =
        "transform 0.3s ease";


    /* ======================================================
       PRÉPARATION DU BRAS ERREUR
    ====================================================== */

    brasErreur.style.transformBox =
        "fill-box";

    brasErreur.style.transformOrigin =
        "0% 50%";

    brasErreur.style.transition =
        "transform 0.5s ease";


    /* ======================================================
       PRÉPARATION DU BRAS BRAVO
    ====================================================== */

    brasBravo.style.transformBox =
        "fill-box";

    brasBravo.style.transformOrigin =
        "0% 50%";

    brasBravo.style.transition =
        "transform 0.3s ease";


    /* ======================================================
       REMISE À ZÉRO
    ====================================================== */

    brasNeutre.style.display =
        "none";

    brasErreur.style.display =
        "none";

    brasBravo.style.display =
        "none";

    brasErreur.style.transform =
        "rotate(0deg)";

    brasBravo.style.transform =
        "rotate(0deg)";

    sourcilG.style.transform =
        "rotate(0deg)";

    sourcilD.style.transform =
        "rotate(0deg)";


    /* ======================================================
       NEUTRE
    ====================================================== */

    if (state === "neutral")
    {
        brasNeutre.style.display =
            "inline";

        return;
    }


    /* ======================================================
       ERREUR
    ====================================================== */

    if (state === "error")
    {
        brasErreur.style.display =
            "inline";


        /* Sourcils froncés */

        sourcilG.style.transform =
            "rotate(-45deg)";

        sourcilD.style.transform =
            "rotate(45deg)";


        /* Mouvement du bras */

        setTimeout(
            () =>
            {
                let mouvements = 0;

                const animationBras =
                    setInterval(
                        () =>
                        {
                            if (
                                mouvements % 2 === 0
                            )
                            {
                                brasErreur.style.transform =
                                    "rotate(-10deg)";
                            }
                            else
                            {
                                brasErreur.style.transform =
                                    "rotate(5deg)";
                            }


                            mouvements++;


                            if (
                                mouvements === 4
                            )
                            {
                                clearInterval(
                                    animationBras
                                );


                                setTimeout(
                                    () =>
                                    {
                                        brasErreur.style.transform =
                                            "rotate(0deg)";
                                    },
                                    500
                                );
                            }
                        },
                        600
                    );
            },
            100
        );


        return;
    }


    /* ======================================================
       BRAVO
    ====================================================== */

    if (state === "bravo")
    {
        brasBravo.style.display =
            "inline";


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


        return;
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