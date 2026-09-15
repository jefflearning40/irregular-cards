"use strict";


/* ==========================================================
   PROFESSEURS
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

const professeurClasse =
    document.getElementById(
        "professeur-classe"
    );


/* ==========================================================
   CHEMINS SVG
========================================================== */

const PROFESSEUR_NEUTRE =
    "assets/images/decor/personnages/professeur_pasgif_animation_neutre.svg";

const PROFESSEUR_ERREUR =
    "assets/images/decor/personnages/professeur_pasgif_animation.svg";

const PROFESSEUR_BRAVO =
    "assets/images/decor/personnages/professeur_pasgif_animation_bravo.svg";


/* ==========================================================
   OUTIL : RÉCUPÉRATION DU SVG
========================================================== */

function getProfessorSvg(
    professeur
)
{
    if (!professeur)
    {
        return null;
    }


    return professeur.contentDocument;
}


/* ==========================================================
   OUTIL : AFFICHAGE D'UN ÉLÉMENT SVG
========================================================== */

function showProfessorElement(
    element
)
{
    if (!element)
    {
        return;
    }


    element.style.removeProperty(
        "display"
    );

    element.removeAttribute(
        "display"
    );

    element.style.visibility =
        "visible";

    element.style.opacity =
        "1";
}


/* ==========================================================
   OUTIL : MASQUAGE D'UN ÉLÉMENT SVG
========================================================== */

function hideProfessorElement(
    element
)
{
    if (!element)
    {
        return;
    }


    element.style.display =
        "none";
}


/* ==========================================================
   PROFESSEUR DÉPART
========================================================== */

function initialiseDepartureProfessor()
{
    const svg =
        getProfessorSvg(
            professeurDepart
        );


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


    showProfessorElement(
        brasNeutre
    );

    hideProfessorElement(
        brasErreur
    );

    hideProfessorElement(
        brasBravo
    );
}


/* ==========================================================
   ÉTAT NEUTRE
========================================================== */

function jouerNeutreProfesseur(
    professeur
)
{
    const svg =
        getProfessorSvg(
            professeur
        );


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


    /* ======================================================
       BRAS
    ====================================================== */

    showProfessorElement(
        brasNeutre
    );

    hideProfessorElement(
        brasErreur
    );

    hideProfessorElement(
        brasBravo
    );


    /* ======================================================
       SOURCILS
    ====================================================== */

    if (sourcilG)
    {
        sourcilG.style.transformBox =
            "fill-box";

        sourcilG.style.transformOrigin =
            "center";

        sourcilG.style.transition =
            "transform 0.3s ease";

        sourcilG.style.transform =
            "rotate(0deg)";
    }


    if (sourcilD)
    {
        sourcilD.style.transformBox =
            "fill-box";

        sourcilD.style.transformOrigin =
            "center";

        sourcilD.style.transition =
            "transform 0.3s ease";

        sourcilD.style.transform =
            "rotate(0deg)";
    }
}


/* ==========================================================
   ÉTAT ERREUR
========================================================== */

