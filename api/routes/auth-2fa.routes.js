"use strict";

/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");
const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const qrcode = require("qrcode");
const nodemailer = require("nodemailer");

const database = require("../database");

const {
    encryptSecret,
    decryptSecret,
    generateTotpSecret,
    verifyTotp,
    generateEmailCode
} = require("../services/two-factor");

const router = express.Router();

/* ==========================================================
   CONFIGURATION
========================================================== */

const CHALLENGE_DURATION = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_CHALLENGES_PER_10_MINUTES = 5;

const ALLOWED_ROLES = [
    "administrateur",
    "professeur"
];

const ALLOWED_METHODS = [
    "totp",
    "email",
    "configuration"
];

/* ==========================================================
   CONFIGURATION E-MAIL
========================================================== */

const mailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

/* ==========================================================
   REQUÊTES MYSQL
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
   CLÉ INDÉPENDANTE POUR LES DÉFIS 2FA
========================================================== */

function challengeKey()
{
    const key = process.env.TOTP_ENCRYPTION_KEY;

    if (!/^[a-f0-9]{64}$/i.test(key || ""))
    {
        throw new Error(
            "TOTP_ENCRYPTION_KEY invalide."
        );
    }

    return crypto
        .createHmac(
            "sha256",
            Buffer.from(key, "hex")
        )
        .update("irregular-cards:2fa-challenge:v1")
        .digest();
}

/* ==========================================================
   HASH DES CODES
========================================================== */

function hashCode(code, challengeId)
{
    return crypto
        .createHmac("sha256", challengeKey())
        .update(
            `${challengeId}:${String(code)}`
        )
        .digest("hex");
}

function compareHashes(actual, expected)
{
    if (
        typeof actual !== "string" ||
        typeof expected !== "string" ||
        !/^[a-f0-9]{64}$/i.test(actual) ||
        !/^[a-f0-9]{64}$/i.test(expected)
    )
    {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(actual, "hex"),
        Buffer.from(expected, "hex")
    );
}

/* ==========================================================
   JWT DE SESSION COMPLÈTE
========================================================== */

