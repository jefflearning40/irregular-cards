
"use strict";

/* ==========================================================
   GESTION DES ÉCRANS
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
   AMBIANCE OCÉANIQUE
========================================================== */

const crossingOceanAudio =
    new Audio("assets/sounds/oceannoise.mp3");

crossingOceanAudio.loop = true;
crossingOceanAudio.preload = "auto";
crossingOceanAudio.volume = 0;

/* ==========================================================
   AMBIANCE PORTUAIRE
========================================================== */

const harborAudio =
    new Audio("assets/sounds/harbor-noise1.mp3");

harborAudio.loop = true;
harborAudio.preload = "auto";
harborAudio.volume = 0;

/* ==========================================================
   CRI DE LA MOUETTE
========================================================== */

const seagullAudio =
    new Audio("assets/sounds/seagul.mp3");

seagullAudio.loop = false;
seagullAudio.preload = "auto";
seagullAudio.volume = 0;

/* ==========================================================
   CORNE DU BATEAU
========================================================== */

const boatHornAudio =
    new Audio("assets/sounds/boat.mp3");

boatHornAudio.loop = false;
boatHornAudio.preload = "auto";
boatHornAudio.volume = 0;

/* ==========================================================
   VOLUME DES EFFETS SONORES
========================================================== */

function getCrossingAudioVolume()
{
    if (
        !window.irregularAudio ||
        !window.irregularAudio.isEffectsEnabled()
    )
    {
        return 0;
    }

    return window.irregularAudio.getEffectsVolume();
}

/* ==========================================================
   LECTURE AUDIO AVEC DÉTECTION DES ERREURS
========================================================== */

function playAudioSafely(audio, label)
{
    const playPromise = audio.play();

    if (
        playPromise &&
        typeof playPromise.catch === "function"
    )
    {
        playPromise.catch((error) =>
        {
            console.error(
                `[AUDIO] ${label} :`,
                error.name,
                error.message
            );
        });
    }
}

/* ==========================================================
   DÉMARRER UNE AMBIANCE
========================================================== */

function startAmbientAudio(audio)
{
    const volume = getCrossingAudioVolume();

    audio.volume = volume;

    if (volume === 0)
    {
        audio.pause();
        return;
    }

    if (!audio.paused)
    {
        return;
    }

    playAudioSafely(
        audio,
        "Ambiance sonore"
    );
}

/* ==========================================================
   ARRÊTER UNE AMBIANCE
========================================================== */

function stopAmbientAudio(audio)
{
    audio.pause();
    audio.currentTime = 0;
}

/* ==========================================================
   AMBIANCE OCÉANIQUE
========================================================== */

function startCrossingOceanAudio()
{
    startAmbientAudio(crossingOceanAudio);
}

function stopCrossingOceanAudio()
{
    stopAmbientAudio(crossingOceanAudio);
}

/* ==========================================================
   AMBIANCE PORTUAIRE
========================================================== */

function startHarborAudio()
{
    startAmbientAudio(harborAudio);
}

function stopHarborAudio()
{
    stopAmbientAudio(harborAudio);
}

/* ==========================================================
   LECTURE DES EFFETS SONORES
========================================================== */

