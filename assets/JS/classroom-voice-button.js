"use strict";

/* ==========================================================
   BOUTON COMMANDE VOCALE — SALLE DE CLASSE
========================================================== */

(function initialiseClassroomVoiceButton()
{
    const button = document.getElementById(
        "classroom-voice-control-button"
    );

    const classroom = document.getElementById(
        "classroom-screen"
    );

    if (!button || !classroom)
    {
        return;
    }

    /* ======================================================
       ICÔNE SVG
    ====================================================== */

    const icon = document.createElement("img");

    icon.src =
        "assets/images/icones/icone-commande-vocale.svg";

    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    icon.draggable = false;

    icon.style.display = "block";
    icon.style.width = "100%";
    icon.style.height = "100%";

    button.replaceChildren(icon);

    /* ======================================================
       POSITIONNEMENT
    ====================================================== */

    Object.assign(button.style, {

        position: "absolute",

        left: "41.2%",
        top: "74%",

        transform: "translate(-50%, -50%)",

        width: "5.5%",
        height: "auto",
        aspectRatio: "1 / 1",

        padding: "0",
        margin: "0",

        border: "none",
        borderRadius: "50%",

        background: "transparent",

        cursor: "pointer",

        zIndex: "35"

    });

    /* ======================================================
       RECONNAISSANCE VOCALE
    ====================================================== */

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;

    let listening = false;
    let starting = false;

    let activationPending = false;
    let microphoneRequested = false;

    let speakingAnnouncement = false;
    let announcementToken = 0;

    let restartTimer = null;
    let restartAttempts = 0;

    let fatalRecognitionError = false;

    const MAX_RESTART_ATTEMPTS = 5;
    const RESTART_DELAY = 600;

    /* ======================================================
       ASSISTANCE VOCALE ACTIVÉE ?
    ====================================================== */

    function isVoiceEnabled()
    {
        return window.irregularAudio
            ?.isVoiceEnabled() === true;
    }

    /* ======================================================
       SALLE DE CLASSE VISIBLE ?
    ====================================================== */

    function isClassroomVisible()
    {
        if (classroom.hidden)
        {
            return false;
        }

        const style =
            window.getComputedStyle(classroom);

        return (
            style.display !== "none" &&
            style.visibility !== "hidden"
        );
    }

    /* ======================================================
       CONDITIONS D'UTILISATION
    ====================================================== */

    function canUseMicrophone()
    {
        return (
            isVoiceEnabled() &&
            isClassroomVisible() &&
            !document.hidden
        );
    }

    /* ======================================================
       VOIX MICROSOFT PAUL
    ====================================================== */

    function getVoicePaul()
    {
        if (!("speechSynthesis" in window))
        {
            return null;
        }

        const voices =
            window.speechSynthesis.getVoices();

        return (
            voices.find(
                voice =>
                    voice.name ===
                    "Microsoft Paul - French (France)"
            ) ||
            voices.find(
                voice =>
                    voice.lang === "fr-FR"
            ) ||
            voices.find(
                voice =>
                    voice.lang.toLowerCase().startsWith("fr")
            ) ||
            null
        );
    }

    /* ======================================================
       ANNONCES VOCALES
    ====================================================== */

    function speakAnnouncement(
        message,
        onFinished = null
    )
    {
        if (
            !isVoiceEnabled() ||
            !isClassroomVisible() ||
            !("speechSynthesis" in window) ||
            !("SpeechSynthesisUtterance" in window)
        )
        {
            if (onFinished)
            {
                onFinished();
            }

            return;
        }

        announcementToken++;

        const currentToken =
            announcementToken;

        window.speechSynthesis.cancel();

        speakingAnnouncement = true;

        const settings =
            window.irregularAudio?.getSettings?.() || {};

        const utterance =
            new SpeechSynthesisUtterance(message);

        utterance.lang = "fr-FR";

        utterance.volume =
            typeof settings.voiceVolume === "number"
                ? settings.voiceVolume / 100
                : 0.8;

        utterance.rate =
            typeof settings.voiceRate === "number"
                ? settings.voiceRate
                : 1;

        function applyPaulVoice()
        {
            const paul = getVoicePaul();

            if (paul)
            {
                utterance.voice = paul;
            }
        }

        function finishAnnouncement()
        {
            if (currentToken !== announcementToken)
            {
                return;
            }

            speakingAnnouncement = false;

            if (onFinished)
            {
                onFinished();
            }
        }

        utterance.onend =
            finishAnnouncement;

        utterance.onerror =
            finishAnnouncement;

        const voices =
            window.speechSynthesis.getVoices();

        if (voices.length > 0)
        {
            applyPaulVoice();

            window.speechSynthesis.speak(
                utterance
            );

            return;
        }

        /* ==============================================
           ATTENTE DU CHARGEMENT DES VOIX
        ============================================== */

        let voiceWaitFinished = false;

        const voiceTimeout =
            window.setTimeout(
                finishVoiceWait,
                1200
            );

        function finishVoiceWait()
        {
            if (voiceWaitFinished)
            {
                return;
            }

            voiceWaitFinished = true;

            window.clearTimeout(
                voiceTimeout
            );

            window.speechSynthesis.removeEventListener(
                "voiceschanged",
                finishVoiceWait
            );

            if (currentToken !== announcementToken)
            {
                return;
            }

            applyPaulVoice();

            window.speechSynthesis.speak(
                utterance
            );
        }

        window.speechSynthesis.addEventListener(
            "voiceschanged",
            finishVoiceWait
        );
    }

    /* ======================================================
       ANNULATION D'UNE ANNONCE
    ====================================================== */

    function cancelAnnouncement()
    {
        announcementToken++;

        speakingAnnouncement = false;

        if ("speechSynthesis" in window)
        {
            window.speechSynthesis.cancel();
        }
    }

    /* ======================================================
       ANNULATION DU REDÉMARRAGE
    ====================================================== */

    function cancelRestart()
    {
        if (restartTimer !== null)
        {
            window.clearTimeout(
                restartTimer
            );

            restartTimer = null;
        }
    }

    /* ======================================================
       ÉTAT VISUEL DU MICROPHONE
    ====================================================== */

    function updateMicrophoneState()
    {
        const active =
            microphoneRequested;

        button.setAttribute(
            "aria-pressed",
            String(active)
        );

        button.setAttribute(
            "aria-label",
            active
                ? "Bouton de commande vocale, activée, touche F8"
                : "Bouton de commande vocale, désactivée, touche F8"
        );

        button.title = active
            ? "Bouton de commande vocale — activée — F8"
            : "Bouton de commande vocale — désactivée — F8";

        button.style.boxShadow = active
            ? "0 0 0 4px #05EA6F"
            : "none";
    }

    /* ======================================================
       ARRÊT DU MICROPHONE
    ====================================================== */

    function stopListening(announce = false)
    {
        const wasActive =
            microphoneRequested ||
            listening ||
            starting ||
            activationPending;

        if (!wasActive)
        {
            return;
        }

        microphoneRequested = false;

        activationPending = false;
        starting = false;
        listening = false;

        restartAttempts = 0;
        fatalRecognitionError = false;

        cancelRestart();
        cancelAnnouncement();

        if (recognition)
        {
            try
            {
                recognition.abort();
            }
            catch (error)
            {
                console.warn(
                    "Arrêt du microphone :",
                    error
                );
            }
        }

        updateMicrophoneState();

        if (announce)
        {
            speakAnnouncement(
                "Commande vocale désactivée."
            );
        }
    }

    /* ======================================================
       ÉCHEC DÉFINITIF DE LA RECONNAISSANCE
    ====================================================== */

    function failMicrophone()
    {
        if (!microphoneRequested)
        {
            return;
        }

        microphoneRequested = false;

        activationPending = false;
        starting = false;
        listening = false;

        restartAttempts = 0;

        cancelRestart();

        updateMicrophoneState();

        speakAnnouncement(
            "Le microphone n'est plus actif. " +
            "Appuie sur F 8 pour réessayer."
        );
    }

    /* ======================================================
       VISIBILITÉ SELON LES RÉGLAGES AUDIO
    ====================================================== */

    function updateVoiceButtonVisibility()
    {
        const enabled =
            isVoiceEnabled();

        if (!enabled)
        {
            stopListening();
        }

        button.hidden = !enabled;

        button.style.display =
            enabled ? "block" : "none";
    }

    /* ======================================================
       DÉMARRAGE DE LA RECONNAISSANCE
    ====================================================== */

    function startRecognition()
    {
        if (
            !microphoneRequested ||
            !canUseMicrophone()
        )
        {
            if (!canUseMicrophone())
            {
                stopListening();
            }

            return;
        }

        if (
            !recognition ||
            listening ||
            starting
        )
        {
            return;
        }

        cancelRestart();

        activationPending = false;
        starting = true;

        updateMicrophoneState();

        try
        {
            recognition.start();
        }
        catch (error)
        {
            starting = false;

            console.warn(
                "Impossible de démarrer le microphone :",
                error
            );

            scheduleRecognitionRestart();
        }
    }

    /* ======================================================
       REDÉMARRAGE AUTOMATIQUE
    ====================================================== */

    function scheduleRecognitionRestart()
    {
        if (
            !microphoneRequested ||
            !canUseMicrophone()
        )
        {
            if (!canUseMicrophone())
            {
                stopListening();
            }

            return;
        }

        if (fatalRecognitionError)
        {
            failMicrophone();
            return;
        }

        if (restartTimer !== null)
        {
            return;
        }

        if (
            restartAttempts >=
            MAX_RESTART_ATTEMPTS
        )
        {
            failMicrophone();
            return;
        }

        restartAttempts++;

        console.info(
            "[VOCAL] Tentative de reprise :",
            restartAttempts,
            "/",
            MAX_RESTART_ATTEMPTS
        );

        restartTimer =
            window.setTimeout(
                function()
                {
                    restartTimer = null;

                    if (
                        !microphoneRequested ||
                        !canUseMicrophone()
                    )
                    {
                        return;
                    }

                    startRecognition();
                },
                RESTART_DELAY
            );
    }

    /* ======================================================
       INITIALISATION DE LA RECONNAISSANCE
    ====================================================== */

    function initialiseRecognition()
    {
        if (recognition)
        {
            return true;
        }

        if (!SpeechRecognition)
        {
            console.warn(
                "Reconnaissance vocale non disponible dans ce navigateur."
            );

            return false;
        }

        recognition =
            new SpeechRecognition();

        recognition.lang = "fr-FR";

        recognition.continuous = true;

        recognition.interimResults = false;

        /* ==================================================
           MICROPHONE ACTIVÉ
        ================================================== */

        recognition.onstart = function()
        {
            if (!microphoneRequested)
            {
                try
                {
                    recognition.abort();
                }
                catch (error)
                {
                    console.warn(
                        "Arrêt de la reconnaissance :",
                        error
                    );
                }

                return;
            }

            starting = false;
            listening = true;

            activationPending = false;

            restartAttempts = 0;

            updateMicrophoneState();

            console.info(
                "[VOCAL] Microphone en écoute."
            );
        };

        /* ==================================================
           PAROLES RECONNUES
        ================================================== */

        recognition.onresult = function(event)
        {
            if (
                !microphoneRequested ||
                !canUseMicrophone()
            )
            {
                return;
            }

            /*
               Ne pas interpréter les annonces
               du microphone lui-même.
            */

            if (speakingAnnouncement)
            {
                return;
            }

            for (
                let index = event.resultIndex;
                index < event.results.length;
                index++
            )
            {
                const result =
                    event.results[index];

                if (!result.isFinal)
                {
                    continue;
                }

                const transcript =
                    result[0].transcript.trim();

                if (!transcript)
                {
                    continue;
                }

                /* ==========================================
                   NORMALISATION DE LA COMMANDE
                ========================================== */

                const normalizedTranscript =
                    transcript
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[.,!?;:]/g, "")
                        .trim();

                /* ==========================================
                   DÉTECTION DE LA LECTURE DE BASIL
                ========================================== */

                const basilIsReading =
                    (
                        typeof classroomBasilReading !== "undefined" &&
                        classroomBasilReading
                    );

                const introductionIsPlaying =
                    (
                        typeof classroomIntroductionPlaying !== "undefined" &&
                        classroomIntroductionPlaying
                    );

                const synthesisIsSpeaking =
                    (
                        "speechSynthesis" in window &&
                        (
                            window.speechSynthesis.speaking ||
                            window.speechSynthesis.pending
                        )
                    );

                /* ==========================================
                   PROTECTION PENDANT LES ANNONCES
                ========================================== */

                if (
                    introductionIsPlaying
                )
                {
                    continue;
                }

                /*
                   Pendant que Basil lit un verbe,
                   seule la commande ARRÊTE
                   est autorisée.
                */

                if (
                    (basilIsReading || synthesisIsSpeaking) &&
                    normalizedTranscript !== "arrete"
                )
                {
                    continue;
                }

                /* ==========================================
                   TRANSMISSION DE LA COMMANDE
                ========================================== */

                console.log(
                    "Commande vocale reconnue :",
                    transcript
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "classroom-voice-command",
                        {
                            detail: {
                                transcript
                            }
                        }
                    )
                );
            }
        };

        /* ==================================================
           ERREURS DE RECONNAISSANCE
        ================================================== */

        recognition.onerror = function(event)
        {
            console.warn(
                "[VOCAL] Erreur de reconnaissance :",
                event.error
            );

            if (!microphoneRequested)
            {
                return;
            }

            if (
                event.error === "not-allowed" ||
                event.error === "service-not-allowed" ||
                event.error === "audio-capture"
            )
            {
                fatalRecognitionError = true;

                failMicrophone();

                return;
            }

            /*
               Les erreurs transitoires sont
               traitées lors de recognition.onend.
            */
        };

        /* ==================================================
           FIN DE L'ÉCOUTE
        ================================================== */

        recognition.onend = function()
        {
            listening = false;
            starting = false;

            console.info(
                "[VOCAL] Reconnaissance terminée."
            );

            /*
               Arrêt volontaire : ne rien relancer.
            */

            if (!microphoneRequested)
            {
                updateMicrophoneState();
                return;
            }

            /*
               La reconnaissance s'est arrêtée
               sans demande de l'utilisateur.
            */

            if (!canUseMicrophone())
            {
                stopListening();
                return;
            }

            /*
               Le cercle vert reste affiché
               pendant la tentative de reprise.
            */

            updateMicrophoneState();

            scheduleRecognitionRestart();
        };

        return true;
    }

    /* ======================================================
       ACTIVATION AVEC ANNONCE VOCALE
    ====================================================== */

    function startListening()
    {
        if (!canUseMicrophone())
        {
            return;
        }

        if (microphoneRequested)
        {
            return;
        }

        if (!initialiseRecognition())
        {
            speakAnnouncement(
                "La reconnaissance vocale " +
                "n'est pas disponible."
            );

            return;
        }

        cancelRestart();

        fatalRecognitionError = false;

        restartAttempts = 0;

        microphoneRequested = true;

        activationPending = true;

        updateMicrophoneState();

        speakAnnouncement(
            "Commande vocale activée.",
            function()
            {
                if (
                    microphoneRequested &&
                    activationPending
                )
                {
                    startRecognition();
                }
            }
        );
    }

    /* ======================================================
       ACTIVATION / DÉSACTIVATION
    ====================================================== */

    function toggleVoiceCommand()
    {
        if (
            !isVoiceEnabled() ||
            !isClassroomVisible()
        )
        {
            return;
        }

        if (microphoneRequested)
        {
            stopListening(true);
        }
        else
        {
            startListening();
        }
    }

    /* ======================================================
       SURVOL ET FOCUS DU BOUTON
    ====================================================== */

    function announceVoiceButton()
    {
        if (
            !isVoiceEnabled() ||
            !isClassroomVisible()
        )
        {
            return;
        }

        if (microphoneRequested)
        {
            return;
        }

        speakAnnouncement(
            "Bouton de commande vocale."
        );
    }

    button.addEventListener(
        "mouseenter",
        announceVoiceButton
    );

    button.addEventListener(
        "focus",
        announceVoiceButton
    );

    /* ======================================================
       CLIC SUR LE MICROPHONE
    ====================================================== */

    button.addEventListener(
        "click",
        toggleVoiceCommand
    );

    /* ======================================================
       RACCOURCI CLAVIER F8
    ====================================================== */

    document.addEventListener(
        "keydown",
        function(event)
        {
            if (
                event.key !== "F8" ||
                event.repeat ||
                event.ctrlKey ||
                event.altKey ||
                event.metaKey
            )
            {
                return;
            }

            if (
                !isVoiceEnabled() ||
                !isClassroomVisible()
            )
            {
                return;
            }

            event.preventDefault();

            toggleVoiceCommand();
        }
    );

    /* ======================================================
       MODIFICATION DES RÉGLAGES AUDIO
    ====================================================== */

    window.addEventListener(
        "irregular-audio-settings-changed",
        updateVoiceButtonVisibility
    );

    /* ======================================================
       ARRÊT SI L'ONGLET DEVIENT INACTIF
    ====================================================== */

    document.addEventListener(
        "visibilitychange",
        function()
        {
            if (document.hidden)
            {
                stopListening();
            }
        }
    );

    /* ======================================================
       ARRÊT LORSQU'ON QUITTE LA CLASSE
    ====================================================== */

    const classroomObserver =
        new MutationObserver(
            function()
            {
                if (!isClassroomVisible())
                {
                    stopListening();
                }
            }
        );

    classroomObserver.observe(
        classroom,
        {
            attributes: true,
            attributeFilter: [
                "style",
                "class",
                "hidden"
            ]
        }
    );

    /* ======================================================
       INITIALISATION
    ====================================================== */

    updateMicrophoneState();

    updateVoiceButtonVisibility();

})();