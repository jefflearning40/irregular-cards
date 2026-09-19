"use strict";

const express = require("express");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const database = require("../database");

const router = express.Router();


/* ==========================================================
   CONNEXION PROFESSEUR
========================================================== */

router.post(
    "/login",
    (request, response) =>
    {
        const {
            email,
            mot_de_passe
        } = request.body;


        if (
            !email ||
            !mot_de_passe
        )
        {
            response.status(400).json({
                error: "Email et mot de passe obligatoires"
            });

            return;
        }


        database.query(
            `
                SELECT *
                FROM professeur
                WHERE email = ?
            `,
            [email],
            async (error, results) =>
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
                    response.status(401).json({
                        error: "Identifiants incorrects"
                    });

                    return;
                }


                const professeur =
                    results[0];


                const motDePasseValide =
                    await bcrypt.compare(
                        mot_de_passe,
                        professeur.mot_de_passe
                    );


                if (!motDePasseValide)
                {
                    response.status(401).json({
                        error: "Identifiants incorrects"
                    });

                    return;
                }


                const token =
                    jwt.sign(
                        {
                            id: professeur.id,
                            role: "professeur"
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "2h"
                        }
                    );


                response.json({
                    token,
                    professeur: {
                        id: professeur.id,
                        nom: professeur.nom,
                        prenom: professeur.prenom,
                        email: professeur.email
                    }
                });
            }
        );
    }
);


module.exports = router;