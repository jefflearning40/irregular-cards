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
   LISTE DES RÉVISIONS
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
                        revision.id,
                        revision.progression_id,
                        revision.date_revision,
                        revision.effectuee

                    FROM revision

                    INNER JOIN progression
                        ON progression.id =
                            revision.progression_id

                    WHERE progression.eleve_id = ?

                    ORDER BY revision.date_revision ASC
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
   AFFICHER UNE RÉVISION
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
                        revision.id,
                        revision.progression_id,
                        revision.date_revision,
                        revision.effectuee

                    FROM revision

                    INNER JOIN progression
                        ON progression.id =
                            revision.progression_id

                    WHERE revision.id = ?
                    AND progression.eleve_id = ?
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
   CRÉATION D'UNE RÉVISION
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


        if (role === "eleve")
        {
            database.query(
                `
                    SELECT id

                    FROM progression

                    WHERE id = ?
                    AND eleve_id = ?
                `,
                [
                    progression_id,
                    userId
                ],
                (error, results) =>
                {
                    verifyProgressionAndCreate(
                        error,
                        results,
                        progression_id,
                        date_revision,
                        effectuee,
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
                    userId
                ],
                (error, results) =>
                {
                    verifyProgressionAndCreate(
                        error,
                        results,
                        progression_id,
                        date_revision,
                        effectuee,
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
   MODIFICATION D'UNE RÉVISION
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


        if (role === "eleve")
        {
            database.query(
                `
                    UPDATE revision

                    INNER JOIN progression
                        ON progression.id =
                            revision.progression_id

                    SET
                        revision.date_revision = ?,
                        revision.effectuee = ?

                    WHERE revision.id = ?
                    AND progression.eleve_id = ?
                `,
                [
                    date_revision,
                    effectuee,
                    id,
                    userId
                ],
                (error, result) =>
                {
                    handleUpdate(
                        error,
                        result,
                        id,
                        date_revision,
                        effectuee,
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
                    userId
                ],
                (error, result) =>
                {
                    handleUpdate(
                        error,
                        result,
                        id,
                        date_revision,
                        effectuee,
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
   SUPPRESSION D'UNE RÉVISION
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
                    DELETE revision

                    FROM revision

                    INNER JOIN progression
                        ON progression.id =
                            revision.progression_id

                    WHERE revision.id = ?
                    AND progression.eleve_id = ?
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
   VÉRIFIER LA PROGRESSION ET CRÉER LA RÉVISION
========================================================== */

function verifyProgressionAndCreate(
    error,
    results,
    progressionId,
    dateRevision,
    effectuee,
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
            progressionId,
            dateRevision,
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
                    Number(progressionId),
                date_revision:
                    dateRevision,
                effectuee:
                    effectuee ?? false
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
            error: "Révision introuvable"
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
    dateRevision,
    effectuee,
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
            error: "Révision introuvable"
        });

        return;
    }


    response.json({
        id: Number(id),
        date_revision:
            dateRevision,
        effectuee
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
            error: "Révision introuvable"
        });

        return;
    }


    response.json({
        message: "Révision supprimée"
    });
}


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;