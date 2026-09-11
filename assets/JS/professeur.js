"use strict";


/* ==========================================================
   PROFESSEUR
========================================================== */


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const professeurDepart =
    document.getElementById(
        "professeur-depart"
    );

const professeurArrivee =
    document.getElementById(
        "professeur-arrivee"
    );


/* ==========================================================
   PROFESSEUR DÉPART
========================================================== */

function initialiseDepartureProfessor()
{
    if (!professeurDepart)
    {
        return;
    }


    const svg =
        professeurDepart.contentDocument;


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


    if (brasNeutre)
    {
        brasNeutre.style.display =
            "inline";
    }


    if (brasErreur)
    {
        brasErreur.style.display =
            "none";
    }


    if (brasBravo)
    {
        brasBravo.style.display =
            "none";
    }
}


/* ==========================================================
   PROFESSEUR ARRIVÉE - PAS CONTENT
========================================================== */

function jouerErreurArrivee()
{
    const svg =
        professeurArrivee.contentDocument;


    if (!svg)
    {
        return;
    }


    const brasErreur =
        svg.getElementById(
            "bras-g"
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
        !brasErreur ||
        !sourcilG ||
        !sourcilD
    )
    {
        console.error(
            "Éléments du professeur erreur introuvables."
        );

        return;
    }


    /* ======================================================
       SOURCILS
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
       BRAS
    ====================================================== */

    brasErreur.style.transformBox =
        "fill-box";

    brasErreur.style.transformOrigin =
        "0% 50%";

    brasErreur.style.transition =
        "transform 0.5s ease";


    /* ======================================================
       POSITION INITIALE
    ====================================================== */

    sourcilG.style.transform =
        "rotate(0deg)";

    sourcilD.style.transform =
        "rotate(0deg)";

    brasErreur.style.transform =
        "rotate(0deg)";


    /* ======================================================
       SOURCILS FRONCÉS
    ====================================================== */

    setTimeout(
        () =>
        {
            sourcilG.style.transform =
                "rotate(-45deg)";

            sourcilD.style.transform =
                "rotate(45deg)";
        },
        100
    );


    /* ======================================================
       MOUVEMENT DU BRAS
    ====================================================== */

    setTimeout(
        () =>
        {
            let mouvements = 0;


            const animationBras =
                setInterval(
                    () =>
                    {
                        brasErreur.style.transform =
                            brasErreur.style.transform ===
                            "rotate(-10deg)"
                                ? "rotate(5deg)"
                                : "rotate(-10deg)";


                        mouvements++;


                        if (mouvements === 4)
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
        400
    );
}


/* ==========================================================
   PROFESSEUR ARRIVÉE - NEUTRE
========================================================== */

function jouerNeutreArrivee()
{
    const svg =
        professeurArrivee.contentDocument;


    if (!svg)
    {
        return;
    }


    const sourcilG =
        svg.getElementById(
            "sourcil-g"
        );

    const sourcilD =
        svg.getElementById(
            "sourcil-d"
        );


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
}


/* ==========================================================
   PROFESSEUR ARRIVÉE - BRAVO
========================================================== */

function jouerBravoArrivee()
{
    const svg =
        professeurArrivee.contentDocument;


    if (!svg)
    {
        return;
    }


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


    if (sourcilG)
    {
        sourcilG.style.transformBox =
            "fill-box";

        sourcilG.style.transformOrigin =
            "center";

        sourcilG.style.transform =
            "rotate(0deg)";
    }


    if (sourcilD)
    {
        sourcilD.style.transformBox =
            "fill-box";

        sourcilD.style.transformOrigin =
            "center";

        sourcilD.style.transform =
            "rotate(0deg)";
    }


    if (!brasBravo)
    {
        return;
    }


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


/* ==========================================================
   PROFESSEUR ARRIVÉE SELON LE SCORE
========================================================== */

function initialiseArrivalProfessorFromScore(
    score,
    totalQuestions
)
{
    if (!professeurArrivee)
    {
        return;
    }


    const ratio =
        score /
        totalQuestions;


    /* ======================================================
       MOINS DE 50 % : PAS CONTENT
    ====================================================== */

    if (ratio < 0.5)
    {
        professeurArrivee.onload =
            () =>
            {
                jouerErreurArrivee();
            };


        professeurArrivee.data =
            "assets/images/decor/personnages/professeur_pasgif_animation.svg";


        return;
    }


    /* ======================================================
       DE 50 % À 75 % : NEUTRE
    ====================================================== */

    if (ratio <= 0.75)
    {
        professeurArrivee.onload =
            () =>
            {
                jouerNeutreArrivee();
            };


        professeurArrivee.data =
            "assets/images/decor/personnages/professeur_pasgif_animation_neutre.svg";


        return;
    }


    /* ======================================================
       PLUS DE 75 % : BRAVO
    ====================================================== */

    professeurArrivee.onload =
        () =>
        {
            jouerBravoArrivee();
        };


    professeurArrivee.data =
        "assets/images/decor/personnages/professeur_pasgif_animation_bravo.svg";
}


/* ==========================================================
   COMPATIBILITÉ
========================================================== */

function initialiseArrivalProfessor()
{
    jouerBravoArrivee();
}