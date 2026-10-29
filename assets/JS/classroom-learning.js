
"use strict";

/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const classroomVerbTitle =
    document.getElementById("classroom-verb-title");

const classroomVerbTranslation =
    document.getElementById("classroom-verb-translation");

const classroomVerbInfinitive =
    document.getElementById("classroom-verb-infinitive");

const classroomVerbPreterite =
    document.getElementById("classroom-verb-preterite");

const classroomVerbParticiple =
    document.getElementById("classroom-verb-participle");

const classroomPreviousVerbButton =
    document.getElementById("classroom-previous-verb");

const classroomNextVerbButton =
    document.getElementById("classroom-next-verb");

const classroomVerbCounter =
    document.getElementById("classroom-verb-counter");

const classroomVerbForms =
    document.querySelector(".classroom-board__verb");

const classroomReviewButton =
    document.getElementById("classroom-review-button");

const classroomExitButton =
    document.getElementById("classroom-back-button");

const classroomVoiceExerciseButton =
    document.getElementById("classroom-exercise-button");

const classroomProfessorHotspot =
    document.getElementById("classroom-professor-hotspot");


/* ==========================================================
   ÉTAT
========================================================== */

let classroomAllVerbs = [];

let classroomVerbs = [];

let classroomVerbIndex = 0;

let classroomReviewMode = false;

let classroomBasilReading = false;

let classroomBasilReadingToken = 0;


/* ==========================================================
   ACCESSIBILITÉ VOCALE
========================================================== */

function speakClassroomAccessibleText(
    message,
    language = "fr-FR"
)
{
    if (
        !message ||
        !window.irregularAudio ||
        !window.irregularAudio.isVoiceEnabled() ||
        !("speechSynthesis" in window)
    )
    {
        return;
    }

    /* Ne pas interrompre l'introduction du professeur */

    if (
        typeof classroomIntroductionPlaying !== "undefined" &&
        classroomIntroductionPlaying
    )
    {
        return;
    }

    /* Ne pas interrompre la leçon de Basil */

    if (classroomBasilReading)
    {
        return;
    }

    try
    {
        const settings =
            window.irregularAudio.getSettings();

        const utterance =
            new SpeechSynthesisUtterance(
                String(message)
                    .replace(/\s*\/\s*/g, " ou ")
                    .trim()
            );

        utterance.lang = language;

        utterance.rate = 0.8;

        utterance.volume =
            settings.voiceVolume / 100;

        utterance.voice =
            getClassroomBasilVoice(language);

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(utterance);
    }
    catch (error)
    {
        console.error(
            "[AUDIO] Accessibilité du tableau :",
            error
        );
    }
}


/* ==========================================================
   SÉLECTION DES VOIX FRANÇAISE ET ANGLAISE
========================================================== */

