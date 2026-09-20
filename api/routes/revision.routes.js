"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const verifyToken =
    require("../middleware/auth.middleware");

const database = require("../database");


/* ==========================================================
   ROUTER
========================================================== */

const router = express.Router();


/* ==========================================================
   LISTE DES RÉVISIONS
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
                    revision.id,
                    revision.progression_id,
                    revision.date_revision,
                    revision.effectuee

                FROM revision

                INNER JOIN progression
                    ON progression.id =
                        revision.progression_id

                INNER JOIN eleve
                    ON eleve.id =
                        progression.eleve_id

                WHERE eleve.professeur_id = ?

                ORDER BY revision.date_revision ASC
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
   AFFICHER UNE RÉVISION
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
                    revision.id,
                    revision.progression_id,
                    revision.date_revision,
                    revision.effectuee

                FROM revision

                INNER JOIN progression
                    ON progression.id =
                        revision.progression_id

                INNER JOIN eleve
                    ON eleve.id =
                        progression.eleve_id

                WHERE revision.id = ?
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
                        error: "Révision introuvable"
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
   CRÉATION D'UNE RÉVISION
========================================================== */

router.post(
    "/",
    verifyToken,
    (request, response) =>
    {
        const professeurId =
            request.user.id;

        const {
            progression_id,
            date_revision,
            effectuee
        } = request.body;

        if (
            !progression_id ||
            !date_revision
        )
        {
            response.status(400).json({
                error: "Champs obligatoires manquants"
            });

            return;
        }

        database.query(
            `
                SELECT progression.id

                FROM progression

                INNER JOIN eleve
                    ON eleve.id =
                        progression.eleve_id

                WHERE progression.id = ?
                AND eleve.professeur_id = ?
            `,
            [
                progression_id,
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
                        error: "Progression introuvable"
                    });

                    return;
                }

                database.query(
                    `
                        INSERT INTO revision
                        (
                            progression_id,
                            date_revision,
                            effectuee
                        )
                        VALUES (?, ?, ?)
                    `,
                    [
                        progression_id,
                        date_revision,
                        effectuee ?? false
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
                            progression_id:
                                Number(progression_id),
                            date_revision,
                            effectuee:
                                effectuee ?? false
                        });
                    }
                );
            }
        );
    }
);


/* ==========================================================
   MODIFICATION D'UNE RÉVISION
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
            date_revision,
            effectuee
        } = request.body;

        if (
            !date_revision ||
            effectuee === undefined
        )
        {
            response.status(400).json({
                error: "Champs obligatoires manquants"
            });

            return;
        }

        database.query(
            `
                UPDATE revision

                INNER JOIN progression
                    ON progression.id =
                        revision.progression_id

                INNER JOIN eleve
                    ON eleve.id =
                        progression.eleve_id

                SET
                    revision.date_revision = ?,
                    revision.effectuee = ?

                WHERE revision.id = ?
                AND eleve.professeur_id = ?
            `,
            [
                date_revision,
                effectuee,
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
                        error: "Révision introuvable"
                    });

                    return;
                }

                response.json({
                    id: Number(id),
                    date_revision,
                    effectuee
                });
            }
        );
    }
);


/* ==========================================================
   SUPPRESSION D'UNE RÉVISION
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
                DELETE revision
                FROM revision

                INNER JOIN progression
                    ON progression.id =
                        revision.progression_id

                INNER JOIN eleve
                    ON eleve.id =
                        progression.eleve_id

                WHERE revision.id = ?
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
                        error: "Révision introuvable"
                    });

                    return;
                }

                response.json({
                    message: "Révision supprimée"
                });
            }
        );
    }
);


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;