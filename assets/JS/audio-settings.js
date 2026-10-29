
"use strict";

/* ==========================================================
   CONFIGURATION AUDIO PAR DÉFAUT
========================================================== */

const AUDIO_SETTINGS_KEY =
    "irregular-cards-audio-settings";

const AUDIO_DEFAULT_SETTINGS = {
    voiceEnabled: false,
    voiceVolume: 80,
    voiceRate: 1,
    effectsEnabled: true,
    effectsVolume: 70
};

/* ==========================================================
   VITESSES AUTORISÉES
========================================================== */

const AUDIO_RATE_VALUES = [
    0.5,
    0.8,
    1.0,
    1.2,
    1.5
];

function getNearestAudioRate(value)
{
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue))
    {
        return 1.0;
    }

    return AUDIO_RATE_VALUES.reduce(
        (nearest, candidate) =>
        {
            return Math.abs(candidate - numericValue) <
                Math.abs(nearest - numericValue)
                ? candidate
                : nearest;
        },
        AUDIO_RATE_VALUES[0]
    );
}

/* ==========================================================
   CHARGEMENT DES PRÉFÉRENCES
========================================================== */

function loadAudioSettings()
{
    try
    {
        const saved = JSON.parse(
            localStorage.getItem(AUDIO_SETTINGS_KEY)
        );

        if (
            !saved ||
            typeof saved !== "object"
        )
        {
            return { ...AUDIO_DEFAULT_SETTINGS };
        }

        return {
            ...AUDIO_DEFAULT_SETTINGS,
            ...saved,
            voiceRate: getNearestAudioRate(
                saved.voiceRate
            )
        };
    }
    catch
    {
        return { ...AUDIO_DEFAULT_SETTINGS };
    }
}

let audioSettings = loadAudioSettings();

/* ==========================================================
   API AUDIO COMMUNE
========================================================== */

window.irregularAudio = {

    getSettings()
    {
        return { ...audioSettings };
    },

    isVoiceEnabled()
    {
        return audioSettings.voiceEnabled;
    },

    isEffectsEnabled()
    {
        return audioSettings.effectsEnabled;
    },

    getEffectsVolume()
    {
        return audioSettings.effectsEnabled
            ? audioSettings.effectsVolume / 100
            : 0;
    },

    speak(text, lang = "fr-FR")
    {
        if (
            !audioSettings.voiceEnabled ||
            !("speechSynthesis" in window)
        )
        {
            return;
        }

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(text);

        utterance.lang = lang;

        utterance.volume =
            audioSettings.voiceVolume / 100;

        utterance.rate =
            audioSettings.voiceRate;

        window.speechSynthesis.speak(utterance);
    },

    playEffect(audioElement)
    {
        if (
            !audioSettings.effectsEnabled ||
            !(audioElement instanceof HTMLAudioElement)
        )
        {
            return;
        }

        audioElement.volume =
            audioSettings.effectsVolume / 100;

        audioElement.currentTime = 0;

        audioElement.play().catch(() => {});
    }
};

/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const audioOpenButton =
    document.getElementById("audio-settings-button");

const audioModal =
    document.getElementById("audio-settings-modal");

const audioDialog =
    audioModal?.querySelector(".audio-settings-dialog");

const audioCloseButton =
    document.getElementById("audio-settings-close");

const audioSaveButton =
    document.getElementById("audio-settings-save");

const audioVoiceEnabled =
    document.getElementById("audio-voice-enabled");

const audioVoiceVolume =
    document.getElementById("audio-voice-volume");

const audioVoiceRate =
    document.getElementById("audio-voice-rate");

const audioEffectsEnabled =
    document.getElementById("audio-effects-enabled");

const audioEffectsVolume =
    document.getElementById("audio-effects-volume");

const audioVoiceVolumeValue =
    document.getElementById("audio-voice-volume-value");

const audioVoiceRateValue =
    document.getElementById("audio-voice-rate-value");

const audioEffectsVolumeValue =
    document.getElementById("audio-effects-volume-value");

let audioPreviousFocus = null;

/* ==========================================================
   CONFIGURATION INDÉPENDANTE DES MOLETTES
========================================================== */

