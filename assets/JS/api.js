"use strict";


/* ==========================================================
   CONFIGURATION API
========================================================== */

const API_URL =
    "http://localhost:3000/api";


/* ==========================================================
   TOKEN
========================================================== */

let apiToken = null;

/* ==========================================================
   DÉCONNEXION
========================================================== */

function logoutStudent()
{
    apiToken =
        null;
}


/* ==========================================================
   CONNEXION ÉLÈVE
========================================================== */

async function loginStudent(
    email,
    password
)
{
    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/auth/eleve/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        mot_de_passe: password
                    })
                }
            );
    }
    catch (error)
    {
        throw new Error(
            "SERVER_UNAVAILABLE"
        );
    }


    if (response.status === 401)
    {
        throw new Error(
            "INVALID_CREDENTIALS"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "LOGIN_ERROR"
        );
    }


    const data =
        await response.json();


    apiToken =
        data.token;


    return data.eleve;
}


/* ==========================================================
   CRÉATION D'UNE SESSION DE QUIZ
========================================================== */

async function createQuizSession(
    difficulty,
    quizType,
    score,
    questionCount,
    duration
)
{
    if (!apiToken)
    {
        throw new Error(
            "Aucun élève connecté."
        );
    }


    const response =
        await fetch(
            `${API_URL}/sessions-quiz`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiToken}`
                },

                body: JSON.stringify({
                    difficulte:
                        difficulty,

                    type_quiz:
                        quizType,

                    score:
                        score,

                    nombre_questions:
                        questionCount,

                    duree:
                        duration
                })
            }
        );


    if (!response.ok)
    {
        throw new Error(
            "Impossible d'enregistrer la session de quiz."
        );
    }


    return await response.json();
}


/* ==========================================================
   ENREGISTREMENT D'UNE ERREUR DE QUIZ
========================================================== */

async function createQuizError(
    sessionId,
    error
)
{
    if (!apiToken)
    {
        throw new Error(
            "Aucun élève connecté."
        );
    }


    const response =
        await fetch(
            `${API_URL}/erreurs-quiz`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiToken}`
                },

                body: JSON.stringify({
                    session_quiz_id:
                        sessionId,

                    infinitif:
                        error.verb,

                    reponse_attendue:
                        error.correctAnswer,

                    reponse_eleve:
                        error.answer
                })
            }
        );


    if (!response.ok)
    {
        throw new Error(
            "Impossible d'enregistrer l'erreur du quiz."
        );
    }


    return await response.json();
}


/* ==========================================================
   ENREGISTREMENT DES ERREURS DU QUIZ
========================================================== */

async function createQuizErrors(
    sessionId,
    errors
)
{
    for (const error of errors)
    {
        await createQuizError(
            sessionId,
            error
        );
    }
}