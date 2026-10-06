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
   DEMANDE DE RÉINITIALISATION DU MOT DE PASSE
========================================================== */

async function requestPasswordReset(
    email
)
{
    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/auth/mot-de-passe-oublie`,
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
                                email
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "PASSWORD_RESET_REQUEST_ERROR"
        );
    }


    return data;
}
/* ==========================================================
   VÉRIFICATION DU TOKEN DE RÉINITIALISATION
========================================================== */

async function verifyPasswordResetToken(
    token
)
{
    let response;

    try
    {
        response =
            await fetch(
                `${API_URL}/auth/verifier-token-reinitialisation`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            token:
                                token
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


    let data = {};

    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (
        response.status === 400
    )
    {
        throw new Error(
            "INVALID_RESET_TOKEN"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "TOKEN_VERIFICATION_ERROR"
        );
    }


    return data;
}
/* ==========================================================
   RÉINITIALISATION DU MOT DE PASSE
========================================================== */

async function resetUserPassword(
    token,
    password
)
{
    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/auth/reinitialiser-mot-de-passe`,
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            token:
                                token,

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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "PASSWORD_RESET_ERROR"
        );
    }


    return data;
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

/* ==========================================================
   CRÉATION D'UN PROFESSEUR PAR L'ADMINISTRATEUR
========================================================== */

async function createAdminTeacher(
    nom,
    prenom,
    email,
    motDePasse
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "Accès réservé aux administrateurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/professeurs`,
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


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "Impossible de créer le professeur."
        );
    }


    return data;
}


/* ==========================================================
   RÉCUPÉRATION DES PROFESSEURS PAR L'ADMINISTRATEUR
========================================================== */

async function getAdminTeachers()
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "Accès réservé aux administrateurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/professeurs`,
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


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de récupérer les professeurs."
        );
    }


    return await response.json();
}
/* ==========================================================
   RÉCUPÉRATION DE TOUS LES ÉLÈVES
   PAR L'ADMINISTRATEUR
========================================================== */

async function getAdminStudents()
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "Accès réservé aux administrateurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/eleves`,
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


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
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
   RÉCUPÉRATION DES ÉLÈVES D'UN PROFESSEUR
   PAR L'ADMINISTRATEUR
========================================================== */

async function getAdminTeacherStudents(
    teacherId
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "Accès réservé aux administrateurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/professeurs/${teacherId}/eleves`,
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


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
        );
    }


    if (
        response.status === 404
    )
    {
        throw new Error(
            "TEACHER_NOT_FOUND"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de récupérer les élèves du professeur."
        );
    }


    return await response.json();
}


/* ==========================================================
   SUPPRESSION D'UN PROFESSEUR PAR L'ADMINISTRATEUR
========================================================== */

async function deleteAdminTeacher(
    teacherId
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/professeurs/${teacherId}`,
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
        );
    }


    if (
        response.status === 404
    )
    {
        throw new Error(
            "TEACHER_NOT_FOUND"
        );
    }


    if (
        response.status === 409
    )
    {
        throw new Error(
            "TEACHER_HAS_STUDENTS"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "DELETE_TEACHER_ERROR"
        );
    }


    return data;
}

/* ==========================================================
   RÉCUPÉRATION DE L'ARCHIVE D'UN ÉLÈVE
   PAR L'ADMINISTRATEUR
========================================================== */

async function getAdminStudentArchive(
    studentId
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/eleves/${studentId}/archive`,
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


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
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
            "STUDENT_ARCHIVE_ERROR"
        );
    }


    return await response.json();
}
/* ==========================================================
   MODIFICATION D'UN ÉLÈVE
   PAR L'ADMINISTRATEUR
========================================================== */

async function updateAdminStudent(
    studentId,
    nom,
    prenom,
    email
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/eleves/${studentId}`,
                {
                    method:
                        "PUT",

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
                                email
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
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


    if (
        response.status === 409
    )
    {
        throw new Error(
            "EMAIL_ALREADY_USED"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "UPDATE_STUDENT_ERROR"
        );
    }


    return data;
}
/* ==========================================================
   MODIFICATION D'UN PROFESSEUR
   PAR L'ADMINISTRATEUR
========================================================== */

async function updateAdminTeacher(
    teacherId,
    nom,
    prenom,
    email
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/professeurs/${teacherId}`,
                {
                    method:
                        "PUT",

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
                                email
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
        );
    }


    if (
        response.status === 404
    )
    {
        throw new Error(
            "TEACHER_NOT_FOUND"
        );
    }


    if (
        response.status === 409
    )
    {
        throw new Error(
            "EMAIL_ALREADY_USED"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "UPDATE_TEACHER_ERROR"
        );
    }


    return data;
}

