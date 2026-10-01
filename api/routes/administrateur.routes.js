"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express =
    require("express");

const bcrypt =
    require("bcrypt");

const PDFDocument =
    require("pdfkit");


const fs =
    require("fs");


const path =
    require("path");

const database =
    require("../database");

const {
    verifyToken,
    requireAdmin
} =
    require("../middleware/auth.middleware");


/* ==========================================================
   ROUTER
========================================================== */

const router =
    express.Router();


/* ==========================================================
   CONSTANTES DE VALIDATION
========================================================== */

const namePattern =
    /^[\p{L}\p{M}' -]+$/u;

const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


/* ==========================================================
   TEST ACCÈS ADMINISTRATEUR
========================================================== */

router.get(
    "/test",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        response.status(200).json({
            message:
                "Accès administrateur autorisé",

            administrateur_id:
                request.user.id,

            role:
                request.user.role
        });
    }
);


/* ==========================================================
   LISTE DES PROFESSEURS
========================================================== */

router.get(
    "/professeurs",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        database.query(
            `
                SELECT
                    professeur.id,
                    professeur.nom,
                    professeur.prenom,
                    professeur.email,
                    professeur.date_creation,
                    COUNT(eleve.id) AS nombre_eleves

                FROM professeur

                LEFT JOIN eleve
                    ON eleve.professeur_id =
                       professeur.id

                GROUP BY
                    professeur.id,
                    professeur.nom,
                    professeur.prenom,
                    professeur.email,
                    professeur.date_creation

                ORDER BY
                    professeur.nom ASC,
                    professeur.prenom ASC
            `,
            (error, professors) =>
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


                response.status(200).json({
                    professeurs:
                        professors
                });
            }
        );
    }
);


/* ==========================================================
   CRÉATION D'UN PROFESSEUR
========================================================== */

router.post(
    "/professeurs",
    verifyToken,
    requireAdmin,
    async (request, response) =>
    {
        let {
            nom,
            prenom,
            email,
            mot_de_passe
        } = request.body;


        /* ==================================================
           CHAMPS OBLIGATOIRES
        ================================================== */

        if (
            typeof nom !== "string" ||
            typeof prenom !== "string" ||
            typeof email !== "string" ||
            typeof mot_de_passe !== "string"
        )
        {
            response.status(400).json({
                error:
                    "Tous les champs sont obligatoires"
            });

            return;
        }


        nom =
            nom.trim();

        prenom =
            prenom.trim();

        email =
            email.trim().toLowerCase();


        if (
            !nom ||
            !prenom ||
            !email ||
            !mot_de_passe
        )
        {
            response.status(400).json({
                error:
                    "Tous les champs sont obligatoires"
            });

            return;
        }


        /* ==================================================
           VALIDATION DU NOM
        ================================================== */

        if (
            nom.length < 2 ||
            nom.length > 50
        )
        {
            response.status(400).json({
                error:
                    "Nom invalide : entre 2 et 50 caractères"
            });

            return;
        }


        if (
            !namePattern.test(
                nom
            )
        )
        {
            response.status(400).json({
                error:
                    "Nom invalide : lettres, espaces, apostrophes et tirets uniquement"
            });

            return;
        }


        /* ==================================================
           VALIDATION DU PRÉNOM
        ================================================== */

        if (
            prenom.length < 2 ||
            prenom.length > 50
        )
        {
            response.status(400).json({
                error:
                    "Prénom invalide : entre 2 et 50 caractères"
            });

            return;
        }


        if (
            !namePattern.test(
                prenom
            )
        )
        {
            response.status(400).json({
                error:
                    "Prénom invalide : lettres, espaces, apostrophes et tirets uniquement"
            });

            return;
        }


        /* ==================================================
           VALIDATION DE L'E-MAIL
        ================================================== */

        if (
            email.length > 254 ||
            !emailPattern.test(
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


        /* ==================================================
           VALIDATION DU MOT DE PASSE
        ================================================== */

        if (
            mot_de_passe.length < 8 ||
            mot_de_passe.length > 72
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
                mot_de_passe
            );

        const passwordHasNumber =
            /\d/.test(
                mot_de_passe
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
           VÉRIFICATION DE L'E-MAIL
        ================================================== */

        database.query(
            `
                SELECT id
                FROM professeur
                WHERE email = ?
            `,
            [
                email
            ],
            async (
                emailError,
                existingTeachers
            ) =>
            {
                if (emailError)
                {
                    console.error(
                        emailError
                    );


                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });


                    return;
                }


                if (
                    existingTeachers.length > 0
                )
                {
                    response.status(409).json({
                        error:
                            "Cette adresse e-mail est déjà utilisée"
                    });

                    return;
                }


                /* ==========================================
                   HASH DU MOT DE PASSE
                ========================================== */

                let hashedPassword;


                try
                {
                    hashedPassword =
                        await bcrypt.hash(
                            mot_de_passe,
                            12
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
                   INSERTION DU PROFESSEUR
                ========================================== */

                database.query(
                    `
                        INSERT INTO professeur
                        (
                            nom,
                            prenom,
                            email,
                            mot_de_passe
                        )
                        VALUES (?, ?, ?, ?)
                    `,
                    [
                        nom,
                        prenom,
                        email,
                        hashedPassword
                    ],
                    (
                        insertError,
                        result
                    ) =>
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


                        response.status(201).json({
                            message:
                                "Professeur créé",

                            professeur: {
                                id:
                                    result.insertId,

                                nom:
                                    nom,

                                prenom:
                                    prenom,

                                email:
                                    email
                            }
                        });
                    }
                );
            }
        );
    }
);

/* ==========================================================
   LISTE GLOBALE DES ÉLÈVES
========================================================== */

router.get(
    "/eleves",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        database.query(
            `
                SELECT
                    eleve.id,
                    eleve.nom,
                    eleve.prenom,
                    eleve.email,
                    eleve.professeur_id,

                    professeur.nom AS professeur_nom,
                    professeur.prenom AS professeur_prenom,
                    professeur.email AS professeur_email

                FROM eleve

                LEFT JOIN professeur
                    ON professeur.id =
                       eleve.professeur_id

                ORDER BY
                    eleve.nom ASC,
                    eleve.prenom ASC
            `,
            (error, students) =>
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


                response.status(200).json({
                    eleves:
                        students
                });
            }
        );
    }
);
/* ==========================================================
   LISTE DES ÉLÈVES D'UN PROFESSEUR
========================================================== */

