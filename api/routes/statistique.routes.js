"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const {
    verifyToken
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
                error: "Accès réservé aux élèves"
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
                    console.error(error);

                    response.status(500).json({
                        error: "Erreur serveur"
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
   ERREURS DES QUIZ
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
                console.error(error);

                response.status(500).json({
                    error: "Erreur serveur"
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
   VERBES À REVOIR
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
                console.error(error);

                response.status(500).json({
                    error: "Erreur serveur"
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
   ÉVOLUTION DES RÉSULTATS
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
                console.error(error);

                response.status(500).json({
                    error: "Erreur serveur"
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
   EXPORT
========================================================== */

module.exports = router;