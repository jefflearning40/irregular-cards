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


    if (!authorizationHeader)
    {
        response.status(401).json({
            error:
                "Token manquant"
        });

        return;
    }


    const token =
        authorizationHeader.split(" ")[1];


    if (!token)
    {
        response.status(401).json({
            error:
                "Token manquant"
        });

        return;
    }


    try
    {
        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        request.user =
            decoded;


        next();
    }
    catch (error)
    {
        response.status(401).json({
            error:
                "Token invalide ou expiré"
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
        response.status(403).json({
            error:
                "Accès réservé aux professeurs"
        });

        return;
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
        response.status(403).json({
            error:
                "Accès réservé aux élèves"
        });

        return;
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
        response.status(403).json({
            error:
                "Accès réservé aux administrateurs"
        });

        return;
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