function getClassroomBasilVoice(language)
{
    if (!("speechSynthesis" in window))
    {
        return null;
    }

    const voices =
        window.speechSynthesis.getVoices();

    if (language === "fr-FR")
    {
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

    return (
        voices.find(
            voice =>
                voice.lang.toLowerCase() === "en-gb"
        ) ||
        voices.find(
            voice =>
                voice.lang.toLowerCase().startsWith("en")
        ) ||
        null
    );
}


/* ==========================================================
   ANNONCE D'UN ÉLÉMENT
========================================================== */

function announceClassroomElement(
    element,
    language = "fr-FR",
    getMessage = null
)
{
    if (!element)
    {
        return;
    }

    const announce = () =>
    {
        if (
            element.disabled ||
            element.closest("[hidden]")
        )
        {
            return;
        }

        const message =
            typeof getMessage === "function"
                ? getMessage()
                : element.textContent.trim();

        speakClassroomAccessibleText(
            message,
            language
        );
    };

    element.addEventListener(
        "mouseenter",
        announce
    );

    element.addEventListener(
        "focus",
        announce
    );
}


/* ==========================================================
   ÉLÉMENTS ACCESSIBLES AU CLAVIER
========================================================== */

function makeClassroomTextFocusable(
    element,
    language
)
{
    if (!element)
    {
        return;
    }

    element.tabIndex = 0;

    element.lang = language;

    element.addEventListener(
        "focus",
        () =>
        {
            speakClassroomAccessibleText(
                element.textContent.trim(),
                language
            );
        }
    );
}


/* ==========================================================
   SURVOL DES TEXTES DU TABLEAU
========================================================== */

const classroomSpokenTextElements = [
    {
        element: classroomVerbTitle,
        language: "en-GB"
    },
    {
        element: classroomVerbTranslation,
        language: "fr-FR"
    },
    {
        element: classroomVerbInfinitive,
        language: "en-GB"
    },
    {
        element: classroomVerbPreterite,
        language: "en-GB"
    },
    {
        element: classroomVerbParticiple,
        language: "en-GB"
    }
];

let classroomLastHoveredText = null;


/* ==========================================================
   DÉTECTION DE LA POSITION DE LA SOURIS
========================================================== */

function handleClassroomTextMouseMove(event)
{
    const classroomScreen =
        document.getElementById("classroom-screen");

    if (
        !classroomScreen ||
        classroomScreen.hidden ||
        getComputedStyle(classroomScreen).display === "none"
    )
    {
        classroomLastHoveredText = null;

        return;
    }

    if (classroomBasilReading)
    {
        return;
    }

    const trainingActive =
        typeof classroomTrainingActive !== "undefined" &&
        classroomTrainingActive;

    let hoveredText = null;

    for (const item of classroomSpokenTextElements)
    {
        const element = item.element;

        if (
            !element ||
            !element.isConnected
        )
        {
            continue;
        }

        const rect =
            element.getBoundingClientRect();

        if (
            rect.width === 0 ||
            rect.height === 0
        )
        {
            continue;
        }

        if (
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom
        )
        {
            hoveredText = item;

            break;
        }
    }

    if (hoveredText === classroomLastHoveredText)
    {
        return;
    }

    classroomLastHoveredText = hoveredText;

    if (!hoveredText)
    {
        return;
    }

    const element =
        hoveredText.element;

    let language =
        hoveredText.language;

    if (
        trainingActive &&
        element === classroomVerbTitle
    )
    {
        language = "fr-FR";
    }

    speakClassroomAccessibleText(
        element.textContent.trim(),
        language
    );
}

document.addEventListener(
    "mousemove",
    handleClassroomTextMouseMove
);


/* ==========================================================
   ANNONCE DU COMPTEUR
========================================================== */

function getClassroomCounterAnnouncement()
{
    if (
        typeof classroomTrainingActive !== "undefined" &&
        classroomTrainingActive
    )
    {
        return classroomReviewMode
            ? "Retour aux verbes à revoir"
            : "Retour à l'apprentissage";
    }

    if (
        classroomVerbCounter &&
        classroomVerbCounter.textContent.trim() === "0 / 0"
    )
    {
        return "Aucun verbe à revoir";
    }

    if (classroomVerbs.length === 0)
    {
        return "Aucun verbe disponible";
    }

    return (
        `Verbe ${classroomVerbIndex + 1} ` +
        `sur ${classroomVerbs.length}`
    );
}


/* ==========================================================
   ACCESSIBILITÉ DU COMPTEUR
========================================================== */

function updateClassroomCounterAccessibility()
{
    if (!classroomVerbCounter)
    {
        return;
    }

    const trainingActive =
        typeof classroomTrainingActive !== "undefined" &&
        classroomTrainingActive;

    classroomVerbCounter.tabIndex = 0;

    classroomVerbCounter.lang = "fr-FR";

    classroomVerbCounter.setAttribute(
        "aria-label",
        getClassroomCounterAnnouncement()
    );

    if (trainingActive)
    {
        classroomVerbCounter.setAttribute(
            "role",
            "button"
        );
    }
    else
    {
        classroomVerbCounter.removeAttribute(
            "role"
        );
    }
}


/* ==========================================================
   CHARGEMENT DU JSON
========================================================== */

async function loadClassroomVerbs()
{
    try
    {
        const response =
            await fetch(
                "assets/data/irregular-verbs.json"
            );

        if (!response.ok)
        {
            throw new Error(
                "Impossible de charger les verbes."
            );
        }

        classroomAllVerbs =
            await response.json();

        if (
            !Array.isArray(classroomAllVerbs) ||
            classroomAllVerbs.length === 0
        )
        {
            throw new Error(
                "Aucun verbe disponible."
            );
        }

        classroomVerbs =
            [...classroomAllVerbs];

        classroomVerbIndex = 0;

        displayClassroomVerb();
    }
    catch (error)
    {
        console.error(
            "Erreur apprentissage :",
            error
        );
    }
}


/* ==========================================================
   NORMALISATION D'UN INFINITIF
========================================================== */

function normalizeClassroomInfinitive(
    infinitive
)
{
    return String(
        infinitive ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /^to\s+/,
            ""
        );
}


/* ==========================================================
   VERBES À REVOIR
========================================================== */

async function showClassroomReviewVerbs()
{
    stopClassroomBasilReading();

    if (classroomReviewMode)
    {
        classroomReviewMode = false;

        classroomVerbs =
            [...classroomAllVerbs];

        classroomVerbIndex = 0;

        classroomReviewButton.textContent =
            "Verbes à revoir";

        displayClassroomVerb();

        return;
    }

    try
    {
        classroomReviewButton.disabled = true;

        const errors =
            await getQuizErrors();

        const reviewInfinitives =
            new Set(
                errors.map(
                    error =>
                        normalizeClassroomInfinitive(
                            error.infinitif
                        )
                )
            );

        const reviewVerbs =
            classroomAllVerbs.filter(
                verb =>
                    reviewInfinitives.has(
                        normalizeClassroomInfinitive(
                            verb.infinitive
                        )
                    )
            );

        if (reviewVerbs.length === 0)
        {
            classroomVerbTitle.textContent =
                "AUCUN VERBE À REVOIR";

            classroomVerbTranslation.textContent =
                "Aucune erreur enregistrée";

            classroomVerbInfinitive.textContent = "";

            classroomVerbPreterite.textContent = "";

            classroomVerbParticiple.textContent = "";

            classroomVerbCounter.textContent =
                "0 / 0";

            updateClassroomCounterAccessibility();

            return;
        }

        classroomReviewMode = true;

        classroomVerbs = reviewVerbs;

        classroomVerbIndex = 0;

        classroomReviewButton.textContent =
            "Tous les verbes";

        displayClassroomVerb();
    }
    catch (error)
    {
        console.error(
            "Erreur verbes à revoir :",
            error
        );

        classroomVerbTitle.textContent =
            "ERREUR";

        classroomVerbTranslation.textContent =
            "Impossible de charger les verbes à revoir";
    }
    finally
    {
        classroomReviewButton.disabled = false;
    }
}


/* ==========================================================
   DÉTECTION DES FORMES LONGUES
========================================================== */

function hasLongVerbForms(verb)
{
    const infinitive =
        verb.infinitive.trim();

    const preterite =
        verb.preterite.trim();

    const pastParticiple =
        verb.pastParticiple.trim();

    return (
        infinitive.length > 12 ||
        preterite.length > 12 ||
        pastParticiple.length > 12 ||
        preterite.includes("/") ||
        pastParticiple.includes("/")
    );
}


/* ==========================================================
   AFFICHAGE DU VERBE
========================================================== */

function displayClassroomVerb()
{
    stopClassroomBasilReading();

    if (
        !classroomVerbTitle ||
        !classroomVerbTranslation ||
        !classroomVerbInfinitive ||
        !classroomVerbPreterite ||
        !classroomVerbParticiple ||
        !classroomVerbCounter ||
        !classroomVerbForms
    )
    {
        console.error(
            "Un élément du tableau d'apprentissage est absent du HTML."
        );

        return;
    }

    if (classroomVerbs.length === 0)
    {
        return;
    }

    const verb =
        classroomVerbs[classroomVerbIndex];

    classroomVerbTitle.textContent =
        `TO ${verb.infinitive.toUpperCase()}`;

    classroomVerbTranslation.textContent =
        verb.translation;

    classroomVerbInfinitive.textContent =
        verb.infinitive.toUpperCase();

    classroomVerbPreterite.textContent =
        verb.preterite.toUpperCase();

    classroomVerbParticiple.textContent =
        verb.pastParticiple.toUpperCase();

    classroomVerbCounter.textContent =
        `${classroomVerbIndex + 1} / ${classroomVerbs.length}`;

    classroomVerbForms.classList.toggle(
        "classroom-board__verb--column",
        hasLongVerbForms(verb)
    );

    updateClassroomCounterAccessibility();
}


/* ==========================================================
   VERBE PRÉCÉDENT
========================================================== */

function showPreviousClassroomVerb()
{
    if (classroomVerbs.length === 0)
    {
        return;
    }

    classroomVerbIndex--;

    if (classroomVerbIndex < 0)
    {
        classroomVerbIndex =
            classroomVerbs.length - 1;
    }

    displayClassroomVerb();
}


/* ==========================================================
   VERBE SUIVANT
========================================================== */

function showNextClassroomVerb()
{
    if (classroomVerbs.length === 0)
    {
        return;
    }

    classroomVerbIndex++;

    if (
        classroomVerbIndex >=
        classroomVerbs.length
    )
    {
        classroomVerbIndex = 0;
    }

    displayClassroomVerb();
}


/* ==========================================================
   ACCESSIBILITÉ DES BOUTONS
========================================================== */

announceClassroomElement(
    classroomPreviousVerbButton,
    "fr-FR"
);

announceClassroomElement(
    classroomNextVerbButton,
    "fr-FR"
);

announceClassroomElement(
    classroomReviewButton,
    "fr-FR"
);

announceClassroomElement(
    classroomExitButton,
    "fr-FR"
);

announceClassroomElement(
    classroomVoiceExerciseButton,
    "fr-FR"
);


/* ==========================================================
   ACCESSIBILITÉ DES TEXTES
========================================================== */

makeClassroomTextFocusable(
    classroomVerbTitle,
    "en-GB"
);

makeClassroomTextFocusable(
    classroomVerbInfinitive,
    "en-GB"
);

makeClassroomTextFocusable(
    classroomVerbPreterite,
    "en-GB"
);

makeClassroomTextFocusable(
    classroomVerbParticiple,
    "en-GB"
);

makeClassroomTextFocusable(
    classroomVerbTranslation,
    "fr-FR"
);


/* ==========================================================
   ACCESSIBILITÉ DU COMPTEUR
========================================================== */

if (classroomVerbCounter)
{
    classroomVerbCounter.tabIndex = 0;

    announceClassroomElement(
        classroomVerbCounter,
        "fr-FR",
        getClassroomCounterAnnouncement
    );

    classroomVerbCounter.addEventListener(
        "keydown",
        event =>
        {
            if (
                event.key !== "Enter" &&
                event.key !== " "
            )
            {
                return;
            }

            const trainingActive =
                typeof classroomTrainingActive !== "undefined" &&
                classroomTrainingActive;

            if (!trainingActive)
            {
                return;
            }

            event.preventDefault();

            classroomVerbCounter.click();

            updateClassroomCounterAccessibility();
        }
    );
}


/* ==========================================================
   ÉVÉNEMENTS DE NAVIGATION
========================================================== */

if (classroomPreviousVerbButton)
{
    classroomPreviousVerbButton.addEventListener(
        "click",
        showPreviousClassroomVerb
    );
}

if (classroomNextVerbButton)
{
    classroomNextVerbButton.addEventListener(
        "click",
        showNextClassroomVerb
    );
}

if (classroomReviewButton)
{
    classroomReviewButton.addEventListener(
        "click",
        showClassroomReviewVerbs
    );
}


/* ==========================================================
   PROFESSEUR BASIL : ARRÊT DE LA LECTURE
========================================================== */

function stopClassroomBasilReading()
{
    const wasReading =
        classroomBasilReading;

    classroomBasilReading = false;

    classroomBasilReadingToken++;

    if (
        wasReading &&
        "speechSynthesis" in window
    )
    {
        window.speechSynthesis.cancel();
    }
}


/* ==========================================================
   PROFESSEUR BASIL : LECTURE DU VERBE
========================================================== */

function readClassroomVerbWithBasil()
{
    if (
        !window.irregularAudio ||
        !window.irregularAudio.isVoiceEnabled() ||
        !("speechSynthesis" in window)
    )
    {
        return;
    }

    if (
        typeof classroomIntroductionPlaying !== "undefined" &&
        classroomIntroductionPlaying
    )
    {
        return;
    }

    if (
        typeof classroomTrainingActive !== "undefined" &&
        classroomTrainingActive
    )
    {
        return;
    }

    if (
        classroomVerbs.length === 0 ||
        !classroomVerbs[classroomVerbIndex]
    )
    {
        return;
    }

    if (
        classroomVerbCounter &&
        classroomVerbCounter.textContent.trim() === "0 / 0"
    )
    {
        return;
    }

    stopClassroomBasilReading();

    const verb =
        classroomVerbs[classroomVerbIndex];

    const translation =
        String(verb.translation ?? "")
            .replace(/\s*\/\s*/g, " ou ")
            .trim();

    const infinitive =
        String(verb.infinitive ?? "")
            .replace(/^to\s+/i, "")
            .trim();

    const preterite =
        String(verb.preterite ?? "")
            .replace(/\s*\/\s*/g, " or ")
            .trim();

    const participle =
        String(verb.pastParticiple ?? "")
            .replace(/\s*\/\s*/g, " or ")
            .trim();

    const parts = [
        {
            text: "Le verbe",
            lang: "fr-FR"
        },
        {
            text: `to ${infinitive}`,
            lang: "en-GB"
        },
        {
            text:
                `qui se traduit en français par ${translation}. ` +
                "L'infinitif est",
            lang: "fr-FR"
        },
        {
            text: infinitive,
            lang: "en-GB"
        },
        {
            text: "Le prétérit est",
            lang: "fr-FR"
        },
        {
            text: preterite,
            lang: "en-GB"
        },
        {
            text: "Et le participe passé est",
            lang: "fr-FR"
        },
        {
            text: participle,
            lang: "en-GB"
        }
    ];

    const settings =
        window.irregularAudio.getSettings();

    const volume =
        settings.voiceVolume / 100;

    const token =
        ++classroomBasilReadingToken;

    classroomBasilReading = true;

    let index = 0;

    const speakNext = () =>
    {
        if (
            !classroomBasilReading ||
            token !== classroomBasilReadingToken
        )
        {
            return;
        }

        if (index >= parts.length)
        {
            classroomBasilReading = false;

            return;
        }

        const part =
            parts[index++];

        const utterance =
            new SpeechSynthesisUtterance(
                part.text
            );

        utterance.lang =
            part.lang;

        utterance.voice =
            getClassroomBasilVoice(
                part.lang
            );

        utterance.rate = 0.8;

        utterance.volume = volume;

        utterance.onend = speakNext;

        utterance.onerror = () =>
        {
            if (token === classroomBasilReadingToken)
            {
                classroomBasilReading = false;
            }
        };

        window.speechSynthesis.speak(
            utterance
        );
    };

    window.speechSynthesis.cancel();

    speakNext();
}


/* ==========================================================
   PROFESSEUR BASIL : SURVOL, FOCUS ET CLIC
========================================================== */

if (classroomProfessorHotspot)
{
    announceClassroomElement(
        classroomProfessorHotspot,
        "fr-FR",
        () =>
            "Professeur Basil. " +
            "Cliquez ou appuyez sur Entrée " +
            "pour écouter le verbe affiché au tableau."
    );

    classroomProfessorHotspot.addEventListener(
        "click",
        readClassroomVerbWithBasil
    );
}


/* ==========================================================
   PROFESSEUR BASIL : TOUCHE ÉCHAP
========================================================== */

document.addEventListener(
    "keydown",
    event =>
    {
        if (
            event.key === "Escape" &&
            classroomBasilReading
        )
        {
            stopClassroomBasilReading();
        }
    }
);


/* ==========================================================
   PROFESSEUR BASIL : SORTIE ET CHANGEMENT DE MODE
========================================================== */

if (classroomExitButton)
{
    classroomExitButton.addEventListener(
        "click",
        stopClassroomBasilReading
    );
}

if (classroomVoiceExerciseButton)
{
    classroomVoiceExerciseButton.addEventListener(
        "click",
        stopClassroomBasilReading
    );
}
/* ==========================================================
   COMMANDES VOCALES : SUIVANT ET PRÉCÉDENT
========================================================== */

window.addEventListener(
    "classroom-voice-command",
    function(event)
    {
        const transcript =
            String(event.detail?.transcript ?? "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[.,!?;:]/g, "")
                .trim();

        const classroomScreen =
            document.getElementById("classroom-screen");

        if (
            !classroomScreen ||
            classroomScreen.hidden ||
            window.getComputedStyle(classroomScreen).display === "none"
        )
        {
            return;
        }

        switch (transcript)
        {
            case "suivant":

                showNextClassroomVerb();

                readClassroomVerbWithBasil();

                break;

            case "precedent":

                showPreviousClassroomVerb();

                readClassroomVerbWithBasil();

                break;
           
            case "repete":

                readClassroomVerbWithBasil();

                break;
             
            case "arrete":

                console.log("Commande ARRÊTE exécutée");

                stopClassroomBasilReading();

                break;
        }
    }
);

/* ==========================================================
   INITIALISATION
========================================================== */

loadClassroomVerbs();