function createAccessToken(id, role)
{
    return jwt.sign(
        {
            id: Number(id),
            role,
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
   JWT TEMPORAIRE 2FA
========================================================== */

function createChallengeToken(
    challengeId,
    userId,
    userType
)
{
    return jwt.sign(
        {
            cid: Number(challengeId),
            uid: Number(userId),
            utilisateur_type: userType,
            token_type: "2fa_challenge"
        },
        challengeKey(),
        {
            algorithm: "HS256",
            expiresIn: "5m"
        }
    );
}

function readChallengeToken(token)
{
    const decoded = jwt.verify(
        String(token || ""),
        challengeKey(),
        {
            algorithms: ["HS256"]
        }
    );

    if (
        decoded.token_type !== "2fa_challenge" ||
        !Number.isInteger(decoded.cid) ||
        decoded.cid <= 0 ||
        !Number.isInteger(decoded.uid) ||
        decoded.uid <= 0 ||
        !ALLOWED_ROLES.includes(
            decoded.utilisateur_type
        )
    )
    {
        throw new Error("Défi 2FA invalide.");
    }

    return decoded;
}

/* ==========================================================
   UTILISATEUR
========================================================== */

function publicUser(user)
{
    return {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
    };
}

async function findUser(userType, userId)
{
    if (!ALLOWED_ROLES.includes(userType))
    {
        return null;
    }

    const users = await query(
        `SELECT id, nom, prenom, email
         FROM ${userType}
         WHERE id = ?
         LIMIT 1`,
        [userId]
    );

    return users[0] || null;
}

/* ==========================================================
   CONFIGURATION 2FA
========================================================== */

async function getConfiguration(userType, userId)
{
    const rows = await query(
        `SELECT *
         FROM authentification_2fa
         WHERE utilisateur_type = ?
           AND utilisateur_id = ?
         LIMIT 1`,
        [userType, userId]
    );

    return rows[0] || null;
}

/* ==========================================================
   CRÉATION D'UN DÉFI
========================================================== */

async function issueChallenge(
    userType,
    userId,
    method,
    emailCode = null
)
{
    if (
        !ALLOWED_ROLES.includes(userType) ||
        !ALLOWED_METHODS.includes(method)
    )
    {
        throw new Error("Paramètres 2FA invalides.");
    }

    const recent = await query(
        `SELECT COUNT(*) AS total
         FROM verification_email_2fa
         WHERE utilisateur_type = ?
           AND utilisateur_id = ?
           AND date_creation >
               DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
        [userType, userId]
    );

    if (
        Number(recent[0].total) >=
        MAX_CHALLENGES_PER_10_MINUTES
    )
    {
        const error = new Error(
            "Trop de demandes 2FA. Réessaie plus tard."
        );

        error.status = 429;

        throw error;
    }

    const expiration = new Date(
        Date.now() + CHALLENGE_DURATION
    );

    const result = await query(
        `INSERT INTO verification_email_2fa
         (
             utilisateur_type,
             utilisateur_id,
             methode,
             code_hash,
             date_expiration
         )
         VALUES (?, ?, ?, ?, ?)`,
        [
            userType,
            userId,
            method,
            "0".repeat(64),
            expiration
        ]
    );

    const challengeId = result.insertId;

    const value = emailCode === null
        ? crypto.randomBytes(32).toString("hex")
        : emailCode;

    await query(
        `UPDATE verification_email_2fa
         SET code_hash = ?
         WHERE id = ?`,
        [
            hashCode(value, challengeId),
            challengeId
        ]
    );

    return {
        id: challengeId,
        token: createChallengeToken(
            challengeId,
            userId,
            userType
        )
    };
}

/* ==========================================================
   LECTURE D'UN DÉFI VALIDE
========================================================== */

async function getChallenge(token)
{
    const decoded = readChallengeToken(token);

    const rows = await query(
        `SELECT *
         FROM verification_email_2fa
         WHERE id = ?
           AND utilisateur_type = ?
           AND utilisateur_id = ?
           AND date_utilisation IS NULL
           AND date_expiration > NOW()
           AND nombre_tentatives < ?
         LIMIT 1`,
        [
            decoded.cid,
            decoded.utilisateur_type,
            decoded.uid,
            MAX_ATTEMPTS
        ]
    );

    if (rows.length === 0)
    {
        throw new Error(
            "Défi 2FA invalide ou expiré."
        );
    }

    return {
        decoded,
        challenge: rows[0]
    };
}

/* ==========================================================
   MODIFICATION DE LA MÉTHODE D'UN DÉFI
========================================================== */

async function setChallengeMethod(
    challengeId,
    method
)
{
    if (!["totp", "email"].includes(method))
    {
        throw new Error("Méthode invalide.");
    }

    const result = await query(
        `UPDATE verification_email_2fa
         SET methode = ?
         WHERE id = ?
           AND methode = 'configuration'
           AND date_utilisation IS NULL
           AND date_expiration > NOW()
           AND nombre_tentatives < ?`,
        [
            method,
            challengeId,
            MAX_ATTEMPTS
        ]
    );

    return result.affectedRows === 1;
}

/* ==========================================================
   TENTATIVES
========================================================== */

async function incrementAttempts(challengeId)
{
    const result = await query(
        `UPDATE verification_email_2fa
         SET nombre_tentatives =
             nombre_tentatives + 1
         WHERE id = ?
           AND date_utilisation IS NULL
           AND date_expiration > NOW()
           AND nombre_tentatives < ?`,
        [
            challengeId,
            MAX_ATTEMPTS
        ]
    );

    return result.affectedRows === 1;
}

/* ==========================================================
   CONSOMMATION D'UN DÉFI
========================================================== */

async function consumeChallenge(challengeId)
{
    const result = await query(
        `UPDATE verification_email_2fa
         SET date_utilisation = NOW()
         WHERE id = ?
           AND date_utilisation IS NULL
           AND date_expiration > NOW()
           AND nombre_tentatives <= ?`,
        [
            challengeId,
            MAX_ATTEMPTS
        ]
    );

    return result.affectedRows === 1;
}

/* ==========================================================
   INVALIDATION DES AUTRES DÉFIS
========================================================== */

async function invalidateChallenges(
    userType,
    userId
)
{
    await query(
        `UPDATE verification_email_2fa
         SET date_utilisation = NOW()
         WHERE utilisateur_type = ?
           AND utilisateur_id = ?
           AND date_utilisation IS NULL`,
        [
            userType,
            userId
        ]
    );
}

/* ==========================================================
   ENVOI DU CODE E-MAIL
========================================================== */

async function sendEmailCode(email, code)
{
    await mailTransporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject:
            "Irregular Cards - Code de sécurité",
        text:
            `Votre code de vérification est : ${code}\n\n` +
            "Ce code est valable pendant 5 minutes.\n\n" +
            "Si vous n'avez pas demandé ce code, " +
            "ignorez cet e-mail."
    });
}

/* ==========================================================
   OUVERTURE DE SESSION
========================================================== */

async function finishLogin(response, decoded)
{
    const user = await findUser(
        decoded.utilisateur_type,
        decoded.uid
    );

    if (!user)
    {
        return response.status(401).json({
            error: "Compte introuvable"
        });
    }

    return response.json({
        token: createAccessToken(
            user.id,
            decoded.utilisateur_type
        ),
        role: decoded.utilisateur_type,
        utilisateur: publicUser(user)
    });
}

/* ==========================================================
   DÉMARRAGE 2FA APRÈS MOT DE PASSE
========================================================== */

async function beginTwoFactor(
    response,
    user,
    userType
)
{
    const configuration = await getConfiguration(
        userType,
        user.id
    );

    if (
        !configuration ||
        !configuration.est_active
    )
    {
        const challenge = await issueChallenge(
            userType,
            user.id,
            "configuration"
        );

        return response.json({
            requires_2fa: true,
            setup_required: true,
            challenge_token: challenge.token,
            methods: [
                "totp",
                "email"
            ]
        });
    }

    if (configuration.methode === "totp")
    {
        const challenge = await issueChallenge(
            userType,
            user.id,
            "totp"
        );

        return response.json({
            requires_2fa: true,
            setup_required: false,
            method: "totp",
            challenge_token: challenge.token
        });
    }

    if (configuration.methode === "email")
    {
        const code = generateEmailCode();

        const challenge = await issueChallenge(
            userType,
            user.id,
            "email",
            code
        );

        try
        {
            await sendEmailCode(
                user.email,
                code
            );
        }
        catch (error)
        {
            await consumeChallenge(challenge.id);
            throw error;
        }

        return response.json({
            requires_2fa: true,
            setup_required: false,
            method: "email",
            challenge_token: challenge.token
        });
    }

    throw new Error(
        "Configuration 2FA inconnue."
    );
}

/* ==========================================================
   CONFIGURATION AUTHENTICATOR
========================================================== */

router.post(
    "/setup/totp",
    async (request, response) =>
    {
        try
        {
            const { decoded, challenge } =
                await getChallenge(
                    request.body.challenge_token
                );

            if (
                challenge.methode !== "configuration"
            )
            {
                return response.status(403).json({
                    error:
                        "Ce défi ne permet pas la configuration."
                });
            }

            const configuration =
                await getConfiguration(
                    decoded.utilisateur_type,
                    decoded.uid
                );

            if (
                configuration &&
                configuration.est_active
            )
            {
                return response.status(403).json({
                    error:
                        "La double authentification est déjà active."
                });
            }

            const user = await findUser(
                decoded.utilisateur_type,
                decoded.uid
            );

            if (!user)
            {
                return response.status(401).json({
                    error: "Compte introuvable."
                });
            }

            const secret = generateTotpSecret();

            const encrypted = encryptSecret(secret);

            const methodChanged =
                await setChallengeMethod(
                    challenge.id,
                    "totp"
                );

            if (!methodChanged)
            {
                return response.status(409).json({
                    error:
                        "Ce défi a déjà été utilisé pour une autre méthode."
                });
            }

            await query(
                `INSERT INTO authentification_2fa
                 (
                     utilisateur_type,
                     utilisateur_id,
                     methode,
                     secret_chiffre,
                     est_active
                 )
                 VALUES (?, ?, 'totp', ?, 0)
                 ON DUPLICATE KEY UPDATE
                     methode = 'totp',
                     secret_chiffre = VALUES(secret_chiffre),
                     est_active = 0,
                     date_activation = NULL`,
                [
                    decoded.utilisateur_type,
                    decoded.uid,
                    encrypted
                ]
            );

            const label =
                `Irregular Cards:${user.email}`;

            const uri =
                `otpauth://totp/${encodeURIComponent(label)}` +
                `?secret=${secret}` +
                `&issuer=${encodeURIComponent("Irregular Cards")}` +
                "&algorithm=SHA1&digits=6&period=30";

            const qrCode =
                await qrcode.toDataURL(uri);

            return response.json({
                method: "totp",
                secret,
                qr_code: qrCode
            });
        }
        catch (error)
        {
            console.error(
                "Configuration TOTP :",
                error
            );

            return response.status(
                error.status || 400
            ).json({
                error:
                    "Configuration Authenticator impossible."
            });
        }
    }
);

/* ==========================================================
   CONFIGURATION PAR E-MAIL
========================================================== */

router.post(
    "/setup/email",
    async (request, response) =>
    {
        try
        {
            const { decoded, challenge } =
                await getChallenge(
                    request.body.challenge_token
                );

            if (
                challenge.methode !== "configuration"
            )
            {
                return response.status(403).json({
                    error:
                        "Ce défi ne permet pas la configuration."
                });
            }

            const configuration =
                await getConfiguration(
                    decoded.utilisateur_type,
                    decoded.uid
                );

            if (
                configuration &&
                configuration.est_active
            )
            {
                return response.status(403).json({
                    error:
                        "La double authentification est déjà active."
                });
            }

            const user = await findUser(
                decoded.utilisateur_type,
                decoded.uid
            );

            if (!user)
            {
                return response.status(401).json({
                    error: "Compte introuvable."
                });
            }

            const methodChanged =
                await setChallengeMethod(
                    challenge.id,
                    "email"
                );

            if (!methodChanged)
            {
                return response.status(409).json({
                    error:
                        "Ce défi a déjà été utilisé pour une autre méthode."
                });
            }

            const code = generateEmailCode();

            await query(
                `UPDATE verification_email_2fa
                 SET code_hash = ?
                 WHERE id = ?
                   AND methode = 'email'
                   AND date_utilisation IS NULL`,
                [
                    hashCode(code, challenge.id),
                    challenge.id
                ]
            );

            try
            {
                await sendEmailCode(
                    user.email,
                    code
                );
            }
            catch (error)
            {
                await consumeChallenge(challenge.id);
                throw error;
            }

            return response.json({
                method: "email",
                challenge_token:
                    request.body.challenge_token,
                message:
                    "Un code de vérification a été envoyé."
            });
        }
        catch (error)
        {
            console.error(
                "Configuration e-mail 2FA :",
                error
            );

            return response.status(
                error.status || 500
            ).json({
                error:
                    "Impossible d'envoyer le code de vérification."
            });
        }
    }
);

/* ==========================================================
   VÉRIFICATION DU CODE
========================================================== */

router.post(
    "/verify",
    async (request, response) =>
    {
        try
        {
            const { decoded, challenge } =
                await getChallenge(
                    request.body.challenge_token
                );

            const code = String(
                request.body.code || ""
            ).trim();

            if (!/^\d{6}$/.test(code))
            {
                return response.status(400).json({
                    error:
                        "Le code doit contenir 6 chiffres."
                });
            }

            if (
                !["totp", "email"].includes(
                    challenge.methode
                )
            )
            {
                return response.status(403).json({
                    error:
                        "Choisis d'abord une méthode de vérification."
                });
            }

            if (
                !await incrementAttempts(
                    challenge.id
                )
            )
            {
                return response.status(429).json({
                    error:
                        "Nombre maximal de tentatives atteint."
                });
            }

            const configuration =
                await getConfiguration(
                    decoded.utilisateur_type,
                    decoded.uid
                );

            let valid = false;
            let activationMethod = null;

            if (
                configuration &&
                configuration.est_active
            )
            {
                if (
                    configuration.methode !==
                    challenge.methode
                )
                {
                    return response.status(403).json({
                        error:
                            "Méthode de vérification incorrecte."
                    });
                }

                if (
                    challenge.methode === "totp"
                )
                {
                    valid = verifyTotp(
                        decryptSecret(
                            configuration.secret_chiffre
                        ),
                        code
                    );
                }
                else
                {
                    valid = compareHashes(
                        hashCode(
                            code,
                            challenge.id
                        ),
                        challenge.code_hash
                    );
                }
            }
            else
            {
                activationMethod =
                    challenge.methode;

                if (
                    challenge.methode === "totp" &&
                    configuration &&
                    configuration.methode === "totp" &&
                    configuration.secret_chiffre
                )
                {
                    valid = verifyTotp(
                        decryptSecret(
                            configuration.secret_chiffre
                        ),
                        code
                    );
                }
                else if (
                    challenge.methode === "email"
                )
                {
                    valid = compareHashes(
                        hashCode(
                            code,
                            challenge.id
                        ),
                        challenge.code_hash
                    );
                }
            }

            if (!valid)
            {
                return response.status(401).json({
                    error:
                        "Code incorrect ou expiré."
                });
            }

            if (
                !await consumeChallenge(
                    challenge.id
                )
            )
            {
                return response.status(401).json({
                    error:
                        "Code déjà utilisé ou expiré."
                });
            }

            if (
                activationMethod === "email"
            )
            {
                await query(
                    `INSERT INTO authentification_2fa
                     (
                         utilisateur_type,
                         utilisateur_id,
                         methode,
                         secret_chiffre,
                         est_active,
                         date_activation
                     )
                     VALUES (?, ?, 'email', '', 1, NOW())
                     ON DUPLICATE KEY UPDATE
                         methode = 'email',
                         secret_chiffre = '',
                         est_active = 1,
                         date_activation = NOW()`,
                    [
                        decoded.utilisateur_type,
                        decoded.uid
                    ]
                );
            }
            else if (
                activationMethod === "totp"
            )
            {
                const result = await query(
                    `UPDATE authentification_2fa
                     SET est_active = 1,
                         date_activation = NOW()
                     WHERE utilisateur_type = ?
                       AND utilisateur_id = ?
                       AND methode = 'totp'
                       AND est_active = 0`,
                    [
                        decoded.utilisateur_type,
                        decoded.uid
                    ]
                );

                if (result.affectedRows !== 1)
                {
                    return response.status(409).json({
                        error:
                            "Activation Authenticator impossible."
                    });
                }
            }

            await invalidateChallenges(
                decoded.utilisateur_type,
                decoded.uid
            );

            return await finishLogin(
                response,
                decoded
            );
        }
        catch (error)
        {
            console.error(
                "Vérification 2FA :",
                error
            );

            return response.status(401).json({
                error:
                    "Vérification 2FA impossible ou expirée."
            });
        }
    }
);

/* ==========================================================
   EXPORTS
========================================================== */

module.exports = {
    router,
    beginTwoFactor
};