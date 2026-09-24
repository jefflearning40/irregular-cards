"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const statisticsQuizCount =
    document.getElementById(
        "statistics-quiz-count"
    );

const statisticsAverage =
    document.getElementById(
        "statistics-average"
    );

const statisticsBestScore =
    document.getElementById(
        "statistics-best-score"
    );

const statisticsTime =
    document.getElementById(
        "statistics-time"
    );

const statisticsErrors =
    document.getElementById(
        "statistics-errors"
    );

const statisticsReviewVerbs =
    document.getElementById(
        "statistics-review-verbs"
    );

const statisticsEvolutionContent =
    document.getElementById(
        "statistics-evolution-content"
    );


/* ==========================================================
   RÉCUPÉRATION DES STATISTIQUES
========================================================== */

async function getStudentStatistics()
{
    if (!apiToken)
    {
        throw new Error(
            "Aucun élève connecté."
        );
    }


    let response;


    try
    {
        response =
            await fetch(
                `${API_URL}/statistiques/eleve`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${apiToken}`
                    }
                }
            );
    }
    catch (error)
    {
        throw new Error(
            "SERVER_UNAVAILABLE"
        );
    }


    if (!response.ok)
    {
        throw new Error(
            "Impossible de récupérer les statistiques."
        );
    }


    return await response.json();
}


/* ==========================================================
   FORMATAGE DU TEMPS
========================================================== */

function formatStatisticsTime(
    totalSeconds
)
{
    const seconds =
        Number(
            totalSeconds
        ) || 0;

    const hours =
        Math.floor(
            seconds / 3600
        );

    const minutes =
        Math.floor(
            (
                seconds % 3600
            ) / 60
        );

    const remainingSeconds =
        seconds % 60;


    if (hours > 0)
    {
        return (
            `${hours} h ` +
            `${minutes} min`
        );
    }


    if (minutes > 0)
    {
        return (
            `${minutes} min ` +
            `${remainingSeconds} s`
        );
    }


    return `${remainingSeconds} s`;
}


/* ==========================================================
   FORMATAGE DE LA DATE
========================================================== */

function formatStatisticsDate(
    date
)
{
    if (!date)
    {
        return "";
    }


    return new Date(
        date
    ).toLocaleDateString(
        "fr-FR"
    );
}


/* ==========================================================
   AFFICHAGE DES VERBES À REVOIR
========================================================== */

function displayStatisticsReviewVerbs(
    verbs
)
{
    statisticsReviewVerbs.innerHTML =
        "";


    if (
        !Array.isArray(verbs) ||
        verbs.length === 0
    )
    {
        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "Aucun verbe à revoir.";

        statisticsReviewVerbs.appendChild(
            message
        );

        return;
    }


    verbs.forEach(
        (verb) =>
        {
            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "statistics-review-item";


            const infinitive =
                document.createElement(
                    "span"
                );


            infinitive.className =
                "statistics-review-verb";

            infinitive.textContent =
                verb.infinitif;


            const errorCount =
                document.createElement(
                    "span"
                );


            errorCount.className =
                "statistics-review-count";

            errorCount.textContent =
                `${verb.nombre_erreurs} erreur${
                    Number(
                        verb.nombre_erreurs
                    ) > 1
                        ? "s"
                        : ""
                }`;


            item.appendChild(
                infinitive
            );

            item.appendChild(
                errorCount
            );


            statisticsReviewVerbs.appendChild(
                item
            );
        }
    );
}


/* ==========================================================
   AFFICHAGE DE L'ÉVOLUTION
========================================================== */

function displayStatisticsEvolution(
    sessions
)
{
    statisticsEvolutionContent.innerHTML =
        "";


    if (
        !Array.isArray(sessions) ||
        sessions.length === 0
    )
    {
        const message =
            document.createElement(
                "p"
            );

        message.textContent =
            "Aucun quiz enregistré.";

        statisticsEvolutionContent.appendChild(
            message
        );

        return;
    }


    const chart =
        document.createElement(
            "div"
        );


    chart.className =
        "statistics-chart";


    sessions.forEach(
        (session) =>
        {
            const percentage =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(
                            session.pourcentage
                        ) || 0
                    )
                );


            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "statistics-chart-column";


            const score =
                document.createElement(
                    "span"
                );


            score.className =
                "statistics-chart-score";

            score.textContent =
                `${percentage} %`;


            const track =
                document.createElement(
                    "div"
                );


            track.className =
                "statistics-chart-track";


            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "statistics-chart-bar";

            bar.style.height =
                `${percentage}%`;


            const date =
                document.createElement(
                    "span"
                );


            date.className =
                "statistics-chart-date";

            date.textContent =
                formatStatisticsDate(
                    session.date_session
                );


            track.appendChild(
                bar
            );


            column.appendChild(
                score
            );

            column.appendChild(
                track
            );

            column.appendChild(
                date
            );


            chart.appendChild(
                column
            );
        }
    );


    statisticsEvolutionContent.appendChild(
        chart
    );
}


/* ==========================================================
   AFFICHAGE DES STATISTIQUES
========================================================== */

function displayStudentStatistics(
    statistics
)
{
    statisticsQuizCount.textContent =
        statistics.nombre_quiz;

    statisticsAverage.textContent =
        `${statistics.moyenne} %`;

    statisticsBestScore.textContent =
        `${statistics.meilleur_score} %`;

    statisticsTime.textContent =
        formatStatisticsTime(
            statistics.temps_total
        );

    statisticsErrors.textContent =
        statistics.nombre_erreurs;


    displayStatisticsReviewVerbs(
        statistics.verbes_a_revoir
    );


    displayStatisticsEvolution(
        statistics.evolution
    );
}


/* ==========================================================
   CHARGEMENT DES STATISTIQUES
========================================================== */

async function loadStudentStatistics()
{
    statisticsQuizCount.textContent =
        "...";

    statisticsAverage.textContent =
        "...";

    statisticsBestScore.textContent =
        "...";

    statisticsTime.textContent =
        "...";

    statisticsErrors.textContent =
        "...";


    statisticsReviewVerbs.innerHTML =
        "";

    statisticsEvolutionContent.innerHTML =
        "";


    try
    {
        const statistics =
            await getStudentStatistics();


        displayStudentStatistics(
            statistics
        );
    }
    catch (error)
    {
        console.error(
            error
        );


        statisticsReviewVerbs.innerHTML =
            "";

        statisticsEvolutionContent.innerHTML =
            "";


        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "Impossible de charger les statistiques.";


        statisticsReviewVerbs.appendChild(
            message
        );
    }
}