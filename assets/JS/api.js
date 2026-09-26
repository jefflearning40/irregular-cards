"use strict";


/* ==========================================================
   CONFIGURATION API
========================================================== */

const API_URL =
    "http://localhost:3000/api";


/* ==========================================================
   AUTHENTIFICATION
========================================================== */

let apiToken =
    null;

let currentUser =
    null;

let currentRole =
    null;


/* ==========================================================
   COMPATIBILITÉ ÉLÈVE
========================================================== */

let currentStudent =
    null;


/* ==========================================================
   DÉCONNEXION
========================================================== */

function logoutUser()
{
    apiToken =
        null;

    currentUser =
        null;

    currentRole =
        null;

    currentStudent =
        null;
}


/* ==========================================================
   COMPATIBILITÉ ANCIENNE DÉCONNEXION
========================================================== */

function logoutStudent()
{
    logoutUser();
}


/* ==========================================================
   CONNEXION
========================================================== */

async function loginUser(
    email,
    password
)
{
    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/auth/login`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            email:
                                email,

                            mot_de_passe:
                                password
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


    if (
        response.status === 401
    )
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

    currentRole =
        data.role;

    currentUser =
        data.utilisateur;


    if (
        currentRole ===
        "eleve"
    )
    {
        currentStudent =
            currentUser;
    }
    else
    {
        currentStudent =
            null;
    }


    return {
        role:
            currentRole,

        utilisateur:
            currentUser
    };
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
    if (
        !apiToken ||
        currentRole !== "eleve"
    )
    {
        throw new Error(
            "Accès réservé aux élèves."
        );
    }


    const response =
        await fetch(
            `${API_URL}/sessions-quiz`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiToken}`
                },

                body:
                    JSON.stringify({
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
    if (
        !apiToken ||
        currentRole !== "eleve"
    )
    {
        throw new Error(
            "Accès réservé aux élèves."
        );
    }


    const response =
        await fetch(
            `${API_URL}/erreurs-quiz`,
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiToken}`
                },

                body:
                    JSON.stringify({
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
    for (
        const error of errors
    )
    {
        await createQuizError(
            sessionId,
            error
        );
    }
}


/* ==========================================================
   RÉCUPÉRATION DES ERREURS DE L'ÉLÈVE
========================================================== */

async function getQuizErrors()
{
    if (
        !apiToken ||
        currentRole !== "eleve"
    )
    {
        throw new Error(
            "Accès réservé aux élèves."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/erreurs-quiz`,
                {
                    method:
                        "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${apiToken}`
                    }
                }
            );
    }
    catch (error)
    {
        throw new Error(
            "SERVER_UNAVAILABLE"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de récupérer les erreurs du quiz."
        );
    }


    return await response.json();
}
/* ==========================================================
   RÉCUPÉRATION DES ÉLÈVES DU PROFESSEUR
========================================================== */

async function getTeacherStudents()
{
    if (
        !apiToken ||
        currentRole !== "professeur"
    )
    {
        throw new Error(
            "Accès réservé aux professeurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/eleves`,
                {
                    method:
                        "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${apiToken}`
                    }
                }
            );
    }
    catch (error)
    {
        throw new Error(
            "SERVER_UNAVAILABLE"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de récupérer les élèves."
        );
    }


    return await response.json();
}
/* ==========================================================
   RÉCUPÉRATION DES STATISTIQUES DU PROFESSEUR
========================================================== */

async function getTeacherStatistics()
{
    if (
        !apiToken ||
        currentRole !== "professeur"
    )
    {
        throw new Error(
            "Accès réservé aux professeurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/statistiques/professeur`,
                {
                    method:
                        "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${apiToken}`
                    }
                }
            );
    }
    catch (error)
    {
        throw new Error(
            "SERVER_UNAVAILABLE"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de récupérer les statistiques du professeur."
        );
    }


    return await response.json();
}
/* ==========================================================
   RÉCUPÉRATION DES STATISTIQUES D'UN ÉLÈVE
   PAR SON PROFESSEUR
========================================================== */

async function getTeacherStudentStatistics(
    studentId
)
{
    if (
        !apiToken ||
        currentRole !== "professeur"
    )
    {
        throw new Error(
            "Accès réservé aux professeurs."
        );
    }


    if (
        !Number.isInteger(
            Number(studentId)
        ) ||
        Number(studentId) <= 0
    )
    {
        throw new Error(
            "Identifiant élève invalide."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/statistiques/professeur/eleve/${studentId}`,
                {
                    method:
                        "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${apiToken}`
                    }
                }
            );
    }
    catch (error)
    {
        throw new Error(
            "SERVER_UNAVAILABLE"
        );
    }


    if (response.status === 404)
    {
        throw new Error(
            "STUDENT_NOT_FOUND"
        );
    }


    if (response.status === 403)
    {
        throw new Error(
            "FORBIDDEN"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de récupérer les statistiques de l'élève."
        );
    }


    return await response.json();
}
/* ==========================================================
   CRÉATION D'UN ÉLÈVE PAR LE PROFESSEUR
========================================================== */

async function createTeacherStudent(
    nom,
    prenom,
    email,
    motDePasse
)
{
    if (
        !apiToken ||
        currentRole !== "professeur"
    )
    {
        throw new Error(
            "Accès réservé aux professeurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/eleves`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiToken}`
                    },

                    body:
                        JSON.stringify({
                            nom:
                                nom,

                            prenom:
                                prenom,

                            email:
                                email,

                            mot_de_passe:
                                motDePasse
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


    const data =
        await response.json();


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "Impossible de créer l'élève."
        );
    }


    return data;
}
/* ==========================================================
   SUPPRESSION D'UN ÉLÈVE PAR LE PROFESSEUR
========================================================== */

async function deleteTeacherStudent(
    studentId
)
{
    if (
        !apiToken ||
        currentRole !== "professeur"
    )
    {
        throw new Error(
            "Accès réservé aux professeurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/eleves/${studentId}`,
                {
                    method:
                        "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${apiToken}`
                    }
                }
            );
    }
    catch (error)
    {
        throw new Error(
            "SERVER_UNAVAILABLE"
        );
    }


    if (
        response.status === 404
    )
    {
        throw new Error(
            "STUDENT_NOT_FOUND"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de supprimer l'élève."
        );
    }


    return await response.json();
}
