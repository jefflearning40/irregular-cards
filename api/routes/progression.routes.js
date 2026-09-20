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
   LISTE DES PROGRESSIONS
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
                        progression.id,
                        progression.eleve_id,
                        progression.infinitif,
                        progression.nombre_reussites,
                        progression.nombre_erreurs,
                        progression.derniere_revision

                    FROM progression

                    WHERE progression.eleve_id = ?

                    ORDER BY progression.infinitif ASC
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
                        progression.id,
                        progression.eleve_id,
                        progression.infinitif,
                        progression.nombre_reussites,
                        progression.nombre_erreurs,
                        progression.derniere_revision

                    FROM progression

                    INNER JOIN eleve
                        ON eleve.id =
                            progression.eleve_id

                    WHERE eleve.professeur_id = ?

                    ORDER BY progression.infinitif ASC
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
   AFFICHER UNE PROGRESSION
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
                        progression.id,
                        progression.eleve_id,
                        progression.infinitif,
                        progression.nombre_reussites,
                        progression.nombre_erreurs,
                        progression.derniere_revision

                    FROM progression

                    WHERE progression.id = ?
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
                        progression.id,
                        progression.eleve_id,
                        progression.infinitif,
                        progression.nombre_reussites,
                        progression.nombre_erreurs,
                        progression.derniere_revision

                    FROM progression

                    INNER JOIN eleve
                        ON eleve.id =
                            progression.eleve_id

                    WHERE progression.id = ?
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
   CRÉATION D'UNE PROGRESSION
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
            infinitif,
            nombre_reussites,
            nombre_erreurs,
            derniere_revision
        } = request.body;


        if (!infinitif)
        {
            response.status(400).json({
                error: "Champs obligatoires manquants"
            });

            return;
        }


        if (role === "eleve")
        {
            createProgression(
                userId,
                infinitif,
                nombre_reussites,
                nombre_erreurs,
                derniere_revision,
                response
            );

            return;
        }


        if (role === "professeur")
        {
            if (!eleve_id)
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


                    createProgression(
                        eleve_id,
                        infinitif,
                        nombre_reussites,
                        nombre_erreurs,
                        derniere_revision,
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
   MODIFICATION D'UNE PROGRESSION
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
            nombre_reussites,
            nombre_erreurs,
            derniere_revision
        } = request.body;


        if (
            !infinitif ||
            nombre_reussites === undefined ||
            nombre_erreurs === undefined
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
                    UPDATE progression

                    SET
                        infinitif = ?,
                        nombre_reussites = ?,
                        nombre_erreurs = ?,
                        derniere_revision = ?

                    WHERE id = ?
                    AND eleve_id = ?
                `,
                [
                    infinitif,
                    nombre_reussites,
                    nombre_erreurs,
                    derniere_revision ?? null,
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
                        nombre_reussites,
                        nombre_erreurs,
                        derniere_revision,
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
                    UPDATE progression

                    INNER JOIN eleve
                        ON eleve.id =
                            progression.eleve_id

                    SET
                        progression.infinitif = ?,
                        progression.nombre_reussites = ?,
                        progression.nombre_erreurs = ?,
                        progression.derniere_revision = ?

                    WHERE progression.id = ?
                    AND eleve.professeur_id = ?
                `,
                [
                    infinitif,
                    nombre_reussites,
                    nombre_erreurs,
                    derniere_revision ?? null,
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
                        nombre_reussites,
                        nombre_erreurs,
                        derniere_revision,
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
   SUPPRESSION D'UNE PROGRESSION
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
                    DELETE FROM progression

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
                    DELETE progression

                    FROM progression

                    INNER JOIN eleve
                        ON eleve.id =
                            progression.eleve_id

                    WHERE progression.id = ?
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
   CRÉER UNE PROGRESSION
========================================================== */

function createProgression(
    eleveId,
    infinitif,
    nombreReussites,
    nombreErreurs,
    derniereRevision,
    response
)
{
    database.query(
        `
            INSERT INTO progression
            (
                eleve_id,
                infinitif,
                nombre_reussites,
                nombre_erreurs,
                derniere_revision
            )
            VALUES (?, ?, ?, ?, ?)
        `,
        [
            eleveId,
            infinitif,
            nombreReussites ?? 0,
            nombreErreurs ?? 0,
            derniereRevision ?? null
        ],
        (error, result) =>
        {
            if (error)
            {
                console.error(error);


                if (error.code === "ER_DUP_ENTRY")
                {
                    response.status(409).json({
                        error:
                            "Une progression existe déjà pour ce verbe"
                    });

                    return;
                }


                response.status(500).json({
                    error: "Erreur serveur"
                });

                return;
            }


            response.status(201).json({
                id: result.insertId,
                eleve_id:
                    Number(eleveId),
                infinitif,
                nombre_reussites:
                    nombreReussites ?? 0,
                nombre_erreurs:
                    nombreErreurs ?? 0,
                derniere_revision:
                    derniereRevision ?? null
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
            error: "Progression introuvable"
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
    nombreReussites,
    nombreErreurs,
    derniereRevision,
    response
)
{
    if (error)
    {
        console.error(error);


        if (error.code === "ER_DUP_ENTRY")
        {
            response.status(409).json({
                error:
                    "Une progression existe déjà pour ce verbe"
            });

            return;
        }


        response.status(500).json({
            error: "Erreur serveur"
        });

        return;
    }


    if (result.affectedRows === 0)
    {
        response.status(404).json({
            error: "Progression introuvable"
        });

        return;
    }


    response.json({
        id: Number(id),
        infinitif,
        nombre_reussites:
            nombreReussites,
        nombre_erreurs:
            nombreErreurs,
        derniere_revision:
            derniereRevision ?? null
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
            error: "Progression introuvable"
        });

        return;
    }


    response.json({
        message: "Progression supprimée"
    });
}


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;