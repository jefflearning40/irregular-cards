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


const adminTransferAllButton =
    document.getElementById(
        "admin-transfer-all-button"
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
   ÉLÉMENTS HTML — MODIFICATION PROFESSEUR
========================================================== */

const adminTeacherEditButton =
    document.getElementById(
        "admin-teacher-edit-button"
    );


const adminEditTeacherModal =
    document.getElementById(
        "admin-edit-teacher-modal"
    );


const adminEditTeacherCloseButton =
    document.getElementById(
        "admin-edit-teacher-close-button"
    );


const adminEditTeacherForm =
    document.getElementById(
        "admin-edit-teacher-form"
    );


const adminEditTeacherName =
    document.getElementById(
        "admin-edit-teacher-name"
    );


const adminEditTeacherFirstname =
    document.getElementById(
        "admin-edit-teacher-firstname"
    );


const adminEditTeacherEmail =
    document.getElementById(
        "admin-edit-teacher-email"
    );


const adminEditTeacherMessage =
    document.getElementById(
        "admin-edit-teacher-message"
    );


const adminEditTeacherCancelButton =
    document.getElementById(
        "admin-edit-teacher-cancel-button"
    );


const adminEditTeacherConfirmButton =
    document.getElementById(
        "admin-edit-teacher-confirm-button"
    );

/* ==========================================================
   ÉLÉMENTS HTML — LISTE GLOBALE DES ÉLÈVES
========================================================== */

const adminStudentTableBody =
    document.getElementById(
        "admin-student-table-body"
    );


/* ==========================================================
   ÉLÉMENTS HTML — GESTION D'UN ÉLÈVE
========================================================== */

const adminStudentsList =
    document.getElementById(
        "admin-students-list"
    );


const adminStudentManagement =
    document.getElementById(
        "admin-student-management"
    );


const adminStudentBackButton =
    document.getElementById(
        "admin-student-back-button"
    );


const adminSelectedStudentId =
    document.getElementById(
        "admin-selected-student-id"
    );


const adminSelectedStudentName =
    document.getElementById(
        "admin-selected-student-name"
    );


const adminSelectedStudentEmail =
    document.getElementById(
        "admin-selected-student-email"
    );


const adminSelectedStudentTeacher =
    document.getElementById(
        "admin-selected-student-teacher"
    );


const adminStudentTransferButton =
    document.getElementById(
        "admin-student-transfer-button"
    );


const adminStudentEditButton =
    document.getElementById(
        "admin-student-edit-button"
    );


const adminStudentPasswordButton =
    document.getElementById(
        "admin-student-password-button"
    );


const adminStudentDeleteButton =
    document.getElementById(
        "admin-student-delete-button"
    );


/* ==========================================================
   ÉLÉMENTS HTML — MODALE MODIFICATION ÉLÈVE
========================================================== */

const adminEditStudentModal =
    document.getElementById(
        "admin-edit-student-modal"
    );


const adminEditStudentCloseButton =
    document.getElementById(
        "admin-edit-student-close-button"
    );


const adminEditStudentForm =
    document.getElementById(
        "admin-edit-student-form"
    );


const adminEditStudentName =
    document.getElementById(
        "admin-edit-student-name"
    );


const adminEditStudentFirstname =
    document.getElementById(
        "admin-edit-student-firstname"
    );


const adminEditStudentEmail =
    document.getElementById(
        "admin-edit-student-email"
    );


const adminEditStudentMessage =
    document.getElementById(
        "admin-edit-student-message"
    );


const adminEditStudentCancelButton =
    document.getElementById(
        "admin-edit-student-cancel-button"
    );


const adminEditStudentConfirmButton =
    document.getElementById(
        "admin-edit-student-confirm-button"
    );


/* ==========================================================
   ÉLÉMENTS HTML — MODALE SUPPRESSION ÉLÈVE
========================================================== */

const adminDeleteStudentModal =
    document.getElementById(
        "admin-delete-student-modal"
    );


const adminDeleteStudentName =
    document.getElementById(
        "admin-delete-student-name"
    );


const adminDeleteStudentEmail =
    document.getElementById(
        "admin-delete-student-email"
    );


const adminDeleteStudentTeacher =
    document.getElementById(
        "admin-delete-student-teacher"
    );


const adminDeleteStudentMessage =
    document.getElementById(
        "admin-delete-student-message"
    );


const adminDeleteStudentCancelButton =
    document.getElementById(
        "admin-delete-student-cancel-button"
    );


const adminDeleteStudentConfirmButton =
    document.getElementById(
        "admin-delete-student-confirm-button"
    );


/* ==========================================================
   ÉLÉMENTS HTML — MODALE TRANSFERT
========================================================== */

const adminTransferModal =
    document.getElementById(
        "admin-transfer-modal"
    );


const adminTransferCloseButton =
    document.getElementById(
        "admin-transfer-close-button"
    );


const adminTransferCancelButton =
    document.getElementById(
        "admin-transfer-cancel-button"
    );


const adminTransferConfirmButton =
    document.getElementById(
        "admin-transfer-confirm-button"
    );


const adminTransferStudentName =
    document.getElementById(
        "admin-transfer-student-name"
    );


const adminTransferCurrentTeacher =
    document.getElementById(
        "admin-transfer-current-teacher"
    );


const adminTransferTeacherSelect =
    document.getElementById(
        "admin-transfer-teacher-select"
    );


const adminTransferMessage =
    document.getElementById(
        "admin-transfer-message"
    );


/* ==========================================================
   ÉLÉMENTS HTML — CRÉATION PROFESSEUR
========================================================== */

const adminCreateTeacherButton =
    document.getElementById(
        "admin-create-teacher-button"
    );


const adminCreateTeacherModal =
    document.getElementById(
        "admin-create-teacher-modal"
    );


const adminCreateTeacherCloseButton =
    document.getElementById(
        "admin-create-teacher-close-button"
    );


const adminCreateTeacherCancelButton =
    document.getElementById(
        "admin-create-teacher-cancel-button"
    );


const adminCreateTeacherForm =
    document.getElementById(
        "admin-create-teacher-form"
    );


const adminCreateTeacherMessage =
    document.getElementById(
        "admin-create-teacher-message"
    );


const adminCreateTeacherPassword =
    document.getElementById(
        "admin-create-teacher-password"
    );


const adminCreateTeacherPasswordConfirm =
    document.getElementById(
        "admin-create-teacher-password-confirm"
    );


const adminCreateTeacherShowPassword =
    document.getElementById(
        "admin-create-teacher-show-password"
    );


/* ==========================================================
   DONNÉES ADMINISTRATEUR
========================================================== */

let adminTeachers =
    [];

let adminCurrentTeacher =
    null;

let adminCurrentStudents =
    [];

let adminSelectedStudent =
    null;


let adminTransferStudent =
    null;


let adminTransferContext =
    "teacher";


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


    const adminTeachersList =
        document.getElementById(
            "admin-teachers-list"
        );

    const adminTeacherManagement =
        document.getElementById(
            "admin-teacher-management"
        );


    adminTeachersList.hidden =
        true;

    adminTeacherManagement.hidden =
        false;
}


