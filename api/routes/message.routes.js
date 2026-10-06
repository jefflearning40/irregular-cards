"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express =
    require("express");

const {
    verifyToken
} =
    require(
        "../middleware/auth.middleware"
    );

const database =
    require("../database");


/* ==========================================================
   ROUTER
========================================================== */

const router =
    express.Router();


/* ==========================================================
   RÔLES AUTORISÉS
========================================================== */

const rolesAutorises = [
    "administrateur",
    "professeur",
    "eleve"
];

/* ==========================================================
   DESTINATAIRES AUTORISÉS
========================================================== */

router.get(
    "/destinataires",
    verifyToken,
    (request, response) =>
    {
        const utilisateurId =
            request.user.id;

        const utilisateurRole =
            request.user.role;


        if (
            !rolesAutorises.includes(
                utilisateurRole
            )
        )
        {
            response.status(403).json({
                error:
                    "Rôle utilisateur non autorisé"
            });

            return;
        }


        if (
            utilisateurRole ===
            "administrateur"
        )
        {
            database.query(
                `
                    SELECT
                        id,
                        nom,
                        prenom,
                        email,
                        'professeur' AS type

                    FROM professeur

                    ORDER BY
                        nom ASC,
                        prenom ASC
                `,
                (
                    error,
                    destinataires
                ) =>
                {
                    if (error)
                    {
                        console.error(
                            "Erreur récupération destinataires :",
                            error
                        );

                        response.status(500).json({
                            error:
                                "Erreur serveur"
                        });

                        return;
                    }


                    response.json(
                        destinataires
                    );
                }
            );

            return;
        }


        if (
            utilisateurRole ===
            "eleve"
        )
        {
            database.query(
                `
                    SELECT
                        professeur.id,
                        professeur.nom,
                        professeur.prenom,
                        professeur.email,
                        'professeur' AS type

                    FROM eleve

                    INNER JOIN professeur
                        ON professeur.id =
                            eleve.professeur_id

                    WHERE eleve.id = ?
                `,
                [
                    utilisateurId
                ],
                (
                    error,
                    destinataires
                ) =>
                {
                    if (error)
                    {
                        console.error(
                            "Erreur récupération destinataires :",
                            error
                        );

                        response.status(500).json({
                            error:
                                "Erreur serveur"
                        });

                        return;
                    }


                    response.json(
                        destinataires
                    );
                }
            );

            return;
        }


        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    email,
                    'administrateur' AS type

                FROM administrateur

                UNION ALL

                SELECT
                    id,
                    nom,
                    prenom,
                    email,
                    'eleve' AS type

                FROM eleve

                WHERE professeur_id = ?

                ORDER BY
                    type ASC,
                    nom ASC,
                    prenom ASC
            `,
            [
                utilisateurId
            ],
            (
                error,
                destinataires
            ) =>
            {
                if (error)
                {
                    console.error(
                        "Erreur récupération destinataires :",
                        error
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                response.json(
                    destinataires
                );
            }
        );
    }
);
/* ==========================================================
   MESSAGES REÇUS PAR L'UTILISATEUR CONNECTÉ
========================================================== */

router.get(
    "/recus",
    verifyToken,
    (request, response) =>
    {
        const utilisateurId =
            request.user.id;

        const utilisateurRole =
            request.user.role;


        if (
            !rolesAutorises.includes(
                utilisateurRole
            )
        )
        {
            response.status(403).json({
                error:
                    "Rôle utilisateur non autorisé"
            });

            return;
        }


        database.query(
            `
                SELECT
                    id,
                    expediteur_type,
                    expediteur_id,
                    objet,
                    contenu,
                    est_lu,
                    date_envoi

                FROM message

                WHERE destinataire_type = ?
                AND destinataire_id = ?

                ORDER BY
                    date_envoi DESC,
                    id DESC
            `,
            [
                utilisateurRole,
                utilisateurId
            ],
            (
                error,
                messages
            ) =>
            {
                if (error)
                {
                    console.error(
                        "Erreur récupération messages :",
                        error
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                response.json(
                    messages
                );
            }
        );
    }
);


/* ==========================================================
   MESSAGES ENVOYÉS PAR L'UTILISATEUR CONNECTÉ
========================================================== */

router.get(
    "/envoyes",
    verifyToken,
    (request, response) =>
    {
        const utilisateurId =
            request.user.id;

        const utilisateurRole =
            request.user.role;


        if (
            !rolesAutorises.includes(
                utilisateurRole
            )
        )
        {
            response.status(403).json({
                error:
                    "Rôle utilisateur non autorisé"
            });

            return;
        }


        database.query(
            `
                SELECT
                    id,
                    destinataire_type,
                    destinataire_id,
                    objet,
                    contenu,
                    est_lu,
                    date_envoi

                FROM message

                WHERE expediteur_type = ?
                AND expediteur_id = ?

                ORDER BY
                    date_envoi DESC,
                    id DESC
            `,
            [
                utilisateurRole,
                utilisateurId
            ],
            (
                error,
                messages
            ) =>
            {
                if (error)
                {
                    console.error(
                        "Erreur récupération messages envoyés :",
                        error
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                response.json(
                    messages
                );
            }
        );
    }
);
/* ==========================================================
   MARQUER UN MESSAGE COMME LU
========================================================== */

router.put(
    "/:id/lu",
    verifyToken,
    (request, response) =>
    {
        const utilisateurId =
            request.user.id;

        const utilisateurRole =
            request.user.role;

        const messageId =
            Number(
                request.params.id
            );


        if (
            !rolesAutorises.includes(
                utilisateurRole
            )
        )
        {
            response.status(403).json({
                error:
                    "Rôle utilisateur non autorisé"
            });

            return;
        }


        if (
            !Number.isInteger(
                messageId
            ) ||
            messageId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant message invalide"
            });

            return;
        }


        database.query(
            `
                UPDATE message

                SET est_lu = 1

                WHERE id = ?
                AND destinataire_type = ?
                AND destinataire_id = ?
            `,
            [
                messageId,
                utilisateurRole,
                utilisateurId
            ],
            (
                error,
                result
            ) =>
            {
                if (error)
                {
                    console.error(
                        "Erreur lecture message :",
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
                            "Message introuvable"
                    });

                    return;
                }


                response.json({
                    message:
                        "Message marqué comme lu"
                });
            }
        );
    }
);
/* ==========================================================
   SUPPRESSION DE MESSAGES REÇUS
========================================================== */

router.delete(
    "/recus",
    verifyToken,
    (request, response) =>
    {
        const utilisateurId =
            request.user.id;


        const utilisateurRole =
            request.user.role;


        const messageIds =
            request.body.ids;


        if (
            !rolesAutorises.includes(
                utilisateurRole
            )
        )
        {
            response.status(403).json({
                error:
                    "Rôle utilisateur non autorisé"
            });


            return;
        }


        if (
            !Array.isArray(
                messageIds
            ) ||
            messageIds.length === 0
        )
        {
            response.status(400).json({
                error:
                    "Aucun message sélectionné"
            });


            return;
        }


        const ids =
            messageIds.map(
                (id) =>
                    Number(
                        id
                    )
            );


        if (
            ids.some(
                (id) =>
                    !Number.isInteger(
                        id
                    ) ||
                    id <= 0
            )
        )
        {
            response.status(400).json({
                error:
                    "Identifiant message invalide"
            });


            return;
        }


        const placeholders =
            ids.map(
                () => "?"
            ).join(", ");


        database.query(
            `
                DELETE FROM message

                WHERE id IN (${placeholders})
                AND destinataire_type = ?
                AND destinataire_id = ?
            `,
            [
                ...ids,
                utilisateurRole,
                utilisateurId
            ],
            (
                error,
                result
            ) =>
            {
                if (error)
                {
                    console.error(
                        "Erreur suppression messages :",
                        error
                    );


                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });


                    return;
                }


                response.json({
                    message:
                        "Messages supprimés avec succès",

                    nombre:
                        result.affectedRows
                });
            }
        );
    }
);
/* ==========================================================
   SUPPRESSION DE MESSAGES ENVOYÉS
========================================================== */

router.delete(
    "/envoyes",
    verifyToken,
    (request, response) =>
    {
        const utilisateurId =
            request.user.id;


        const utilisateurRole =
            request.user.role;


        const messageIds =
            request.body.ids;


        if (
            !rolesAutorises.includes(
                utilisateurRole
            )
        )
        {
            response.status(403).json({
                error:
                    "Rôle utilisateur non autorisé"
            });


            return;
        }


        if (
            !Array.isArray(
                messageIds
            ) ||
            messageIds.length === 0
        )
        {
            response.status(400).json({
                error:
                    "Aucun message sélectionné"
            });


            return;
        }


        const ids =
            messageIds.map(
                (id) =>
                    Number(
                        id
                    )
            );


        if (
            ids.some(
                (id) =>
                    !Number.isInteger(
                        id
                    ) ||
                    id <= 0
            )
        )
        {
            response.status(400).json({
                error:
                    "Identifiant message invalide"
            });


            return;
        }


        const placeholders =
            ids.map(
                () => "?"
            ).join(", ");


        database.query(
            `
                DELETE FROM message

                WHERE id IN (${placeholders})
                AND expediteur_type = ?
                AND expediteur_id = ?
            `,
            [
                ...ids,
                utilisateurRole,
                utilisateurId
            ],
            (
                error,
                result
            ) =>
            {
                if (error)
                {
                    console.error(
                        "Erreur suppression messages envoyés :",
                        error
                    );


                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });


                    return;
                }


                response.json({
                    message:
                        "Messages envoyés supprimés avec succès",

                    nombre:
                        result.affectedRows
                });
            }
        );
    }
);

/* ==========================================================
   ENVOI D'UN MESSAGE
========================================================== */

router.post(
    "/",
    verifyToken,
    (request, response) =>
    {
        const expediteurId =
            request.user.id;

        const expediteurType =
            request.user.role;


        const destinataireType =
            String(
                request.body.destinataire_type || ""
            )
                .trim()
                .toLowerCase();


        const destinataireId =
            Number(
                request.body.destinataire_id
            );


        const objet =
            String(
                request.body.objet || ""
            )
                .trim();


        const contenu =
            String(
                request.body.contenu || ""
            )
                .trim();


        if (
            !rolesAutorises.includes(
                expediteurType
            )
        )
        {
            response.status(403).json({
                error:
                    "Rôle utilisateur non autorisé"
            });

            return;
        }


        if (
            !rolesAutorises.includes(
                destinataireType
            )
        )
        {
            response.status(400).json({
                error:
                    "Type de destinataire invalide"
            });

            return;
        }


        if (
            !Number.isInteger(
                destinataireId
            ) ||
            destinataireId <= 0
        )
        {
            response.status(400).json({
                error:
                    "Identifiant destinataire invalide"
            });

            return;
        }


        if (
            !objet ||
            !contenu
        )
        {
            response.status(400).json({
                error:
                    "Objet et contenu obligatoires"
            });

            return;
        }


        /* ==================================================
           ÉLÈVE → SON PROFESSEUR UNIQUEMENT
        ================================================== */

        if (
            expediteurType === "eleve"
        )
        {
            envoyerMessageEleve(
                expediteurId,
                destinataireType,
                destinataireId,
                objet,
                contenu,
                response
            );

            return;
        }


        /* ==================================================
           PROFESSEUR → ADMINISTRATEUR OU SES ÉLÈVES
        ================================================== */

        if (
            expediteurType === "professeur"
        )
        {
            envoyerMessageProfesseur(
                expediteurId,
                destinataireType,
                destinataireId,
                objet,
                contenu,
                response
            );

            return;
        }


        /* ==================================================
           ADMINISTRATEUR → PROFESSEUR UNIQUEMENT
        ================================================== */

        envoyerMessageAdministrateur(
            expediteurId,
            destinataireType,
            destinataireId,
            objet,
            contenu,
            response
        );
    }
);


/* ==========================================================
   ENVOI ÉLÈVE
========================================================== */

function envoyerMessageEleve(
    expediteurId,
    destinataireType,
    destinataireId,
    objet,
    contenu,
    response
)
{
    if (
        destinataireType !== "professeur"
    )
    {
        response.status(403).json({
            error:
                "Un élève peut uniquement écrire à son professeur"
        });

        return;
    }


    database.query(
        `
            SELECT
                professeur_id

            FROM eleve

            WHERE id = ?
        `,
        [
            expediteurId
        ],
        (
            error,
            students
        ) =>
        {
            if (error)
            {
                console.error(
                    "Erreur vérification élève :",
                    error
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


            if (
                Number(
                    students[0].professeur_id
                ) !== destinataireId
            )
            {
                response.status(403).json({
                    error:
                        "Vous pouvez uniquement écrire à votre professeur"
                });

                return;
            }


            enregistrerMessage(
                "eleve",
                expediteurId,
                "professeur",
                destinataireId,
                objet,
                contenu,
                response
            );
        }
    );
}


/* ==========================================================
   ENVOI PROFESSEUR
========================================================== */

function envoyerMessageProfesseur(
    expediteurId,
    destinataireType,
    destinataireId,
    objet,
    contenu,
    response
)
{
    if (
        destinataireType ===
        "administrateur"
    )
    {
        database.query(
            `
                SELECT
                    id

                FROM administrateur

                WHERE id = ?
            `,
            [
                destinataireId
            ],
            (
                error,
                admins
            ) =>
            {
                if (error)
                {
                    console.error(
                        "Erreur vérification administrateur :",
                        error
                    );

                    response.status(500).json({
                        error:
                            "Erreur serveur"
                    });

                    return;
                }


                if (
                    admins.length === 0
                )
                {
                    response.status(404).json({
                        error:
                            "Administrateur introuvable"
                    });

                    return;
                }


                enregistrerMessage(
                    "professeur",
                    expediteurId,
                    "administrateur",
                    destinataireId,
                    objet,
                    contenu,
                    response
                );
            }
        );

        return;
    }


    if (
        destinataireType !== "eleve"
    )
    {
        response.status(403).json({
            error:
                "Destinataire non autorisé"
        });

        return;
    }


    database.query(
        `
            SELECT
                id

            FROM eleve

            WHERE id = ?
            AND professeur_id = ?
        `,
        [
            destinataireId,
            expediteurId
        ],
        (
            error,
            students
        ) =>
        {
            if (error)
            {
                console.error(
                    "Erreur vérification élève :",
                    error
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
                response.status(403).json({
                    error:
                        "Cet élève n'appartient pas à ce professeur"
                });

                return;
            }


            enregistrerMessage(
                "professeur",
                expediteurId,
                "eleve",
                destinataireId,
                objet,
                contenu,
                response
            );
        }
    );
}


/* ==========================================================
   ENVOI ADMINISTRATEUR
========================================================== */

function envoyerMessageAdministrateur(
    expediteurId,
    destinataireType,
    destinataireId,
    objet,
    contenu,
    response
)
{
    if (
        destinataireType !== "professeur"
    )
    {
        response.status(403).json({
            error:
                "Un administrateur peut uniquement écrire aux professeurs"
        });

        return;
    }


    database.query(
        `
            SELECT
                id

            FROM professeur

            WHERE id = ?
        `,
        [
            destinataireId
        ],
        (
            error,
            teachers
        ) =>
        {
            if (error)
            {
                console.error(
                    "Erreur vérification professeur :",
                    error
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


            enregistrerMessage(
                "administrateur",
                expediteurId,
                "professeur",
                destinataireId,
                objet,
                contenu,
                response
            );
        }
    );
}


/* ==========================================================
   ENREGISTREMENT DU MESSAGE
========================================================== */

function enregistrerMessage(
    expediteurType,
    expediteurId,
    destinataireType,
    destinataireId,
    objet,
    contenu,
    response
)
{
    database.query(
        `
            INSERT INTO message
            (
                expediteur_type,
                expediteur_id,
                destinataire_type,
                destinataire_id,
                objet,
                contenu
            )

            VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            expediteurType,
            expediteurId,
            destinataireType,
            destinataireId,
            objet,
            contenu
        ],
        (
            error,
            result
        ) =>
        {
            if (error)
            {
                console.error(
                    "Erreur enregistrement message :",
                    error
                );

                response.status(500).json({
                    error:
                        "Erreur serveur"
                });

                return;
            }


            response.status(201).json({
                message:
                    "Message envoyé avec succès",

                id:
                    result.insertId
            });
        }
    );
}


/* ==========================================================
   EXPORT
========================================================== */

module.exports =
    router;