const AUDIO_VOLUME_MIN_ANGLE = -90;
const AUDIO_VOLUME_MAX_ANGLE = 90;

/*
   Les cinq positions de la molette centrale sont
   réparties sur son arc de rotation.

   Les molettes de volume ne dépendent pas
   de ces paramètres.
*/

const AUDIO_RATE_MIN_ANGLE = -120;
const AUDIO_RATE_MAX_ANGLE = 120;

const AUDIO_RATE_VISUAL_OFFSET = 0;

/* ==========================================================
   OUTILS DE CALCUL
========================================================== */

function clampAudioValue(value, min, max)
{
    return Math.max(
        min,
        Math.min(max, value)
    );
}

function getAudioKnobProgress(input)
{
    if (input === audioVoiceRate)
    {
        const value = getNearestAudioRate(
            input.value
        );

        const index =
            AUDIO_RATE_VALUES.indexOf(value);

        return index /
            (AUDIO_RATE_VALUES.length - 1);
    }

    const min = Number(input.min);
    const max = Number(input.max);
    const value = Number(input.value);

    if (max === min)
    {
        return 0;
    }

    return clampAudioValue(
        (value - min) / (max - min),
        0,
        1
    );
}

/* ==========================================================
   AFFICHAGE DES VALEURS
========================================================== */

function updateAudioSettingsDisplay()
{
    audioVoiceVolumeValue.textContent =
        `${audioVoiceVolume.value} %`;

    /*
       La vitesse est toujours ramenée
       à l'une des cinq valeurs autorisées.
    */

    const selectedRate =
        getNearestAudioRate(audioVoiceRate.value);

    audioVoiceRate.value =
        String(selectedRate);

    audioVoiceRateValue.textContent =
        `${selectedRate.toFixed(1)}×`;

    audioEffectsVolumeValue.textContent =
        `${audioEffectsVolume.value} %`;

    audioVoiceVolume.disabled =
        !audioVoiceEnabled.checked;

    audioVoiceRate.disabled =
        !audioVoiceEnabled.checked;

    audioEffectsVolume.disabled =
        !audioEffectsEnabled.checked;

    updateAudioKnobIndicators();
}

/* ==========================================================
   INDICATEURS DE ROTATION
========================================================== */

const audioKnobIndicators = new Map();

function initialiseAudioKnobIndicator(input)
{
    const control =
        input.closest(".audio-radio-control");

    if (!control)
    {
        return;
    }

    const indicator =
        document.createElement("span");

    indicator.setAttribute(
        "aria-hidden",
        "true"
    );

    indicator.style.position = "absolute";
    indicator.style.left = "50%";
    indicator.style.top = "50%";

    indicator.style.width = "3px";
    indicator.style.height = "22%";

    indicator.style.borderRadius = "3px";

    indicator.style.background = "#ffe8a4";
    indicator.style.boxShadow = "0 0 3px #241306";

    indicator.style.transformOrigin =
        "center bottom";

    indicator.style.pointerEvents = "none";
    indicator.style.zIndex = "2";

    control.appendChild(indicator);

    audioKnobIndicators.set(
        input,
        indicator
    );
}

/* ==========================================================
   ROTATION DES MOLETTES DE VOLUME
========================================================== */

function updateAudioVolumeKnobIndicator(
    input,
    indicator
)
{
    const progress =
        getAudioKnobProgress(input);

    const angle =
        AUDIO_VOLUME_MIN_ANGLE +
        progress * (
            AUDIO_VOLUME_MAX_ANGLE -
            AUDIO_VOLUME_MIN_ANGLE
        );

    indicator.style.transform =
        `translate(-50%, -100%) rotate(${angle}deg)`;

    indicator.style.opacity =
        input.disabled ? "0.35" : "1";
}

/* ==========================================================
   ROTATION INDÉPENDANTE DE LA MOLETTE VITESSE
========================================================== */

function updateAudioRateKnobIndicator()
{
    const indicator =
        audioKnobIndicators.get(audioVoiceRate);

    if (!indicator)
    {
        return;
    }

    const progress =
        getAudioKnobProgress(audioVoiceRate);

    const angle =
        AUDIO_RATE_MIN_ANGLE +
        progress * (
            AUDIO_RATE_MAX_ANGLE -
            AUDIO_RATE_MIN_ANGLE
        ) +
        AUDIO_RATE_VISUAL_OFFSET;

    indicator.style.transform =
        `translate(-50%, -100%) rotate(${angle}deg)`;

    indicator.style.opacity =
        audioVoiceRate.disabled ? "0.35" : "1";
}