router.get(
    "/professeurs/:professeurId/eleves",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        const professeurId =
            Number(
                request.params.professeurId
            );


        /* ==================================================
           VALIDATION DE L'ID
        ================================================== */

        if (
            !Number.isInteger(
                professeurId
            ) ||
            professeurId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant professeur invalide"
            });

            return;
        }


        /* ==================================================
           VÉRIFICATION DU PROFESSEUR
        ================================================== */

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    email

                FROM professeur

                WHERE id = ?
            `,
            [
                professeurId
            ],
            (
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


                if (
                    teachers.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Professeur introuvable"
                    });

                    return;
                }


                const teacher =
                    teachers[0];


                /* ==========================================
                   RÉCUPÉRATION DES ÉLÈVES
                ========================================== */

                database.query(
                    `
                        SELECT
                            id,
                            nom,
                            prenom,
                            email

                        FROM eleve

                        WHERE professeur_id = ?

                        ORDER BY
                            nom ASC,
                            prenom ASC
                    `,
                    [
                        professeurId
                    ],
                    (
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


                        response.status(200).json({
                            professeur: {
                                id:
                                    teacher.id,

                                nom:
                                    teacher.nom,

                                prenom:
                                    teacher.prenom,

                                email:
                                    teacher.email
                            },

                            eleves:
                                students
                        });
                    }
                );
            }
        );
    }
);
/* ==========================================================
   ARCHIVE COMPLÈTE D'UN ÉLÈVE
========================================================== */

router.get(
    "/eleves/:eleveId/archive",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        const eleveId =
            Number(
                request.params.eleveId
            );


        if (
            !Number.isInteger(eleveId) ||
            eleveId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant élève invalide"
            });

            return;
        }


        database.query(
            `
                SELECT
                    eleve.id,
                    eleve.nom,
                    eleve.prenom,
                    eleve.email,
                    eleve.professeur_id,

                    professeur.nom AS professeur_nom,
                    professeur.prenom AS professeur_prenom,
                    professeur.email AS professeur_email

                FROM eleve

                LEFT JOIN professeur
                    ON professeur.id =
                       eleve.professeur_id

                WHERE eleve.id = ?
            `,
            [
                eleveId
            ],
            (studentError, students) =>
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


                if (
                    students.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Élève introuvable"
                    });

                    return;
                }


                const student =
                    students[0];


                database.query(
                    `
                        SELECT
                            id,
                            eleve_id,
                            date_session,
                            difficulte,
                            type_quiz,
                            score,
                            nombre_questions,
                            duree

                        FROM session_quiz

                        WHERE eleve_id = ?

                        ORDER BY
                            date_session ASC
                    `,
                    [
                        eleveId
                    ],
                    (sessionError, sessions) =>
                    {
                        if (sessionError)
                        {
                            console.error(
                                sessionError
                            );

                            response.status(500).json({
                                error:
                                    "Erreur serveur"
                            });

                            return;
                        }


                        database.query(
                            `
                                SELECT
                                    erreur_quiz.id,
                                    erreur_quiz.session_quiz_id,
                                    erreur_quiz.infinitif,
                                    erreur_quiz.reponse_attendue,
                                    erreur_quiz.reponse_eleve

                                FROM erreur_quiz

                                INNER JOIN session_quiz
                                    ON session_quiz.id =
                                       erreur_quiz.session_quiz_id

                                WHERE session_quiz.eleve_id = ?

                                ORDER BY
                                    erreur_quiz.id ASC
                            `,
                            [
                                eleveId
                            ],
                            (quizError, quizErrors) =>
                            {
                                if (quizError)
                                {
                                    console.error(
                                        quizError
                                    );

                                    response.status(500).json({
                                        error:
                                            "Erreur serveur"
                                    });

                                    return;
                                }


                                database.query(
                                    `
                                        SELECT
                                            id,
                                            eleve_id,
                                            infinitif,
                                            nombre_reussites,
                                            nombre_erreurs,
                                            derniere_revision

                                        FROM progression

                                        WHERE eleve_id = ?

                                        ORDER BY
                                            infinitif ASC
                                    `,
                                    [
                                        eleveId
                                    ],
                                    (
                                        progressionError,
                                        progressions
                                    ) =>
                                    {
                                        if (progressionError)
                                        {
                                            console.error(
                                                progressionError
                                            );

                                            response.status(500).json({
                                                error:
                                                    "Erreur serveur"
                                            });

                                            return;
                                        }


                                        database.query(
                                            `
                                                SELECT
                                                    revision.id,
                                                    revision.progression_id,
                                                    revision.date_revision,
                                                    revision.effectuee

                                                FROM revision

                                                INNER JOIN progression
                                                    ON progression.id =
                                                       revision.progression_id

                                                WHERE progression.eleve_id = ?

                                                ORDER BY
                                                    revision.date_revision ASC
                                            `,
                                            [
                                                eleveId
                                            ],
                                            (
                                                revisionError,
                                                revisions
                                            ) =>
                                            {
                                                if (revisionError)
                                                {
                                                    console.error(
                                                        revisionError
                                                    );

                                                    response.status(500).json({
                                                        error:
                                                            "Erreur serveur"
                                                    });

                                                    return;
                                                }


                                                response.status(200).json({
                                                    eleve:
                                                        student,

                                                    sessions_quiz:
                                                        sessions,

                                                    erreurs_quiz:
                                                        quizErrors,

                                                    progressions:
                                                        progressions,

                                                    revisions:
                                                        revisions
                                                });
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
    }
);


/* ==========================================================
   SUPPRESSION D'UN ÉLÈVE
   AVEC ARCHIVAGE PDF
========================================================== */

router.delete(
    "/eleves/:eleveId",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        const eleveId =
            Number(
                request.params.eleveId
            );


        if (
            !Number.isInteger(eleveId) ||
            eleveId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant élève invalide"
            });

            return;
        }


        database.query(
            `
                SELECT
                    eleve.id,
                    eleve.nom,
                    eleve.prenom,
                    eleve.email,
                    eleve.professeur_id,

                    professeur.nom AS professeur_nom,
                    professeur.prenom AS professeur_prenom,
                    professeur.email AS professeur_email

                FROM eleve

                LEFT JOIN professeur
                    ON professeur.id =
                       eleve.professeur_id

                WHERE eleve.id = ?
            `,
            [
                eleveId
            ],
            (studentError, students) =>
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


                if (
                    students.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Élève introuvable"
                    });

                    return;
                }


                const student =
                    students[0];


                database.query(
                    `
                        SELECT
                            id,
                            date_session,
                            difficulte,
                            type_quiz,
                            score,
                            nombre_questions,
                            duree

                        FROM session_quiz

                        WHERE eleve_id = ?

                        ORDER BY
                            date_session ASC
                    `,
                    [
                        eleveId
                    ],
                    (sessionError, sessions) =>
                    {
                        if (sessionError)
                        {
                            console.error(
                                sessionError
                            );

                            response.status(500).json({
                                error:
                                    "Erreur serveur"
                            });

                            return;
                        }


                        database.query(
                            `
                                SELECT
                                    erreur_quiz.id,
                                    erreur_quiz.session_quiz_id,
                                    erreur_quiz.infinitif,
                                    erreur_quiz.reponse_attendue,
                                    erreur_quiz.reponse_eleve

                                FROM erreur_quiz

                                INNER JOIN session_quiz
                                    ON session_quiz.id =
                                       erreur_quiz.session_quiz_id

                                WHERE session_quiz.eleve_id = ?

                                ORDER BY
                                    erreur_quiz.id ASC
                            `,
                            [
                                eleveId
                            ],
                            (quizError, quizErrors) =>
                            {
                                if (quizError)
                                {
                                    console.error(
                                        quizError
                                    );

                                    response.status(500).json({
                                        error:
                                            "Erreur serveur"
                                    });

                                    return;
                                }


                                database.query(
                                    `
                                        SELECT
                                            id,
                                            infinitif,
                                            nombre_reussites,
                                            nombre_erreurs,
                                            derniere_revision

                                        FROM progression

                                        WHERE eleve_id = ?

                                        ORDER BY
                                            infinitif ASC
                                    `,
                                    [
                                        eleveId
                                    ],
                                    (
                                        progressionError,
                                        progressions
                                    ) =>
                                    {
                                        if (progressionError)
                                        {
                                            console.error(
                                                progressionError
                                            );

                                            response.status(500).json({
                                                error:
                                                    "Erreur serveur"
                                            });

                                            return;
                                        }


                                        database.query(
                                            `
                                                SELECT
                                                    revision.id,
                                                    revision.progression_id,
                                                    revision.date_revision,
                                                    revision.effectuee

                                                FROM revision

                                                INNER JOIN progression
                                                    ON progression.id =
                                                       revision.progression_id

                                                WHERE progression.eleve_id = ?

                                                ORDER BY
                                                    revision.date_revision ASC
                                            `,
                                            [
                                                eleveId
                                            ],
                                            (
                                                revisionError,
                                                revisions
                                            ) =>
                                            {
                                                if (revisionError)
                                                {
                                                    console.error(
                                                        revisionError
                                                    );

                                                    response.status(500).json({
                                                        error:
                                                            "Erreur serveur"
                                                    });

                                                    return;
                                                }


                                                /* ==================================
                                                   PRÉPARATION DE L'ARCHIVE PDF
                                                ================================== */

                                                const archiveDirectory =
                                                        path.join(
                                                            __dirname,
                                                            "..",
                                                            "..",
                                                            "..",
                                                            "irregular-cards-archives",
                                                            "eleves"
                                                        );


                                                try
                                                {
                                                    fs.mkdirSync(
                                                        archiveDirectory,
                                                        {
                                                            recursive:
                                                                true
                                                        }
                                                    );
                                                }
                                                catch (directoryError)
                                                {
                                                    console.error(
                                                        directoryError
                                                    );

                                                    response.status(500).json({
                                                        error:
                                                            "Impossible de créer le dossier d'archive"
                                                    });

                                                    return;
                                                }


                                                const archiveDate =
                                                    new Date();


                                                const datePart =
                                                    archiveDate
                                                        .toISOString()
                                                        .replace(
                                                            /[:.]/g,
                                                            "-"
                                                        );


                                                const safeName =
                                                    `${student.nom}-${student.prenom}`
                                                        .normalize("NFD")
                                                        .replace(
                                                            /[\u0300-\u036f]/g,
                                                            ""
                                                        )
                                                        .replace(
                                                            /[^a-zA-Z0-9_-]/g,
                                                            "-"
                                                        );


                                                const archiveFileName =
                                                    `eleve-${student.id}-${safeName}-${datePart}.pdf`;


                                                const archivePath =
                                                    path.join(
                                                        archiveDirectory,
                                                        archiveFileName
                                                    );


                                                /* ==================================
                                                   CRÉATION DU PDF
                                                ================================== */

                                                const document =
                                                    new PDFDocument({
                                                        size:
                                                            "A4",

                                                        margin:
                                                            50
                                                    });


                                                const output =
                                                    fs.createWriteStream(
                                                        archivePath
                                                    );


                                                let pdfFailed =
                                                    false;


                                                output.on(
                                                    "error",
                                                    (pdfError) =>
                                                    {
                                                        pdfFailed =
                                                            true;

                                                        console.error(
                                                            pdfError
                                                        );


                                                        if (
                                                            !response.headersSent
                                                        )
                                                        {
                                                            response.status(500).json({
                                                                error:
                                                                    "Impossible de créer l'archive PDF"
                                                            });
                                                        }
                                                    }
                                                );


                                                document.on(
                                                    "error",
                                                    (pdfError) =>
                                                    {
                                                        pdfFailed =
                                                            true;

                                                        console.error(
                                                            pdfError
                                                        );
                                                    }
                                                );


                                                document.pipe(
                                                    output
                                                );


                                                document
                                                    .fontSize(20)
                                                    .text(
                                                        "ARCHIVE DE PROGRESSION",
                                                        {
                                                            align:
                                                                "center"
                                                        }
                                                    );


                                                document.moveDown();


                                                document
                                                    .fontSize(12)
                                                    .text(
                                                        `Élève : ${student.prenom} ${student.nom}`
                                                    );


                                                document.text(
                                                    `Identifiant : ${student.id}`
                                                );


                                                document.text(
                                                    `E-mail : ${student.email}`
                                                );


                                                document.text(
                                                    `Professeur : ${student.professeur_prenom || ""} ${student.professeur_nom || ""}`.trim()
                                                );


                                                document.text(
                                                    `E-mail professeur : ${student.professeur_email || "-"}`
                                                );


                                                document.text(
                                                    `Date d'archivage : ${archiveDate.toLocaleString("fr-FR")}`
                                                );


                                                document.moveDown();


                                                /* ==================================
                                                   SESSIONS DE QUIZ
                                                ================================== */

                                                document
                                                    .fontSize(16)
                                                    .text(
                                                        "SESSIONS DE QUIZ"
                                                    );


                                                document.moveDown(0.5);


                                                if (
                                                    sessions.length === 0
                                                )
                                                {
                                                    document
                                                        .fontSize(10)
                                                        .text(
                                                            "Aucune session de quiz."
                                                        );
                                                }
                                                else
                                                {
                                                    sessions.forEach(
                                                        (session) =>
                                                        {
                                                            document
                                                                .fontSize(10)
                                                                .text(
                                                                    `Session #${session.id}`
                                                                );

                                                            document.text(
                                                                `Date : ${session.date_session || "-"}`
                                                            );

                                                            document.text(
                                                                `Difficulté : ${session.difficulte}`
                                                            );

                                                            document.text(
                                                                `Type : ${session.type_quiz}`
                                                            );

                                                            document.text(
                                                                `Score : ${session.score}/${session.nombre_questions}`
                                                            );

                                                            document.text(
                                                                `Durée : ${session.duree ?? "-"} seconde(s)`
                                                            );

                                                            document.moveDown(
                                                                0.5
                                                            );
                                                        }
                                                    );
                                                }


                                                document.moveDown();


                                                /* ==================================
                                                   ERREURS DE QUIZ
                                                ================================== */

                                                document
                                                    .fontSize(16)
                                                    .text(
                                                        "ERREURS DE QUIZ"
                                                    );


                                                document.moveDown(0.5);


                                                if (
                                                    quizErrors.length === 0
                                                )
                                                {
                                                    document
                                                        .fontSize(10)
                                                        .text(
                                                            "Aucune erreur enregistrée."
                                                        );
                                                }
                                                else
                                                {
                                                    quizErrors.forEach(
                                                        (quizError) =>
                                                        {
                                                            document
                                                                .fontSize(10)
                                                                .text(
                                                                    `${quizError.infinitif} | réponse : ${quizError.reponse_eleve || "-"} | attendu : ${quizError.reponse_attendue}`
                                                                );
                                                        }
                                                    );
                                                }


                                                document.moveDown();


                                                /* ==================================
                                                   PROGRESSION
                                                ================================== */

                                                document
                                                    .fontSize(16)
                                                    .text(
                                                        "PROGRESSION"
                                                    );


                                                document.moveDown(0.5);


                                                if (
                                                    progressions.length === 0
                                                )
                                                {
                                                    document
                                                        .fontSize(10)
                                                        .text(
                                                            "Aucune progression enregistrée."
                                                        );
                                                }
                                                else
                                                {
                                                    progressions.forEach(
                                                        (progression) =>
                                                        {
                                                            document
                                                                .fontSize(10)
                                                                .text(
                                                                    `${progression.infinitif} | réussites : ${progression.nombre_reussites} | erreurs : ${progression.nombre_erreurs} | dernière révision : ${progression.derniere_revision || "-"}`
                                                                );
                                                        }
                                                    );
                                                }


                                                document.moveDown();


                                                /* ==================================
                                                   RÉVISIONS
                                                ================================== */

                                                document
                                                    .fontSize(16)
                                                    .text(
                                                        "RÉVISIONS"
                                                    );


                                                document.moveDown(0.5);


                                                if (
                                                    revisions.length === 0
                                                )
                                                {
                                                    document
                                                        .fontSize(10)
                                                        .text(
                                                            "Aucune révision enregistrée."
                                                        );
                                                }
                                                else
                                                {
                                                    revisions.forEach(
                                                        (revision) =>
                                                        {
                                                            document
                                                                .fontSize(10)
                                                                .text(
                                                                    `Révision #${revision.id} | date : ${revision.date_revision} | effectuée : ${revision.effectuee ? "oui" : "non"}`
                                                                );
                                                        }
                                                    );
                                                }


                                                document.end();


                                                /* ==================================
                                                   SUPPRESSION APRÈS CRÉATION DU PDF
                                                ================================== */

                                                output.on(
                                                    "finish",
                                                    () =>
                                                    {
                                                        if (pdfFailed)
                                                        {
                                                            return;
                                                        }


                                                        database.query(
                                                            `
                                                                DELETE FROM eleve

                                                                WHERE id = ?
                                                            `,
                                                            [
                                                                eleveId
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
                                                                            "Archive créée mais suppression de l'élève impossible",

                                                                        archive_pdf:
                                                                            archiveFileName
                                                                    });

                                                                    return;
                                                                }


                                                                response.status(200).json({
                                                                    message:
                                                                        "Élève archivé et supprimé avec succès",

                                                                    archive_pdf:
                                                                        archiveFileName,

                                                                    eleve: {
                                                                        id:
                                                                            student.id,

                                                                        nom:
                                                                            student.nom,

                                                                        prenom:
                                                                            student.prenom,

                                                                        email:
                                                                            student.email
                                                                    }
                                                                });
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
                    }
                );
            }
        );
    }
);
/* ==========================================================
   TRANSFERT D'UN ÉLÈVE VERS UN AUTRE PROFESSEUR
========================================================== */