function playSoundEffect(audio)
{
    const volume = getCrossingAudioVolume();

    if (volume === 0)
    {
        console.info(
            "[AUDIO] Effet désactivé ou volume à zéro."
        );

        return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;

    playAudioSafely(
        audio,
        audio.src
    );
}

/* ==========================================================
   MOUETTES AU SURVOL
   ZONE ACTIVE : 30 % × 40 %
========================================================== */

const postcardSeagulls =
    document.querySelectorAll(
        ".postcard-seagull--departure, " +
        ".postcard-seagull--arrival"
    );

postcardSeagulls.forEach((seagull) =>
{
    let isInsideActiveZone = false;

    seagull.addEventListener(
        "mousemove",
        (event) =>
        {
            const rect =
                seagull.getBoundingClientRect();

            const activeWidth =
                rect.width * 0.30;

            const activeHeight =
                rect.height * 0.40;

            const left =
                rect.left +
                (rect.width - activeWidth) / 2;

            const top =
                rect.top +
                (rect.height - activeHeight) / 2;

            const inside =
                event.clientX >= left &&
                event.clientX <= left + activeWidth &&
                event.clientY >= top &&
                event.clientY <= top + activeHeight;

            if (
                inside &&
                !isInsideActiveZone
            )
            {
                console.info(
                    "[SURVOL] Mouette détectée"
                );

                playSoundEffect(seagullAudio);
            }

            isInsideActiveZone = inside;
        }
    );

    seagull.addEventListener(
        "mouseleave",
        () =>
        {
            isInsideActiveZone = false;
        }
    );
});

/* ==========================================================
   CORNE DU BATEAU AU SURVOL
========================================================== */

const boatHornHotspot =
    document.getElementById("boat-horn-hotspot");

if (boatHornHotspot)
{
    boatHornHotspot.addEventListener(
        "mouseenter",
        () =>
        {
            console.info(
                "[SURVOL] Bateau détecté"
            );

            playSoundEffect(boatHornAudio);
        }
    );
}

/* ==========================================================
   PROFESSEUR BASIL
========================================================== */

const departureProfessor =
    document.getElementById("professeur-depart");

const professorVoiceHotspot =
    document.getElementById("professor-voice-hotspot");

const professorBasilMessage =
    "Hello ! Je suis le professeur Basil, " +
    "votre guide dans l'apprentissage " +
    "des verbes irréguliers anglais !";

/* ==========================================================
   POSITIONNEMENT DE LA ZONE VOCALE
   GÉRÉ PAR PROFESSEUR.CSS
========================================================== */

function updateProfessorVoiceHotspot()
{
    if (!professorVoiceHotspot)
    {
        return;
    }

    professorVoiceHotspot.style.position = "";
    professorVoiceHotspot.style.left = "";
    professorVoiceHotspot.style.top = "";
    professorVoiceHotspot.style.right = "";
    professorVoiceHotspot.style.bottom = "";
    professorVoiceHotspot.style.width = "";
    professorVoiceHotspot.style.height = "";
    professorVoiceHotspot.style.zIndex = "";
    professorVoiceHotspot.style.pointerEvents = "";
    professorVoiceHotspot.style.background = "";
}

/* ==========================================================
   VOIX DE BASIL AU SURVOL
========================================================== */

if (professorVoiceHotspot)
{
    professorVoiceHotspot.addEventListener(
        "mouseenter",
        () =>
        {
            console.info(
                "[SURVOL] Professeur Basil détecté"
            );

            if (
                !window.irregularAudio ||
                !window.irregularAudio.isVoiceEnabled()
            )
            {
                console.info(
                    "[AUDIO] Voix désactivée."
                );

                return;
            }

            try
            {
               const utterance =
    new SpeechSynthesisUtterance(
        professorBasilMessage
    );

utterance.lang = "fr-FR";
utterance.rate = 0.8;

utterance.volume =
    window.irregularAudio.getSettings().voiceVolume / 100;

const voices =
    window.speechSynthesis.getVoices();

utterance.voice =
    voices.find(
        voice => voice.lang === "fr-FR"
    ) || null;

window.speechSynthesis.cancel();
window.speechSynthesis.speak(utterance);

                if (
                    result &&
                    typeof result.catch === "function"
                )
                {
                    result.catch((error) =>
                    {
                        console.error(
                            "[AUDIO] Voix de Basil :",
                            error
                        );
                    });
                }
            }
            catch (error)
            {
                console.error(
                    "[AUDIO] Voix de Basil :",
                    error
                );
            }
        }
    );

    window.addEventListener(
        "resize",
        updateProfessorVoiceHotspot
    );

    window.addEventListener(
        "load",
        updateProfessorVoiceHotspot
    );

    updateProfessorVoiceHotspot();
}

/* ==========================================================
   ARRÊTER LA VOIX DU PROFESSEUR
========================================================== */

function stopProfessorVoice()
{
    if ("speechSynthesis" in window)
    {
        window.speechSynthesis.cancel();
    }
}

/* ==========================================================
   ACTUALISATION DES RÉGLAGES AUDIO
========================================================== */

window.addEventListener(
    "irregular-audio-settings-changed",
    () =>
    {
        const volume =
            getCrossingAudioVolume();

        seagullAudio.volume = volume;
        boatHornAudio.volume = volume;

        if (volume === 0)
        {
            seagullAudio.pause();
            boatHornAudio.pause();
        }

        if (
            crossingScreen &&
            crossingScreen.style.display === "block"
        )
        {
            stopHarborAudio();
            startCrossingOceanAudio();
        }
        else if (
            (
                departureScreen &&
                departureScreen.style.display === "flex"
            ) ||
            (
                arrivalScreen &&
                arrivalScreen.style.display === "flex"
            )
        )
        {
            stopCrossingOceanAudio();
            startHarborAudio();
        }
        else
        {
            stopCrossingOceanAudio();
            stopHarborAudio();
        }
    }
);

/* ==========================================================
   MASQUER TOUS LES ÉCRANS
========================================================== */

function hideAllScreens()
{
    stopCrossingOceanAudio();
    stopHarborAudio();

    stopProfessorVoice();

    seagullAudio.pause();
    seagullAudio.currentTime = 0;

    boatHornAudio.pause();
    boatHornAudio.currentTime = 0;

    if (departureScreen)
    {
        departureScreen.style.display = "none";
    }

    if (classroomScreen)
    {
        classroomScreen.style.display = "none";
    }

    if (crossingScreen)
    {
        crossingScreen.style.display = "none";
    }

    if (arrivalScreen)
    {
        arrivalScreen.style.display = "none";
    }

    if (statisticsScreen)
    {
        statisticsScreen.style.display = "none";
    }

    if (teacherScreen)
    {
        teacherScreen.style.display = "none";
    }
}

/* ==========================================================
   ÉCRAN DE DÉPART
========================================================== */

function showDeparture()
{
    hideAllScreens();

    departureScreen.style.display = "flex";

    startHarborAudio();

    requestAnimationFrame(
        updateProfessorVoiceHotspot
    );
}

/* ==========================================================
   ÉCRAN CLASSE / APPRENTISSAGE
========================================================== */

function showClassroom()
{
    hideAllScreens();

    classroomScreen.style.display = "flex";
}

/* ==========================================================
   ÉCRAN DE TRAVERSÉE
========================================================== */

function showCrossing()
{
    hideAllScreens();

    crossingScreen.style.display = "block";

    startCrossingOceanAudio();
}

/* ==========================================================
   ÉCRAN D'ARRIVÉE
========================================================== */

function showArrival()
{
    hideAllScreens();

    arrivalScreen.style.display = "flex";

    startHarborAudio();
}

/* ==========================================================
   ÉCRAN STATISTIQUES ÉLÈVE
========================================================== */

function showStatistics()
{
    hideAllScreens();

    statisticsScreen.style.display = "block";
}

/* ==========================================================
   ÉCRAN PROFESSEUR
========================================================== */

function showTeacher()
{
    hideAllScreens();

    teacherScreen.style.display = "block";

    if (
        typeof loadTeacherDashboard === "function"
    )
    {
        loadTeacherDashboard();
    }
}
