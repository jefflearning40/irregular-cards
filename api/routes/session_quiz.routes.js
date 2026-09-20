"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const {
    verifyToken
} = require("../middleware/auth.middleware");

const database = require("../database");


/* ==========================================================
   ROUTER
========================================================== */

const router = express.Router();


/* ==========================================================
   LISTE DES SESSIONS DE QUIZ
========================================================== */

router.get(
    "/",
    verifyToken,
    (request, response) =>
    {
        const userId =
            request.user.id;

        const role =
            request.user.role;


        if (role === "professeur")
        {
            database.query(
                `
                    SELECT
                        session_quiz.id,
                        session_quiz.eleve_id,
                        session_quiz.date_session,
                        session_quiz.difficulte,
                        session_quiz.type_quiz,
                        session_quiz.score,
                        session_quiz.nombre_questions,
                        session_quiz.duree

                    FROM session_quiz

                    INNER JOIN eleve
                        ON eleve.id =
                            session_quiz.eleve_id

                    WHERE eleve.professeur_id = ?

                    ORDER BY
                        session_quiz.date_session DESC
                `,
                [userId],
                (error, results) =>
                {
                    if (error)
                    {
                        console.error(error);

                        response.status(500).json({
                            error: "Erreur serveur"
                        });

                        return;
                    }

                    response.json(results);
                }
            );

            return;
        }


        if (role === "eleve")
        {
            database.query(
                `
                    SELECT
                        id,
                        eleve_id,
                        date_session,
                        difficulte,
                        type_quiz,
                        score,
                        nombre_questions,
                        duree

                    FROM session_quiz

                    WHERE eleve_id = ?

                    ORDER BY date_session DESC
                `,
                [userId],
                (error, results) =>
                {
                    if (error)
                    {
                        console.error(error);

                        response.status(500).json({
                            error: "Erreur serveur"
                        });

                        return;
                    }

                    response.json(results);
                }
            );

            return;
        }


        response.status(403).json({
            error: "Accès interdit"
        });
    }
);


/* ==========================================================
   AFFICHER UNE SESSION DE QUIZ
========================================================== */

router.get(
    "/:id",
    verifyToken,
    (request, response) =>
    {
        const id =
            request.params.id;

        const userId =
            request.user.id;

        const role =
            request.user.role;


        if (role === "professeur")
        {
            database.query(
                `
                    SELECT
                        session_quiz.id,
                        session_quiz.eleve_id,
                        session_quiz.date_session,
                        session_quiz.difficulte,
                        session_quiz.type_quiz,
                        session_quiz.score,
                        session_quiz.nombre_questions,
                        session_quiz.duree

                    FROM session_quiz

                    INNER JOIN eleve
                        ON eleve.id =
                            session_quiz.eleve_id

                    WHERE session_quiz.id = ?
                    AND eleve.professeur_id = ?
                `,
                [
                    id,
                    userId
                ],
                (error, results) =>
                {
                    if (error)
                    {
                        console.error(error);

                        response.status(500).json({
                            error: "Erreur serveur"
                        });

                        return;
                    }

                    if (results.length === 0)
                    {
                        response.status(404).json({
                            error: "Session de quiz introuvable"
                        });

                        return;
                    }

                    response.json(
                        results[0]
                    );
                }
            );

            return;
        }


        if (role === "eleve")
        {
            database.query(
                `
                    SELECT
                        id,
                        eleve_id,
                        date_session,
                        difficulte,
                        type_quiz,
                        score,
                        nombre_questions,
                        duree

                    FROM session_quiz

                    WHERE id = ?
                    AND eleve_id = ?
                `,
                [
                    id,
                    userId
                ],
                (error, results) =>
                {
                    if (error)
                    {
                        console.error(error);

                        response.status(500).json({
                            error: "Erreur serveur"
                        });

                        return;
                    }

                    if (results.length === 0)
                    {
                        response.status(404).json({
                            error: "Session de quiz introuvable"
                        });

                        return;
                    }

                    response.json(
                        results[0]
                    );
                }
            );

            return;
        }


        response.status(403).json({
            error: "Accès interdit"
        });
    }
);


/* ==========================================================
   CRÉATION D'UNE SESSION DE QUIZ
========================================================== */

router.post(
    "/",
    verifyToken,
    (request, response) =>
    {
        const userId =
            request.user.id;

        const role =
            request.user.role;

        const {
            eleve_id,
            difficulte,
            type_quiz,
            score,
            nombre_questions,
            duree
        } = request.body;


        if (
            !difficulte ||
            !type_quiz ||
            nombre_questions === undefined
        )
        {
            response.status(400).json({
                error: "Champs obligatoires manquants"
            });

            return;
        }


        if (role === "eleve")
        {
            createSession(
                userId,
                difficulte,
                type_quiz,
                score,
                nombre_questions,
                duree,
                response
            );

            return;
        }


        if (role === "professeur")
        {
            if (!eleve_id)
            {
                response.status(400).json({
                    error: "Élève obligatoire"
                });

                return;
            }


            database.query(
                `
                    SELECT id

                    FROM eleve

                    WHERE id = ?
                    AND professeur_id = ?
                `,
                [
                    eleve_id,
                    userId
                ],
                (error, results) =>
                {
                    if (error)
                    {
                        console.error(error);

                        response.status(500).json({
                            error: "Erreur serveur"
                        });

                        return;
                    }

                    if (results.length === 0)
                    {
                        response.status(404).json({
                            error: "Élève introuvable"
                        });

                        return;
                    }

                    createSession(
                        eleve_id,
                        difficulte,
                        type_quiz,
                        score,
                        nombre_questions,
                        duree,
                        response
                    );
                }
            );

            return;
        }


        response.status(403).json({
            error: "Accès interdit"
        });
    }
);


