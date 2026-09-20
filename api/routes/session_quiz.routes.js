"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const {
    verifyToken,
    requireProfessor
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
        const professeurId =
            request.user.id;

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
                    ON eleve.id = session_quiz.eleve_id

                WHERE eleve.professeur_id = ?

                ORDER BY session_quiz.date_session DESC
            `,
            [professeurId],
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

        const professeurId =
            request.user.id;

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
                    ON eleve.id = session_quiz.eleve_id

                WHERE session_quiz.id = ?
                AND eleve.professeur_id = ?
            `,
            [
                id,
                professeurId
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
        const professeurId =
            request.user.id;

        const {
            eleve_id,
            difficulte,
            type_quiz,
            score,
            nombre_questions,
            duree
        } = request.body;

        if (
            !eleve_id ||
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

        database.query(
            `
                SELECT id
                FROM eleve
                WHERE id = ?
                AND professeur_id = ?
            `,
            [
                eleve_id,
                professeurId
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
                        eleve_id,
                        difficulte,
                        type_quiz,
                        score ?? 0,
                        nombre_questions,
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
                            eleve_id: Number(eleve_id),
                            difficulte,
                            type_quiz,
                            score: score ?? 0,
                            nombre_questions,
                            duree: duree ?? null
                        });
                    }
                );
            }
        );
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

        const professeurId =
            request.user.id;

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

        database.query(
            `
                UPDATE session_quiz

                INNER JOIN eleve
                    ON eleve.id = session_quiz.eleve_id

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
                professeurId
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
                    type_quiz,
                    score,
                    nombre_questions,
                    duree: duree ?? null
                });
            }
        );
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

        const professeurId =
            request.user.id;

        database.query(
            `
                DELETE session_quiz
                FROM session_quiz

                INNER JOIN eleve
                    ON eleve.id = session_quiz.eleve_id

                WHERE session_quiz.id = ?
                AND eleve.professeur_id = ?
            `,
            [
                id,
                professeurId
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
        );
    }
);


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;