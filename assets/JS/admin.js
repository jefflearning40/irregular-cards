"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const adminTeacherCount =
    document.getElementById(
        "admin-teacher-count"
    );

const adminStudentCount =
    document.getElementById(
        "admin-student-count"
    );

const adminTeacherTableBody =
    document.getElementById(
        "admin-teacher-table-body"
    );

const adminDashboardView =
    document.getElementById(
        "admin-dashboard-view"
    );

const adminTeachersView =
    document.getElementById(
        "admin-teachers-view"
    );

const adminTeacherBackButton =
    document.getElementById(
        "admin-teacher-back-button"
    );

const adminSelectedTeacherId =
    document.getElementById(
        "admin-selected-teacher-id"
    );

const adminSelectedTeacherName =
    document.getElementById(
        "admin-selected-teacher-name"
    );

const adminSelectedTeacherEmail =
    document.getElementById(
        "admin-selected-teacher-email"
    );

const adminSelectedTeacherStudentCount =
    document.getElementById(
        "admin-selected-teacher-student-count"
    );

const adminTeacherStudentTableBody =
    document.getElementById(
        "admin-teacher-student-table-body"
    );


/* ==========================================================
   PROFESSEURS CHARGÉS
========================================================== */

let adminTeachers =
    [];


/* ==========================================================
   AFFICHAGE DU MESSAGE DE CHARGEMENT
========================================================== */

function showAdminLoading()
{
    adminTeacherTableBody.innerHTML =
        `
            <tr>
                <td colspan="6">
                    &gt; CHARGEMENT DES DONNEES...
                </td>
            </tr>
        `;
}


/* ==========================================================
   AFFICHAGE D'UNE ERREUR
========================================================== */

function showAdminError(
    message
)
{
    adminTeacherTableBody.innerHTML =
        `
            <tr>
                <td colspan="6">
                    &gt; ERREUR : ${message}
                </td>
            </tr>
        `;
}


/* ==========================================================
   AFFICHAGE DU CHARGEMENT DES ÉLÈVES
========================================================== */

function showAdminTeacherStudentsLoading()
{
    adminTeacherStudentTableBody.innerHTML =
        `
            <tr>
                <td colspan="5">
                    &gt; CHARGEMENT DES ELEVES...
                </td>
            </tr>
        `;
}


/* ==========================================================
   AFFICHAGE D'UNE ERREUR ÉLÈVES
========================================================== */

function showAdminTeacherStudentsError(
    message
)
{
    adminTeacherStudentTableBody.innerHTML =
        `
            <tr>
                <td colspan="5">
                    &gt; ERREUR : ${message}
                </td>
            </tr>
        `;
}


/* ==========================================================
   AFFICHAGE DU TABLEAU DE BORD
========================================================== */

function showAdminDashboardView()
{
    adminTeachersView.hidden =
        true;

    adminDashboardView.hidden =
        false;
}


/* ==========================================================
   AFFICHAGE DE LA GESTION D'UN PROFESSEUR
========================================================== */

function showAdminTeacherView()
{
    adminDashboardView.hidden =
        true;

    adminTeachersView.hidden =
        false;
}


/* ==========================================================
   CRÉATION D'UNE LIGNE PROFESSEUR
========================================================== */

function createAdminTeacherRow(
    teacher
)
{
    const row =
        document.createElement(
            "tr"
        );


    const idCell =
        document.createElement(
            "td"
        );

    idCell.textContent =
        teacher.id;


    const nameCell =
        document.createElement(
            "td"
        );

    nameCell.textContent =
        teacher.nom;


    const firstNameCell =
        document.createElement(
            "td"
        );

    firstNameCell.textContent =
        teacher.prenom;


    const emailCell =
        document.createElement(
            "td"
        );

    emailCell.textContent =
        teacher.email;


    const studentCountCell =
        document.createElement(
            "td"
        );

    studentCountCell.textContent =
        teacher.nombre_eleves;


    const actionCell =
        document.createElement(
            "td"
        );


    const manageButton =
        document.createElement(
            "button"
        );

    manageButton.type =
        "button";

    manageButton.className =
        "admin-button";

    manageButton.textContent =
        "[ GERER ]";

    manageButton.dataset.teacherId =
        teacher.id;


    manageButton.addEventListener(
        "click",
        () =>
        {
            loadAdminTeacher(
                teacher.id
            );
        }
    );


    actionCell.appendChild(
        manageButton
    );


    row.appendChild(
        idCell
    );

    row.appendChild(
        nameCell
    );

    row.appendChild(
        firstNameCell
    );

    row.appendChild(
        emailCell
    );

    row.appendChild(
        studentCountCell
    );

    row.appendChild(
        actionCell
    );


    return row;
}


/* ==========================================================
   AFFICHAGE DES PROFESSEURS
========================================================== */

function displayAdminTeachers(
    teachers
)
{
    adminTeacherTableBody.innerHTML =
        "";


    if (teachers.length === 0)
    {
        adminTeacherTableBody.innerHTML =
            `
                <tr>
                    <td colspan="6">
                        &gt; AUCUN PROFESSEUR ENREGISTRE
                    </td>
                </tr>
            `;

        return;
    }


    for (
        const teacher of teachers
    )
    {
        const row =
            createAdminTeacherRow(
                teacher
            );


        adminTeacherTableBody.appendChild(
            row
        );
    }
}


/* ==========================================================
   CRÉATION D'UNE LIGNE ÉLÈVE
========================================================== */