/* ==========================================================
   ACTUALISATION DES TROIS INDICATEURS
========================================================== */

function updateAudioKnobIndicators()
{
    for (
        const [input, indicator]
        of audioKnobIndicators
    )
    {
        if (input === audioVoiceRate)
        {
            updateAudioRateKnobIndicator();
        }
        else
        {
            updateAudioVolumeKnobIndicator(
                input,
                indicator
            );
        }
    }
}

/* ==========================================================
   CENTRE RÉEL D'UNE MOLETTE
========================================================== */

function getAudioKnobPointerAngle(
    input,
    clientX,
    clientY
)
{
    const control =
        input.closest(".audio-radio-control");

    if (!control)
    {
        return null;
    }

    const rect =
        control.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;

    const deltaX =
        clientX - centerX;

    const deltaY =
        clientY - centerY;

    return Math.atan2(
        deltaX,
        -deltaY
    ) * 180 / Math.PI;
}

/* ==========================================================
   APPLICATION D'UNE VALEUR À UNE MOLETTE
========================================================== */

function applyAudioKnobProgress(input, progress)
{
    const boundedProgress =
        clampAudioValue(progress, 0, 1);

    /*
       Traitement exclusif de la vitesse.

       Les cinq valeurs ne sont pas espacées
       régulièrement numériquement.

       On sélectionne donc leur indice,
       et non une valeur calculée avec step.
    */

    if (input === audioVoiceRate)
    {
        const index = Math.round(
            boundedProgress *
            (AUDIO_RATE_VALUES.length - 1)
        );

        const selectedRate =
            AUDIO_RATE_VALUES[index];

        input.value = String(selectedRate);

        input.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );

        return;
    }

    /*
       Fonctionnement initial conservé
       pour les deux molettes de volume.
    */

    const min = Number(input.min);
    const max = Number(input.max);
    const step = Number(input.step) || 1;

    const rawValue =
        min + boundedProgress * (max - min);

    const steppedValue =
        min +
        Math.round(
            (rawValue - min) / step
        ) * step;

    const finalValue =
        clampAudioValue(
            steppedValue,
            min,
            max
        );

    input.value = String(
        Number(finalValue.toFixed(2))
    );

    input.dispatchEvent(
        new Event(
            "input",
            {
                bubbles: true
            }
        )
    );
}

/* ==========================================================
   MODIFICATION DES MOLETTES DE VOLUME
========================================================== */

function setAudioVolumeKnobValue(
    input,
    clientX,
    clientY
)
{
    if (input.disabled)
    {
        return;
    }

    const angle =
        getAudioKnobPointerAngle(
            input,
            clientX,
            clientY
        );

    if (angle === null)
    {
        return;
    }

    const boundedAngle =
        clampAudioValue(
            angle,
            AUDIO_VOLUME_MIN_ANGLE,
            AUDIO_VOLUME_MAX_ANGLE
        );

    const progress =
        (
            boundedAngle -
            AUDIO_VOLUME_MIN_ANGLE
        ) /
        (
            AUDIO_VOLUME_MAX_ANGLE -
            AUDIO_VOLUME_MIN_ANGLE
        );

    applyAudioKnobProgress(
        input,
        progress
    );
}

/* ==========================================================
   MODIFICATION INDÉPENDANTE DE LA VITESSE
========================================================== */

function setAudioRateKnobValue(
    clientX,
    clientY
)
{
    if (audioVoiceRate.disabled)
    {
        return;
    }

    const angle =
        getAudioKnobPointerAngle(
            audioVoiceRate,
            clientX,
            clientY
        );

    if (angle === null)
    {
        return;
    }

    const correctedAngle =
        angle - AUDIO_RATE_VISUAL_OFFSET;

    const boundedAngle =
        clampAudioValue(
            correctedAngle,
            AUDIO_RATE_MIN_ANGLE,
            AUDIO_RATE_MAX_ANGLE
        );

    const progress =
        (
            boundedAngle -
            AUDIO_RATE_MIN_ANGLE
        ) /
        (
            AUDIO_RATE_MAX_ANGLE -
            AUDIO_RATE_MIN_ANGLE
        );

    applyAudioKnobProgress(
        audioVoiceRate,
        progress
    );
}

