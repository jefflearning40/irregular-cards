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
   CONFIGURATION DE L'ENVOI DES E-MAILS
========================================================== */

const mailTransporter =
    nodemailer.createTransport({
        host:
            process.env.MAIL_HOST,

        port:
            Number(
                process.env.MAIL_PORT
            ),

        secure:
            false,

        auth:
        {
            user:
                process.env.MAIL_USER,

            pass:
                process.env.MAIL_PASSWORD
        }
    }
);
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


                                /* ==================================
                                   CRÉATION DU LIEN
                                ================================== */

                                const resetLink =
                                    `${process.env.APP_URL}/?reset_token=${resetToken}`;


                                /* ==================================
                                   ENVOI DE L'E-MAIL
                                ================================== */

                                mailTransporter.sendMail(
                                    {
                                        from:
                                            process.env.MAIL_FROM,

                                        to:
                                            user.email,

                                        subject:
                                            "Irregular Cards - Réinitialisation du mot de passe",

                                        text:
                                            `Une demande de réinitialisation de votre mot de passe a été effectuée.

Pour créer un nouveau mot de passe, utilisez le lien suivant :

${resetLink}

Ce lien est valable pendant 30 minutes.

Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`
                                    },
                                    (mailError) =>
                                    {
                                        if (mailError)
                                        {
                                            console.error(
                                                mailError
                                            );

                                            response.status(500).json({
                                                error:
                                                    "Erreur lors de l'envoi de l'e-mail"
                                            });

                                            return;
                                        }


                                        genericResponse();
                                    }
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

   RÉINITIALISATION DU MOT DE PASSE

========================================================== */
/* ==========================================================
   VÉRIFICATION DU TOKEN DE RÉINITIALISATION
========================================================== */

router.post(
    "/verifier-token-reinitialisation",
    (request, response) =>
    {
        const token =
            String(
                request.body.token || ""
            )
                .trim();


        if (!token)
        {
            response.status(400).json({
                error:
                    "Token manquant"
            });

            return;
        }


        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        database.query(
            `
                SELECT
                    id,
                    date_expiration
                FROM reinitialisation_mot_de_passe
                WHERE token_hash = ?
                LIMIT 1
            `,
            [
                tokenHash
            ],
            (
                tokenError,
                resetTokens
            ) =>
            {
                if (tokenError)
                {
                    console.error(
                        "Erreur vérification token :",
                        tokenError
                    );


                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });


                    return;
                }


                if (
                    resetTokens.length === 0
                )
                {
                    response.status(400).json({
                        error:
                            "Lien invalide ou expiré"
                    });


                    return;
                }


                const resetData =
                    resetTokens[0];


                if (
                    new Date(
                        resetData.date_expiration
                    ).getTime() <= Date.now()
                )
                {
                    database.query(
                        `
                            DELETE FROM reinitialisation_mot_de_passe
                            WHERE id = ?
                        `,
                        [
                            resetData.id
                        ],
                        (deleteError) =>
                        {
                            if (deleteError)
                            {
                                console.error(
                                    deleteError
                                );
                            }
                        }
                    );


                    response.status(400).json({
                        error:
                            "Lien invalide ou expiré"
                    });


                    return;
                }


                response.status(200).json({
                    valid:
                        true
                });
            }
        );
    }
);

