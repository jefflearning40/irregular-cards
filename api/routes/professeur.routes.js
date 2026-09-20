"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const bcrypt = require("bcrypt");

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
   LISTE DES PROFESSEURS
========================================================== */

router.get(
    "/",
    verifyToken,
    requireProfessor,
    (request, response) =>
    {
        const professeurId =
            request.user.id;

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    email,
                    date_creation
                FROM professeur
                WHERE id = ?
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
   AFFICHER UN PROFESSEUR
========================================================== */

router.get(
    "/:id",
    verifyToken,
    requireProfessor,
    (request, response) =>
    {
        const id =
            request.params.id;

        const professeurId =
            request.user.id;

        if (
            Number(id) !==
            Number(professeurId)
        )
        {
            response.status(403).json({
                error: "Accès interdit"
            });

            return;
        }

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    email,
                    date_creation
                FROM professeur
                WHERE id = ?
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

                if (results.length === 0)
                {
                    response.status(404).json({
                        error: "Professeur introuvable"
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
   CRÉATION D'UN PROFESSEUR
========================================================== */

router.post(
    "/",
    async (request, response) =>
    {
        try
        {
            const {
                nom,
                prenom,
                email,
                mot_de_passe
            } = request.body;

            if (
                !nom ||
                !prenom ||
                !email ||
                !mot_de_passe
            )
            {
                response.status(400).json({
                    error: "Tous les champs sont obligatoires"
                });

                return;
            }

            const motDePasseHash =
                await bcrypt.hash(
                    mot_de_passe,
                    12
                );

            database.query(
                `
                    INSERT INTO professeur
                    (
                        nom,
                        prenom,
                        email,
                        mot_de_passe
                    )
                    VALUES (?, ?, ?, ?)
                `,
                [
                    nom,
                    prenom,
                    email,
                    motDePasseHash
                ],
                (error, result) =>
                {
                    if (error)
                    {
                        console.error(error);

                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        )
                        {
                            response.status(409).json({
                                error: "Cette adresse email est déjà utilisée"
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
                        nom,
                        prenom,
                        email
                    });
                }
            );
        }
        catch (error)
        {
            console.error(error);

            response.status(500).json({
                error: "Erreur serveur"
            });
        }
    }
);


/* ==========================================================
   MODIFICATION D'UN PROFESSEUR
========================================================== */

router.put(
    "/:id",
    verifyToken,
    requireProfessor,
    (request, response) =>
    {
        const id =
            request.params.id;

        const professeurId =
            request.user.id;

        const {
            nom,
            prenom,
            email
        } = request.body;

        if (
            Number(id) !==
            Number(professeurId)
        )
        {
            response.status(403).json({
                error: "Accès interdit"
            });

            return;
        }

        if (
            !nom ||
            !prenom ||
            !email
        )
        {
            response.status(400).json({
                error: "Tous les champs sont obligatoires"
            });

            return;
        }

        database.query(
            `
                UPDATE professeur
                SET
                    nom = ?,
                    prenom = ?,
                    email = ?
                WHERE id = ?
            `,
            [
                nom,
                prenom,
                email,
                professeurId
            ],
            (error, result) =>
            {
                if (error)
                {
                    console.error(error);

                    if (
                        error.code ===
                        "ER_DUP_ENTRY"
                    )
                    {
                        response.status(409).json({
                            error: "Cette adresse email est déjà utilisée"
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
                        error: "Professeur introuvable"
                    });

                    return;
                }

                response.json({
                    id: Number(professeurId),
                    nom,
                    prenom,
                    email
                });
            }
        );
    }
);


/* ==========================================================
   SUPPRESSION D'UN PROFESSEUR
========================================================== */

router.delete(
    "/:id",
    verifyToken,
    requireProfessor,
    (request, response) =>
    {
        const id =
            request.params.id;

        const professeurId =
            request.user.id;

        if (
            Number(id) !==
            Number(professeurId)
        )
        {
            response.status(403).json({
                error: "Accès interdit"
            });

            return;
        }

        database.query(
            `
                DELETE FROM professeur
                WHERE id = ?
            `,
            [professeurId],
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
                        error: "Professeur introuvable"
                    });

                    return;
                }

                response.json({
                    message: "Professeur supprimé"
                });
            }
        );
    }
);


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;