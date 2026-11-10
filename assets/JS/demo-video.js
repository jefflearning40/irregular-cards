
"use strict";

/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const demoVideoModal =
    document.getElementById("demo-video-modal");

const demoVideoPlayer =
    document.getElementById("demo-video-player");

const demoVideoPlaceholder =
    document.getElementById("demo-video-placeholder");

const demoVideoClose =
    document.getElementById("demo-video-close");

const demoVideoLogin =
    document.getElementById("demo-video-login");


/* ==========================================================
   OUVERTURE
========================================================== */

function openDemoVideoModal()
{
    demoVideoModal.hidden = false;

    demoVideoModal.classList.add(
        "demo-video-modal--open"
    );

    demoVideoModal.setAttribute(
        "aria-hidden",
        "false"
    );

    demoVideoClose.focus();
}


/* ==========================================================
   FERMETURE
========================================================== */

function closeDemoVideoModal()
{
    demoVideoPlayer.pause();

    demoVideoPlayer.currentTime = 0;

    demoVideoModal.classList.remove(
        "demo-video-modal--open"
    );

    demoVideoModal.hidden = true;

    demoVideoModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.getElementById(
        "quiz-button"
    ).focus();
}


/* ==========================================================
   CHARGEMENT DE LA VIDÉO
========================================================== */

demoVideoPlayer.addEventListener(
    "loadedmetadata",
    () =>
    {
        demoVideoPlayer.hidden = false;

        demoVideoPlaceholder.hidden = true;
    }
);

demoVideoPlayer.addEventListener(
    "error",
    () =>
    {
        demoVideoPlayer.hidden = true;

        demoVideoPlaceholder.hidden = false;
    }
);


/* ==========================================================
   FERMETURE PAR BOUTON
========================================================== */

demoVideoClose.addEventListener(
    "click",
    closeDemoVideoModal
);


/* ==========================================================
   FERMETURE PAR ÉCHAP
========================================================== */

document.addEventListener(
    "keydown",
    (event) =>
    {
        if (
            event.key === "Escape" &&
            !demoVideoModal.hidden
        )
        {
            closeDemoVideoModal();
        }
    }
);


/* ==========================================================
   ACCÈS CONNEXION
========================================================== */

demoVideoLogin.addEventListener(
    "click",
    () =>
    {
        closeDemoVideoModal();

        openLoginModal();
    }
);
