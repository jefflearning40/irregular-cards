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

const statisticsEvolutionButton =
    document.getElementById(
        "statistics-evolution-button"
    );

const statisticsEvolutionModal =
    document.getElementById(
        "statistics-evolution-modal"
    );

const statisticsEvolutionClose =
    document.getElementById(
        "statistics-evolution-close"
    );

const statisticsEvolutionCloseButton =
    document.getElementById(
        "statistics-evolution-close-button"
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
   ÉVOLUTION
========================================================== */

let statisticsEvolutionSessions =
    [];


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
   FORMATAGE COURT DE LA DATE
========================================================== */

function formatStatisticsChartDate(
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
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit"
        }
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
   CRÉATION D'UN ÉLÉMENT SVG
========================================================== */

function createStatisticsSvgElement(
    tagName,
    attributes = {}
)
{
    const element =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            tagName
        );


    Object.entries(
        attributes
    ).forEach(
        ([name, value]) =>
        {
            element.setAttribute(
                name,
                value
            );
        }
    );


    return element;
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


        message.className =
            "statistics-chart-empty";

        message.textContent =
            "Aucun quiz enregistré.";


        statisticsEvolutionContent.appendChild(
            message
        );

        return;
    }


    const orderedSessions =
        [...sessions].sort(
            (sessionA, sessionB) =>
            {
                return (
                    new Date(
                        sessionA.date_session
                    ) -
                    new Date(
                        sessionB.date_session
                    )
                );
            }
        );


    const svg =
        createStatisticsSvgElement(
            "svg",
            {
                class:
                    "statistics-line-chart-svg",

                viewBox:
                    "0 0 900 400",

                preserveAspectRatio:
                    "none",

                role:
                    "img",

                "aria-label":
                    "Courbe d'évolution des résultats aux quiz"
            }
        );


    const chartLeft =
        75;

    const chartRight =
        860;

    const chartTop =
        35;

    const chartBottom =
        330;

    const chartWidth =
        chartRight -
        chartLeft;

    const chartHeight =
        chartBottom -
        chartTop;


    /* ======================================================
       GRILLE HORIZONTALE
    ====================================================== */

    const levels =
        [
            0,
            20,
            40,
            60,
            80,
            100
        ];


    levels.forEach(
        (level) =>
        {
            const y =
                chartBottom -
                (
                    level / 100
                ) *
                chartHeight;


            const gridLine =
                createStatisticsSvgElement(
                    "line",
                    {
                        x1:
                            chartLeft,

                        y1:
                            y,

                        x2:
                            chartRight,

                        y2:
                            y,

                        class:
                            "statistics-chart-grid-line"
                    }
                );


            const label =
                createStatisticsSvgElement(
                    "text",
                    {
                        x:
                            chartLeft - 15,

                        y:
                            y + 5,

                        class:
                            "statistics-chart-percentage",

                        "text-anchor":
                            "end"
                    }
                );


            label.textContent =
                `${level} %`;


            svg.appendChild(
                gridLine
            );

            svg.appendChild(
                label
            );
        }
    );


    /* ======================================================
       AXE VERTICAL
    ====================================================== */

    const verticalAxis =
        createStatisticsSvgElement(
            "line",
            {
                x1:
                    chartLeft,

                y1:
                    chartTop,

                x2:
                    chartLeft,

                y2:
                    chartBottom,

                class:
                    "statistics-chart-axis"
            }
        );


    svg.appendChild(
        verticalAxis
    );


    /* ======================================================
       AXE HORIZONTAL
    ====================================================== */

    const horizontalAxis =
        createStatisticsSvgElement(
            "line",
            {
                x1:
                    chartLeft,

                y1:
                    chartBottom,

                x2:
                    chartRight,

                y2:
                    chartBottom,

                class:
                    "statistics-chart-axis"
            }
        );


    svg.appendChild(
        horizontalAxis
    );


    /* ======================================================
       CALCUL DE LA COURBE
    ====================================================== */

    const points =
        [];


    orderedSessions.forEach(
        (session, index) =>
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


            let x;


            if (orderedSessions.length === 1)
            {
                x =
                    chartLeft +
                    chartWidth / 2;
            }
            else
            {
                x =
                    chartLeft +
                    (
                        index /
                        (
                            orderedSessions.length -
                            1
                        )
                    ) *
                    chartWidth;
            }


            const y =
                chartBottom -
                (
                    percentage / 100
                ) *
                chartHeight;


            points.push({
                x:
                    x,

                y:
                    y,

                date:
                    session.date_session
            });
        }
    );


    /* ======================================================
       COURBE
    ====================================================== */

    if (points.length > 1)
    {
        const polyline =
            createStatisticsSvgElement(
                "polyline",
                {
                    points:
                        points
                            .map(
                                (point) =>
                                    `${point.x},${point.y}`
                            )
                            .join(" "),

                    class:
                        "statistics-chart-line"
                }
            );


        svg.appendChild(
            polyline
        );
    }


    /* ======================================================
       DATES DE L'AXE HORIZONTAL
    ====================================================== */

    const maximumDateLabels =
        5;


    const labelCount =
        Math.min(
            maximumDateLabels,
            points.length
        );


    const displayedIndexes =
        new Set();


    if (labelCount === 1)
    {
        displayedIndexes.add(
            0
        );
    }
    else
    {
        for (
            let labelIndex = 0;
            labelIndex < labelCount;
            labelIndex++
        )
        {
            const pointIndex =
                Math.round(
                    labelIndex *
                    (
                        points.length - 1
                    ) /
                    (
                        labelCount - 1
                    )
                );


            displayedIndexes.add(
                pointIndex
            );
        }
    }


    displayedIndexes.forEach(
        (pointIndex) =>
        {
            const point =
                points[
                    pointIndex
                ];


            const date =
                createStatisticsSvgElement(
                    "text",
                    {
                        x:
                            point.x,

                        y:
                            chartBottom + 35,

                        class:
                            "statistics-chart-date-label",

                        "text-anchor":
                            "middle"
                    }
                );


            date.textContent =
                formatStatisticsChartDate(
                    point.date
                );


            svg.appendChild(
                date
            );
        }
    );


    statisticsEvolutionContent.appendChild(
        svg
    );
}