router.post(
    "/reinitialiser-mot-de-passe",
    (request, response) =>
    {
        const token =
            String(
                request.body.token || ""
            )
                .trim();


        const motDePasse =
            String(
                request.body.mot_de_passe || ""
            );


        /* ==================================================
           VÉRIFICATION DES DONNÉES
        ================================================== */

        if (
            !token ||
            !motDePasse
        )
        {
            response.status(400).json({
                error:
                    "Token et nouveau mot de passe obligatoires"
            });


            return;
        }


        /* ==================================================
           VÉRIFICATION DU MOT DE PASSE
        ================================================== */

        if (
            motDePasse.length < 8 ||
            motDePasse.length > 72
        )
        {
            response.status(400).json({
                error:
                    "Le mot de passe doit contenir entre 8 et 72 caractères"
            });


            return;
        }


        const passwordHasLetter =
            /\p{L}/u.test(
                motDePasse
            );


        const passwordHasNumber =
            /\d/.test(
                motDePasse
            );


        if (
            !passwordHasLetter ||
            !passwordHasNumber
        )
        {
            response.status(400).json({
                error:
                    "Le mot de passe doit contenir au moins une lettre et un chiffre"
            });


            return;
        }


        /* ==================================================
           HASH DU TOKEN REÇU
        ================================================== */

        const tokenHash =
            crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");


        /* ==================================================
           RECHERCHE DU TOKEN
        ================================================== */

        database.query(
            `
                SELECT
                    id,
                    utilisateur_type,
                    utilisateur_id,
                    date_expiration
                FROM reinitialisation_mot_de_passe
                WHERE token_hash = ?
                LIMIT 1
            `,
            [tokenHash],
            async (
                tokenError,
                resetTokens
            ) =>
            {
                if (tokenError)
                {
                    console.error(
                        tokenError
                    );


                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });


                    return;
                }


                /* ==========================================
                   TOKEN INTROUVABLE
                ========================================== */

                if (resetTokens.length === 0)
                {
                    response.status(400).json({
                        error:
                            "Lien de réinitialisation invalide ou expiré"
                    });


                    return;
                }


                const resetData =
                    resetTokens[0];


                /* ==========================================
                   VÉRIFICATION DE L'EXPIRATION
                ========================================== */

                if (
                    new Date(
                        resetData.date_expiration
                    ).getTime() <= Date.now()
                )
                {
                    database.query(
                        `
                            DELETE FROM reinitialisation_mot_de_passe
                            WHERE id = ?
                        `,
                        [resetData.id],
                        (deleteExpiredError) =>
                        {
                            if (deleteExpiredError)
                            {
                                console.error(
                                    deleteExpiredError
                                );
                            }
                        }
                    );


                    response.status(400).json({
                        error:
                            "Lien de réinitialisation invalide ou expiré"
                    });


                    return;
                }


                /* ==========================================
                   VÉRIFICATION DU TYPE D'UTILISATEUR
                ========================================== */

                if (
                    resetData.utilisateur_type !== "eleve" &&
                    resetData.utilisateur_type !== "professeur"
                )
                {
                    response.status(400).json({
                        error:
                            "Lien de réinitialisation invalide ou expiré"
                    });


                    return;
                }


                /* ==========================================
                   HASH DU NOUVEAU MOT DE PASSE
                ========================================== */

                let passwordHash;


                try
                {
                    passwordHash =
                        await bcrypt.hash(
                            motDePasse,
                            10
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


                /* ==========================================
                   TABLE À MODIFIER
                ========================================== */

                const tableName =
                    resetData.utilisateur_type === "eleve"
                        ? "eleve"
                        : "professeur";


                /* ==========================================
                   MODIFICATION DU MOT DE PASSE
                ========================================== */

                database.query(
                    `
                        UPDATE ${tableName}
                        SET mot_de_passe = ?
                        WHERE id = ?
                    `,
                    [
                        passwordHash,
                        resetData.utilisateur_id
                    ],
                    (
                        updateError,
                        updateResult
                    ) =>
                    {
                        if (updateError)
                        {
                            console.error(
                                updateError
                            );


                            response.status(500).json({
                                error:
                                    "Erreur serveur"
                            });


                            return;
                        }


                        if (updateResult.affectedRows === 0)
                        {
                            response.status(400).json({
                                error:
                                    "Lien de réinitialisation invalide ou expiré"
                            });


                            return;
                        }


                        /* ==================================
                           SUPPRESSION DU TOKEN UTILISÉ
                        ================================== */

                        database.query(
                            `
                                DELETE FROM reinitialisation_mot_de_passe
                                WHERE utilisateur_type = ?
                                AND utilisateur_id = ?
                            `,
                            [
                                resetData.utilisateur_type,
                                resetData.utilisateur_id
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


                                response.json({
                                    message:
                                        "Mot de passe réinitialisé avec succès"
                                });
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