/* ==========================================================
   DISTRIBUTION DES INTERACTIONS
========================================================== */

function setAudioKnobValue(
    input,
    clientX,
    clientY
)
{
    if (input === audioVoiceRate)
    {
        setAudioRateKnobValue(
            clientX,
            clientY
        );

        return;
    }

    setAudioVolumeKnobValue(
        input,
        clientX,
        clientY
    );
}

/* ==========================================================
   INTERACTION SOURIS ET TACTILE
========================================================== */

function initialiseAudioKnob(input)
{
    initialiseAudioKnobIndicator(input);

    let dragging = false;

    input.addEventListener(
        "pointerdown",
        event =>
        {
            if (input.disabled)
            {
                return;
            }

            event.preventDefault();

            dragging = true;

            input.setPointerCapture(
                event.pointerId
            );

            setAudioKnobValue(
                input,
                event.clientX,
                event.clientY
            );
        }
    );

    input.addEventListener(
        "pointermove",
        event =>
        {
            if (!dragging)
            {
                return;
            }

            event.preventDefault();

            setAudioKnobValue(
                input,
                event.clientX,
                event.clientY
            );
        }
    );

    input.addEventListener(
        "pointerup",
        () =>
        {
            dragging = false;
        }
    );

    input.addEventListener(
        "pointercancel",
        () =>
        {
            dragging = false;
        }
    );

    input.addEventListener(
        "lostpointercapture",
        () =>
        {
            dragging = false;
        }
    );

    /*
       Clavier : passage d'une valeur autorisée
       à la suivante, sans valeur intermédiaire.
    */

    if (input === audioVoiceRate)
    {
        input.addEventListener(
            "keydown",
            event =>
            {
                if (input.disabled)
                {
                    return;
                }

                const currentRate =
                    getNearestAudioRate(input.value);

                const currentIndex =
                    AUDIO_RATE_VALUES.indexOf(
                        currentRate
                    );

                let nextIndex = currentIndex;

                if (
                    event.key === "ArrowRight" ||
                    event.key === "ArrowUp"
                )
                {
                    nextIndex = Math.min(
                        AUDIO_RATE_VALUES.length - 1,
                        currentIndex + 1
                    );
                }
                else if (
                    event.key === "ArrowLeft" ||
                    event.key === "ArrowDown"
                )
                {
                    nextIndex = Math.max(
                        0,
                        currentIndex - 1
                    );
                }
                else if (event.key === "Home")
                {
                    nextIndex = 0;
                }
                else if (event.key === "End")
                {
                    nextIndex =
                        AUDIO_RATE_VALUES.length - 1;
                }
                else
                {
                    return;
                }

                event.preventDefault();

                input.value = String(
                    AUDIO_RATE_VALUES[nextIndex]
                );

                input.dispatchEvent(
                    new Event(
                        "input",
                        {
                            bubbles: true
                        }
                    )
                );
            }
        );
    }
}

/* ==========================================================
   OUVERTURE DE LA MODALE
========================================================== */

function openAudioSettings()
{
    audioPreviousFocus =
        document.activeElement;

    audioVoiceEnabled.checked =
        audioSettings.voiceEnabled;

    audioVoiceVolume.value =
        audioSettings.voiceVolume;

    audioVoiceRate.value =
        getNearestAudioRate(
            audioSettings.voiceRate
        );

    audioEffectsEnabled.checked =
        audioSettings.effectsEnabled;

    audioEffectsVolume.value =
        audioSettings.effectsVolume;

    audioModal.hidden = false;

    updateAudioSettingsDisplay();

    audioCloseButton.focus();
}

/* ==========================================================
   FERMETURE DE LA MODALE
========================================================== */

function closeAudioSettings()
{
    audioModal.hidden = true;

    if (
        audioPreviousFocus &&
        typeof audioPreviousFocus.focus === "function"
    )
    {
        audioPreviousFocus.focus();
    }
}