/* ==========================================================
   ÉLÉMENTS DE LA MODALE DE SUPPRESSION PROFESSEUR
========================================================== */

const adminDeleteTeacherModal =
    document.getElementById(
        "admin-delete-teacher-modal"
    );

const adminDeleteTeacherEmail =
    document.getElementById(
        "admin-delete-teacher-email"
    );

const adminDeleteTeacherMessage =
    document.getElementById(
        "admin-delete-teacher-message"
    );

const adminDeleteTeacherCancelButton =
    document.getElementById(
        "admin-delete-teacher-cancel-button"
    );

const adminDeleteTeacherConfirmButton =
    document.getElementById(
        "admin-delete-teacher-confirm-button"
    );


let adminTeacherPendingDeletion =
    null;


/* ==========================================================
   OUVERTURE DE LA MODALE DE SUPPRESSION
========================================================== */

function openAdminDeleteTeacherModal(
    teacher
)
{
    if (
        !teacher ||
        Number(teacher.nombre_eleves) !== 0
    )
    {
        return;
    }


    adminTeacherPendingDeletion =
        teacher;


    adminDeleteTeacherEmail.textContent =
        teacher.email;


    adminDeleteTeacherMessage.textContent =
        "";

    adminDeleteTeacherMessage.classList.remove(
        "admin-transfer-message--error"
    );


    adminDeleteTeacherConfirmButton.disabled =
        false;

    adminDeleteTeacherCancelButton.disabled =
        false;


    adminDeleteTeacherModal.classList.add(
        "admin-transfer-modal--open"
    );

    adminDeleteTeacherModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE DE LA MODALE DE SUPPRESSION
========================================================== */

function closeAdminDeleteTeacherModal()
{
    adminDeleteTeacherModal.classList.remove(
        "admin-transfer-modal--open"
    );

    adminDeleteTeacherModal.setAttribute(
        "aria-hidden",
        "true"
    );


    adminDeleteTeacherEmail.textContent =
        "-";


    adminDeleteTeacherMessage.textContent =
        "";

    adminDeleteTeacherMessage.classList.remove(
        "admin-transfer-message--error"
    );


    adminDeleteTeacherConfirmButton.disabled =
        false;

    adminDeleteTeacherCancelButton.disabled =
        false;


    adminTeacherPendingDeletion =
        null;
}


/* ==========================================================
   MESSAGE D'ERREUR DE SUPPRESSION
========================================================== */

function showAdminDeleteTeacherError(
    message
)
{
    adminDeleteTeacherMessage.classList.add(
        "admin-transfer-message--error"
    );

    adminDeleteTeacherMessage.textContent =
        `> ERREUR : ${message}`;
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


    /* ======================================================
       SUPPRESSION AUTORISÉE UNIQUEMENT SANS ÉLÈVE
    ====================================================== */

    if (
        Number(teacher.nombre_eleves) === 0
    )
    {
        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.type =
            "button";

        deleteButton.className =
            "admin-button";

        deleteButton.textContent =
            "[ SUPPRIMER ]";

        deleteButton.dataset.teacherId =
            teacher.id;


        deleteButton.addEventListener(
            "click",
            () =>
            {
                openAdminDeleteTeacherModal(
                    teacher
                );
            }
        );


        actionCell.appendChild(
            deleteButton
        );
    }


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


    if (
        teachers.length === 0
    )
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
   ANNULATION DE LA SUPPRESSION
========================================================== */

adminDeleteTeacherCancelButton.addEventListener(
    "click",
    () =>
    {
        closeAdminDeleteTeacherModal();
    }
);


/* ==========================================================
   /* ==========================================================
   CONFIRMATION DE LA SUPPRESSION
========================================================== */

adminDeleteTeacherConfirmButton.addEventListener(
    "click",
    async () =>
    {
        if (
            !adminTeacherPendingDeletion
        )
        {
            return;
        }


        const teacherId =
            adminTeacherPendingDeletion.id;


        adminDeleteTeacherMessage.classList.remove(
            "admin-transfer-message--error"
        );

        adminDeleteTeacherMessage.textContent =
            "> SUPPRESSION EN COURS...";


        adminDeleteTeacherConfirmButton.disabled =
            true;

        adminDeleteTeacherCancelButton.disabled =
            true;


        try
        {
            await deleteAdminTeacher(
                teacherId
            );


            closeAdminDeleteTeacherModal();


            /* ==================================================
               ACTUALISATION DE LA LISTE DES PROFESSEURS
            ================================================== */

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


            adminDeleteTeacherConfirmButton.disabled =
                false;

            adminDeleteTeacherCancelButton.disabled =
                false;


            if (
                error.message ===
                "TEACHER_HAS_STUDENTS"
            )
            {
                showAdminDeleteTeacherError(
                    "CE PROFESSEUR POSSEDE ENCORE DES ELEVES"
                );

                return;
            }


            if (
                error.message ===
                "TEACHER_NOT_FOUND"
            )
            {
                showAdminDeleteTeacherError(
                    "PROFESSEUR INTROUVABLE"
                );

                return;
            }


            if (
                error.message ===
                "SERVER_UNAVAILABLE"
            )
            {
                showAdminDeleteTeacherError(
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
                showAdminDeleteTeacherError(
                    "ACCES REFUSE"
                );

                return;
            }


            showAdminDeleteTeacherError(
                "SUPPRESSION IMPOSSIBLE"
            );
        }
    }
);


/* ==========================================================
   FERMETURE PAR CLIC SUR LE FOND
========================================================== */

adminDeleteTeacherModal.addEventListener(
    "click",
    (event) =>
    {
        if (
            event.target ===
            adminDeleteTeacherModal
        )
        {
            closeAdminDeleteTeacherModal();
        }
    }
);

/*----------------------------------------------------------------------------------------------------------------------------------------------
/* ==========================================================
   OUVERTURE DE LA MODALE DE TRANSFERT
========================================================== */

function openAdminTransferModal(
    student,
    context = "teacher"
)
{
    let currentTeacher =
        null;


    if (
        context === "global"
    )
    {
        currentTeacher =
            adminTeachers.find(
                (teacher) =>
                    Number(teacher.id) ===
                    Number(student.professeur_id)
            );
    }
    else
    {
        currentTeacher =
            adminCurrentTeacher;
    }


    if (!currentTeacher)
    {
        return;
    }


    adminTransferStudent =
        student;


    adminTransferContext =
        context;


    adminTransferStudentName.textContent =
        `${student.prenom} ${student.nom}`;


    adminTransferCurrentTeacher.textContent =
        `${currentTeacher.prenom} ${currentTeacher.nom}`;


    adminTransferMessage.textContent =
        "";


    adminTransferTeacherSelect.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";


    defaultOption.textContent =
        "-- SELECTIONNER --";


    adminTransferTeacherSelect.appendChild(
        defaultOption
    );


    for (
        const teacher of adminTeachers
    )
    {
        if (
            Number(teacher.id) ===
            Number(currentTeacher.id)
        )
        {
            continue;
        }


        const option =
            document.createElement(
                "option"
            );


        option.value =
            teacher.id;


        option.textContent =
            `${teacher.prenom} ${teacher.nom}`;


        adminTransferTeacherSelect.appendChild(
            option
        );
    }


    adminTransferTeacherSelect.value =
        "";


    adminTransferConfirmButton.disabled =
        true;


    adminTransferModal.classList.add(
        "admin-transfer-modal--open"
    );


    adminTransferModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   OUVERTURE DE LA MODALE DE TRANSFERT GROUPÉ
========================================================== */

function openAdminTransferAllModal()
{
    if (
        !adminCurrentTeacher ||
        adminCurrentStudents.length === 0
    )
    {
        return;
    }


    adminTransferStudent =
    null;


adminTransferContext =
    "teacher";


    adminTransferStudentName.textContent =
        `TOUS LES ELEVES (${adminCurrentStudents.length})`;


    adminTransferCurrentTeacher.textContent =
        `${adminCurrentTeacher.prenom} ${adminCurrentTeacher.nom}`;


    adminTransferMessage.textContent =
        "";


    adminTransferTeacherSelect.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value =
        "";

    defaultOption.textContent =
        "-- SELECTIONNER --";


    adminTransferTeacherSelect.appendChild(
        defaultOption
    );


    for (
        const teacher of adminTeachers
    )
    {
        if (
            Number(teacher.id) ===
            Number(adminCurrentTeacher.id)
        )
        {
            continue;
        }


        const option =
            document.createElement(
                "option"
            );

        option.value =
            teacher.id;

        option.textContent =
            `${teacher.prenom} ${teacher.nom}`;


        adminTransferTeacherSelect.appendChild(
            option
        );
    }


    adminTransferTeacherSelect.value =
        "";


    adminTransferConfirmButton.disabled =
        true;


    adminTransferModal.classList.add(
        "admin-transfer-modal--open"
    );


    adminTransferModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE DE LA MODALE DE TRANSFERT
========================================================== */

function closeAdminTransferModal()
{
    adminTransferModal.classList.remove(
        "admin-transfer-modal--open"
    );


    adminTransferModal.setAttribute(
        "aria-hidden",
        "true"
    );


    adminTransferTeacherSelect.value =
        "";


    adminTransferMessage.textContent =
        "";


    adminTransferConfirmButton.disabled =
        true;


    adminTransferStudent =
        null;


    adminTransferContext =
        "teacher";
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


    transferButton.addEventListener(
        "click",
        () =>
        {
            openAdminTransferModal(
                student
            );
        }
    );


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
    adminTransferAllButton.disabled =
        students.length === 0;


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
   /* ==========================================================
   CRÉATION D'UNE LIGNE ÉLÈVE — LISTE GLOBALE
========================================================== */

function createAdminStudentRow(
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


    const teacherCell =
        document.createElement(
            "td"
        );

    teacherCell.textContent =
        `${student.professeur_prenom || ""} ${student.professeur_nom || ""}`.trim() ||
        "-";


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


    manageButton.dataset.studentId =
        student.id;


    manageButton.addEventListener(
        "click",
        () =>
        {
            showAdminStudentManagement(
                student
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
        teacherCell
    );

    row.appendChild(
        actionCell
    );


    return row;
}


/* ==========================================================
   OUVERTURE DE LA GESTION D'UN ÉLÈVE
========================================================== */

function showAdminStudentManagement(
    student
)
{
    adminSelectedStudent =
        student;


    adminSelectedStudentId.textContent =
        student.id;


    adminSelectedStudentName.textContent =
        `${student.prenom} ${student.nom}`;


    adminSelectedStudentEmail.textContent =
        student.email;


    adminSelectedStudentTeacher.textContent =
        `${student.professeur_prenom || ""} ${student.professeur_nom || ""}`.trim() ||
        "-";


    adminStudentsList.hidden =
        true;


    adminStudentManagement.hidden =
        false;
}
/* ==========================================================
   OUVERTURE DE LA MODALE MODIFICATION ÉLÈVE
========================================================== */

function openAdminEditStudentModal()
{
    if (
        !adminSelectedStudent
    )
    {
        return;
    }


    adminEditStudentName.value =
        adminSelectedStudent.nom;


    adminEditStudentFirstname.value =
        adminSelectedStudent.prenom;


    adminEditStudentEmail.value =
        adminSelectedStudent.email;


    adminEditStudentMessage.classList.remove(
        "admin-transfer-message--error"
    );


    adminEditStudentMessage.textContent =
        "";


    adminEditStudentModal.classList.add(
        "admin-transfer-modal--open"
    );


    adminEditStudentModal.setAttribute(
        "aria-hidden",
        "false"
    );
}
/* ==========================================================
   FERMETURE DE LA MODALE MODIFICATION ÉLÈVE
========================================================== */

function closeAdminEditStudentModal()
{
    adminEditStudentModal.classList.remove(
        "admin-transfer-modal--open"
    );


    adminEditStudentModal.setAttribute(
        "aria-hidden",
        "true"
    );


    adminEditStudentForm.reset();


    adminEditStudentMessage.classList.remove(
        "admin-transfer-message--error"
    );


    adminEditStudentMessage.textContent =
        "";
}

/* ==========================================================
   OUVERTURE DE LA MODALE SUPPRESSION ÉLÈVE
========================================================== */

function openAdminDeleteStudentModal()
{
    if (
        !adminSelectedStudent
    )
    {
        return;
    }


    adminDeleteStudentName.textContent =
        `${adminSelectedStudent.prenom} ${adminSelectedStudent.nom}`;


    adminDeleteStudentEmail.textContent =
        adminSelectedStudent.email;


    adminDeleteStudentTeacher.textContent =
        `${adminSelectedStudent.professeur_prenom || ""} ${adminSelectedStudent.professeur_nom || ""}`.trim() ||
        "-";


    adminDeleteStudentMessage.textContent =
        "";


    adminDeleteStudentConfirmButton.disabled =
        false;


    adminDeleteStudentModal.classList.add(
        "admin-transfer-modal--open"
    );


    adminDeleteStudentModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE DE LA MODALE SUPPRESSION ÉLÈVE
========================================================== */

function closeAdminDeleteStudentModal()
{
    adminDeleteStudentModal.classList.remove(
        "admin-transfer-modal--open"
    );


    adminDeleteStudentModal.setAttribute(
        "aria-hidden",
        "true"
    );


    adminDeleteStudentMessage.textContent =
        "";


    adminDeleteStudentConfirmButton.disabled =
        false;
}


/* ==========================================================
   RETOUR À LA LISTE GLOBALE DES ÉLÈVES
========================================================== */

/* ==========================================================
   TRANSFERT DEPUIS LA GESTION GLOBALE D'UN ÉLÈVE
========================================================== */

adminStudentTransferButton.addEventListener(
    "click",
    () =>
    {
        if (!adminSelectedStudent)
        {
            return;
        }


        openAdminTransferModal(
            adminSelectedStudent,
            "global"
        );
    }
);


/* ==========================================================
   OUVERTURE MODIFICATION D'UN ÉLÈVE
========================================================== */

adminStudentEditButton.addEventListener(
    "click",
    () =>
    {
        openAdminEditStudentModal();
    }
);


/* ==========================================================
   FERMETURE MODIFICATION D'UN ÉLÈVE — BOUTON X
========================================================== */

adminEditStudentCloseButton.addEventListener(
    "click",
    () =>
    {
        closeAdminEditStudentModal();
    }
);


/* ==========================================================
   FERMETURE MODIFICATION D'UN ÉLÈVE — ANNULER
========================================================== */

adminEditStudentCancelButton.addEventListener(
    "click",
    () =>
    {
        closeAdminEditStudentModal();
    }
);


/* ==========================================================
   ENREGISTREMENT MODIFICATION D'UN ÉLÈVE
========================================================== */

adminEditStudentForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();


        if (!adminSelectedStudent)
        {
            return;
        }


        const studentId =
            adminSelectedStudent.id;


        const nom =
            adminEditStudentName.value.trim();

        const prenom =
            adminEditStudentFirstname.value.trim();

        const email =
            adminEditStudentEmail.value
                .trim()
                .toLowerCase();


        adminEditStudentMessage.classList.remove(
            "admin-transfer-message--error"
        );


        adminEditStudentMessage.textContent =
            "> MODIFICATION EN COURS...";


        adminEditStudentConfirmButton.disabled =
            true;

        adminEditStudentCancelButton.disabled =
            true;

        adminEditStudentCloseButton.disabled =
            true;


        try
        {
            await updateAdminStudent(
                studentId,
                nom,
                prenom,
                email
            );


            const studentsData =
                await getAdminStudents();


            const students =
                studentsData.eleves || [];


            displayAdminStudents(
                students
            );


            const updatedStudent =
                students.find(
                    (student) =>
                        Number(student.id) ===
                        Number(studentId)
                );


            if (updatedStudent)
            {
                adminSelectedStudent =
                    updatedStudent;


                adminSelectedStudentId.textContent =
                    updatedStudent.id;


                adminSelectedStudentName.textContent =
                    `${updatedStudent.prenom} ${updatedStudent.nom}`;


                adminSelectedStudentEmail.textContent =
                    updatedStudent.email;


                adminSelectedStudentTeacher.textContent =
                    `${updatedStudent.professeur_prenom || ""} ${updatedStudent.professeur_nom || ""}`.trim() ||
                    "-";
            }


            adminEditStudentMessage.textContent =
                "> ÉLÈVE MODIFIÉ";


            setTimeout(
                () =>
                {
                    closeAdminEditStudentModal();
                },
                700
            );
        }
        catch (error)
        {
            console.error(
                error
            );


            adminEditStudentMessage.classList.add(
                "admin-transfer-message--error"
            );


            if (
                error.message ===
                "SERVER_UNAVAILABLE"
            )
            {
                adminEditStudentMessage.textContent =
                    "> ERREUR : SERVEUR INDISPONIBLE";
            }
            else if (
                error.message ===
                "UNAUTHORIZED" ||
                error.message ===
                "FORBIDDEN"
            )
            {
                adminEditStudentMessage.textContent =
                    "> ERREUR : ACCES REFUSE";
            }
            else if (
                error.message ===
                "STUDENT_NOT_FOUND"
            )
            {
                adminEditStudentMessage.textContent =
                    "> ERREUR : ELEVE INTROUVABLE";
            }
            else if (
                error.message ===
                "EMAIL_ALREADY_USED"
            )
            {
                adminEditStudentMessage.textContent =
                    "> ERREUR : CETTE ADRESSE E-MAIL EST DEJA UTILISEE";
            }
            else
            {
                adminEditStudentMessage.textContent =
                    `> ERREUR : ${error.message}`;
            }
        }
        finally
        {
            adminEditStudentConfirmButton.disabled =
                false;

            adminEditStudentCancelButton.disabled =
                false;

            adminEditStudentCloseButton.disabled =
                false;
        }
    }
);


/* ==========================================================
   OUVERTURE SUPPRESSION D'UN ÉLÈVE
========================================================== */

adminStudentDeleteButton.addEventListener(
    "click",
    () =>
    {
        openAdminDeleteStudentModal();
    }
);


/* ==========================================================
   ANNULATION SUPPRESSION D'UN ÉLÈVE
========================================================== */

adminDeleteStudentCancelButton.addEventListener(
    "click",
    () =>
    {
        closeAdminDeleteStudentModal();
    }
);


/* ==========================================================
   ARCHIVAGE ET SUPPRESSION D'UN ÉLÈVE
========================================================== */

adminDeleteStudentConfirmButton.addEventListener(
    "click",
    async () =>
    {
        if (
            !adminSelectedStudent
        )
        {
            return;
        }


        const studentId =
            adminSelectedStudent.id;


        adminDeleteStudentConfirmButton.disabled =
            true;


        adminDeleteStudentCancelButton.disabled =
            true;


        adminDeleteStudentMessage.textContent =
            "> ARCHIVAGE ET SUPPRESSION EN COURS...";


        try
        {
            const result =
                await deleteAdminStudent(
                    studentId
                );


            console.log(
                "Archive PDF :",
                result.archive_pdf
            );


            /* ==================================================
               ACTUALISATION DE LA LISTE DES ÉLÈVES
            ================================================== */

            const studentsData =
                await getAdminStudents();


            const students =
                studentsData.eleves || [];


            displayAdminStudents(
                students
            );


            /* ==================================================
               ACTUALISATION DE LA LISTE DES PROFESSEURS
            ================================================== */

            const teachersData =
                await getAdminTeachers();


            adminTeachers =
                teachersData.professeurs || [];


            adminTeacherCount.textContent =
                adminTeachers.length;


            adminStudentCount.textContent =
                getAdminStudentTotal(
                    adminTeachers
                );


            displayAdminTeachers(
                adminTeachers
            );


            /* ==================================================
               RETOUR À LA LISTE DES ÉLÈVES
            ================================================== */

            adminSelectedStudent =
                null;


            closeAdminDeleteStudentModal();


            adminStudentManagement.hidden =
                true;


            adminStudentsList.hidden =
                false;
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
                adminDeleteStudentMessage.textContent =
                    "> ERREUR : SERVEUR INDISPONIBLE";
            }
            else if (
                error.message ===
                "UNAUTHORIZED" ||
                error.message ===
                "FORBIDDEN"
            )
            {
                adminDeleteStudentMessage.textContent =
                    "> ERREUR : ACCES REFUSE";
            }
            else if (
                error.message ===
                "STUDENT_NOT_FOUND"
            )
            {
                adminDeleteStudentMessage.textContent =
                    "> ERREUR : ELEVE INTROUVABLE";
            }
            else
            {
                adminDeleteStudentMessage.textContent =
                    "> ERREUR : ARCHIVAGE OU SUPPRESSION IMPOSSIBLE";
            }
        }
        finally
        {
            adminDeleteStudentConfirmButton.disabled =
                false;


            adminDeleteStudentCancelButton.disabled =
                false;
        }
    }
);



adminStudentBackButton.addEventListener(
    "click",
    () =>
    {
        adminSelectedStudent =
            null;


        adminStudentManagement.hidden =
            true;


        adminStudentsList.hidden =
            false;
    }
);


/* ==========================================================
   AFFICHAGE DE LA LISTE GLOBALE DES ÉLÈVES
========================================================== */

function displayAdminStudents(
    students
)
{
    adminStudentTableBody.innerHTML =
        "";


    if (
        students.length === 0
    )
    {
        adminStudentTableBody.innerHTML =
            `
                <tr>
                    <td colspan="6">
                        &gt; AUCUN ELEVE ENREGISTRE
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
            createAdminStudentRow(
                student
            );


        adminStudentTableBody.appendChild(
            row
        );
    }
}


/* ==========================================================
   CHARGEMENT DE LA LISTE GLOBALE DES ÉLÈVES
========================================================== */

async function loadAdminStudents()
{
    adminStudentTableBody.innerHTML =
        `
            <tr>
                <td colspan="6">
                    &gt; CHARGEMENT DES ELEVES...
                </td>
            </tr>
        `;


    try
    {
        const data =
            await getAdminStudents();


        const students =
            data.eleves || [];


        displayAdminStudents(
            students
        );
    }
    catch (error)
    {
        console.error(
            error
        );


        let message =
            "IMPOSSIBLE DE CHARGER LES ELEVES";


        if (
            error.message ===
            "SERVER_UNAVAILABLE"
        )
        {
            message =
                "SERVEUR INDISPONIBLE";
        }


        if (
            error.message === "UNAUTHORIZED" ||
            error.message === "FORBIDDEN"
        )
        {
            message =
                "ACCES REFUSE";
        }


        adminStudentTableBody.innerHTML =
            `
                <tr>
                    <td colspan="6">
                        &gt; ERREUR : ${message}
                    </td>
                </tr>
            `;
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


    adminCurrentTeacher =
        teacher;


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


        adminCurrentStudents =
            data.eleves || [];


        adminSelectedTeacherStudentCount.textContent =
            adminCurrentStudents.length;


        displayAdminTeacherStudents(
            adminCurrentStudents
        );
    }
    catch (error)
    {
        console.error(
            error
        );


        adminCurrentStudents =
            [];


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
   OUVERTURE DE LA MODALE MODIFICATION PROFESSEUR
========================================================== */

function openAdminEditTeacherModal()
{
    if (!adminCurrentTeacher)
    {
        return;
    }


    adminEditTeacherName.value =
        adminCurrentTeacher.nom;

    adminEditTeacherFirstname.value =
        adminCurrentTeacher.prenom;

    adminEditTeacherEmail.value =
        adminCurrentTeacher.email;


    adminEditTeacherMessage.classList.remove(
        "admin-transfer-message--error"
    );

    adminEditTeacherMessage.textContent =
        "";


    adminEditTeacherModal.classList.add(
        "admin-transfer-modal--open"
    );

    adminEditTeacherModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE DE LA MODALE MODIFICATION PROFESSEUR
========================================================== */

function closeAdminEditTeacherModal()
{
    adminEditTeacherModal.classList.remove(
        "admin-transfer-modal--open"
    );

    adminEditTeacherModal.setAttribute(
        "aria-hidden",
        "true"
    );


    adminEditTeacherForm.reset();


    adminEditTeacherMessage.classList.remove(
        "admin-transfer-message--error"
    );

    adminEditTeacherMessage.textContent =
        "";
}


/* ==========================================================
   BOUTON MODIFIER PROFESSEUR
========================================================== */

adminTeacherEditButton.addEventListener(
    "click",
    () =>
    {
        openAdminEditTeacherModal();
    }
);


/* ==========================================================
   FERMETURE MODALE MODIFICATION PROFESSEUR
========================================================== */

adminEditTeacherCloseButton.addEventListener(
    "click",
    () =>
    {
        closeAdminEditTeacherModal();
    }
);


adminEditTeacherCancelButton.addEventListener(
    "click",
    () =>
    {
        closeAdminEditTeacherModal();
    }
);


/* ==========================================================
   ENREGISTREMENT MODIFICATION PROFESSEUR
========================================================== */

adminEditTeacherForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();


        if (!adminCurrentTeacher)
        {
            return;
        }


        const teacherId =
            adminCurrentTeacher.id;


        const nom =
            adminEditTeacherName.value.trim();

        const prenom =
            adminEditTeacherFirstname.value.trim();

        const email =
            adminEditTeacherEmail.value
                .trim()
                .toLowerCase();


        adminEditTeacherMessage.classList.remove(
            "admin-transfer-message--error"
        );

        adminEditTeacherMessage.textContent =
            "> MODIFICATION EN COURS...";


        adminEditTeacherConfirmButton.disabled =
            true;

        adminEditTeacherCancelButton.disabled =
            true;

        adminEditTeacherCloseButton.disabled =
            true;


        try
        {
            await updateAdminTeacher(
                teacherId,
                nom,
                prenom,
                email
            );


            const teachersData =
                await getAdminTeachers();


            adminTeachers =
                teachersData.professeurs || [];


            displayAdminTeachers(
                adminTeachers
            );


            const updatedTeacher =
                adminTeachers.find(
                    (teacher) =>
                        Number(teacher.id) ===
                        Number(teacherId)
                );


            if (updatedTeacher)
            {
                adminCurrentTeacher =
                    updatedTeacher;


                adminSelectedTeacherId.textContent =
                    updatedTeacher.id;

                adminSelectedTeacherName.textContent =
                    `${updatedTeacher.prenom} ${updatedTeacher.nom}`;

                adminSelectedTeacherEmail.textContent =
                    updatedTeacher.email;


                const studentsData =
                    await getAdminTeacherStudents(
                        updatedTeacher.id
                    );


                adminCurrentStudents =
                    studentsData.eleves || [];


                adminSelectedTeacherStudentCount.textContent =
                    adminCurrentStudents.length;


                displayAdminTeacherStudents(
                    adminCurrentStudents
                );
            }


            adminEditTeacherMessage.textContent =
                "> PROFESSEUR MODIFIÉ";


            setTimeout(
                () =>
                {
                    closeAdminEditTeacherModal();
                },
                700
            );
        }
        catch (error)
        {
            console.error(
                error
            );


            adminEditTeacherMessage.classList.add(
                "admin-transfer-message--error"
            );


            if (
                error.message ===
                "SERVER_UNAVAILABLE"
            )
            {
                adminEditTeacherMessage.textContent =
                    "> ERREUR : SERVEUR INDISPONIBLE";
            }
            else if (
                error.message ===
                "UNAUTHORIZED" ||
                error.message ===
                "FORBIDDEN"
            )
            {
                adminEditTeacherMessage.textContent =
                    "> ERREUR : ACCES REFUSE";
            }
            else if (
                error.message ===
                "TEACHER_NOT_FOUND"
            )
            {
                adminEditTeacherMessage.textContent =
                    "> ERREUR : PROFESSEUR INTROUVABLE";
            }
            else if (
                error.message ===
                "EMAIL_ALREADY_USED"
            )
            {
                adminEditTeacherMessage.textContent =
                    "> ERREUR : CETTE ADRESSE E-MAIL EST DEJA UTILISEE";
            }
            else
            {
                adminEditTeacherMessage.textContent =
                    `> ERREUR : ${error.message}`;
            }
        }
        finally
        {
            adminEditTeacherConfirmButton.disabled =
                false;

            adminEditTeacherCancelButton.disabled =
                false;

            adminEditTeacherCloseButton.disabled =
                false;
        }
    }
);


/* ==========================================================
   OUVERTURE DE LA MODALE CRÉER PROFESSEUR
========================================================== */

function openAdminCreateTeacherModal()
{
    adminCreateTeacherForm.reset();

    adminCreateTeacherMessage.classList.remove(
        "admin-transfer-message--error"
    );

    adminCreateTeacherMessage.textContent =
        "";

    adminCreateTeacherPassword.type =
        "password";

    adminCreateTeacherPasswordConfirm.type =
        "password";


    adminCreateTeacherModal.classList.add(
        "admin-transfer-modal--open"
    );

    adminCreateTeacherModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE DE LA MODALE CRÉER PROFESSEUR
========================================================== */

function closeAdminCreateTeacherModal()
{
    adminCreateTeacherModal.classList.remove(
        "admin-transfer-modal--open"
    );

    adminCreateTeacherModal.setAttribute(
        "aria-hidden",
        "true"
    );

    adminCreateTeacherForm.reset();

    adminCreateTeacherMessage.classList.remove(
        "admin-transfer-message--error"
    );

    adminCreateTeacherMessage.textContent =
        "";

    adminCreateTeacherPassword.type =
        "password";

    adminCreateTeacherPasswordConfirm.type =
        "password";
}


/* ==========================================================
   BOUTON CRÉER PROFESSEUR
========================================================== */

adminCreateTeacherButton.addEventListener(
    "click",
    () =>
    {
        openAdminCreateTeacherModal();
    }
);


/* ==========================================================
   FERMETURE — BOUTON X
========================================================== */

adminCreateTeacherCloseButton.addEventListener(
    "click",
    () =>
    {
        closeAdminCreateTeacherModal();
    }
);


/* ==========================================================
   FERMETURE — BOUTON ANNULER - CREATE TEACHER
========================================================== */

adminCreateTeacherCancelButton.addEventListener(
    "click",
    () =>
    {
        closeAdminCreateTeacherModal();
    }
);


/* ==========================================================
   AFFICHAGE / MASQUAGE DES MOTS DE PASSE
========================================================== */

adminCreateTeacherShowPassword.addEventListener(
    "change",
    () =>
    {
        const inputType =
            adminCreateTeacherShowPassword.checked
                ? "text"
                : "password";


        adminCreateTeacherPassword.type =
            inputType;

        adminCreateTeacherPasswordConfirm.type =
            inputType;
    }
);


/* ==========================================================
   CRÉATION D'UN PROFESSEUR
========================================================== */

adminCreateTeacherForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();


        const nom =
            document
                .getElementById(
                    "admin-create-teacher-name"
                )
                .value
                .trim();


        const prenom =
            document
                .getElementById(
                    "admin-create-teacher-firstname"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "admin-create-teacher-email"
                )
                .value
                .trim();


        const motDePasse =
            adminCreateTeacherPassword.value;


        const confirmationMotDePasse =
            adminCreateTeacherPasswordConfirm.value;


        /* ==================================================
           VÉRIFICATION DES CHAMPS OBLIGATOIRES
        ================================================== */

        if (
            !nom ||
            !prenom ||
            !email ||
            !motDePasse ||
            !confirmationMotDePasse
        )
        {
            adminCreateTeacherMessage.classList.add(
                "admin-transfer-message--error"
            );

            adminCreateTeacherMessage.textContent =
                "> ERREUR : TOUS LES CHAMPS SONT OBLIGATOIRES";

            return;
        }


        /* ==================================================
           VÉRIFICATION DE L'ADRESSE E-MAIL
        ================================================== */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailPattern.test(
                email
            )
        )
        {
            adminCreateTeacherMessage.classList.add(
                "admin-transfer-message--error"
            );

            adminCreateTeacherMessage.textContent =
                "> ERREUR : ADRESSE E-MAIL INVALIDE";

            return;
        }


        /* ==================================================
           VÉRIFICATION DES MOTS DE PASSE
        ================================================== */

        if (
            motDePasse.length < 8 ||
            motDePasse.length > 72
        )
        {
            adminCreateTeacherMessage.classList.add(
                "admin-transfer-message--error"
            );

            adminCreateTeacherMessage.textContent =
                "> ERREUR : LE MOT DE PASSE DOIT CONTENIR ENTRE 8 ET 72 CARACTERES";

            return;
        }


        const passwordHasLetter =
            /\p{L}/u.test(
                motDePasse
            );

        const passwordHasNumber =
            /\d/.test(
                motDePasse
            );


        if (
            !passwordHasLetter ||
            !passwordHasNumber
        )
        {
            adminCreateTeacherMessage.classList.add(
                "admin-transfer-message--error"
            );

            adminCreateTeacherMessage.textContent =
                "> ERREUR : LE MOT DE PASSE DOIT CONTENIR AU MOINS UNE LETTRE ET UN CHIFFRE";

            return;
        }


        if (
            motDePasse !==
            confirmationMotDePasse
        )
        {
            adminCreateTeacherMessage.classList.add(
                "admin-transfer-message--error"
            );

            adminCreateTeacherMessage.textContent =
                "> ERREUR : LES MOTS DE PASSE SONT DIFFERENTS";

            return;
        }


        adminCreateTeacherMessage.classList.remove(
            "admin-transfer-message--error"
        );


        adminCreateTeacherMessage.textContent =
            "> CREATION EN COURS...";


        try
        {
            await createAdminTeacher(
                nom,
                prenom,
                email,
                motDePasse
            );


            adminCreateTeacherMessage.classList.remove(
                "admin-transfer-message--error"
            );


            adminCreateTeacherMessage.textContent =
                "> PROFESSEUR CREE";


            await loadAdminDashboard();


            setTimeout(
                () =>
                {
                    closeAdminCreateTeacherModal();
                },
                700
            );
        }
        catch (error)
        {
            adminCreateTeacherMessage.classList.add(
                "admin-transfer-message--error"
            );

            adminCreateTeacherMessage.textContent =
                `> ERREUR : ${error.message}`;
        }
    }
);


/* ==========================================================
   OUVERTURE DU TRANSFERT GROUPÉ
========================================================== */

adminTransferAllButton.addEventListener(
    "click",
    () =>
    {
        openAdminTransferAllModal();
    }
);
/* ==========================================================
   CHOIX DU PROFESSEUR DE DESTINATION
========================================================== */

adminTransferTeacherSelect.addEventListener(
    "change",
    () =>
    {
        adminTransferConfirmButton.disabled =
            adminTransferTeacherSelect.value === "";
    }
);


/* ==========================================================
   FERMETURE — BOUTON X
========================================================== */

adminTransferCloseButton.addEventListener(
    "click",
    () =>
    {
        closeAdminTransferModal();
    }
);


/* ==========================================================
   FERMETURE — BOUTON ANNULER - TRANSFER
========================================================== */

adminTransferCancelButton.addEventListener(
    "click",
    () =>
    {
        closeAdminTransferModal();
    }
);


/* ==========================================================
   TRANSFERT DE L'ÉLÈVE / DE LA CLASSE
========================================================== */

adminTransferConfirmButton.addEventListener(
    "click",
    async () =>
    {
        if (
            adminTransferTeacherSelect.value === ""
        )
        {
            return;
        }


        const newTeacherId =
            Number(
                adminTransferTeacherSelect.value
            );


        const destinationTeacher =
            adminTeachers.find(
                (teacher) =>
                    Number(teacher.id) ===
                    newTeacherId
            );


        if (!destinationTeacher)
        {
            return;
        }


        let currentTeacherId =
            null;


        if (
            adminTransferContext === "global"
        )
        {
            if (!adminTransferStudent)
            {
                return;
            }


            currentTeacherId =
                Number(
                    adminTransferStudent.professeur_id
                );
        }
        else
        {
            if (!adminCurrentTeacher)
            {
                return;
            }


            currentTeacherId =
                Number(
                    adminCurrentTeacher.id
                );
        }


        adminTransferConfirmButton.disabled =
            true;

        adminTransferTeacherSelect.disabled =
            true;

        adminTransferCloseButton.disabled =
            true;

        adminTransferCancelButton.disabled =
            true;


        adminTransferMessage.textContent =
            "> TRANSFERT EN COURS...";


        try
        {
            /* ==============================================
               TRANSFERT INDIVIDUEL
            ============================================== */

            if (adminTransferStudent)
            {
                await transferAdminStudent(
                    adminTransferStudent.id,
                    newTeacherId
                );
            }


            /* ==============================================
               TRANSFERT DE TOUS LES ÉLÈVES
            ============================================== */

            else
            {
                await transferAdminClass(
                    currentTeacherId,
                    newTeacherId
                );
            }


            adminTransferMessage.textContent =
                "> TRANSFERT EFFECTUE";


            /* ==============================================
               RECHARGEMENT DES PROFESSEURS
            ============================================== */

            const teachersData =
                await getAdminTeachers();


            adminTeachers =
                teachersData.professeurs || [];


            adminTeacherCount.textContent =
                adminTeachers.length;


            adminStudentCount.textContent =
                getAdminStudentTotal(
                    adminTeachers
                );


            displayAdminTeachers(
                adminTeachers
            );


            /* ==============================================
               TRANSFERT DEPUIS LA GESTION GLOBALE
            ============================================== */

            if (
                adminTransferContext === "global" &&
                adminTransferStudent
            )
            {
                const transferredStudentId =
                    Number(
                        adminTransferStudent.id
                    );


                const studentsData =
                    await getAdminStudents();


                const students =
                    studentsData.eleves || [];


                displayAdminStudents(
                    students
                );


                const updatedStudent =
                    students.find(
                        (student) =>
                            Number(student.id) ===
                            transferredStudentId
                    );


                if (updatedStudent)
                {
                    adminSelectedStudent =
                        updatedStudent;


                    adminSelectedStudentId.textContent =
                        updatedStudent.id;


                    adminSelectedStudentName.textContent =
                        `${updatedStudent.prenom} ${updatedStudent.nom}`;


                    adminSelectedStudentEmail.textContent =
                        updatedStudent.email;


                    adminSelectedStudentTeacher.textContent =
                        `${updatedStudent.professeur_prenom || ""} ${updatedStudent.professeur_nom || ""}`.trim() ||
                        "-";
                }


                closeAdminTransferModal();

                return;
            }


            /* ==============================================
               RECHARGEMENT DU PROFESSEUR ACTUEL
            ============================================== */

            const updatedCurrentTeacher =
                adminTeachers.find(
                    (teacher) =>
                        Number(teacher.id) ===
                        Number(currentTeacherId)
                );


            if (updatedCurrentTeacher)
            {
                adminCurrentTeacher =
                    updatedCurrentTeacher;


                const studentsData =
                    await getAdminTeacherStudents(
                        currentTeacherId
                    );


                adminCurrentStudents =
                    studentsData.eleves || [];


                adminSelectedTeacherStudentCount.textContent =
                    adminCurrentStudents.length;


                displayAdminTeacherStudents(
                    adminCurrentStudents
                );
            }


            /* ==============================================
               FERMETURE DE LA MODALE
            ============================================== */

            closeAdminTransferModal();
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
                adminTransferMessage.textContent =
                    "> ERREUR : SERVEUR INDISPONIBLE";
            }
            else if (
                error.message ===
                "UNAUTHORIZED" ||
                error.message ===
                "FORBIDDEN"
            )
            {
                adminTransferMessage.textContent =
                    "> ERREUR : ACCES REFUSE";
            }
            else if (
                error.message ===
                "STUDENT_NOT_FOUND"
            )
            {
                adminTransferMessage.textContent =
                    "> ERREUR : ELEVE INTROUVABLE";
            }
            else if (
                error.message ===
                "TEACHER_NOT_FOUND"
            )
            {
                adminTransferMessage.textContent =
                    "> ERREUR : PROFESSEUR INTROUVABLE";
            }
            else
            {
                adminTransferMessage.textContent =
                    "> ERREUR : TRANSFERT IMPOSSIBLE";
            }
        }
        finally
        {
            adminTransferTeacherSelect.disabled =
                false;

            adminTransferCloseButton.disabled =
                false;

            adminTransferCancelButton.disabled =
                false;


            adminTransferConfirmButton.disabled =
                adminTransferTeacherSelect.value === "";
        }
    }
);


/* ==========================================================
   RETOUR À LA LISTE DES PROFESSEURS
========================================================== */

adminTeacherBackButton.addEventListener(
    "click",
    () =>
    {
        adminCurrentTeacher =
            null;

        adminCurrentStudents =
            [];


        const adminTeachersList =
            document.getElementById(
                "admin-teachers-list"
            );

        const adminTeacherManagement =
            document.getElementById(
                "admin-teacher-management"
            );


        adminTeacherManagement.hidden =
            true;

        adminTeachersList.hidden =
            false;
    }
);


/* ==========================================================
   CHARGEMENT DU TABLEAU DE BORD
========================================================== */

async function loadAdminDashboard()
{
    showAdminDashboardView();


    showAdminLoading();


    adminCurrentTeacher =
        null;

    adminCurrentStudents =
        [];


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


/* ==========================================================
   NAVIGATION DU MENU ADMINISTRATEUR
========================================================== */

const adminMenuButtons =
    document.querySelectorAll(
        ".admin-menu__button"
    );

const adminViews =
    document.querySelectorAll(
        ".admin-view"
    );


adminMenuButtons.forEach(
    (button) =>
    {
        button.addEventListener(
            "click",
            () =>
            {
                const target =
                    button.dataset.adminView;


                /* ==========================================
                   BOUTON ACTIF
                ========================================== */

                adminMenuButtons.forEach(
                    (menuButton) =>
                    {
                        menuButton.classList.remove(
                            "admin-menu__button--active"
                        );
                    }
                );


                button.classList.add(
                    "admin-menu__button--active"
                );


                /* ==========================================
                   TABLEAU DE BORD
                ========================================== */

                if (
                    target === "dashboard"
                )
                {
                    loadAdminDashboard();

                    return;
                }


                /* ==========================================
                   PROFESSEURS
                ========================================== */

                if (
                    target === "professeurs"
                )
                {
                    adminViews.forEach(
                        (view) =>
                        {
                            view.hidden =
                                view.dataset.adminSection !==
                                "professeurs";
                        }
                    );


                    const adminTeachersList =
                        document.getElementById(
                            "admin-teachers-list"
                        );

                    const adminTeacherManagement =
                        document.getElementById(
                            "admin-teacher-management"
                        );


                    adminTeachersList.hidden =
                        false;

                    adminTeacherManagement.hidden =
                        true;


                    adminCurrentTeacher =
                        null;

                    adminCurrentStudents =
                        [];


                    return;
                }


/* ==========================================
   ELEVES / CONTACTS
========================================== */

                if (
                    target === "eleves"
                )
                {
                    adminViews.forEach(
                        (view) =>
                        {
                            view.hidden =
                                view.dataset.adminSection !==
                                "eleves";
                        }
                    );


                    loadAdminStudents();


                    return;
                }


                adminViews.forEach(
                    (view) =>
                    {
                        view.hidden =
                            view.dataset.adminSection !==
                            target;
                    }
                );
            }
        );
    }
);


/* ==========================================================
   THÈME DE LA CONSOLE ADMINISTRATEUR
========================================================== */

const adminThemeSwitch =
    document.getElementById(
        "admin-theme-switch"
    );


/* ==========================================================
   BASCULE VERT / AMBRE
========================================================== */

adminThemeSwitch.addEventListener(
    "click",
    () =>
    {
        const adminScreen =
            adminThemeSwitch.closest(
                ".admin-screen"
            );


        const amberEnabled =
            adminScreen.classList.toggle(
                "admin-screen--amber"
            );


        adminThemeSwitch.setAttribute(
            "aria-checked",
            amberEnabled
                ? "true"
                : "false"
        );
    }
);