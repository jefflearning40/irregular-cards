"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const bcrypt = require("bcrypt");

const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const database = require("../database");


/* ==========================================================
   ROUTER
========================================================== */

const router = express.Router();


/* ==========================================================
   CRÉATION DU TOKEN
========================================================== */

function createToken(
    id,
    role
)
{
    return jwt.sign(
        {
            id: id,
            role: role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "2h"
        }
    );
}


/* ==========================================================
   RÉPONSE DE CONNEXION
========================================================== */

function sendLoginResponse(
    response,
    user,
    role
)
{
    const token =
        createToken(
            user.id,
            role
        );


    const utilisateur = {
        id:
            user.id,

        nom:
            user.nom,

        prenom:
            user.prenom,

        email:
            user.email
    };


    if (role === "eleve")
    {
        utilisateur.professeur_id =
            user.professeur_id;
    }


    response.json({
        token:
            token,

        role:
            role,

        utilisateur:
            utilisateur
    });
}


/* ==========================================================
   VÉRIFICATION DU MOT DE PASSE
========================================================== */

async function checkPassword(
    password,
    hash
)
{
    return await bcrypt.compare(
        password,
        hash
    );
}


/* ==========================================================
   CONNEXION UNIQUE
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
                error:
                    "Email et mot de passe obligatoires"
            });

            return;
        }


        /* ==================================================
           RECHERCHE DANS LES ÉLÈVES
        ================================================== */

        database.query(
            `
                SELECT *
                FROM eleve
                WHERE email = ?
            `,
            [email],
            async (
                studentError,
                students
            ) =>
            {
                if (studentError)
                {
                    console.error(
                        studentError
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                if (students.length > 0)
                {
                    const student =
                        students[0];


                    let passwordIsValid;


                    try
                    {
                        passwordIsValid =
                            await checkPassword(
                                mot_de_passe,
                                student.mot_de_passe
                            );
                    }
                    catch (error)
                    {
                        console.error(
                            error
                        );

                        response.status(500).json({
                            error:
                                "Erreur serveur"
                        });

                        return;
                    }


                    if (!passwordIsValid)
                    {
                        response.status(401).json({
                            error:
                                "Identifiants incorrects"
                        });

                        return;
                    }


                    sendLoginResponse(
                        response,
                        student,
                        "eleve"
                    );

                    return;
                }


                /* ==========================================
                   RECHERCHE DANS LES PROFESSEURS
                ========================================== */

                database.query(
                    `
                        SELECT *
                        FROM professeur
                        WHERE email = ?
                    `,
                    [email],
                    async (
                        teacherError,
                        teachers
                    ) =>
                    {
                        if (teacherError)
                        {
                            console.error(
                                teacherError
                            );

                            response.status(500).json({
                                error:
                                    "Erreur serveur"
                            });

                            return;
                        }


                        if (teachers.length > 0)
                        {
                            const teacher =
                                teachers[0];


                            let passwordIsValid;


                            try
                            {
                                passwordIsValid =
                                    await checkPassword(
                                        mot_de_passe,
                                        teacher.mot_de_passe
                                    );
                            }
                            catch (error)
                            {
                                console.error(
                                    error
                                );

                                response.status(500).json({
                                    error:
                                        "Erreur serveur"
                                });

                                return;
                            }


                            if (!passwordIsValid)
                            {
                                response.status(401).json({
                                    error:
                                        "Identifiants incorrects"
                                });

                                return;
                            }


                            sendLoginResponse(
                                response,
                                teacher,
                                "professeur"
                            );

                            return;
                        }


                        /* ==================================
                           RECHERCHE DANS LES ADMINISTRATEURS
                        ================================== */

                        database.query(
                            `
                                SELECT *
                                FROM administrateur
                                WHERE email = ?
                            `,
                            [email],
                            async (
                                adminError,
                                admins
                            ) =>
                            {
                                if (adminError)
                                {
                                    console.error(
                                        adminError
                                    );

                                    response.status(500).json({
                                        error:
                                            "Erreur serveur"
                                    });

                                    return;
                                }


                                if (admins.length === 0)
                                {
                                    response.status(401).json({
                                        error:
                                            "Identifiants incorrects"
                                    });

                                    return;
                                }


                                const admin =
                                    admins[0];


                                let passwordIsValid;


                                try
                                {
                                    passwordIsValid =
                                        await checkPassword(
                                            mot_de_passe,
                                            admin.mot_de_passe
                                        );
                                }
                                catch (error)
                                {
                                    console.error(
                                        error
                                    );

                                    response.status(500).json({
                                        error:
                                            "Erreur serveur"
                                    });

                                    return;
                                }


                                if (!passwordIsValid)
                                {
                                    response.status(401).json({
                                        error:
                                            "Identifiants incorrects"
                                    });

                                    return;
                                }


                                sendLoginResponse(
                                    response,
                                    admin,
                                    "administrateur"
                                );
                            }
                        );
                    }
                );
            }
        );
    }
);