function createAdminTeacherStudentRow(
    student
)
{
    const row =
        document.createElement(
            "tr"
        );


    const idCell =
        document.createElement(
            "td"
        );

    idCell.textContent =
        student.id;


    const nameCell =
        document.createElement(
            "td"
        );

    nameCell.textContent =
        student.nom;


    const firstNameCell =
        document.createElement(
            "td"
        );

    firstNameCell.textContent =
        student.prenom;


    const emailCell =
        document.createElement(
            "td"
        );

    emailCell.textContent =
        student.email;


    const actionCell =
        document.createElement(
            "td"
        );


    const transferButton =
        document.createElement(
            "button"
        );

    transferButton.type =
        "button";

    transferButton.className =
        "admin-button";

    transferButton.textContent =
        "[ TRANSFERER ]";

    transferButton.dataset.studentId =
        student.id;


    actionCell.appendChild(
        transferButton
    );


    row.appendChild(
        idCell
    );

    row.appendChild(
        nameCell
    );

    row.appendChild(
        firstNameCell
    );

    row.appendChild(
        emailCell
    );

    row.appendChild(
        actionCell
    );


    return row;
}


/* ==========================================================
   AFFICHAGE DES ÉLÈVES DU PROFESSEUR
========================================================== */

function displayAdminTeacherStudents(
    students
)
{
    adminTeacherStudentTableBody.innerHTML =
        "";


    if (students.length === 0)
    {
        adminTeacherStudentTableBody.innerHTML =
            `
                <tr>
                    <td colspan="5">
                        &gt; AUCUN ELEVE RATTACHE
                    </td>
                </tr>
            `;

        return;
    }


    for (
        const student of students
    )
    {
        const row =
            createAdminTeacherStudentRow(
                student
            );


        adminTeacherStudentTableBody.appendChild(
            row
        );
    }
}


/* ==========================================================
   CALCUL DU NOMBRE TOTAL D'ÉLÈVES
========================================================== */

function getAdminStudentTotal(
    teachers
)
{
    let total =
        0;


    for (
        const teacher of teachers
    )
    {
        total +=
            Number(
                teacher.nombre_eleves
            ) || 0;
    }


    return total;
}


/* ==========================================================
   CHARGEMENT D'UN PROFESSEUR
========================================================== */

async function loadAdminTeacher(
    teacherId
)
{
    const teacher =
        adminTeachers.find(
            (item) =>
                Number(item.id) ===
                Number(teacherId)
        );


    if (!teacher)
    {
        return;
    }


    adminSelectedTeacherId.textContent =
        teacher.id;

    adminSelectedTeacherName.textContent =
        `${teacher.prenom} ${teacher.nom}`;

    adminSelectedTeacherEmail.textContent =
        teacher.email;

    adminSelectedTeacherStudentCount.textContent =
        teacher.nombre_eleves;


    showAdminTeacherView();

    showAdminTeacherStudentsLoading();


    try
    {
        const data =
            await getAdminTeacherStudents(
                teacher.id
            );


        const students =
            data.eleves || [];


        adminSelectedTeacherStudentCount.textContent =
            students.length;


        displayAdminTeacherStudents(
            students
        );
    }
    catch (error)
    {
        console.error(
            error
        );


        if (
            error.message ===
            "SERVER_UNAVAILABLE"
        )
        {
            showAdminTeacherStudentsError(
                "SERVEUR INDISPONIBLE"
            );

            return;
        }


        if (
            error.message ===
            "UNAUTHORIZED" ||
            error.message ===
            "FORBIDDEN"
        )
        {
            showAdminTeacherStudentsError(
                "ACCES REFUSE"
            );

            return;
        }


        if (
            error.message ===
            "TEACHER_NOT_FOUND"
        )
        {
            showAdminTeacherStudentsError(
                "PROFESSEUR INTROUVABLE"
            );

            return;
        }


        showAdminTeacherStudentsError(
            "IMPOSSIBLE DE CHARGER LES ELEVES"
        );
    }
}


/* ==========================================================
   RETOUR AU TABLEAU DE BORD
========================================================== */

adminTeacherBackButton.addEventListener(
    "click",
    () =>
    {
        showAdminDashboardView();
    }
);


/* ==========================================================
   CHARGEMENT DU TABLEAU DE BORD
========================================================== */

async function loadAdminDashboard()
{
    showAdminDashboardView();

    showAdminLoading();


    try
    {
        const data =
            await getAdminTeachers();


        adminTeachers =
            data.professeurs || [];


        adminTeacherCount.textContent =
            adminTeachers.length;


        adminStudentCount.textContent =
            getAdminStudentTotal(
                adminTeachers
            );


        displayAdminTeachers(
            adminTeachers
        );
    }
    catch (error)
    {
        console.error(
            error
        );


        adminTeacherCount.textContent =
            "-";

        adminStudentCount.textContent =
            "-";


        if (
            error.message ===
            "SERVER_UNAVAILABLE"
        )
        {
            showAdminError(
                "SERVEUR INDISPONIBLE"
            );

            return;
        }


        if (
            error.message ===
            "UNAUTHORIZED" ||
            error.message ===
            "FORBIDDEN"
        )
        {
            showAdminError(
                "ACCES REFUSE"
            );

            return;
        }


        showAdminError(
            "IMPOSSIBLE DE CHARGER LES DONNEES"
        );
    }
}