/* ==========================================================
   MODIFICATION D'UNE SESSION DE QUIZ
========================================================== */

router.put(
    "/:id",
    verifyToken,
    (request, response) =>
    {
        const id =
            request.params.id;

        const userId =
            request.user.id;

        const role =
            request.user.role;

        const {
            difficulte,
            type_quiz,
            score,
            nombre_questions,
            duree
        } = request.body;


        if (
            !difficulte ||
            !type_quiz ||
            score === undefined ||
            nombre_questions === undefined
        )
        {
            response.status(400).json({
                error: "Champs obligatoires manquants"
            });

            return;
        }


        if (role === "eleve")
        {
            database.query(
                `
                    UPDATE session_quiz

                    SET
                        difficulte = ?,
                        type_quiz = ?,
                        score = ?,
                        nombre_questions = ?,
                        duree = ?

                    WHERE id = ?
                    AND eleve_id = ?
                `,
                [
                    difficulte,
                    type_quiz,
                    score,
                    nombre_questions,
                    duree ?? null,
                    id,
                    userId
                ],
                (error, result) =>
                {
                    handleUpdate(
                        error,
                        result,
                        id,
                        difficulte,
                        type_quiz,
                        score,
                        nombre_questions,
                        duree,
                        response
                    );
                }
            );

            return;
        }


        if (role === "professeur")
        {
            database.query(
                `
                    UPDATE session_quiz

                    INNER JOIN eleve
                        ON eleve.id =
                            session_quiz.eleve_id

                    SET
                        session_quiz.difficulte = ?,
                        session_quiz.type_quiz = ?,
                        session_quiz.score = ?,
                        session_quiz.nombre_questions = ?,
                        session_quiz.duree = ?

                    WHERE session_quiz.id = ?
                    AND eleve.professeur_id = ?
                `,
                [
                    difficulte,
                    type_quiz,
                    score,
                    nombre_questions,
                    duree ?? null,
                    id,
                    userId
                ],
                (error, result) =>
                {
                    handleUpdate(
                        error,
                        result,
                        id,
                        difficulte,
                        type_quiz,
                        score,
                        nombre_questions,
                        duree,
                        response
                    );
                }
            );

            return;
        }


        response.status(403).json({
            error: "Accès interdit"
        });
    }
);


/* ==========================================================
   SUPPRESSION D'UNE SESSION DE QUIZ
========================================================== */

router.delete(
    "/:id",
    verifyToken,
    (request, response) =>
    {
        const id =
            request.params.id;

        const userId =
            request.user.id;

        const role =
            request.user.role;


        if (role === "eleve")
        {
            database.query(
                `
                    DELETE FROM session_quiz

                    WHERE id = ?
                    AND eleve_id = ?
                `,
                [
                    id,
                    userId
                ],
                (error, result) =>
                {
                    handleDelete(
                        error,
                        result,
                        response
                    );
                }
            );

            return;
        }


        if (role === "professeur")
        {
            database.query(
                `
                    DELETE session_quiz

                    FROM session_quiz

                    INNER JOIN eleve
                        ON eleve.id =
                            session_quiz.eleve_id

                    WHERE session_quiz.id = ?
                    AND eleve.professeur_id = ?
                `,
                [
                    id,
                    userId
                ],
                (error, result) =>
                {
                    handleDelete(
                        error,
                        result,
                        response
                    );
                }
            );

            return;
        }


        response.status(403).json({
            error: "Accès interdit"
        });
    }
);


/* ==========================================================
   CRÉER UNE SESSION
========================================================== */

function createSession(
    eleveId,
    difficulte,
    typeQuiz,
    score,
    nombreQuestions,
    duree,
    response
)
{
    database.query(
        `
            INSERT INTO session_quiz
            (
                eleve_id,
                difficulte,
                type_quiz,
                score,
                nombre_questions,
                duree
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            eleveId,
            difficulte,
            typeQuiz,
            score ?? 0,
            nombreQuestions,
            duree ?? null
        ],
        (error, result) =>
        {
            if (error)
            {
                console.error(error);

                response.status(500).json({
                    error: "Erreur serveur"
                });

                return;
            }

            response.status(201).json({
                id: result.insertId,
                eleve_id: Number(eleveId),
                difficulte,
                type_quiz: typeQuiz,
                score: score ?? 0,
                nombre_questions:
                    nombreQuestions,
                duree: duree ?? null
            });
        }
    );
}


/* ==========================================================
   RÉPONSE MODIFICATION
========================================================== */

function handleUpdate(
    error,
    result,
    id,
    difficulte,
    typeQuiz,
    score,
    nombreQuestions,
    duree,
    response
)
{
    if (error)
    {
        console.error(error);

        response.status(500).json({
            error: "Erreur serveur"
        });

        return;
    }

    if (result.affectedRows === 0)
    {
        response.status(404).json({
            error: "Session de quiz introuvable"
        });

        return;
    }

    response.json({
        id: Number(id),
        difficulte,
        type_quiz: typeQuiz,
        score,
        nombre_questions:
            nombreQuestions,
        duree: duree ?? null
    });
}


/* ==========================================================
   RÉPONSE SUPPRESSION
========================================================== */

function handleDelete(
    error,
    result,
    response
)
{
    if (error)
    {
        console.error(error);

        response.status(500).json({
            error: "Erreur serveur"
        });

        return;
    }

    if (result.affectedRows === 0)
    {
        response.status(404).json({
            error: "Session de quiz introuvable"
        });

        return;
    }

    response.json({
        message: "Session de quiz supprimée"
    });
}


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;