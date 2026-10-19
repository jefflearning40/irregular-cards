
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
        const saved =
            JSON.parse(
                localStorage.getItem(
                    AUDIO_SETTINGS_KEY
                )
            );


        if (
            !saved ||
            typeof saved !== "object"
        )
        {
            return {
                ...AUDIO_DEFAULT_SETTINGS
            };
        }


        return {
            ...AUDIO_DEFAULT_SETTINGS,
            ...saved
        };
    }
    catch
    {
        return {
            ...AUDIO_DEFAULT_SETTINGS
        };
    }
}


let audioSettings =
    loadAudioSettings();


/* ==========================================================
   API AUDIO COMMUNE
========================================================== */

window.irregularAudio = {

    /* ======================================================
       LECTURE DES RÉGLAGES
    ====================================================== */

    getSettings()
    {
        return {
            ...audioSettings
        };
    },


    /* ======================================================
       ASSISTANCE VOCALE ACTIVÉE ?
    ====================================================== */

    isVoiceEnabled()
    {
        return audioSettings.voiceEnabled;
    },


    /* ======================================================
       EFFETS SONORES ACTIVÉS ?
    ====================================================== */

    isEffectsEnabled()
    {
        return audioSettings.effectsEnabled;
    },


    /* ======================================================
       VOLUME DES EFFETS SONORES
    ====================================================== */

    getEffectsVolume()
    {
        if (
            !audioSettings.effectsEnabled
        )
        {
            return 0;
        }


        return (
            audioSettings.effectsVolume / 100
        );
    },


    /* ======================================================
       PRONONCIATION VOCALE
    ====================================================== */

    speak(
        text,
        lang = "fr-FR"
    )
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
            new SpeechSynthesisUtterance(
                text
            );


        utterance.lang =
            lang;


        utterance.volume =
            audioSettings.voiceVolume / 100;


        utterance.rate =
            audioSettings.voiceRate;


        window.speechSynthesis.speak(
            utterance
        );
    },


    /* ======================================================
       LECTURE D'UN EFFET SONORE
    ====================================================== */

    playEffect(
        audioElement
    )
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


        audioElement.currentTime =
            0;


        audioElement.play().catch(
            () => {}
        );
    }

};


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const audioOpenButton =
    document.getElementById(
        "audio-settings-button"
    );


const audioModal =
    document.getElementById(
        "audio-settings-modal"
    );


const audioDialog =
    audioModal?.querySelector(
        ".audio-settings-dialog"
    );


const audioCloseButton =
    document.getElementById(
        "audio-settings-close"
    );


const audioSaveButton =
    document.getElementById(
        "audio-settings-save"
    );


const audioVoiceEnabled =
    document.getElementById(
        "audio-voice-enabled"
    );


const audioVoiceVolume =
    document.getElementById(
        "audio-voice-volume"
    );


const audioVoiceRate =
    document.getElementById(
        "audio-voice-rate"
    );


const audioEffectsEnabled =
    document.getElementById(
        "audio-effects-enabled"
    );


const audioEffectsVolume =
    document.getElementById(
        "audio-effects-volume"
    );


const audioVoiceVolumeValue =
    document.getElementById(
        "audio-voice-volume-value"
    );


const audioVoiceRateValue =
    document.getElementById(
        "audio-voice-rate-value"
    );


const audioEffectsVolumeValue =
    document.getElementById(
        "audio-effects-volume-value"
    );


let audioPreviousFocus =
    null;


/* ==========================================================
   AFFICHAGE DES VALEURS
========================================================== */

function updateAudioSettingsDisplay()
{
    audioVoiceVolumeValue.textContent =
        `${audioVoiceVolume.value} %`;


    audioVoiceRateValue.textContent =
        `${Number(
            audioVoiceRate.value
        ).toFixed(1)}×`;


    audioEffectsVolumeValue.textContent =
        `${audioEffectsVolume.value} %`;


    audioVoiceVolume.disabled =
        !audioVoiceEnabled.checked;


    audioVoiceRate.disabled =
        !audioVoiceEnabled.checked;


    audioEffectsVolume.disabled =
        !audioEffectsEnabled.checked;
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
        audioSettings.voiceRate;


    audioEffectsEnabled.checked =
        audioSettings.effectsEnabled;


    audioEffectsVolume.value =
        audioSettings.effectsVolume;


    updateAudioSettingsDisplay();


    audioModal.hidden =
        false;


    audioCloseButton.focus();
}


/* ==========================================================
   FERMETURE DE LA MODALE
========================================================== */

function closeAudioSettings()
{
    audioModal.hidden =
        true;


    if (
        audioPreviousFocus &&
        typeof audioPreviousFocus.focus ===
        "function"
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
            Number(
                audioVoiceVolume.value
            ),

        voiceRate:
            Number(
                audioVoiceRate.value
            ),

        effectsEnabled:
            audioEffectsEnabled.checked,

        effectsVolume:
            Number(
                audioEffectsVolume.value
            )
    };


    try
    {
        localStorage.setItem(
            AUDIO_SETTINGS_KEY,
            JSON.stringify(
                audioSettings
            )
        );
    }
    catch
    {
        // Les préférences restent actives
        // pendant la visite en cours.
    }


    /* ======================================================
       ARRÊT DE LA VOIX SI DÉSACTIVÉE
    ====================================================== */

    if (
        !audioSettings.voiceEnabled &&
        "speechSynthesis" in window
    )
    {
        window.speechSynthesis.cancel();
    }


    /* ======================================================
       NOTIFICATION AUX AUTRES MODULES
    ====================================================== */

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
   ÉVÉNEMENTS
========================================================== */

if (
    audioOpenButton &&
    audioModal &&
    audioDialog &&
    audioCloseButton &&
    audioSaveButton
)
{

    /* ======================================================
       OUVRIR
    ====================================================== */

    audioOpenButton.addEventListener(
        "click",
        openAudioSettings
    );


    /* ======================================================
       FERMER
    ====================================================== */

    audioCloseButton.addEventListener(
        "click",
        closeAudioSettings
    );


    /* ======================================================
       ENREGISTRER
    ====================================================== */

    audioSaveButton.addEventListener(
        "click",
        saveAudioSettings
    );


    /* ======================================================
       ACTUALISER LES VALEURS
    ====================================================== */

    [
        audioVoiceEnabled,
        audioVoiceVolume,
        audioVoiceRate,
        audioEffectsEnabled,
        audioEffectsVolume
    ].forEach(
        element =>
        {
            element.addEventListener(
                "input",
                updateAudioSettingsDisplay
            );
        }
    );


    /* ======================================================
       FERMER EN CLIQUANT SUR LE FOND
    ====================================================== */

    audioModal.addEventListener(
        "click",
        event =>
        {
            if (
                event.target === audioModal
            )
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
            if (
                event.key === "Escape"
            )
            {
                event.preventDefault();

                closeAudioSettings();

                return;
            }


            if (
                event.key !== "Tab"
            )
            {
                return;
            }


            const focusable = [
                ...audioDialog.querySelectorAll(
                    'button:not([disabled]), input:not([disabled])'
                )
            ];


            const first =
                focusable[0];


            const last =
                focusable[
                    focusable.length - 1
                ];


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

}
