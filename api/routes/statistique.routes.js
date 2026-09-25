"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

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
   STATISTIQUES DE L'ÉLÈVE CONNECTÉ
========================================================== */

router.get(
    "/eleve",
    verifyToken,
    (request, response) =>
    {
        const eleveId =
            request.user.id;

        const role =
            request.user.role;


        if (role !== "eleve")
        {
            response.status(403).json({
                error:
                    "Accès réservé aux élèves"
            });

            return;
        }


        database.query(
            `
                SELECT
                    COUNT(*) AS nombre_quiz,

                    ROUND(
                        AVG(
                            CASE
                                WHEN nombre_questions > 0
                                THEN
                                    (score / nombre_questions) * 100
                                ELSE 0
                            END
                        ),
                        1
                    ) AS moyenne,

                    ROUND(
                        MAX(
                            CASE
                                WHEN nombre_questions > 0
                                THEN
                                    (score / nombre_questions) * 100
                                ELSE 0
                            END
                        ),
                        1
                    ) AS meilleur_score,

                    COALESCE(
                        SUM(duree),
                        0
                    ) AS temps_total

                FROM session_quiz

                WHERE eleve_id = ?
            `,
            [eleveId],
            (error, statistiques) =>
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


                getQuizErrors(
                    eleveId,
                    statistiques[0],
                    response
                );
            }
        );
    }
);


/* ==========================================================
   ERREURS DES QUIZ DE L'ÉLÈVE
========================================================== */

function getQuizErrors(
    eleveId,
    statistiques,
    response
)
{
    database.query(
        `
            SELECT
                COUNT(*) AS nombre_erreurs

            FROM erreur_quiz

            INNER JOIN session_quiz
                ON session_quiz.id =
                    erreur_quiz.session_quiz_id

            WHERE session_quiz.eleve_id = ?
        `,
        [eleveId],
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


            statistiques.nombre_erreurs =
                Number(
                    results[0].nombre_erreurs
                );


            getVerbsToReview(
                eleveId,
                statistiques,
                response
            );
        }
    );
}


/* ==========================================================
   VERBES À REVOIR DE L'ÉLÈVE
========================================================== */

function getVerbsToReview(
    eleveId,
    statistiques,
    response
)
{
    database.query(
        `
            SELECT
                erreur_quiz.infinitif,

                COUNT(*) AS nombre_erreurs,

                MAX(
                    session_quiz.date_session
                ) AS derniere_erreur

            FROM erreur_quiz

            INNER JOIN session_quiz
                ON session_quiz.id =
                    erreur_quiz.session_quiz_id

            WHERE session_quiz.eleve_id = ?

            GROUP BY
                erreur_quiz.infinitif

            ORDER BY
                nombre_erreurs DESC,
                derniere_erreur DESC,
                erreur_quiz.infinitif ASC
        `,
        [eleveId],
        (error, verbs) =>
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


            statistiques.verbes_a_revoir =
                verbs.map(
                    (verb) =>
                    {
                        return {
                            infinitif:
                                verb.infinitif,

                            nombre_erreurs:
                                Number(
                                    verb.nombre_erreurs
                                ),

                            derniere_erreur:
                                verb.derniere_erreur
                        };
                    }
                );


            getQuizEvolution(
                eleveId,
                statistiques,
                response
            );
        }
    );
}


/* ==========================================================
   ÉVOLUTION DES RÉSULTATS DE L'ÉLÈVE
========================================================== */

