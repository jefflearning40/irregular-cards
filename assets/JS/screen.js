
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
   CORNE DU BATEAU À L'ARRIVÉE
========================================================== */

const arrivalBoatHornHotspot =
    document.getElementById("arrival-boat-horn-hotspot");

if (arrivalBoatHornHotspot)
{
    arrivalBoatHornHotspot.addEventListener(
        "mouseenter",
        () =>
        {
            console.info(
                "[SURVOL] Bateau d'arrivée détecté"
            );

            playSoundEffect(boatHornAudio);
        }
    );
}


/* ==========================================================
   PROFESSEUR BASIL AU DÉPART
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
   POSITIONNEMENT DE LA ZONE VOCALE DU DÉPART
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
   ANNONCES VOCALES
   VOIX MASCULINE MICROSOFT PAUL
========================================================== */

function speakButtonLabel(message)
{
    if (
        !window.irregularAudio ||
        !window.irregularAudio.isVoiceEnabled() ||
        !("speechSynthesis" in window)
    )
    {
        return;
    }

    try
    {
        const utterance =
            new SpeechSynthesisUtterance(message);

        const settings =
            window.irregularAudio.getSettings();

        utterance.lang = "fr-FR";
        utterance.rate = 0.8;
        utterance.volume =
            settings.voiceVolume / 100;

        const voices =
            window.speechSynthesis.getVoices();

        utterance.voice =
            voices.find(
                voice =>
                    voice.name ===
                    "Microsoft Paul - French (France)"
            ) ||
            voices.find(
                voice =>
                    voice.lang === "fr-FR"
            ) ||
            null;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
    catch (error)
    {
        console.error(
            "[AUDIO] Annonce vocale :",
            error
        );
    }
}


/* ==========================================================
   VOIX DE BASIL AU DÉPART
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

            speakButtonLabel(professorBasilMessage);
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
   ANNONCES VOCALES DES SIX BOUTONS
========================================================== */

const spokenButtons = [
    {
        id: "statistics-button",
        message: "Statistiques"
    },
    {
        id: "messages-button",
        message: "Messages"
    },
    {
        id: "audio-settings-button",
        message: "Paramètres audio"
    },
    {
        id: "logout-button",
        message: "Déconnexion"
    },
    {
        id: "quiz-button",
        message: "Lancer le quiz"
    },
    {
        id: "learning-button",
        message:
            "Entraîne-toi avant le départ, " +
            "tu vas rentrer dans la classe d'apprentissage"
    }
];

spokenButtons.forEach(({ id, message }) =>
{
    const button = document.getElementById(id);

    if (!button)
    {
        return;
    }

    button.addEventListener(
        "mouseenter",
        () =>
        {
            speakButtonLabel(message);
        }
    );
});


/* ==========================================================
   ARRIVÉE : ÉLÉMENTS HTML
========================================================== */

const arrivalContainer = arrivalScreen
    ? arrivalScreen.querySelector(".postcard-container")
    : null;

const arrivalProfessor =
    document.getElementById("professeur-arrivee");

const arrivalReturnButton =
    document.getElementById("return-button");

let arrivalScoreHotspot = null;
let arrivalProfessorHotspot = null;

let arrivalConfettiLayer = null;
let arrivalConfettiTimeout = null;


/* ==========================================================
   CALCUL DE LA NOTE SUR 20
========================================================== */

function getArrivalMark()
{
    if (
        typeof quizScore !== "number" ||
        typeof currentQuizConfig === "undefined" ||
        !currentQuizConfig ||
        !currentQuizConfig.questions
    )
    {
        return null;
    }

    return (
        quizScore /
        currentQuizConfig.questions
    ) * 20;
}


/* ==========================================================
   FORMATAGE DE LA NOTE
========================================================== */

function getArrivalMarkLabel()
{
    const mark = getArrivalMark();

    if (mark === null)
    {
        return "";
    }

    const rounded =
        Math.round(mark * 10) / 10;

    return Number.isInteger(rounded)
        ? String(rounded)
        : String(rounded).replace(".", ",");
}


/* ==========================================================
   MESSAGE DU PROFESSEUR SELON LA NOTE
========================================================== */

function getArrivalProfessorMessage()
{
    const mark = getArrivalMark();

    if (mark === null)
    {
        return "";
    }

    /* ======================================================
       NOTE PARFAITE : 20/20
    ====================================================== */

    if (mark === 20)
    {
        return (
            "Félicitations ! Tu as obtenu 20 sur 20 ! " +
            "C'est un sans-faute ! " +
            "Bravo pour ton excellent travail !"
        );
    }

    /* ======================================================
       MOINS DE 10/20
    ====================================================== */

    if (mark < 10)
    {
        return (
            `Ta note est de ${getArrivalMarkLabel()} sur 20. ` +
            "Je t'invite à aller réviser en classe " +
            "après avoir corrigé les fautes " +
            "sur la traversée du retour."
        );
    }

    /* ======================================================
       DE 10 À 15/20
    ====================================================== */

    if (mark <= 15)
    {
        return (
            "C'est pas mal, mais tu peux mieux faire. " +
            "Je t'invite à aller réviser en classe " +
            "après avoir corrigé les fautes " +
            "sur la traversée du retour."
        );
    }

    /* ======================================================
       PLUS DE 15/20 ET MOINS DE 20/20
    ====================================================== */

    return (
        "Pas mal du tout ! " +
        "Corrige les fautes pendant la traversée du retour, " +
        "puis recommence jusqu'à obtenir 20 sur 20."
    );
}


/* ==========================================================
   CRÉATION D'UNE ZONE VOCALE TRANSPARENTE
========================================================== */

function makeArrivalHotspot(label)
{
    const hotspot =
        document.createElement("button");

    hotspot.type = "button";

    hotspot.setAttribute(
        "aria-label",
        label
    );

    hotspot.style.position = "absolute";
    hotspot.style.border = "0";
    hotspot.style.padding = "0";
    hotspot.style.background = "transparent";
    hotspot.style.cursor = "default";
    hotspot.style.zIndex = "35";

    return hotspot;
}


/* ==========================================================
   POSITION DE LA ZONE VOCALE DU PROFESSEUR
   À L'ARRIVÉE
========================================================== */

function updateArrivalProfessorHotspot()
{
    if (
        !arrivalContainer ||
        !arrivalProfessorHotspot
    )
    {
        return;
    }

    arrivalProfessorHotspot.style.left = "69%";
    arrivalProfessorHotspot.style.top = "47%";

    arrivalProfessorHotspot.style.width = "15%";
    arrivalProfessorHotspot.style.height = "44%";
}


/* ==========================================================
   INITIALISATION DES ZONES VOCALES D'ARRIVÉE
========================================================== */

function initialiseArrivalVoiceHotspots()
{
    if (!arrivalContainer)
    {
        return;
    }

    /* ======================================================
       PARCHEMIN GAUCHE : NOTE
    ====================================================== */

    if (!arrivalScoreHotspot)
    {
        arrivalScoreHotspot =
            makeArrivalHotspot(
                "Écouter la note obtenue"
            );

        arrivalScoreHotspot.style.left = "6%";
        arrivalScoreHotspot.style.top = "13%";
        arrivalScoreHotspot.style.width = "34%";
        arrivalScoreHotspot.style.height = "37%";

        arrivalScoreHotspot.addEventListener(
            "mouseenter",
            () =>
            {
                const label =
                    getArrivalMarkLabel();

                if (label)
                {
                    speakButtonLabel(
                        "Bienvenue en Angleterre ! " +
                        `Ta note est de ${label} sur 20.`
                    );
                }
            }
        );

        arrivalContainer.appendChild(
            arrivalScoreHotspot
        );
    }

    /* ======================================================
       PROFESSEUR BASIL : ARRIVÉE
    ====================================================== */

    if (
        !arrivalProfessorHotspot &&
        arrivalProfessor
    )
    {
        arrivalProfessorHotspot =
            makeArrivalHotspot(
                "Écouter le professeur Basil"
            );

        arrivalProfessorHotspot.addEventListener(
            "mouseenter",
            () =>
            {
                const message =
                    getArrivalProfessorMessage();

                if (message)
                {
                    speakButtonLabel(message);
                }
            }
        );

        arrivalContainer.appendChild(
            arrivalProfessorHotspot
        );
    }

    updateArrivalProfessorHotspot();
}


/* ==========================================================
   INITIALISATION AUTOMATIQUE
   DES ZONES VOCALES D'ARRIVÉE
========================================================== */

initialiseArrivalVoiceHotspots();

window.addEventListener(
    "load",
    () =>
    {
        initialiseArrivalVoiceHotspots();

        if (
            arrivalScreen &&
            arrivalScreen.style.display === "flex"
        )
        {
            requestAnimationFrame(
                updateArrivalProfessorHotspot
            );
        }
    }
);


/* ==========================================================
   PARCHEMIN DROIT : RETOUR VERS LA FRANCE
========================================================== */

if (arrivalReturnButton)
{
    arrivalReturnButton.addEventListener(
        "mouseenter",
        () =>
        {
            speakButtonLabel(
                "Il est temps de rentrer en France ! " +
                "Prêt à repartir ? " +
                "Clique ici pour commencer la traversée du retour. " +
                "Si tu n'as commis aucune erreur, " +
                "le bateau rentrera automatiquement !"
            );
        }
    );
}

window.addEventListener(
    "resize",
    updateArrivalProfessorHotspot
);


/* ==========================================================
   CONFETTIS : NETTOYAGE
========================================================== */

function clearArrivalConfetti()
{
    if (arrivalConfettiTimeout)
    {
        clearTimeout(arrivalConfettiTimeout);

        arrivalConfettiTimeout = null;
    }

    if (arrivalConfettiLayer)
    {
        arrivalConfettiLayer.remove();

        arrivalConfettiLayer = null;
    }
}


/* ==========================================================
   CONFETTIS : RÉCOMPENSE POUR 20/20
========================================================== */

function celebratePerfectArrival()
{
    clearArrivalConfetti();

    if (
        !arrivalContainer ||
        getArrivalMark() !== 20 ||
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    )
    {
        return;
    }

    /* ======================================================
       ANIMATION CSS
    ====================================================== */

    if (
        !document.getElementById(
            "arrival-confetti-style"
        )
    )
    {
        const style =
            document.createElement("style");

        style.id = "arrival-confetti-style";

        style.textContent = `
            @keyframes arrival-confetti-fall {
                from {
                    transform:
                        translateY(-20px)
                        rotate(0deg);

                    opacity: 1;
                }

                to {
                    transform:
                        translateY(650px)
                        rotate(720deg);

                    opacity: 0;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* ======================================================
       CALQUE DE CONFETTIS
    ====================================================== */

    arrivalConfettiLayer =
        document.createElement("div");

    arrivalConfettiLayer.setAttribute(
        "aria-hidden",
        "true"
    );

    Object.assign(
        arrivalConfettiLayer.style,
        {
            position: "absolute",
            inset: "0",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: "50"
        }
    );

    /* ======================================================
       COULEURS
    ====================================================== */

    const colors = [
        "#f5c542",
        "#e34b68",
        "#49b7c8",
        "#6fcf72",
        "#a776d4"
    ];

    /* ======================================================
       CRÉATION DES 90 CONFETTIS
    ====================================================== */

    for (
        let index = 0;
        index < 90;
        index++
    )
    {
        const piece =
            document.createElement("span");

        Object.assign(
            piece.style,
            {
                position: "absolute",

                top: "-20px",

                left:
                    `${Math.random() * 100}%`,

                width:
                    `${5 + Math.random() * 6}px`,

                height:
                    `${8 + Math.random() * 8}px`,

                background:
                    colors[index % colors.length],

                opacity: "0",

                animation:
                    `arrival-confetti-fall ` +
                    `${3 + Math.random() * 2}s ` +
                    `linear ` +
                    `${Math.random() * 1.2}s forwards`
            }
        );

        arrivalConfettiLayer.appendChild(
            piece
        );
    }

    arrivalContainer.appendChild(
        arrivalConfettiLayer
    );

    /* ======================================================
       SUPPRESSION APRÈS 6,5 SECONDES
    ====================================================== */

    arrivalConfettiTimeout = setTimeout(
        clearArrivalConfetti,
        6500
    );
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
    clearArrivalConfetti();

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
   DESCRIPTION VOCALE GÉNÉRALE DE LA SALLE DE CLASSE
========================================================== */

const classroomIntroductionMessage =
    "Bienvenue dans notre salle d'apprentissage ! " +
    "Je suis le professeur Basil. " +
    "Devant toi se trouve un grand tableau sur lequel " +
    "tu peux réviser les verbes irréguliers anglais " +
    "et faire des exercices. " +
    "Autour de nous, tu découvriras plusieurs objets " +
    "et une fenêtre donnant sur le port. " +
    "Prends ton temps pour explorer la classe ! " +

    "Tu pourras également communiquer avec moi " +
    "grâce à la reconnaissance vocale. " +
    "Pour utiliser cette fonction, " +
    "active le microphone avec le bouton " +
    "Commandes vocales. " +

    "Une fois le microphone activé, " +
    "tu pourras me demander : " +
    "Basil, verbe suivant, " +
    "pour passer au verbe suivant. " +
    "Basil, verbe précédent, " +
    "pour revenir au verbe précédent. " +
    "Basil, répète, " +
    "pour réécouter mon explication. " +
    "Et Basil, arrête, " +
    "pour interrompre ma lecture. " +

    "Tu pourras désactiver le microphone " +
    "à tout moment. " +
    "Les boutons du tableau resteront " +
    "également disponibles.";


/* ==========================================================
   ÉCRAN CLASSE / APPRENTISSAGE
========================================================== */

let classroomIntroductionPlaying = false;


/* ==========================================================
   PRÉSENTATION VOCALE DE LA CLASSE
========================================================== */

function speakClassroomIntroduction()
{
    if (
        !window.irregularAudio ||
        !window.irregularAudio.isVoiceEnabled() ||
        !("speechSynthesis" in window)
    )
    {
        classroomIntroductionPlaying = false;
        return;
    }

    classroomIntroductionPlaying = true;

    speakButtonLabel(classroomIntroductionMessage);

    const checkIntroduction = () =>
    {
        if (!classroomIntroductionPlaying)
        {
            return;
        }

        if (
            !window.speechSynthesis.speaking &&
            !window.speechSynthesis.pending
        )
        {
            classroomIntroductionPlaying = false;
            return;
        }

        setTimeout(checkIntroduction, 200);
    };

    setTimeout(checkIntroduction, 200);
}


/* ==========================================================
   AFFICHAGE DE LA CLASSE
========================================================== */

function showClassroom()
{
    hideAllScreens();

    classroomScreen.style.display = "flex";

    speakClassroomIntroduction();
}


/* ==========================================================
   DESCRIPTION VOCALE : PLANTE VERTE
========================================================== */

const classroomPlantHotspot =
    document.getElementById("classroom-plant-hotspot");

const classroomPlantMessage =
    "Une jolie plante verte retombe " +
    "d'une étagère en bois.";


/* ==========================================================
   ANNONCE VOCALE DE LA PLANTE
========================================================== */

function speakClassroomPlant()
{
    if (classroomIntroductionPlaying)
    {
        return;
    }

    speakButtonLabel(classroomPlantMessage);
}


/* ==========================================================
   ÉVÉNEMENTS DE LA PLANTE
========================================================== */

if (classroomPlantHotspot)
{
    classroomPlantHotspot.addEventListener(
        "mouseenter",
        speakClassroomPlant
    );

    classroomPlantHotspot.addEventListener(
        "focus",
        speakClassroomPlant
    );
}

/* ==========================================================
   DESCRIPTION VOCALE : AFFICHE DE VOCABULAIRE
========================================================== */

const classroomVocabularyHotspot =
    document.getElementById("classroom-vocabulary-hotspot");

const classroomVocabularyMessage =
    "Un tableau de vocabulaire anglais " +
    "qui sera abordé dans le tome 2 de notre collection.";

function speakClassroomVocabulary()
{
    if (classroomIntroductionPlaying)
    {
        return;
    }

    speakButtonLabel(classroomVocabularyMessage);
}

if (classroomVocabularyHotspot)
{
    classroomVocabularyHotspot.addEventListener(
        "mouseenter",
        speakClassroomVocabulary
    );

    classroomVocabularyHotspot.addEventListener(
        "focus",
        speakClassroomVocabulary
    );
}
/* ==========================================================
   DESCRIPTION VOCALE : PANNEAU APPRENTISSAGE
========================================================== */

const classroomLearningHotspot =
    document.getElementById("classroom-learning-hotspot");

const classroomLearningMessage =
    "Bienvenue dans notre espace d'apprentissage " +
    "des verbes irréguliers anglais.";

function speakClassroomLearning()
{
    if (classroomIntroductionPlaying)
    {
        return;
    }

    speakButtonLabel(classroomLearningMessage);
}

if (classroomLearningHotspot)
{
    classroomLearningHotspot.addEventListener(
        "mouseenter",
        speakClassroomLearning
    );

    classroomLearningHotspot.addEventListener(
        "focus",
        speakClassroomLearning
    );
}
/* ==========================================================
   DESCRIPTION VOCALE : POT À CRAYONS
========================================================== */

const classroomPencilsHotspot =
    document.getElementById("classroom-pencils-hotspot");

const classroomPencilsMessage =
    "Sur le bureau du professeur se trouve " +
    "un pot contenant plusieurs crayons de couleur.";

function speakClassroomPencils()
{
    if (classroomIntroductionPlaying)
    {
        return;
    }

    speakButtonLabel(classroomPencilsMessage);
}

if (classroomPencilsHotspot)
{
    classroomPencilsHotspot.addEventListener(
        "mouseenter",
        speakClassroomPencils
    );

    classroomPencilsHotspot.addEventListener(
        "focus",
        speakClassroomPencils
    );
}
/* ==========================================================
   DESCRIPTION VOCALE : FENÊTRE
========================================================== */

const classroomWindowHotspot =
    document.getElementById("classroom-window-hotspot");

const classroomWindowMessage =
    "Une grande fenêtre à neuf carreaux donne sur le port . " +
    "On aperçoit des maisons, un phare, " +
    "un bateau qui quitte le port " +
    "et une mouette qui vole dans le ciel.";

function speakClassroomWindow()
{
    if (classroomIntroductionPlaying)
    {
        return;
    }

    speakButtonLabel(classroomWindowMessage);
}

if (classroomWindowHotspot)
{
    classroomWindowHotspot.addEventListener(
        "mouseenter",
        speakClassroomWindow
    );

    classroomWindowHotspot.addEventListener(
        "focus",
        speakClassroomWindow
    );
}
/* ==========================================================
   AMBIANCE SONORE : FENÊTRE DU PORT
========================================================== */

const classroomHarbourAudio = new Audio(
    "assets/sounds/harbour.mp3"
);

classroomHarbourAudio.loop = true;
classroomHarbourAudio.volume = 0.3;

if (classroomWindowHotspot)
{
    classroomWindowHotspot.addEventListener(
        "mouseenter",
        () =>
        {
            classroomHarbourAudio.currentTime = 0;

            classroomHarbourAudio.play().catch(error =>
            {
                console.error("[AUDIO] Ambiance du port :", error);
            });
        }
    );

    classroomWindowHotspot.addEventListener(
        "mouseleave",
        () =>
        {
            classroomHarbourAudio.pause();
            classroomHarbourAudio.currentTime = 0;
        }
    );
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

    initialiseArrivalVoiceHotspots();

    requestAnimationFrame(
        updateArrivalProfessorHotspot
    );

    celebratePerfectArrival();
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
