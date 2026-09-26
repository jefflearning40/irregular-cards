"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express =
    require("express");

const bcrypt =
    require("bcrypt");

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