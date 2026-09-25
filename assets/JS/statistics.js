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

const statisticsErrorFilter =
    document.getElementById(
        "statistics-error-filter"
    );

const statisticsReviewCounter =
    document.getElementById(
        "statistics-review-counter"
    );

const statisticsPreviousButton =
    document.getElementById(
        "statistics-previous-button"
    );

const statisticsNextButton =
    document.getElementById(
        "statistics-next-button"
    );

const statisticsPageIndicator =
    document.getElementById(
        "statistics-page-indicator"
    );

const statisticsStudentName =
    document.getElementById(
        "statistics-student-name"
    );


/* ==========================================================
   PAGINATION DES VERBES
========================================================== */

const STATISTICS_VERBS_PER_PAGE =
    10;

let statisticsAllReviewVerbs =
    [];

let statisticsFilteredReviewVerbs =
    [];

let statisticsCurrentPage =
    1;


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
   FILTRAGE DES VERBES
========================================================== */

function filterStatisticsReviewVerbs()
{
    const filter =
        statisticsErrorFilter.value;


    statisticsFilteredReviewVerbs =
        statisticsAllReviewVerbs.filter(
            (verb) =>
            {
                const errorCount =
                    Number(
                        verb.nombre_erreurs
                    ) || 0;


                if (filter === "all")
                {
                    return true;
                }


                if (filter === "4")
                {
                    return errorCount >= 4;
                }


                return (
                    errorCount ===
                    Number(filter)
                );
            }
        );


    statisticsCurrentPage =
        1;


    displayStatisticsReviewVerbs();
}


/* ==========================================================
   CRÉATION D'UNE LIGNE VERBE
========================================================== */

function createStatisticsReviewVerb(
    verb
)
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


    const numberOfErrors =
        Number(
            verb.nombre_erreurs
        ) || 0;


    errorCount.textContent =
        `${numberOfErrors} erreur${
            numberOfErrors > 1
                ? "s"
                : ""
        }`;


    item.appendChild(
        infinitive
    );

    item.appendChild(
        errorCount
    );


    return item;
}


/* ==========================================================
   MISE À JOUR DE LA PAGINATION
========================================================== */

function updateStatisticsPagination()
{
    const totalVerbs =
        statisticsFilteredReviewVerbs.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalVerbs /
                STATISTICS_VERBS_PER_PAGE
            )
        );


    if (
        statisticsCurrentPage >
        totalPages
    )
    {
        statisticsCurrentPage =
            totalPages;
    }


    const start =
        totalVerbs === 0
            ? 0
            : (
                (
                    statisticsCurrentPage - 1
                ) *
                STATISTICS_VERBS_PER_PAGE
            ) + 1;


    const end =
        Math.min(
            statisticsCurrentPage *
            STATISTICS_VERBS_PER_PAGE,
            totalVerbs
        );


    statisticsReviewCounter.textContent =
        `${start}–${end} / ${totalVerbs} verbe${
            totalVerbs > 1
                ? "s"
                : ""
        }`;


    statisticsPageIndicator.textContent =
        `Page ${statisticsCurrentPage} / ${totalPages}`;


    statisticsPreviousButton.disabled =
        statisticsCurrentPage <= 1;


    statisticsNextButton.disabled =
        statisticsCurrentPage >= totalPages;
}


/* ==========================================================
   AFFICHAGE DES VERBES À REVOIR
========================================================== */

function displayStatisticsReviewVerbs()
{
    statisticsReviewVerbs.innerHTML =
        "";


    const totalVerbs =
        statisticsFilteredReviewVerbs.length;


    if (totalVerbs === 0)
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


        updateStatisticsPagination();

        return;
    }


    const startIndex =
        (
            statisticsCurrentPage - 1
        ) *
        STATISTICS_VERBS_PER_PAGE;


    const endIndex =
        startIndex +
        STATISTICS_VERBS_PER_PAGE;


    const pageVerbs =
        statisticsFilteredReviewVerbs.slice(
            startIndex,
            endIndex
        );


    pageVerbs.forEach(
        (verb) =>
        {
            statisticsReviewVerbs.appendChild(
                createStatisticsReviewVerb(
                    verb
                )
            );
        }
    );


    updateStatisticsPagination();
}


/* ==========================================================
   INITIALISATION DES VERBES À REVOIR
========================================================== */

function initialiseStatisticsReviewVerbs(
    verbs
)
{
    if (!Array.isArray(verbs))
    {
        statisticsAllReviewVerbs =
            [];
    }
    else
    {
        statisticsAllReviewVerbs =
            [...verbs];
    }


    statisticsAllReviewVerbs.sort(
        (verbA, verbB) =>
        {
            return (
                Number(
                    verbB.nombre_erreurs
                ) -
                Number(
                    verbA.nombre_erreurs
                )
            );
        }
    );


    statisticsFilteredReviewVerbs =
        [...statisticsAllReviewVerbs];


    statisticsCurrentPage =
        1;


    statisticsErrorFilter.value =
        "all";


    displayStatisticsReviewVerbs();
}


/* ==========================================================
   PAGE PRÉCÉDENTE
========================================================== */

function showPreviousStatisticsPage()
{
    if (statisticsCurrentPage <= 1)
    {
        return;
    }


    statisticsCurrentPage--;


    displayStatisticsReviewVerbs();
}


/* ==========================================================
   PAGE SUIVANTE
========================================================== */

function showNextStatisticsPage()
{
    const totalPages =
        Math.max(
            1,
            Math.ceil(
                statisticsFilteredReviewVerbs.length /
                STATISTICS_VERBS_PER_PAGE
            )
        );


    if (
        statisticsCurrentPage >=
        totalPages
    )
    {
        return;
    }


    statisticsCurrentPage++;


    displayStatisticsReviewVerbs();
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
    if (currentStudent)
    {
        statisticsStudentName.textContent =
            `${currentStudent.prenom} ${currentStudent.nom}`;
    }
    else
    {
        statisticsStudentName.textContent =
            "-";
    }


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


    initialiseStatisticsReviewVerbs(
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
    statisticsStudentName.textContent =
        currentStudent
            ? `${currentStudent.prenom} ${currentStudent.nom}`
            : "-";


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


/* ==========================================================
   ÉVÉNEMENTS DU FILTRE
========================================================== */

statisticsErrorFilter.addEventListener(
    "change",
    filterStatisticsReviewVerbs
);


/* ==========================================================
   ÉVÉNEMENTS DE PAGINATION
========================================================== */

statisticsPreviousButton.addEventListener(
    "click",
    showPreviousStatisticsPage
);


statisticsNextButton.addEventListener(
    "click",
    showNextStatisticsPage
);