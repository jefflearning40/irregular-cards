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

const teacherCreateStudentButton =
    document.getElementById(
        "teacher-create-student-button"
    );


/* ==========================================================
   MODALE CRÉATION ÉLÈVE
========================================================== */

const teacherStudentModal =
    document.getElementById(
        "teacher-student-modal"
    );

const teacherStudentModalClose =
    document.getElementById(
        "teacher-student-modal-close"
    );

const teacherStudentCancelButton =
    document.getElementById(
        "teacher-student-cancel-button"
    );

const teacherStudentForm =
    document.getElementById(
        "teacher-student-form"
    );

const teacherStudentMessage =
    document.getElementById(
        "teacher-student-message"
    );

const teacherStudentPassword =
    document.getElementById(
        "teacher-student-password"
    );

const teacherStudentPasswordToggle =
    document.getElementById(
        "teacher-student-password-toggle"
    );

const teacherStudentPasswordConfirm =
    document.getElementById(
        "teacher-student-password-confirm"
    );

const teacherStudentPasswordConfirmToggle =
    document.getElementById(
        "teacher-student-password-confirm-toggle"
    );


/* ==========================================================
   MODALE SUPPRESSION ÉLÈVE
========================================================== */

const teacherDeleteStudentModal =
    document.getElementById(
        "teacher-delete-student-modal"
    );

const teacherDeleteStudentModalClose =
    document.getElementById(
        "teacher-delete-student-modal-close"
    );

const teacherDeleteStudentName =
    document.getElementById(
        "teacher-delete-student-name"
    );

const teacherDeleteStudentMessage =
    document.getElementById(
        "teacher-delete-student-message"
    );

const teacherDeleteStudentCancelButton =
    document.getElementById(
        "teacher-delete-student-cancel-button"
    );

const teacherDeleteStudentConfirmButton =
    document.getElementById(
        "teacher-delete-student-confirm-button"
    );


/* ==========================================================
   ÉLÈVE EN ATTENTE DE SUPPRESSION
========================================================== */

let teacherStudentToDelete =
    null;


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
   RÉINITIALISATION DES MOTS DE PASSE
========================================================== */

function resetTeacherStudentPasswords()
{
    teacherStudentPassword.type =
        "password";


    teacherStudentPasswordConfirm.type =
        "password";


    teacherStudentPasswordToggle.setAttribute(
        "aria-label",
        "Afficher le mot de passe"
    );


    teacherStudentPasswordToggle.setAttribute(
        "title",
        "Afficher le mot de passe"
    );


    teacherStudentPasswordConfirmToggle.setAttribute(
        "aria-label",
        "Afficher la confirmation du mot de passe"
    );


    teacherStudentPasswordConfirmToggle.setAttribute(
        "title",
        "Afficher le mot de passe"
    );
}


/* ==========================================================
   AFFICHER / MASQUER LE MOT DE PASSE
========================================================== */

function toggleTeacherStudentPassword()
{
    const passwordIsHidden =
        teacherStudentPassword.type ===
        "password";


    teacherStudentPassword.type =
        passwordIsHidden
            ? "text"
            : "password";


    teacherStudentPasswordToggle.setAttribute(
        "aria-label",
        passwordIsHidden
            ? "Masquer le mot de passe"
            : "Afficher le mot de passe"
    );


    teacherStudentPasswordToggle.setAttribute(
        "title",
        passwordIsHidden
            ? "Masquer le mot de passe"
            : "Afficher le mot de passe"
    );
}


/* ==========================================================
   AFFICHER / MASQUER LA CONFIRMATION
========================================================== */

function toggleTeacherStudentPasswordConfirm()
{
    const passwordIsHidden =
        teacherStudentPasswordConfirm.type ===
        "password";


    teacherStudentPasswordConfirm.type =
        passwordIsHidden
            ? "text"
            : "password";


    teacherStudentPasswordConfirmToggle.setAttribute(
        "aria-label",
        passwordIsHidden
            ? "Masquer la confirmation du mot de passe"
            : "Afficher la confirmation du mot de passe"
    );


    teacherStudentPasswordConfirmToggle.setAttribute(
        "title",
        passwordIsHidden
            ? "Masquer le mot de passe"
            : "Afficher le mot de passe"
    );
}


/* ==========================================================
   OUVERTURE MODALE CRÉATION ÉLÈVE
========================================================== */