function jouerErreurProfesseur(
    professeur
)
{
    const svg =
        getProfessorSvg(
            professeur
        );


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


    /* ======================================================
       BRAS
    ====================================================== */

    hideProfessorElement(
        brasNeutre
    );

    hideProfessorElement(
        brasBravo
    );

    showProfessorElement(
        brasErreur
    );


    /* ======================================================
       SOURCILS
    ====================================================== */

    if (sourcilG)
    {
        sourcilG.style.transformBox =
            "fill-box";

        sourcilG.style.transformOrigin =
            "center";

        sourcilG.style.transition =
            "transform 0.3s ease";

        sourcilG.style.transform =
            "rotate(0deg)";
    }


    if (sourcilD)
    {
        sourcilD.style.transformBox =
            "fill-box";

        sourcilD.style.transformOrigin =
            "center";

        sourcilD.style.transition =
            "transform 0.3s ease";

        sourcilD.style.transform =
            "rotate(0deg)";
    }


    /* ======================================================
       BRAS ERREUR
    ====================================================== */

    if (brasErreur)
    {
        brasErreur.style.transformBox =
            "fill-box";

        brasErreur.style.transformOrigin =
            "0% 50%";

        brasErreur.style.transition =
            "transform 0.5s ease";

        brasErreur.style.transform =
            "rotate(0deg)";
    }


    /* ======================================================
       SOURCILS FRONCÉS
    ====================================================== */

    setTimeout(
        () =>
        {
            if (sourcilG)
            {
                sourcilG.style.transform =
                    "rotate(-45deg)";
            }


            if (sourcilD)
            {
                sourcilD.style.transform =
                    "rotate(45deg)";
            }
        },
        100
    );


    /* ======================================================
       ANIMATION DU BRAS
    ====================================================== */

    if (!brasErreur)
    {
        return;
    }


    setTimeout(
        () =>
        {
            let mouvements = 0;


            const animationBras =
                setInterval(
                    () =>
                    {
                        brasErreur.style.transform =
                            mouvements % 2 === 0
                                ? "rotate(-10deg)"
                                : "rotate(5deg)";


                        mouvements++;


                        if (mouvements >= 4)
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
   ÉTAT BRAVO
========================================================== */

function jouerBravoProfesseur(
    professeur
)
{
    const svg =
        getProfessorSvg(
            professeur
        );


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


    /* ======================================================
       BRAS
    ====================================================== */

    hideProfessorElement(
        brasNeutre
    );

    hideProfessorElement(
        brasErreur
    );

    showProfessorElement(
        brasBravo
    );


    /* ======================================================
       SOURCILS
    ====================================================== */

    if (sourcilG)
    {
        sourcilG.style.transformBox =
            "fill-box";

        sourcilG.style.transformOrigin =
            "center";

        sourcilG.style.transition =
            "transform 0.3s ease";

        sourcilG.style.transform =
            "rotate(0deg)";
    }


    if (sourcilD)
    {
        sourcilD.style.transformBox =
            "fill-box";

        sourcilD.style.transformOrigin =
            "center";

        sourcilD.style.transition =
            "transform 0.3s ease";

        sourcilD.style.transform =
            "rotate(0deg)";
    }


    /* ======================================================
       BRAS BRAVO
    ====================================================== */

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
   CHANGEMENT DE FICHIER SVG
========================================================== */

function changerEtatProfesseur(
    professeur,
    fichier,
    animation
)
{
    if (!professeur)
    {
        return;
    }


    professeur.onload =
        () =>
        {
            professeur.onload =
                null;


            animation(
                professeur
            );
        };


    professeur.data =
        fichier;
}


/* ==========================================================
   PROFESSEUR CLASSE - NEUTRE
========================================================== */

function professeurClasseNeutre()
{
    changerEtatProfesseur(
        professeurClasse,
        PROFESSEUR_NEUTRE,
        jouerNeutreProfesseur
    );
}


/* ==========================================================
   PROFESSEUR CLASSE - ERREUR
========================================================== */

function professeurClasseErreur()
{
    changerEtatProfesseur(
        professeurClasse,
        PROFESSEUR_ERREUR,
        jouerErreurProfesseur
    );
}


/* ==========================================================
   PROFESSEUR CLASSE - BRAVO
========================================================== */

function professeurClasseBravo()
{
    changerEtatProfesseur(
        professeurClasse,
        PROFESSEUR_BRAVO,
        jouerBravoProfesseur
    );
}


/* ==========================================================
   PROFESSEUR ARRIVÉE - ERREUR
========================================================== */

function jouerErreurArrivee()
{
    jouerErreurProfesseur(
        professeurArrivee
    );
}


/* ==========================================================
   PROFESSEUR ARRIVÉE - NEUTRE
========================================================== */

function jouerNeutreArrivee()
{
    jouerNeutreProfesseur(
        professeurArrivee
    );
}


/* ==========================================================
   PROFESSEUR ARRIVÉE - BRAVO
========================================================== */

function jouerBravoArrivee()
{
    jouerBravoProfesseur(
        professeurArrivee
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
    if (
        !professeurArrivee ||
        totalQuestions <= 0
    )
    {
        return;
    }


    const ratio =
        score /
        totalQuestions;


    /* ======================================================
       MOINS DE 50 % : ERREUR
    ====================================================== */

    if (ratio < 0.5)
    {
        changerEtatProfesseur(
            professeurArrivee,
            PROFESSEUR_ERREUR,
            jouerErreurProfesseur
        );

        return;
    }


    /* ======================================================
       DE 50 % À 75 % : NEUTRE
    ====================================================== */

    if (ratio <= 0.75)
    {
        changerEtatProfesseur(
            professeurArrivee,
            PROFESSEUR_NEUTRE,
            jouerNeutreProfesseur
        );

        return;
    }


    /* ======================================================
       PLUS DE 75 % : BRAVO
    ====================================================== */

    changerEtatProfesseur(
        professeurArrivee,
        PROFESSEUR_BRAVO,
        jouerBravoProfesseur
    );
}


/* ==========================================================
   COMPATIBILITÉ ARRIVÉE
========================================================== */

function initialiseArrivalProfessor()
{
    jouerBravoArrivee();
}


/* ==========================================================
   INITIALISATION PROFESSEUR CLASSE
========================================================== */

function initialiseClassroomProfessor()
{
    if (!professeurClasse)
    {
        return;
    }


    jouerNeutreProfesseur(
        professeurClasse
    );
}


/* ==========================================================
   CHARGEMENT INITIAL DU PROFESSEUR CLASSE

   IMPORTANT :
   ONCE = TRUE

   Cet événement sert uniquement au PREMIER chargement du SVG.
   Il ne doit pas réinitialiser le professeur lorsque le SVG
   est remplacé par ERREUR ou BRAVO.
========================================================== */

if (professeurClasse)
{
    professeurClasse.addEventListener(
        "load",
        initialiseClassroomProfessor,
        {
            once: true
        }
    );
}