function getQuizEvolution(
    eleveId,
    statistiques,
    response
)
{
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
                date_session ASC,
                id ASC
        `,
        [eleveId],
        (error, sessions) =>
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


            statistiques.nombre_quiz =
                Number(
                    statistiques.nombre_quiz
                );

            statistiques.moyenne =
                Number(
                    statistiques.moyenne ?? 0
                );

            statistiques.meilleur_score =
                Number(
                    statistiques.meilleur_score ?? 0
                );

            statistiques.temps_total =
                Number(
                    statistiques.temps_total ?? 0
                );


            statistiques.evolution =
                sessions.map(
                    (session) =>
                    {
                        let pourcentage =
                            0;


                        if (
                            Number(
                                session.nombre_questions
                            ) > 0
                        )
                        {
                            pourcentage =
                                (
                                    Number(
                                        session.score
                                    ) /
                                    Number(
                                        session.nombre_questions
                                    )
                                ) * 100;
                        }


                        return {
                            id:
                                session.id,

                            date_session:
                                session.date_session,

                            difficulte:
                                session.difficulte,

                            type_quiz:
                                session.type_quiz,

                            score:
                                Number(
                                    session.score
                                ),

                            nombre_questions:
                                Number(
                                    session.nombre_questions
                                ),

                            pourcentage:
                                Number(
                                    pourcentage.toFixed(1)
                                ),

                            duree:
                                session.duree === null
                                    ? null
                                    : Number(
                                        session.duree
                                    )
                        };
                    }
                );


            response.json(
                statistiques
            );
        }
    );
}


/* ==========================================================
   STATISTIQUES DU PROFESSEUR
========================================================== */

router.get(
    "/professeur",
    verifyToken,
    requireProfessor,
    (request, response) =>
    {
        const professeurId =
            request.user.id;


        database.query(
            `
                SELECT
                    COUNT(*) AS nombre_eleves

                FROM eleve

                WHERE professeur_id = ?
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


                const statistiques = {
                    nombre_eleves:
                        Number(
                            results[0].nombre_eleves
                        )
                };


                getTeacherQuizStatistics(
                    professeurId,
                    statistiques,
                    response
                );
            }
        );
    }
);


/* ==========================================================
   QUIZ DE LA CLASSE
========================================================== */

function getTeacherQuizStatistics(
    professeurId,
    statistiques,
    response
)
{
    database.query(
        `
            SELECT
                COUNT(
                    session_quiz.id
                ) AS nombre_quiz,

                ROUND(
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
                    1
                ) AS moyenne_classe

            FROM eleve

            LEFT JOIN session_quiz
                ON session_quiz.eleve_id =
                    eleve.id

            WHERE eleve.professeur_id = ?
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


            statistiques.nombre_quiz =
                Number(
                    results[0].nombre_quiz
                );


            statistiques.moyenne_classe =
                Number(
                    results[0].moyenne_classe ?? 0
                );


            getTeacherQuizErrors(
                professeurId,
                statistiques,
                response
            );
        }
    );
}


/* ==========================================================
   ERREURS DE LA CLASSE
========================================================== */

function getTeacherQuizErrors(
    professeurId,
    statistiques,
    response
)
{
    database.query(
        `
            SELECT
                COUNT(
                    erreur_quiz.id
                ) AS nombre_erreurs

            FROM eleve

            INNER JOIN session_quiz
                ON session_quiz.eleve_id =
                    eleve.id

            INNER JOIN erreur_quiz
                ON erreur_quiz.session_quiz_id =
                    session_quiz.id

            WHERE eleve.professeur_id = ?
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


            statistiques.nombre_erreurs =
                Number(
                    results[0].nombre_erreurs
                );


            response.json(
                statistiques
            );
        }
    );
}

/* ==========================================================
   STATISTIQUES D'UN ÉLÈVE CONSULTÉES PAR SON PROFESSEUR
========================================================== */

router.get(
    "/professeur/eleve/:id",
    verifyToken,
    requireProfessor,
    (request, response) =>
    {
        const professeurId =
            request.user.id;

        const eleveId =
            Number(
                request.params.id
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


        /*
         * On vérifie d'abord que l'élève appartient
         * bien au professeur connecté.
         */

        database.query(
            `
                SELECT
                    id,
                    nom,
                    prenom,
                    email

                FROM eleve

                WHERE id = ?
                AND professeur_id = ?
            `,
            [
                eleveId,
                professeurId
            ],
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


                if (students.length === 0)
                {
                    response.status(404).json({
                        error:
                            "Élève introuvable"
                    });

                    return;
                }


                const student =
                    students[0];


                getTeacherStudentSummary(
                    eleveId,
                    student,
                    response
                );
            }
        );
    }
);


/* ==========================================================
   RÉSUMÉ DE L'ÉLÈVE
========================================================== */

