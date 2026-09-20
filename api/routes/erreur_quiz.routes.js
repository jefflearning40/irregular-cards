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
   LISTE DES ERREURS
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
                    erreur_quiz.id,
                    erreur_quiz.session_quiz_id,
                    erreur_quiz.infinitif,
                    erreur_quiz.reponse_attendue,
                    erreur_quiz.reponse_eleve

                FROM erreur_quiz

                INNER JOIN session_quiz
                    ON session_quiz.id =
                        erreur_quiz.session_quiz_id

                INNER JOIN eleve
                    ON eleve.id =
                        session_quiz.eleve_id

                WHERE eleve.professeur_id = ?

                ORDER BY erreur_quiz.id DESC
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
   AFFICHER UNE ERREUR
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
                    erreur_quiz.id,
                    erreur_quiz.session_quiz_id,
                    erreur_quiz.infinitif,
                    erreur_quiz.reponse_attendue,
                    erreur_quiz.reponse_eleve

                FROM erreur_quiz

                INNER JOIN session_quiz
                    ON session_quiz.id =
                        erreur_quiz.session_quiz_id

                INNER JOIN eleve
                    ON eleve.id =
                        session_quiz.eleve_id

                WHERE erreur_quiz.id = ?
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
                        error: "Erreur de quiz introuvable"
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
   CRÉATION D'UNE ERREUR
========================================================== */

router.post(
    "/",
    verifyToken,
    (request, response) =>
    {
        const professeurId =
            request.user.id;

        const {
            session_quiz_id,
            infinitif,
            reponse_attendue,
            reponse_eleve
        } = request.body;

        if (
            !session_quiz_id ||
            !infinitif ||
            !reponse_attendue
        )
        {
            response.status(400).json({
                error: "Champs obligatoires manquants"
            });

            return;
        }

        database.query(
            `
                SELECT session_quiz.id

                FROM session_quiz

                INNER JOIN eleve
                    ON eleve.id =
                        session_quiz.eleve_id

                WHERE session_quiz.id = ?
                AND eleve.professeur_id = ?
            `,
            [
                session_quiz_id,
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

                database.query(
                    `
                        INSERT INTO erreur_quiz
                        (
                            session_quiz_id,
                            infinitif,
                            reponse_attendue,
                            reponse_eleve
                        )
                        VALUES (?, ?, ?, ?)
                    `,
                    [
                        session_quiz_id,
                        infinitif,
                        reponse_attendue,
                        reponse_eleve ?? null
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
                            session_quiz_id:
                                Number(session_quiz_id),
                            infinitif,
                            reponse_attendue,
                            reponse_eleve:
                                reponse_eleve ?? null
                        });
                    }
                );
            }
        );
    }
);


/* ==========================================================
   MODIFICATION D'UNE ERREUR
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
            infinitif,
            reponse_attendue,
            reponse_eleve
        } = request.body;

        if (
            !infinitif ||
            !reponse_attendue
        )
        {
            response.status(400).json({
                error: "Champs obligatoires manquants"
            });

            return;
        }

        database.query(
            `
                UPDATE erreur_quiz

                INNER JOIN session_quiz
                    ON session_quiz.id =
                        erreur_quiz.session_quiz_id

                INNER JOIN eleve
                    ON eleve.id =
                        session_quiz.eleve_id

                SET
                    erreur_quiz.infinitif = ?,
                    erreur_quiz.reponse_attendue = ?,
                    erreur_quiz.reponse_eleve = ?

                WHERE erreur_quiz.id = ?
                AND eleve.professeur_id = ?
            `,
            [
                infinitif,
                reponse_attendue,
                reponse_eleve ?? null,
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
                        error: "Erreur de quiz introuvable"
                    });

                    return;
                }

                response.json({
                    id: Number(id),
                    infinitif,
                    reponse_attendue,
                    reponse_eleve:
                        reponse_eleve ?? null
                });
            }
        );
    }
);


/* ==========================================================
   SUPPRESSION D'UNE ERREUR
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
                DELETE erreur_quiz
                FROM erreur_quiz

                INNER JOIN session_quiz
                    ON session_quiz.id =
                        erreur_quiz.session_quiz_id

                INNER JOIN eleve
                    ON eleve.id =
                        session_quiz.eleve_id

                WHERE erreur_quiz.id = ?
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
                        error: "Erreur de quiz introuvable"
                    });

                    return;
                }

                response.json({
                    message: "Erreur de quiz supprimée"
                });
            }
        );
    }
);


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;