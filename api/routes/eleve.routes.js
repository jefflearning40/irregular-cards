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
   LISTE DES ÉLÈVES
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
                    professeur_id,
                    nom,
                    prenom,
                    email,
                    date_creation
                FROM eleve
                WHERE professeur_id = ?
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
   AFFICHER UN ÉLÈVE
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


        database.query(
            `
                SELECT
                    id,
                    professeur_id,
                    nom,
                    prenom,
                    email,
                    date_creation
                FROM eleve
                WHERE id = ?
                AND professeur_id = ?
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
                        error: "Élève introuvable"
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
   CRÉATION D'UN ÉLÈVE
========================================================== */

router.post(
    "/",
    verifyToken,
    requireProfessor,
    async (request, response) =>
    {
        try
        {
            const professeurId =
                request.user.id;

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
                    INSERT INTO eleve
                    (
                        professeur_id,
                        nom,
                        prenom,
                        email,
                        mot_de_passe
                    )
                    VALUES (?, ?, ?, ?, ?)
                `,
                [
                    professeurId,
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

                        if (error.code === "ER_DUP_ENTRY")
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
                        professeur_id: professeurId,
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
   MODIFICATION D'UN ÉLÈVE
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
                UPDATE eleve
                SET
                    nom = ?,
                    prenom = ?,
                    email = ?
                WHERE id = ?
                AND professeur_id = ?
            `,
            [
                nom,
                prenom,
                email,
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
                        error: "Élève introuvable"
                    });

                    return;
                }


                response.json({
                    id: Number(id),
                    professeur_id: professeurId,
                    nom,
                    prenom,
                    email
                });
            }
        );
    }
);


/* ==========================================================
   SUPPRESSION D'UN ÉLÈVE
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


        database.query(
            `
                DELETE FROM eleve
                WHERE id = ?
                AND professeur_id = ?
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
                        error: "Élève introuvable"
                    });

                    return;
                }


                response.json({
                    message: "Élève supprimé"
                });
            }
        );
    }
);


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;