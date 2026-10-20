
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
            ...saved
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
   AFFICHAGE DES VALEURS
========================================================== */

function updateAudioSettingsDisplay()
{
    audioVoiceVolumeValue.textContent =
        `${audioVoiceVolume.value} %`;

    audioVoiceRateValue.textContent =
        `${Number(audioVoiceRate.value).toFixed(1)}×`;

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
    const control = input.closest(".audio-radio-control");

    if (!control)
    {
        return;
    }

    const indicator = document.createElement("span");

    indicator.setAttribute("aria-hidden", "true");

    indicator.style.position = "absolute";
    indicator.style.left = "50%";
    indicator.style.top = "50%";
    indicator.style.width = "3px";
    indicator.style.height = "22%";
    indicator.style.borderRadius = "3px";
    indicator.style.background = "#ffe8a4";
    indicator.style.boxShadow = "0 0 3px #241306";
    indicator.style.transformOrigin = "center bottom";
    indicator.style.pointerEvents = "none";
    indicator.style.zIndex = "2";

    control.appendChild(indicator);

    audioKnobIndicators.set(input, indicator);
}


/* ==========================================================
   ACTUALISATION DE LA ROTATION
========================================================== */

function updateAudioKnobIndicators()
{
    for (const [input, indicator] of audioKnobIndicators)
    {
        const min = Number(input.min);
        const max = Number(input.max);
        const value = Number(input.value);

        const progress = (value - min) / (max - min);

        const angle = -135 + progress * 270;

        indicator.style.transform =
            `translate(-50%, -100%) rotate(${angle}deg)`;

        indicator.style.opacity =
            input.disabled ? "0.35" : "1";
    }
}


/* ==========================================================
   MODIFICATION D'UNE MOLETTE
========================================================== */

function setAudioKnobValue(input, clientX, clientY)
{
    if (input.disabled)
    {
        return;
    }

    const rect = input.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let angle =
        Math.atan2(deltaX, -deltaY) * 180 / Math.PI;

    if (angle > 180)
    {
        angle -= 360;
    }

    const min = Number(input.min);
    const max = Number(input.max);
    const step = Number(input.step) || 1;

    const boundedAngle =
        Math.max(-135, Math.min(135, angle));

    const progress =
        (boundedAngle + 135) / 270;

    const rawValue =
        min + progress * (max - min);

    const steppedValue =
        min + Math.round((rawValue - min) / step) * step;

    const finalValue =
        Math.max(min, Math.min(max, steppedValue));

    input.value = String(
        Number(finalValue.toFixed(2))
    );

    input.dispatchEvent(
        new Event("input", { bubbles: true })
    );
}


/* ==========================================================
   INTERACTION SOURIS ET TACTILE
========================================================== */

function initialiseAudioKnob(input)
{
    initialiseAudioKnobIndicator(input);

    let dragging = false;

    input.addEventListener("pointerdown", event =>
    {
        if (input.disabled)
        {
            return;
        }

        dragging = true;

        input.setPointerCapture(event.pointerId);

        setAudioKnobValue(
            input,
            event.clientX,
            event.clientY
        );
    });

    input.addEventListener("pointermove", event =>
    {
        if (!dragging)
        {
            return;
        }

        setAudioKnobValue(
            input,
            event.clientX,
            event.clientY
        );
    });

    input.addEventListener("pointerup", () =>
    {
        dragging = false;
    });

    input.addEventListener("pointercancel", () =>
    {
        dragging = false;
    });

    input.addEventListener("lostpointercapture", () =>
    {
        dragging = false;
    });
}


/* ==========================================================
   OUVERTURE DE LA MODALE
========================================================== */

function openAudioSettings()
{
    audioPreviousFocus = document.activeElement;

    audioVoiceEnabled.checked =
        audioSettings.voiceEnabled;

    audioVoiceVolume.value =
        audioSettings.voiceVolume;

    audioVoiceRate.value =
        audioSettings.voiceRate;

    audioEffectsEnabled.checked =
        audioSettings.effectsEnabled;

    audioEffectsVolume.value =
        audioSettings.effectsVolume;

    updateAudioSettingsDisplay();

    audioModal.hidden = false;

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
            Number(audioVoiceRate.value),

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
                detail: { ...audioSettings }
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

    audioModal.addEventListener("click", event =>
    {
        if (event.target === audioModal)
        {
            closeAudioSettings();
        }
    });


    /* ======================================================
       ACCESSIBILITÉ CLAVIER
    ====================================================== */

    audioModal.addEventListener("keydown", event =>
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
    });


    /* ======================================================
       AFFICHAGE INITIAL
    ====================================================== */

    updateAudioSettingsDisplay();
}