function getTeacherStudentSummary(
    eleveId,
    student,
    response
)
{
    database.query(
        `
            SELECT
                COUNT(*) AS nombre_quiz,

                ROUND(
                    AVG(
                        CASE
                            WHEN nombre_questions > 0
                            THEN
                                (
                                    score /
                                    nombre_questions
                                ) * 100
                            ELSE NULL
                        END
                    ),
                    1
                ) AS moyenne,

                ROUND(
                    MAX(
                        CASE
                            WHEN nombre_questions > 0
                            THEN
                                (
                                    score /
                                    nombre_questions
                                ) * 100
                            ELSE NULL
                        END
                    ),
                    1
                ) AS meilleur_score,

                COALESCE(
                    SUM(duree),
                    0
                ) AS temps_total

            FROM session_quiz

            WHERE eleve_id = ?
        `,
        [eleveId],
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


            const statistics = {
                eleve: {
                    id:
                        student.id,

                    nom:
                        student.nom,

                    prenom:
                        student.prenom,

                    email:
                        student.email
                },

                nombre_quiz:
                    Number(
                        results[0].nombre_quiz
                    ),

                moyenne:
                    Number(
                        results[0].moyenne ?? 0
                    ),

                meilleur_score:
                    Number(
                        results[0].meilleur_score ?? 0
                    ),

                temps_total:
                    Number(
                        results[0].temps_total ?? 0
                    )
            };


            getTeacherStudentErrors(
                eleveId,
                statistics,
                response
            );
        }
    );
}


/* ==========================================================
   ERREURS DE L'ÉLÈVE
========================================================== */

function getTeacherStudentErrors(
    eleveId,
    statistics,
    response
)
{
    database.query(
        `
            SELECT
                COUNT(*) AS nombre_erreurs

            FROM erreur_quiz

            INNER JOIN session_quiz
                ON session_quiz.id =
                    erreur_quiz.session_quiz_id

            WHERE session_quiz.eleve_id = ?
        `,
        [eleveId],
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


            statistics.nombre_erreurs =
                Number(
                    results[0].nombre_erreurs
                );


            getTeacherStudentVerbs(
                eleveId,
                statistics,
                response
            );
        }
    );
}


/* ==========================================================
   VERBES À REVOIR DE L'ÉLÈVE
========================================================== */

function getTeacherStudentVerbs(
    eleveId,
    statistics,
    response
)
{
    database.query(
        `
            SELECT
                erreur_quiz.infinitif,

                COUNT(*) AS nombre_erreurs,

                MAX(
                    session_quiz.date_session
                ) AS derniere_erreur

            FROM erreur_quiz

            INNER JOIN session_quiz
                ON session_quiz.id =
                    erreur_quiz.session_quiz_id

            WHERE session_quiz.eleve_id = ?

            GROUP BY
                erreur_quiz.infinitif

            ORDER BY
                nombre_erreurs DESC,
                derniere_erreur DESC,
                erreur_quiz.infinitif ASC
        `,
        [eleveId],
        (error, verbs) =>
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


            statistics.verbes_a_revoir =
                verbs.map(
                    (verb) =>
                    {
                        return {
                            infinitif:
                                verb.infinitif,

                            nombre_erreurs:
                                Number(
                                    verb.nombre_erreurs
                                ),

                            derniere_erreur:
                                verb.derniere_erreur
                        };
                    }
                );


            getTeacherStudentEvolution(
                eleveId,
                statistics,
                response
            );
        }
    );
}


/* ==========================================================
   ÉVOLUTION DE L'ÉLÈVE
========================================================== */

function getTeacherStudentEvolution(
    eleveId,
    statistics,
    response
)
{
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
                date_session ASC,
                id ASC
        `,
        [eleveId],
        (error, sessions) =>
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


            statistics.evolution =
                sessions.map(
                    (session) =>
                    {
                        let percentage =
                            0;


                        if (
                            Number(
                                session.nombre_questions
                            ) > 0
                        )
                        {
                            percentage =
                                (
                                    Number(
                                        session.score
                                    ) /
                                    Number(
                                        session.nombre_questions
                                    )
                                ) * 100;
                        }


                        return {
                            id:
                                session.id,

                            date_session:
                                session.date_session,

                            difficulte:
                                session.difficulte,

                            type_quiz:
                                session.type_quiz,

                            score:
                                Number(
                                    session.score
                                ),

                            nombre_questions:
                                Number(
                                    session.nombre_questions
                                ),

                            pourcentage:
                                Number(
                                    percentage.toFixed(1)
                                ),

                            duree:
                                session.duree === null
                                    ? null
                                    : Number(
                                        session.duree
                                    )
                        };
                    }
                );


            response.json(
                statistics
            );
        }
    );
}


/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;