function openTeacherStudentModal()
{
    teacherStudentForm.reset();


    teacherStudentMessage.textContent =
        "";


    resetTeacherStudentPasswords();


    teacherStudentModal.classList.add(
        "teacher-student-modal--open"
    );


    teacherStudentModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE MODALE CRÉATION ÉLÈVE
========================================================== */

function closeTeacherStudentModal()
{
    teacherStudentModal.classList.remove(
        "teacher-student-modal--open"
    );


    teacherStudentModal.setAttribute(
        "aria-hidden",
        "true"
    );


    teacherStudentForm.reset();


    teacherStudentMessage.textContent =
        "";


    resetTeacherStudentPasswords();
}


/* ==========================================================
   OUVERTURE MODALE SUPPRESSION ÉLÈVE
========================================================== */

function openTeacherDeleteStudentModal(
    student
)
{
    teacherStudentToDelete =
        student;


    teacherDeleteStudentName.textContent =
        `${student.prenom} ${student.nom}`;


    teacherDeleteStudentMessage.textContent =
        "";


    teacherDeleteStudentConfirmButton.disabled =
        false;


    teacherDeleteStudentModal.classList.add(
        "teacher-delete-student-modal--open"
    );


    teacherDeleteStudentModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE MODALE SUPPRESSION ÉLÈVE
========================================================== */

function closeTeacherDeleteStudentModal()
{
    teacherDeleteStudentModal.classList.remove(
        "teacher-delete-student-modal--open"
    );


    teacherDeleteStudentModal.setAttribute(
        "aria-hidden",
        "true"
    );


    teacherDeleteStudentName.textContent =
        "";


    teacherDeleteStudentMessage.textContent =
        "";


    teacherDeleteStudentConfirmButton.disabled =
        false;


    teacherStudentToDelete =
        null;
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
       ACTIONS
    ====================================================== */

    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "teacher-student-actions";


    /* ======================================================
       BOUTON CONSULTER
    ====================================================== */

    const consultButton =
        document.createElement(
            "button"
        );


    consultButton.className =
        "teacher-student-button";


    consultButton.type =
        "button";


    consultButton.textContent =
        "Consulter";


    consultButton.dataset.studentId =
        student.id;


    consultButton.addEventListener(
        "click",
        async () =>
        {
            consultButton.disabled =
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
                consultButton.disabled =
                    false;
            }
        }
    );


    /* ======================================================
       BOUTON SUPPRIMER
    ====================================================== */

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.className =
        "teacher-student-delete-button";


    deleteButton.type =
        "button";


    deleteButton.textContent =
        "Supprimer";


    deleteButton.dataset.studentId =
        student.id;


    deleteButton.addEventListener(
        "click",
        () =>
        {
            openTeacherDeleteStudentModal(
                student
            );
        }
    );


    /* ======================================================
       AJOUT DES BOUTONS
    ====================================================== */

    actions.appendChild(
        consultButton
    );


    actions.appendChild(
        deleteButton
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
        actions
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


/* ==========================================================
   ÉVÉNEMENTS MODALE CRÉATION ÉLÈVE
========================================================== */

teacherCreateStudentButton.addEventListener(
    "click",
    openTeacherStudentModal
);


teacherStudentModalClose.addEventListener(
    "click",
    closeTeacherStudentModal
);


teacherStudentCancelButton.addEventListener(
    "click",
    closeTeacherStudentModal
);


teacherStudentPasswordToggle.addEventListener(
    "click",
    toggleTeacherStudentPassword
);


teacherStudentPasswordConfirmToggle.addEventListener(
    "click",
    toggleTeacherStudentPasswordConfirm
);


teacherStudentModal.addEventListener(
    "click",
    (event) =>
    {
        if (
            event.target ===
            teacherStudentModal
        )
        {
            closeTeacherStudentModal();
        }
    }
);


/* ==========================================================
   ÉVÉNEMENTS MODALE SUPPRESSION ÉLÈVE
========================================================== */

teacherDeleteStudentModalClose.addEventListener(
    "click",
    closeTeacherDeleteStudentModal
);


teacherDeleteStudentCancelButton.addEventListener(
    "click",
    closeTeacherDeleteStudentModal
);


teacherDeleteStudentModal.addEventListener(
    "click",
    (event) =>
    {
        if (
            event.target ===
            teacherDeleteStudentModal
        )
        {
            closeTeacherDeleteStudentModal();
        }
    }
);


/* ==========================================================
   CONFIRMATION DE LA SUPPRESSION
========================================================== */

teacherDeleteStudentConfirmButton.addEventListener(
    "click",
    async () =>
    {
        if (!teacherStudentToDelete)
        {
            return;
        }


        const studentId =
            teacherStudentToDelete.id;


        teacherDeleteStudentMessage.textContent =
            "";


        teacherDeleteStudentConfirmButton.disabled =
            true;


        try
        {
            await deleteTeacherStudent(
                studentId
            );


            closeTeacherDeleteStudentModal();


            await loadTeacherDashboard();
        }
        catch (error)
        {
            console.error(
                error
            );


            if (
                error.message ===
                "STUDENT_NOT_FOUND"
            )
            {
                teacherDeleteStudentMessage.textContent =
                    "Cet élève n'existe plus dans votre classe.";
            }
            else if (
                error.message ===
                "SERVER_UNAVAILABLE"
            )
            {
                teacherDeleteStudentMessage.textContent =
                    "Impossible de contacter le serveur.";
            }
            else
            {
                teacherDeleteStudentMessage.textContent =
                    "Impossible de supprimer cet élève.";
            }


            teacherDeleteStudentConfirmButton.disabled =
                false;
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
            event.key !==
            "Escape"
        )
        {
            return;
        }


        if (
            teacherDeleteStudentModal.classList.contains(
                "teacher-delete-student-modal--open"
            )
        )
        {
            closeTeacherDeleteStudentModal();

            return;
        }


        if (
            teacherStudentModal.classList.contains(
                "teacher-student-modal--open"
            )
        )
        {
            closeTeacherStudentModal();
        }
    }
);


/* ==========================================================
   CRÉATION D'UN ÉLÈVE
========================================================== */

teacherStudentForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();


        const nom =
            document.getElementById(
                "teacher-student-lastname"
            ).value.trim();

        const prenom =
            document.getElementById(
                "teacher-student-firstname"
            ).value.trim();

        const email =
            document.getElementById(
                "teacher-student-email"
            ).value.trim();

        const motDePasse =
            teacherStudentPassword.value;

        const confirmationMotDePasse =
            teacherStudentPasswordConfirm.value;


        teacherStudentMessage.textContent =
            "";


        /* ==================================================
           CHAMPS OBLIGATOIRES
        ================================================== */

        if (
            !nom ||
            !prenom ||
            !email ||
            !motDePasse ||
            !confirmationMotDePasse
        )
        {
            teacherStudentMessage.textContent =
                "Tous les champs sont obligatoires.";

            return;
        }


        /* ==================================================
           NOM
        ================================================== */

        if (
            nom.length < 2 ||
            nom.length > 50
        )
        {
            teacherStudentMessage.textContent =
                "Nom invalide : entre 2 et 50 caractères.";

            return;
        }


        const namePattern =
            /^[\p{L}\p{M}' -]+$/u;


        if (
            !namePattern.test(
                nom
            )
        )
        {
            teacherStudentMessage.textContent =
                "Nom invalide : lettres, espaces, apostrophes et tirets uniquement.";

            return;
        }


        /* ==================================================
           PRÉNOM
        ================================================== */

        if (
            prenom.length < 2 ||
            prenom.length > 50
        )
        {
            teacherStudentMessage.textContent =
                "Prénom invalide : entre 2 et 50 caractères.";

            return;
        }


        if (
            !namePattern.test(
                prenom
            )
        )
        {
            teacherStudentMessage.textContent =
                "Prénom invalide : lettres, espaces, apostrophes et tirets uniquement.";

            return;
        }


        /* ==================================================
           E-MAIL
        ================================================== */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            email.length > 254 ||
            !emailPattern.test(
                email
            )
        )
        {
            teacherStudentMessage.textContent =
                "Adresse e-mail invalide.";

            return;
        }


        /* ==================================================
           MOT DE PASSE
        ================================================== */

        if (
            motDePasse.length < 8 ||
            motDePasse.length > 72
        )
        {
            teacherStudentMessage.textContent =
                "Mot de passe incomplet : entre 8 et 72 caractères.";

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
            teacherStudentMessage.textContent =
                "Mot de passe incomplet : au moins une lettre et un chiffre.";

            return;
        }


        /* ==================================================
           CONFIRMATION DU MOT DE PASSE
        ================================================== */

        if (
            motDePasse !==
            confirmationMotDePasse
        )
        {
            teacherStudentMessage.textContent =
                "Les mots de passe ne correspondent pas.";

            return;
        }


        /* ==================================================
           ENVOI AU SERVEUR
        ================================================== */

        const submitButton =
            document.getElementById(
                "teacher-student-submit-button"
            );


        submitButton.disabled =
            true;


        try
        {
            await createTeacherStudent(
                nom,
                prenom,
                email,
                motDePasse
            );


            closeTeacherStudentModal();


            await loadTeacherDashboard();
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
                teacherStudentMessage.textContent =
                    "Impossible de contacter le serveur.";
            }
            else
            {
                teacherStudentMessage.textContent =
                    error.message;
            }
        }
        finally
        {
            submitButton.disabled =
                false;
        }
    }
);