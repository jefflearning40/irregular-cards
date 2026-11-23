"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const jwt = require("jsonwebtoken");


/* ==========================================================
   VÉRIFICATION DU TOKEN JWT
========================================================== */

function verifyToken(
    request,
    response,
    next
)
{
    const authorizationHeader =
        request.headers.authorization;

    if (
        !authorizationHeader ||
        !/^Bearer\s+\S+$/i.test(authorizationHeader)
    )
    {
        return response.status(401).json({
            error: "Token manquant ou mal formé"
        });
    }

    const token =
        authorizationHeader.split(/\s+/)[1];

    try
    {
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET,
                {
                    algorithms: ["HS256"]
                }
            );

        /*
           Seuls les tokens de session complète sont acceptés.

           Les futurs tokens temporaires 2FA porteront
           token_type = "2fa_challenge" et seront refusés.
        */

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !Number.isInteger(decoded.id) ||
            decoded.id <= 0 ||
            ![
                "eleve",
                "professeur",
                "administrateur"
            ].includes(decoded.role) ||
            (
                decoded.token_type !== undefined &&
                decoded.token_type !== "access"
            )
        )
        {
            return response.status(401).json({
                error: "Token non autorisé"
            });
        }

        request.user =
            decoded;

        next();
    }
    catch (error)
    {
        return response.status(401).json({
            error: "Token invalide ou expiré"
        });
    }
}


/* ==========================================================
   AUTORISATION PROFESSEUR
========================================================== */

function requireProfessor(
    request,
    response,
    next
)
{
    if (
        !request.user ||
        request.user.role !== "professeur"
    )
    {
        return response.status(403).json({
            error: "Accès réservé aux professeurs"
        });
    }

    next();
}


/* ==========================================================
   AUTORISATION ÉLÈVE
========================================================== */

function requireStudent(
    request,
    response,
    next
)
{
    if (
        !request.user ||
        request.user.role !== "eleve"
    )
    {
        return response.status(403).json({
            error: "Accès réservé aux élèves"
        });
    }

    next();
}


/* ==========================================================
   AUTORISATION ADMINISTRATEUR
========================================================== */

function requireAdmin(
    request,
    response,
    next
)
{
    if (
        !request.user ||
        request.user.role !== "administrateur"
    )
    {
        return response.status(403).json({
            error: "Accès réservé aux administrateurs"
        });
    }

    next();
}


/* ==========================================================
   EXPORTS
========================================================== */

module.exports = {
    verifyToken,
    requireProfessor,
    requireStudent,
    requireAdmin
};