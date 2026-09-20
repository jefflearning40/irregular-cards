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
   LISTE DES ERREURS
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


        if (role === "eleve")
        {
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

                    WHERE session_quiz.eleve_id = ?

                    ORDER BY erreur_quiz.id DESC
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


        if (role === "professeur")
        {
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
   AFFICHER UNE ERREUR
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


        if (role === "eleve")
        {
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

                    WHERE erreur_quiz.id = ?
                    AND session_quiz.eleve_id = ?
                `,
                [
                    id,
                    userId
                ],
                (error, results) =>
                {
                    handleGet(
                        error,
                        results,
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
                    userId
                ],
                (error, results) =>
                {
                    handleGet(
                        error,
                        results,
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
   CRÉATION D'UNE ERREUR
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


        if (role === "eleve")
        {
            database.query(
                `
                    SELECT id

                    FROM session_quiz

                    WHERE id = ?
                    AND eleve_id = ?
                `,
                [
                    session_quiz_id,
                    userId
                ],
                (error, results) =>
                {
                    verifySessionAndCreate(
                        error,
                        results,
                        session_quiz_id,
                        infinitif,
                        reponse_attendue,
                        reponse_eleve,
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
                    userId
                ],
                (error, results) =>
                {
                    verifySessionAndCreate(
                        error,
                        results,
                        session_quiz_id,
                        infinitif,
                        reponse_attendue,
                        reponse_eleve,
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
   MODIFICATION D'UNE ERREUR
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


        if (role === "eleve")
        {
            database.query(
                `
                    UPDATE erreur_quiz

                    INNER JOIN session_quiz
                        ON session_quiz.id =
                            erreur_quiz.session_quiz_id

                    SET
                        erreur_quiz.infinitif = ?,
                        erreur_quiz.reponse_attendue = ?,
                        erreur_quiz.reponse_eleve = ?

                    WHERE erreur_quiz.id = ?
                    AND session_quiz.eleve_id = ?
                `,
                [
                    infinitif,
                    reponse_attendue,
                    reponse_eleve ?? null,
                    id,
                    userId
                ],
                (error, result) =>
                {
                    handleUpdate(
                        error,
                        result,
                        id,
                        infinitif,
                        reponse_attendue,
                        reponse_eleve,
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
                    userId
                ],
                (error, result) =>
                {
                    handleUpdate(
                        error,
                        result,
                        id,
                        infinitif,
                        reponse_attendue,
                        reponse_eleve,
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
   SUPPRESSION D'UNE ERREUR
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
                    DELETE erreur_quiz

                    FROM erreur_quiz

                    INNER JOIN session_quiz
                        ON session_quiz.id =
                            erreur_quiz.session_quiz_id

                    WHERE erreur_quiz.id = ?
                    AND session_quiz.eleve_id = ?
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
   VÉRIFIER LA SESSION ET CRÉER L'ERREUR
========================================================== */

function verifySessionAndCreate(
    error,
    results,
    sessionQuizId,
    infinitif,
    reponseAttendue,
    reponseEleve,
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
            sessionQuizId,
            infinitif,
            reponseAttendue,
            reponseEleve ?? null
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
                    Number(sessionQuizId),
                infinitif,
                reponse_attendue:
                    reponseAttendue,
                reponse_eleve:
                    reponseEleve ?? null
            });
        }
    );
}


/* ==========================================================
   RÉPONSE AFFICHAGE
========================================================== */

function handleGet(
    error,
    results,
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


/* ==========================================================
   RÉPONSE MODIFICATION
========================================================== */

function handleUpdate(
    error,
    result,
    id,
    infinitif,
    reponseAttendue,
    reponseEleve,
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
            error: "Erreur de quiz introuvable"
        });

        return;
    }


    response.json({
        id: Number(id),
        infinitif,
        reponse_attendue:
            reponseAttendue,
        reponse_eleve:
            reponseEleve ?? null
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
            error: "Erreur de quiz introuvable"
        });

        return;
    }


    response.json({
        message: "Erreur de quiz supprimée"
    });
}


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;