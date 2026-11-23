"use strict";

/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const database = require("../database");

const {
    router: twoFactorRouter,
    beginTwoFactor
} = require("./auth-2fa.routes");

/* ==========================================================
   ROUTER
========================================================== */

const router = express.Router();

/* ==========================================================
   CONFIGURATION DES E-MAILS
========================================================== */

const mailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,

    port: Number(
        process.env.MAIL_PORT || 587
    ),

    secure:
        Number(process.env.MAIL_PORT) === 465,

    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

/* ==========================================================
   ROUTES DE DOUBLE AUTHENTIFICATION
========================================================== */

router.use(
    "/2fa",
    twoFactorRouter
);

/* ==========================================================
   UTILITAIRE MYSQL
========================================================== */

function query(sql, parameters = [])
{
    return new Promise((resolve, reject) => {

        database.query(
            sql,
            parameters,
            (error, result) => {

                if (error)
                {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );
    });
}

/* ==========================================================
   CRÉATION DU TOKEN DE SESSION
========================================================== */

function createToken(id, role)
{
    return jwt.sign(
        {
            id: Number(id),
            role: role,
            token_type: "access"
        },

        process.env.JWT_SECRET,

        {
            algorithm: "HS256",
            expiresIn: "2h"
        }
    );
}

/* ==========================================================
   RÉPONSE DE CONNEXION
========================================================== */

function sendLoginResponse(response, user, role)
{
    const token = createToken(
        user.id,
        role
    );

    const utilisateur = {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
    };

    if (role === "eleve")
    {
        utilisateur.professeur_id =
            user.professeur_id;
    }

    return response.json({
        token: token,
        role: role,
        utilisateur: utilisateur
    });
}

/* ==========================================================
   VÉRIFICATION DU MOT DE PASSE
========================================================== */

async function checkPassword(password, hash)
{
    return bcrypt.compare(
        password,
        hash
    );
}

/* ==========================================================
   GESTION DES ERREURS
========================================================== */

function handleServerError(response, error, context)
{
    console.error(
        context,
        error
    );

    if (response.headersSent)
    {
        return;
    }

    const status =
        error && error.status === 429
            ? 429
            : 500;

    return response.status(status).json({
        error:
            status === 429
                ? error.message
                : "Erreur serveur"
    });
}

/* ==========================================================
   CONNEXION UNIQUE
========================================================== */

router.post(
    "/login",

    async (request, response) =>
    {
        try
        {
            const email = String(
                request.body?.email || ""
            ).trim();

            const motDePasse =
                request.body?.mot_de_passe;

            if (
                !email ||
                typeof motDePasse !== "string" ||
                !motDePasse
            )
            {
                return response.status(400).json({
                    error:
                        "Email et mot de passe obligatoires"
                });
            }

            /* ==============================================
               RECHERCHE DANS LES ÉLÈVES
            ============================================== */

            const students = await query(
                `
                    SELECT *
                    FROM eleve
                    WHERE email = ?
                    LIMIT 1
                `,
                [email]
            );

            if (students.length > 0)
            {
                const student = students[0];

                const passwordIsValid =
                    await checkPassword(
                        motDePasse,
                        student.mot_de_passe
                    );

                if (!passwordIsValid)
                {
                    return response.status(401).json({
                        error:
                            "Identifiants incorrects"
                    });
                }

                /* ==========================================
                   CONNEXION ÉLÈVE SANS 2FA
                ========================================== */

                return sendLoginResponse(
                    response,
                    student,
                    "eleve"
                );
            }

            /* ==============================================
               RECHERCHE DANS LES PROFESSEURS
            ============================================== */

            const teachers = await query(
                `
                    SELECT *
                    FROM professeur
                    WHERE email = ?
                    LIMIT 1
                `,
                [email]
            );

            if (teachers.length > 0)
            {
                const teacher = teachers[0];

                const passwordIsValid =
                    await checkPassword(
                        motDePasse,
                        teacher.mot_de_passe
                    );

                if (!passwordIsValid)
                {
                    return response.status(401).json({
                        error:
                            "Identifiants incorrects"
                    });
                }

                /* ==========================================
                   CONNEXION PROFESSEUR AVEC 2FA
                ========================================== */

                return await beginTwoFactor(
                    response,
                    teacher,
                    "professeur"
                );
            }

            /* ==============================================
               RECHERCHE DANS LES ADMINISTRATEURS
            ============================================== */

            const admins = await query(
                `
                    SELECT *
                    FROM administrateur
                    WHERE email = ?
                    LIMIT 1
                `,
                [email]
            );

            if (admins.length === 0)
            {
                return response.status(401).json({
                    error:
                        "Identifiants incorrects"
                });
            }

            const admin = admins[0];

            const passwordIsValid =
                await checkPassword(
                    motDePasse,
                    admin.mot_de_passe
                );

            if (!passwordIsValid)
            {
                return response.status(401).json({
                    error:
                        "Identifiants incorrects"
                });
            }

            /* ==============================================
               CONNEXION ADMINISTRATEUR AVEC 2FA
            ========================================== */

            return await beginTwoFactor(
                response,
                admin,
                "administrateur"
            );
        }
        catch (error)
        {
            return handleServerError(
                response,
                error,
                "Erreur de connexion :"
            );
        }
    }
);

/* ==========================================================
   DEMANDE DE RÉINITIALISATION DU MOT DE PASSE
========================================================== */

router.post(
    "/mot-de-passe-oublie",

    async (request, response) =>
    {
        const genericMessage =
            "Si cette adresse correspond à un compte, " +
            "un e-mail de réinitialisation sera envoyé.";

        try
        {
            const email = String(
                request.body?.email || ""
            )
                .trim()
                .toLowerCase();

            if (!email)
            {
                return response.json({
                    message: genericMessage
                });
            }

            /* ==============================================
               RECHERCHE DE L'UTILISATEUR
            ============================================== */

            const users = await query(
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
                ]
            );

            if (users.length === 0)
            {
                return response.json({
                    message: genericMessage
                });
            }

            const user = users[0];

            /* ==============================================
               GÉNÉRATION DU TOKEN
            ============================================== */

            const resetToken = crypto
                .randomBytes(32)
                .toString("hex");

            const tokenHash = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

            /* ==============================================
               EXPIRATION : 30 MINUTES
            ============================================== */

            const expirationDate = new Date(
                Date.now() + 30 * 60 * 1000
            );

            /* ==============================================
               INVALIDATION DES ANCIENS TOKENS
            ============================================== */

            await query(
                `
                    DELETE FROM
                        reinitialisation_mot_de_passe
                    WHERE utilisateur_type = ?
                      AND utilisateur_id = ?
                `,
                [
                    user.utilisateur_type,
                    user.id
                ]
            );

            /* ==============================================
               ENREGISTREMENT DU HASH
            ============================================== */

            await query(
                `
                    INSERT INTO
                        reinitialisation_mot_de_passe
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
                ]
            );

            /* ==============================================
               CRÉATION DU LIEN
            ============================================== */

            const resetLink =
                `${process.env.APP_URL}/?reset_token=${resetToken}`;

            /* ==============================================
               ENVOI DE L'E-MAIL
            ============================================== */

            try
            {
                await mailTransporter.sendMail({
                    from: process.env.MAIL_FROM,

                    to: user.email,

                    subject:
                        "Irregular Cards - Réinitialisation du mot de passe",

                    text:
                        "Une demande de réinitialisation " +
                        "de votre mot de passe a été effectuée.\n\n" +

                        "Pour créer un nouveau mot de passe, " +
                        "utilisez le lien suivant :\n\n" +

                        `${resetLink}\n\n` +

                        "Ce lien est valable pendant 30 minutes.\n\n" +

                        "Si vous n'êtes pas à l'origine " +
                        "de cette demande, ignorez cet e-mail."
                });
            }
            catch (mailError)
            {
                console.error(
                    "Erreur envoi e-mail :",
                    mailError
                );

                return response.status(500).json({
                    error:
                        "Erreur lors de l'envoi de l'e-mail"
                });
            }

            return response.json({
                message: genericMessage
            });
        }
        catch (error)
        {
            return handleServerError(
                response,
                error,
                "Erreur mot de passe oublié :"
            );
        }
    }
);

/* ==========================================================
   VÉRIFICATION DU TOKEN DE RÉINITIALISATION
========================================================== */

router.post(
    "/verifier-token-reinitialisation",

    async (request, response) =>
    {
        try
        {
            const token = String(
                request.body?.token || ""
            ).trim();

            if (!token)
            {
                return response.status(400).json({
                    error: "Token manquant"
                });
            }

            /* ==============================================
               HASH DU TOKEN
            ============================================== */

            const tokenHash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

            /* ==============================================
               RECHERCHE EN BASE
            ============================================== */

            const resetTokens = await query(
                `
                    SELECT
                        id,
                        date_expiration
                    FROM reinitialisation_mot_de_passe
                    WHERE token_hash = ?
                    LIMIT 1
                `,
                [tokenHash]
            );

            if (resetTokens.length === 0)
            {
                return response.status(400).json({
                    error:
                        "Lien invalide ou expiré"
                });
            }

            const resetData = resetTokens[0];

            /* ==============================================
               CONTRÔLE DE L'EXPIRATION
            ============================================== */

            const expiration = new Date(
                resetData.date_expiration
            ).getTime();

            if (
                !Number.isFinite(expiration) ||
                expiration <= Date.now()
            )
            {
                await query(
                    `
                        DELETE FROM
                            reinitialisation_mot_de_passe
                        WHERE id = ?
                    `,
                    [resetData.id]
                );

                return response.status(400).json({
                    error:
                        "Lien invalide ou expiré"
                });
            }

            return response.status(200).json({
                valid: true
            });
        }
        catch (error)
        {
            return handleServerError(
                response,
                error,
                "Erreur vérification token :"
            );
        }
    }
);

/* ==========================================================
   RÉINITIALISATION DU MOT DE PASSE
========================================================== */

router.post(
    "/reinitialiser-mot-de-passe",

    async (request, response) =>
    {
        try
        {
            const token = String(
                request.body?.token || ""
            ).trim();

            const motDePasse = String(
                request.body?.mot_de_passe || ""
            );

            /* ==============================================
               VÉRIFICATION DES DONNÉES
            ============================================== */

            if (
                !token ||
                !motDePasse
            )
            {
                return response.status(400).json({
                    error:
                        "Token et nouveau mot de passe obligatoires"
                });
            }

            /* ==============================================
               LONGUEUR DU MOT DE PASSE
            ============================================== */

            if (
                motDePasse.length < 8 ||
                motDePasse.length > 72
            )
            {
                return response.status(400).json({
                    error:
                        "Le mot de passe doit contenir " +
                        "entre 8 et 72 caractères"
                });
            }

            /* ==============================================
               PRÉSENCE D'UNE LETTRE ET D'UN CHIFFRE
            ============================================== */

            const passwordHasLetter =
                /\p{L}/u.test(motDePasse);

            const passwordHasNumber =
                /\d/.test(motDePasse);

            if (
                !passwordHasLetter ||
                !passwordHasNumber
            )
            {
                return response.status(400).json({
                    error:
                        "Le mot de passe doit contenir " +
                        "au moins une lettre et un chiffre"
                });
            }

            /* ==============================================
               HASH DU TOKEN
            ============================================== */

            const tokenHash = crypto
                .createHash("sha256")
                .update(token)
                .digest("hex");

            /* ==============================================
               RECHERCHE DU TOKEN
            ============================================== */

            const resetTokens = await query(
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
                [tokenHash]
            );

            if (resetTokens.length === 0)
            {
                return response.status(400).json({
                    error:
                        "Lien de réinitialisation invalide ou expiré"
                });
            }

            const resetData = resetTokens[0];

            /* ==============================================
               VÉRIFICATION DE L'EXPIRATION
            ============================================== */

            const expiration = new Date(
                resetData.date_expiration
            ).getTime();

            if (
                !Number.isFinite(expiration) ||
                expiration <= Date.now()
            )
            {
                await query(
                    `
                        DELETE FROM
                            reinitialisation_mot_de_passe
                        WHERE id = ?
                    `,
                    [resetData.id]
                );

                return response.status(400).json({
                    error:
                        "Lien de réinitialisation invalide ou expiré"
                });
            }

            /* ==============================================
               VÉRIFICATION DU TYPE D'UTILISATEUR
            ============================================== */

            if (
                resetData.utilisateur_type !== "eleve" &&
                resetData.utilisateur_type !== "professeur"
            )
            {
                return response.status(400).json({
                    error:
                        "Lien de réinitialisation invalide ou expiré"
                });
            }

            /* ==============================================
               HASH DU NOUVEAU MOT DE PASSE
            ============================================== */

            const passwordHash = await bcrypt.hash(
                motDePasse,
                10
            );

            /* ==============================================
               TABLE À MODIFIER
            ============================================== */

            const tableName =
                resetData.utilisateur_type === "eleve"
                    ? "eleve"
                    : "professeur";

            /* ==============================================
               MODIFICATION DU MOT DE PASSE
            ============================================== */

            const updateResult = await query(
                `
                    UPDATE ${tableName}
                    SET mot_de_passe = ?
                    WHERE id = ?
                `,
                [
                    passwordHash,
                    resetData.utilisateur_id
                ]
            );

            if (updateResult.affectedRows === 0)
            {
                return response.status(400).json({
                    error:
                        "Lien de réinitialisation invalide ou expiré"
                });
            }

            /* ==============================================
               SUPPRESSION DES TOKENS UTILISÉS
            ============================================== */

            await query(
                `
                    DELETE FROM
                        reinitialisation_mot_de_passe
                    WHERE utilisateur_type = ?
                      AND utilisateur_id = ?
                `,
                [
                    resetData.utilisateur_type,
                    resetData.utilisateur_id
                ]
            );

            return response.json({
                message:
                    "Mot de passe réinitialisé avec succès"
            });
        }
        catch (error)
        {
            return handleServerError(
                response,
                error,
                "Erreur réinitialisation mot de passe :"
            );
        }
    }
);

/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;