/* ==========================================================
   ENREGISTREMENT DES RÉGLAGES
========================================================== */

function saveAudioSettings()
{
    audioSettings = {

        voiceEnabled:
            audioVoiceEnabled.checked,

        voiceVolume:
            Number(audioVoiceVolume.value),

        voiceRate:
            getNearestAudioRate(
                audioVoiceRate.value
            ),

        effectsEnabled:
            audioEffectsEnabled.checked,

        effectsVolume:
            Number(audioEffectsVolume.value)
    };

    try
    {
        localStorage.setItem(
            AUDIO_SETTINGS_KEY,
            JSON.stringify(audioSettings)
        );
    }
    catch
    {
        // Les réglages restent actifs pendant la visite.
    }

    if (
        !audioSettings.voiceEnabled &&
        "speechSynthesis" in window
    )
    {
        window.speechSynthesis.cancel();
    }

    window.dispatchEvent(
        new CustomEvent(
            "irregular-audio-settings-changed",
            {
                detail: {
                    ...audioSettings
                }
            }
        )
    );

    closeAudioSettings();
}

/* ==========================================================
   INITIALISATION ET ÉVÉNEMENTS
========================================================== */

if (
    audioOpenButton &&
    audioModal &&
    audioDialog &&
    audioCloseButton &&
    audioSaveButton &&
    audioVoiceEnabled &&
    audioVoiceVolume &&
    audioVoiceRate &&
    audioEffectsEnabled &&
    audioEffectsVolume &&
    audioVoiceVolumeValue &&
    audioVoiceRateValue &&
    audioEffectsVolumeValue
)
{
    /*
       Le champ HTML de vitesse conserve sa plage
       numérique pour la compatibilité.

       Le JavaScript impose les cinq valeurs.
    */

    audioVoiceRate.min = "0.5";
    audioVoiceRate.max = "1.5";
    audioVoiceRate.step = "any";

    audioVoiceRate.value = String(
        getNearestAudioRate(
            audioVoiceRate.value
        )
    );

    /* ======================================================
       INITIALISATION DES TROIS MOLETTES
    ====================================================== */

    [
        audioVoiceVolume,
        audioVoiceRate,
        audioEffectsVolume
    ].forEach(initialiseAudioKnob);

    /* ======================================================
       OUVERTURE
    ====================================================== */

    audioOpenButton.addEventListener(
        "click",
        openAudioSettings
    );

    /* ======================================================
       FERMETURE
    ====================================================== */

    audioCloseButton.addEventListener(
        "click",
        closeAudioSettings
    );

    /* ======================================================
       ENREGISTREMENT
    ====================================================== */

    audioSaveButton.addEventListener(
        "click",
        saveAudioSettings
    );

    /* ======================================================
       MISE À JOUR DES VALEURS
    ====================================================== */

    [
        audioVoiceEnabled,
        audioVoiceVolume,
        audioVoiceRate,
        audioEffectsEnabled,
        audioEffectsVolume
    ].forEach(element =>
    {
        element.addEventListener(
            "input",
            updateAudioSettingsDisplay
        );
    });

    /* ======================================================
       FERMETURE PAR CLIC SUR LE FOND
    ====================================================== */

    audioModal.addEventListener(
        "click",
        event =>
        {
            if (event.target === audioModal)
            {
                closeAudioSettings();
            }
        }
    );

    /* ======================================================
       ACCESSIBILITÉ CLAVIER
    ====================================================== */

    audioModal.addEventListener(
        "keydown",
        event =>
        {
            if (event.key === "Escape")
            {
                event.preventDefault();

                closeAudioSettings();

                return;
            }

            if (event.key !== "Tab")
            {
                return;
            }

            const focusable = [
                ...audioDialog.querySelectorAll(
                    'button:not([disabled]), input:not([disabled])'
                )
            ];

            if (!focusable.length)
            {
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === first
            )
            {
                event.preventDefault();
                last.focus();
            }
            else if (
                !event.shiftKey &&
                document.activeElement === last
            )
            {
                event.preventDefault();
                first.focus();
            }
        }
    );

    /* ======================================================
       AFFICHAGE INITIAL
    ====================================================== */

    updateAudioSettingsDisplay();
}