/* ==========================================================
   SUPPRESSION D'UN ÉLÈVE
   PAR L'ADMINISTRATEUR
========================================================== */

async function deleteAdminStudent(
    studentId
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/eleves/${studentId}`,
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (
        response.status === 401
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
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
            data.error ||
            "DELETE_STUDENT_ERROR"
        );
    }


    return data;
}


/* ==========================================================
   TRANSFERT D'UN ÉLÈVE PAR L'ADMINISTRATEUR
========================================================== */

async function transferAdminStudent(
    studentId,
    newTeacherId
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "Accès réservé aux administrateurs."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/eleves/${studentId}/transfert`,
                {
                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiToken}`
                    },

                    body:
                        JSON.stringify({
                            nouveau_professeur_id:
                                Number(newTeacherId)
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
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
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
            "Impossible de transférer l'élève."
        );
    }


    return await response.json();
}


/* ==========================================================
   TRANSFERT COMPLET D'UNE CLASSE PAR L'ADMINISTRATEUR
========================================================== */

async function transferAdminClass(
    oldTeacherId,
    newTeacherId
)
{
    if (
        !apiToken ||
        currentRole !== "administrateur"
    )
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/administrateur/professeurs/transfert-classe`,
                {
                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiToken}`
                    },

                    body:
                        JSON.stringify({
                            ancien_professeur_id:
                                Number(oldTeacherId),

                            nouveau_professeur_id:
                                Number(newTeacherId)
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
            "UNAUTHORIZED"
        );
    }


    if (
        response.status === 403
    )
    {
        throw new Error(
            "FORBIDDEN"
        );
    }


    if (
        response.status === 404
    )
    {
        throw new Error(
            "TEACHER_NOT_FOUND"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "TRANSFER_CLASS_ERROR"
        );
    }


    return await response.json();
}
/* ==========================================================
   RÉCUPÉRATION DES DESTINATAIRES DE LA MESSAGERIE
========================================================== */

async function getMessageRecipients()
{
    if (!apiToken)
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/messages/destinataires`,
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
            "Impossible de récupérer les destinataires."
        );
    }


    return await response.json();
}


/* ==========================================================
   RÉCUPÉRATION DES MESSAGES REÇUS
========================================================== */

async function getReceivedMessages()
{
    if (!apiToken)
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/messages/recus`,
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
            "Impossible de récupérer les messages reçus."
        );
    }


    return await response.json();
}


/* ==========================================================
   RÉCUPÉRATION DES MESSAGES ENVOYÉS
========================================================== */

async function getSentMessages()
{
    if (!apiToken)
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/messages/envoyes`,
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
            "Impossible de récupérer les messages envoyés."
        );
    }


    return await response.json();
}


/* ==========================================================
   ENVOI D'UN MESSAGE
========================================================== */

async function sendMessage(
    recipientType,
    recipientId,
    subject,
    content
)
{
    if (!apiToken)
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/messages`,
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
                            destinataire_type:
                                recipientType,

                            destinataire_id:
                                Number(recipientId),

                            objet:
                                subject,

                            contenu:
                                content
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "Impossible d'envoyer le message."
        );
    }


    return data;
}


/* ==========================================================
   MARQUER UN MESSAGE COMME LU
========================================================== */

async function markMessageAsRead(
    messageId
)
{
    if (!apiToken)
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/messages/${messageId}/lu`,
                {
                    method:
                        "PUT",

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
            "Impossible de marquer le message comme lu."
        );
    }


    return await response.json();
}
/* ==========================================================
   SUPPRESSION DE MESSAGES REÇUS
========================================================== */

async function deleteReceivedMessages(
    messageIds
)
{
    if (!apiToken)
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/messages/recus`,
                {
                    method:
                        "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiToken}`
                    },

                    body:
                        JSON.stringify({
                            ids:
                                messageIds
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "Impossible de supprimer les messages."
        );
    }


    return data;
}
/* ==========================================================
   SUPPRESSION DE MESSAGES ENVOYÉS
========================================================== */

async function deleteSentMessages(
    messageIds
)
{
    if (!apiToken)
    {
        throw new Error(
            "UNAUTHORIZED"
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/messages/envoyes`,
                {
                    method:
                        "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${apiToken}`
                    },

                    body:
                        JSON.stringify({
                            ids:
                                messageIds
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


    let data = {};


    try
    {
        data =
            await response.json();
    }
    catch (error)
    {
        data = {};
    }


    if (!response.ok)
    {
        throw new Error(
            data.error ||
            "Impossible de supprimer les messages envoyés."
        );
    }


    return data;
}