router.put(
    "/eleves/:eleveId/transfert",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        const eleveId =
            Number(
                request.params.eleveId
            );

        const nouveauProfesseurId =
            Number(
                request.body.nouveau_professeur_id
            );


        /* ==================================================
           VALIDATION DES IDENTIFIANTS
        ================================================== */

        if (
            !Number.isInteger(eleveId) ||
            eleveId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant élève invalide"
            });

            return;
        }


        if (
            !Number.isInteger(nouveauProfesseurId) ||
            nouveauProfesseurId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant professeur invalide"
            });

            return;
        }


        /* ==================================================
           VÉRIFICATION DE L'ÉLÈVE
        ================================================== */

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    professeur_id

                FROM eleve

                WHERE id = ?
            `,
            [
                eleveId
            ],
            (
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


                if (
                    students.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Élève introuvable"
                    });

                    return;
                }


                const student =
                    students[0];


                /* ==========================================
                   VÉRIFICATION DU NOUVEAU PROFESSEUR
                ========================================== */

                database.query(
                    `
                        SELECT
                            id,
                            nom,
                            prenom

                        FROM professeur

                        WHERE id = ?
                    `,
                    [
                        nouveauProfesseurId
                    ],
                    (
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


                        if (
                            teachers.length === 0
                        )
                        {
                            response.status(404).json({
                                error:
                                    "Professeur introuvable"
                            });

                            return;
                        }


                        if (
                            student.professeur_id ===
                            nouveauProfesseurId
                        )
                        {
                            response.status(400).json({
                                error:
                                    "L'élève est déjà rattaché à ce professeur"
                            });

                            return;
                        }


                        const teacher =
                            teachers[0];


                        /* ==================================
                           TRANSFERT
                        ================================== */

                        database.query(
                            `
                                UPDATE eleve

                                SET professeur_id = ?

                                WHERE id = ?
                            `,
                            [
                                nouveauProfesseurId,
                                eleveId
                            ],
                            (updateError) =>
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


                                response.status(200).json({
                                    message:
                                        "Élève transféré avec succès",

                                    eleve: {
                                        id:
                                            student.id,

                                        nom:
                                            student.nom,

                                        prenom:
                                            student.prenom
                                    },

                                    nouveau_professeur: {
                                        id:
                                            teacher.id,

                                        nom:
                                            teacher.nom,

                                        prenom:
                                            teacher.prenom
                                    }
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
   TRANSFERT DE PLUSIEURS ÉLÈVES
========================================================== */

router.put(
    "/eleves/transfert-groupe",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        const {
            eleve_ids,
            nouveau_professeur_id
        } = request.body;


        const nouveauProfesseurId =
            Number(
                nouveau_professeur_id
            );


        /* ==================================================
           VALIDATION DES ÉLÈVES
        ================================================== */

        if (
            !Array.isArray(eleve_ids) ||
            eleve_ids.length === 0
        )
        {
            response.status(400).json({
                error:
                    "Aucun élève sélectionné"
            });

            return;
        }


        const eleveIds =
            eleve_ids.map(
                (id) =>
                    Number(id)
            );


        const invalidStudentId =
            eleveIds.some(
                (id) =>
                    !Number.isInteger(id) ||
                    id <= 0
            );


        if (invalidStudentId)
        {
            response.status(400).json({
                error:
                    "Identifiant élève invalide"
            });

            return;
        }


        /* ==================================================
           VALIDATION DU PROFESSEUR
        ================================================== */

        if (
            !Number.isInteger(
                nouveauProfesseurId
            ) ||
            nouveauProfesseurId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant professeur invalide"
            });

            return;
        }


        /* ==================================================
           VÉRIFICATION DU PROFESSEUR
        ================================================== */

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom

                FROM professeur

                WHERE id = ?
            `,
            [
                nouveauProfesseurId
            ],
            (
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


                if (
                    teachers.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Professeur introuvable"
                    });

                    return;
                }


                const teacher =
                    teachers[0];


                /* ==========================================
                   VÉRIFICATION DES ÉLÈVES
                ========================================== */

                const placeholders =
                    eleveIds
                        .map(
                            () => "?"
                        )
                        .join(", ");


                database.query(
                    `
                        SELECT id

                        FROM eleve

                        WHERE id IN (${placeholders})
                    `,
                    eleveIds,
                    (
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


                        if (
                            students.length !==
                            eleveIds.length
                        )
                        {
                            response.status(404).json({
                                error:
                                    "Un ou plusieurs élèves sont introuvables"
                            });

                            return;
                        }


                        /* ==================================
                           TRANSFERT
                        ================================== */

                        database.query(
                            `
                                UPDATE eleve

                                SET professeur_id = ?

                                WHERE id IN (${placeholders})
                            `,
                            [
                                nouveauProfesseurId,
                                ...eleveIds
                            ],
                            (
                                updateError,
                                result
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


                                response.status(200).json({
                                    message:
                                        "Élèves transférés avec succès",

                                    nombre_eleves_transferes:
                                        result.affectedRows,

                                    nouveau_professeur: {
                                        id:
                                            teacher.id,

                                        nom:
                                            teacher.nom,

                                        prenom:
                                            teacher.prenom
                                    }
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
   SUPPRESSION D'UN PROFESSEUR
========================================================== */

router.delete(
    "/professeurs/:professeurId",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        const professeurId =
            Number(
                request.params.professeurId
            );


        /* ==================================================
           VALIDATION DE L'IDENTIFIANT
        ================================================== */

        if (
            !Number.isInteger(
                professeurId
            ) ||
            professeurId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant professeur invalide"
            });

            return;
        }


        /* ==================================================
           VÉRIFICATION DU PROFESSEUR
        ================================================== */

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    email

                FROM professeur

                WHERE id = ?
            `,
            [
                professeurId
            ],
            (
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


                if (
                    teachers.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Professeur introuvable"
                    });

                    return;
                }


                const teacher =
                    teachers[0];


                /* ==========================================
                   VÉRIFICATION DES ÉLÈVES
                ========================================== */

                database.query(
                    `
                        SELECT COUNT(*) AS nombre_eleves

                        FROM eleve

                        WHERE professeur_id = ?
                    `,
                    [
                        professeurId
                    ],
                    (
                        studentError,
                        results
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


                        const nombreEleves =
                            Number(
                                results[0].nombre_eleves
                            );


                        /* ==================================
                           SUPPRESSION REFUSÉE
                        ================================== */

                        if (
                            nombreEleves > 0
                        )
                        {
                            response.status(409).json({
                                error:
                                    "Impossible de supprimer ce professeur tant que des élèves lui sont rattachés",

                                nombre_eleves:
                                    nombreEleves
                            });

                            return;
                        }


                        /* ==================================
                           SUPPRESSION DU PROFESSEUR
                        ================================== */

                        database.query(
                            `
                                DELETE FROM professeur

                                WHERE id = ?
                            `,
                            [
                                professeurId
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


                                response.status(200).json({
                                    message:
                                        "Professeur supprimé avec succès",

                                    professeur: {
                                        id:
                                            teacher.id,

                                        nom:
                                            teacher.nom,

                                        prenom:
                                            teacher.prenom,

                                        email:
                                            teacher.email
                                    }
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
   TRANSFERT COMPLET D'UNE CLASSE
========================================================== */

router.put(
    "/professeurs/transfert-classe",
    verifyToken,
    requireAdmin,
    (request, response) =>
    {
        const ancienProfesseurId =
            Number(
                request.body.ancien_professeur_id
            );

        const nouveauProfesseurId =
            Number(
                request.body.nouveau_professeur_id
            );


        /* ==================================================
           VALIDATION DES IDENTIFIANTS
        ================================================== */

        if (
            !Number.isInteger(
                ancienProfesseurId
            ) ||
            ancienProfesseurId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant de l'ancien professeur invalide"
            });

            return;
        }


        if (
            !Number.isInteger(
                nouveauProfesseurId
            ) ||
            nouveauProfesseurId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant du nouveau professeur invalide"
            });

            return;
        }


        /* ==================================================
           PROFESSEURS IDENTIQUES
        ================================================== */

        if (
            ancienProfesseurId ===
            nouveauProfesseurId
        )
        {
            response.status(400).json({
                error:
                    "Les deux professeurs doivent être différents"
            });

            return;
        }


        /* ==================================================
           VÉRIFICATION DE L'ANCIEN PROFESSEUR
        ================================================== */

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom

                FROM professeur

                WHERE id = ?
            `,
            [
                ancienProfesseurId
            ],
            (
                oldTeacherError,
                oldTeachers
            ) =>
            {
                if (oldTeacherError)
                {
                    console.error(
                        oldTeacherError
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                if (
                    oldTeachers.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Ancien professeur introuvable"
                    });

                    return;
                }


                const oldTeacher =
                    oldTeachers[0];


                /* ==========================================
                   VÉRIFICATION DU NOUVEAU PROFESSEUR
                ========================================== */

                database.query(
                    `
                        SELECT
                            id,
                            nom,
                            prenom

                        FROM professeur

                        WHERE id = ?
                    `,
                    [
                        nouveauProfesseurId
                    ],
                    (
                        newTeacherError,
                        newTeachers
                    ) =>
                    {
                        if (newTeacherError)
                        {
                            console.error(
                                newTeacherError
                            );

                            response.status(500).json({
                                error:
                                    "Erreur serveur"
                            });

                            return;
                        }


                        if (
                            newTeachers.length === 0
                        )
                        {
                            response.status(404).json({
                                error:
                                    "Nouveau professeur introuvable"
                            });

                            return;
                        }


                        const newTeacher =
                            newTeachers[0];


                        /* ==================================
                           TRANSFERT DE TOUS LES ÉLÈVES
                        ================================== */

                        database.query(
                            `
                                UPDATE eleve

                                SET professeur_id = ?

                                WHERE professeur_id = ?
                            `,
                            [
                                nouveauProfesseurId,
                                ancienProfesseurId
                            ],
                            (
                                updateError,
                                result
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


                                response.status(200).json({
                                    message:
                                        "Classe transférée avec succès",

                                    nombre_eleves_transferes:
                                        result.affectedRows,

                                    ancien_professeur: {
                                        id:
                                            oldTeacher.id,

                                        nom:
                                            oldTeacher.nom,

                                        prenom:
                                            oldTeacher.prenom
                                    },

                                    nouveau_professeur: {
                                        id:
                                            newTeacher.id,

                                        nom:
                                            newTeacher.nom,

                                        prenom:
                                            newTeacher.prenom
                                    }
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

module.exports =
    router;