"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const teacherName =
    document.getElementById(
        "teacher-name"
    );

const teacherStudentCount =
    document.getElementById(
        "teacher-student-count"
    );

const teacherQuizCount =
    document.getElementById(
        "teacher-quiz-count"
    );

const teacherClassAverage =
    document.getElementById(
        "teacher-class-average"
    );

const teacherErrorCount =
    document.getElementById(
        "teacher-error-count"
    );

const teacherStudentsList =
    document.getElementById(
        "teacher-students-list"
    );


/* ==========================================================
   AFFICHAGE DU NOM DU PROFESSEUR
========================================================== */

function displayTeacherName()
{
    if (!currentUser)
    {
        teacherName.textContent =
            "-";

        return;
    }


    teacherName.textContent =
        `${currentUser.prenom} ${currentUser.nom}`;
}


/* ==========================================================
   AFFICHAGE DES STATISTIQUES DE LA CLASSE
========================================================== */

function displayTeacherStatistics(
    statistics
)
{
    teacherStudentCount.textContent =
        Number(
            statistics.nombre_eleves
        );


    teacherQuizCount.textContent =
        Number(
            statistics.nombre_quiz
        );


    teacherClassAverage.textContent =
        `${
            Number(
                statistics.moyenne_classe
            )
        } %`;


    teacherErrorCount.textContent =
        Number(
            statistics.nombre_erreurs
        );
}


/* ==========================================================
   CRÉATION D'UNE LIGNE ÉLÈVE
========================================================== */

function createTeacherStudentItem(
    student
)
{
    const item =
        document.createElement(
            "div"
        );


    item.className =
        "teacher-student-item";


    /* ======================================================
       NOM
    ====================================================== */

    const name =
        document.createElement(
            "span"
        );


    name.className =
        "teacher-student-name";


    name.textContent =
        `${student.prenom} ${student.nom}`;


    /* ======================================================
       NOMBRE DE QUIZ
    ====================================================== */

    const quizCount =
        document.createElement(
            "span"
        );


    quizCount.className =
        "teacher-student-quiz-count";


    quizCount.textContent =
        Number(
            student.nombre_quiz
        );


    /* ======================================================
       MOYENNE
    ====================================================== */

    const average =
        document.createElement(
            "span"
        );


    average.className =
        "teacher-student-average";


    average.textContent =
        `${Number(student.moyenne)} %`;


    /* ======================================================
       BOUTON CONSULTER
    ====================================================== */

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "teacher-student-button";


    button.type =
        "button";


    button.textContent =
        "Consulter";


    button.dataset.studentId =
        student.id;


    /* ======================================================
       CONSULTATION DES STATISTIQUES DE L'ÉLÈVE
    ====================================================== */

    button.addEventListener(
        "click",
        async () =>
        {
            button.disabled =
                true;


            try
            {
                const studentStatistics =
                    await getTeacherStudentStatistics(
                        student.id
                    );


                displayStudentStatistics(
                    studentStatistics
                );


                showStatistics();
            }
            catch (error)
            {
                console.error(
                    error
                );
            }
            finally
            {
                button.disabled =
                    false;
            }
        }
    );


    /* ======================================================
       AJOUT À LA LIGNE
    ====================================================== */

    item.appendChild(
        name
    );

    item.appendChild(
        quizCount
    );

    item.appendChild(
        average
    );

    item.appendChild(
        button
    );


    return item;
}


/* ==========================================================
   AFFICHAGE DE LA LISTE DES ÉLÈVES
========================================================== */

function displayTeacherStudents(
    students
)
{
    teacherStudentsList.innerHTML =
        "";


    if (
        !Array.isArray(students) ||
        students.length === 0
    )
    {
        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "Aucun élève enregistré.";


        teacherStudentsList.appendChild(
            message
        );


        return;
    }


    students.forEach(
        (student) =>
        {
            const item =
                createTeacherStudentItem(
                    student
                );


            teacherStudentsList.appendChild(
                item
            );
        }
    );
}


/* ==========================================================
   CHARGEMENT DU TABLEAU DE BORD
========================================================== */

async function loadTeacherDashboard()
{
    displayTeacherName();


    teacherStudentCount.textContent =
        "...";

    teacherQuizCount.textContent =
        "...";

    teacherClassAverage.textContent =
        "...";

    teacherErrorCount.textContent =
        "...";


    teacherStudentsList.innerHTML =
        "";


    try
    {
        const [
            students,
            statistics
        ] =
            await Promise.all([
                getTeacherStudents(),
                getTeacherStatistics()
            ]);


        displayTeacherStatistics(
            statistics
        );


        displayTeacherStudents(
            students
        );
    }
    catch (error)
    {
        console.error(
            error
        );


        teacherStudentCount.textContent =
            "-";

        teacherQuizCount.textContent =
            "-";

        teacherClassAverage.textContent =
            "-";

        teacherErrorCount.textContent =
            "-";


        teacherStudentsList.innerHTML =
            "";


        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            "Impossible de charger le tableau de bord.";


        teacherStudentsList.appendChild(
            message
        );
    }
}