/* ==========================================================
   DEMANDE DE RÉINITIALISATION DU MOT DE PASSE
========================================================== */

router.post(
    "/mot-de-passe-oublie",
    (request, response) =>
    {
        const email =
            String(
                request.body.email || ""
            )
                .trim()
                .toLowerCase();


        const genericResponse = () =>
        {
            response.json({
                message:
                    "Si cette adresse correspond à un compte, un e-mail de réinitialisation sera envoyé."
            });
        };


        if (!email)
        {
            genericResponse();

            return;
        }


        /* ==================================================
           RECHERCHE DE L'UTILISATEUR
        ================================================== */

        database.query(
            `
                SELECT
                    id,
                    email,
                    'eleve' AS utilisateur_type
                FROM eleve
                WHERE LOWER(email) = ?

                UNION ALL

                SELECT
                    id,
                    email,
                    'professeur' AS utilisateur_type
                FROM professeur
                WHERE LOWER(email) = ?

                LIMIT 1
            `,
            [
                email,
                email
            ],
            (
                userError,
                users
            ) =>
            {
                if (userError)
                {
                    console.error(
                        userError
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                if (users.length === 0)
                {
                    genericResponse();

                    return;
                }


                const user =
                    users[0];


                /* ==========================================
                   GÉNÉRATION DU JETON
                ========================================== */

                const resetToken =
                    crypto
                        .randomBytes(32)
                        .toString("hex");


                const tokenHash =
                    crypto
                        .createHash("sha256")
                        .update(resetToken)
                        .digest("hex");


                /* ==========================================
                   EXPIRATION : 30 MINUTES
                ========================================== */

                const expirationDate =
                    new Date(
                        Date.now() +
                        30 * 60 * 1000
                    );


                /* ==========================================
                   INVALIDATION DES ANCIENS JETONS
                ========================================== */

                database.query(
                    `
                        DELETE FROM reinitialisation_mot_de_passe
                        WHERE utilisateur_type = ?
                        AND utilisateur_id = ?
                    `,
                    [
                        user.utilisateur_type,
                        user.id
                    ],
                    (deleteError) =>
                    {
                        if (deleteError)
                        {
                            console.error(
                                deleteError
                            );

                            response.status(500).json({
                                error:
                                    "Erreur serveur"
                            });

                            return;
                        }


                        /* ==================================
                           ENREGISTREMENT DU HASH DU JETON
                        ================================== */

                        database.query(
                            `
                                INSERT INTO reinitialisation_mot_de_passe
                                (
                                    utilisateur_type,
                                    utilisateur_id,
                                    token_hash,
                                    date_expiration
                                )
                                VALUES (?, ?, ?, ?)
                            `,
                            [
                                user.utilisateur_type,
                                user.id,
                                tokenHash,
                                expirationDate
                            ],
                            (insertError) =>
                            {
                                if (insertError)
                                {
                                    console.error(
                                        insertError
                                    );

                                    response.status(500).json({
                                        error:
                                            "Erreur serveur"
                                    });

                                    return;
                                }


                                /*
                                 * L'envoi de l'e-mail sera branché
                                 * à l'étape suivante.
                                 *
                                 * resetToken contient le jeton
                                 * utilisable dans le futur lien.
                                 *
                                 * Seul tokenHash est enregistré
                                 * dans MySQL.
                                 */

                                console.log(
                                    "Jeton de réinitialisation créé pour :",
                                    user.email
                                );


                                genericResponse();
                            }
                        );
                    }
                );
            }
        );
    }
);

/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;