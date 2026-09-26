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
   VALIDATION DES DONNÉES
========================================================== */

function normalizeText(value)
{
    if (
        typeof value !==
        "string"
    )
    {
        return "";
    }


    return value
        .trim()
        .replace(
            /\s+/g,
            " "
        );
}


function normalizeEmail(value)
{
    if (
        typeof value !==
        "string"
    )
    {
        return "";
    }


    return value
        .trim()
        .toLowerCase();
}


function isValidName(value)
{
    if (
        value.length < 2 ||
        value.length > 50
    )
    {
        return false;
    }


    return /^[\p{L}\p{M}' -]+$/u.test(
        value
    );
}


function isValidEmail(value)
{
    if (
        value.length > 254
    )
    {
        return false;
    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        value
    );
}


function isValidPassword(value)
{
    if (
        typeof value !==
        "string"
    )
    {
        return false;
    }


    if (
        value.length < 8 ||
        value.length > 72
    )
    {
        return false;
    }


    const hasLetter =
        /\p{L}/u.test(
            value
        );

    const hasNumber =
        /\d/.test(
            value
        );


    return (
        hasLetter &&
        hasNumber
    );
}


/* ==========================================================
   LISTE DES ÉLÈVES DU PROFESSEUR
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
                    eleve.id,
                    eleve.professeur_id,
                    eleve.nom,
                    eleve.prenom,
                    eleve.email,
                    eleve.date_creation,

                    COUNT(
                        session_quiz.id
                    ) AS nombre_quiz,

                    ROUND(
                        COALESCE(
                            AVG(
                                CASE
                                    WHEN session_quiz.nombre_questions > 0
                                    THEN
                                        (
                                            session_quiz.score /
                                            session_quiz.nombre_questions
                                        ) * 100
                                    ELSE NULL
                                END
                            ),
                            0
                        ),
                        1
                    ) AS moyenne

                FROM eleve

                LEFT JOIN session_quiz
                    ON session_quiz.eleve_id =
                        eleve.id

                WHERE eleve.professeur_id = ?

                GROUP BY
                    eleve.id,
                    eleve.professeur_id,
                    eleve.nom,
                    eleve.prenom,
                    eleve.email,
                    eleve.date_creation

                ORDER BY
                    eleve.nom ASC,
                    eleve.prenom ASC
            `,
            [professeurId],
            (error, results) =>
            {
                if (error)
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


                const students =
                    results.map(
                        (student) =>
                        {
                            return {
                                id:
                                    student.id,

                                professeur_id:
                                    student.professeur_id,

                                nom:
                                    student.nom,

                                prenom:
                                    student.prenom,

                                email:
                                    student.email,

                                date_creation:
                                    student.date_creation,

                                nombre_quiz:
                                    Number(
                                        student.nombre_quiz
                                    ),

                                moyenne:
                                    Number(
                                        student.moyenne
                                    )
                            };
                        }
                    );


                response.json(
                    students
                );
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
                    console.error(
                        error
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                if (
                    results.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Élève introuvable"
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


            const nom =
                normalizeText(
                    request.body.nom
                );

            const prenom =
                normalizeText(
                    request.body.prenom
                );

            const email =
                normalizeEmail(
                    request.body.email
                );

            const motDePasse =
                request.body.mot_de_passe;


            /* ==============================================
               CHAMPS OBLIGATOIRES
            ============================================== */

            if (
                !nom ||
                !prenom ||
                !email ||
                !motDePasse
            )
            {
                response.status(400).json({
                    error:
                        "Tous les champs sont obligatoires"
                });

                return;
            }


            /* ==============================================
               NOM
            ============================================== */

            if (
                !isValidName(
                    nom
                )
            )
            {
                response.status(400).json({
                    error:
                        "Nom invalide"
                });

                return;
            }


            /* ==============================================
               PRÉNOM
            ============================================== */

            if (
                !isValidName(
                    prenom
                )
            )
            {
                response.status(400).json({
                    error:
                        "Prénom invalide"
                });

                return;
            }


            /* ==============================================
               E-MAIL
            ============================================== */

            if (
                !isValidEmail(
                    email
                )
            )
            {
                response.status(400).json({
                    error:
                        "Adresse e-mail invalide"
                });

                return;
            }


            /* ==============================================
               MOT DE PASSE
            ============================================== */

            if (
                !isValidPassword(
                    motDePasse
                )
            )
            {
                response.status(400).json({
                    error:
                        "Le mot de passe doit contenir entre 8 et 72 caractères, avec au moins une lettre et un chiffre"
                });

                return;
            }


            /* ==============================================
               HACHAGE DU MOT DE PASSE
            ============================================== */

            const motDePasseHash =
                await bcrypt.hash(
                    motDePasse,
                    12
                );


            /* ==============================================
               ENREGISTREMENT
            ============================================== */

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
                        console.error(
                            error
                        );


                        if (
                            error.code ===
                            "ER_DUP_ENTRY"
                        )
                        {
                            response.status(409).json({
                                error:
                                    "Cette adresse email est déjà utilisée"
                            });

                            return;
                        }


                        response.status(500).json({
                            error:
                                "Erreur serveur"
                        });

                        return;
                    }


                    response.status(201).json({
                        id:
                            result.insertId,

                        professeur_id:
                            professeurId,

                        nom:
                            nom,

                        prenom:
                            prenom,

                        email:
                            email
                    });
                }
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


        const nom =
            normalizeText(
                request.body.nom
            );

        const prenom =
            normalizeText(
                request.body.prenom
            );

        const email =
            normalizeEmail(
                request.body.email
            );


        if (
            !nom ||
            !prenom ||
            !email
        )
        {
            response.status(400).json({
                error:
                    "Tous les champs sont obligatoires"
            });

            return;
        }


        if (
            !isValidName(
                nom
            )
        )
        {
            response.status(400).json({
                error:
                    "Nom invalide"
            });

            return;
        }


        if (
            !isValidName(
                prenom
            )
        )
        {
            response.status(400).json({
                error:
                    "Prénom invalide"
            });

            return;
        }


        if (
            !isValidEmail(
                email
            )
        )
        {
            response.status(400).json({
                error:
                    "Adresse e-mail invalide"
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
                    console.error(
                        error
                    );


                    if (
                        error.code ===
                        "ER_DUP_ENTRY"
                    )
                    {
                        response.status(409).json({
                            error:
                                "Cette adresse email est déjà utilisée"
                        });

                        return;
                    }


                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                if (
                    result.affectedRows === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Élève introuvable"
                    });

                    return;
                }


                response.json({
                    id:
                        Number(id),

                    professeur_id:
                        professeurId,

                    nom:
                        nom,

                    prenom:
                        prenom,

                    email:
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
                    console.error(
                        error
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                if (
                    result.affectedRows === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Élève introuvable"
                    });

                    return;
                }


                response.json({
                    message:
                        "Élève supprimé"
                });
            }
        );
    }
);


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;