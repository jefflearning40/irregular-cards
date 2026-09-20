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
   LISTE DES PROGRESSIONS
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
   AFFICHER UNE PROGRESSION
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

                response.json(
                    results[0]
                );
            }
        );
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
        const professeurId =
            request.user.id;

        const {
            eleve_id,
            infinitif,
            nombre_reussites,
            nombre_erreurs,
            derniere_revision
        } = request.body;

        if (
            !eleve_id ||
            !infinitif
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
                        eleve_id,
                        infinitif,
                        nombre_reussites ?? 0,
                        nombre_erreurs ?? 0,
                        derniere_revision ?? null
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
                                Number(eleve_id),
                            infinitif,
                            nombre_reussites:
                                nombre_reussites ?? 0,
                            nombre_erreurs:
                                nombre_erreurs ?? 0,
                            derniere_revision:
                                derniere_revision ?? null
                        });
                    }
                );
            }
        );
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

        const professeurId =
            request.user.id;

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
                professeurId
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
                    nombre_reussites,
                    nombre_erreurs,
                    derniere_revision:
                        derniere_revision ?? null
                });
            }
        );
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

        const professeurId =
            request.user.id;

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
                        error: "Progression introuvable"
                    });

                    return;
                }

                response.json({
                    message: "Progression supprimée"
                });
            }
        );
    }
);


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;