/* ==========================================================
   OUVERTURE DE LA MODALE ÉVOLUTION
========================================================== */

function openStatisticsEvolution()
{
    displayStatisticsEvolution(
        statisticsEvolutionSessions
    );


    statisticsEvolutionModal.classList.add(
        "is-open"
    );


    statisticsEvolutionModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE DE LA MODALE ÉVOLUTION
========================================================== */

function closeStatisticsEvolution()
{
    statisticsEvolutionModal.classList.remove(
        "is-open"
    );


    statisticsEvolutionModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* ==========================================================
   AFFICHAGE DES STATISTIQUES
========================================================== */

function displayStudentStatistics(
    statistics
)
{
    if (statistics.eleve)
    {
        statisticsStudentName.textContent =
            `${statistics.eleve.prenom} ${statistics.eleve.nom}`;

        statisticsEvolutionButton.textContent =
            "Voir son évolution";
    }
    else if (currentStudent)
    {
        statisticsStudentName.textContent =
            `${currentStudent.prenom} ${currentStudent.nom}`;

        statisticsEvolutionButton.textContent =
            "Voir mon évolution";
    }
    else
    {
        statisticsStudentName.textContent =
            "-";

        statisticsEvolutionButton.textContent =
            "Voir mon évolution";
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


    if (
        Array.isArray(
            statistics.evolution
        )
    )
    {
        statisticsEvolutionSessions =
            [...statistics.evolution];
    }
    else
    {
        statisticsEvolutionSessions =
            [];
    }
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


    statisticsEvolutionSessions =
        [];


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
   ÉVÉNEMENT DU FILTRE
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


/* ==========================================================
   OUVERTURE DE L'ÉVOLUTION
========================================================== */

statisticsEvolutionButton.addEventListener(
    "click",
    openStatisticsEvolution
);


/* ==========================================================
   FERMETURE DE L'ÉVOLUTION
========================================================== */

statisticsEvolutionClose.addEventListener(
    "click",
    closeStatisticsEvolution
);


statisticsEvolutionCloseButton.addEventListener(
    "click",
    closeStatisticsEvolution
);


/* ==========================================================
   CLIC EN DEHORS DE LA MODALE
========================================================== */

statisticsEvolutionModal.addEventListener(
    "click",
    (event) =>
    {
        if (
            event.target ===
            statisticsEvolutionModal
        )
        {
            closeStatisticsEvolution();
        }
    }
);


/* ==========================================================
   TOUCHE ÉCHAP
========================================================== */

document.addEventListener(
    "keydown",
    (event) =>
    {
        if (
            event.key === "Escape" &&
            statisticsEvolutionModal.classList.contains(
                "is-open"
            )
        )
        {
            closeStatisticsEvolution();
        }
    }
);