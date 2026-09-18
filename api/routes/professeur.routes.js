"use strict";

const express = require("express");

const bcrypt = require("bcrypt");

const database = require("../database");

const router = express.Router();


/* ==========================================================
   LISTE DES PROFESSEURS
========================================================== */

router.get(
    "/",
    (request, response) =>
    {
        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    email,
                    date_creation
                FROM professeur
            `,
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
    (request, response) =>
    {
        const id =
            request.params.id;


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
            [id],
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
                    (nom, prenom, email, mot_de_passe)
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
    (request, response) =>
    {
        const id =
            request.params.id;

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
                id
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
                        error: "Professeur introuvable"
                    });

                    return;
                }


                response.json({
                    id: Number(id),
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
    (request, response) =>
    {
        const id =
            request.params.id;


        database.query(
            `
                DELETE FROM professeur
                WHERE id = ?
            `,
            [id],
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

module.exports = router;