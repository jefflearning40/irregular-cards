"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const loginModal =
    document.getElementById(
        "login-modal"
    );

const loginForm =
    document.getElementById(
        "login-form"
    );

const loginEmail =
    document.getElementById(
        "login-email"
    );

const loginPassword =
    document.getElementById(
        "login-password"
    );

const loginButton =
    document.getElementById(
        "login-button"
    );

const loginError =
    document.getElementById(
        "login-error"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

const adminScreen =
    document.getElementById(
        "admin-screen"
    );

const adminLogoutButton =
    document.getElementById(
        "admin-logout-button"
    );


/* ==========================================================
   OUVERTURE DE LA MODALE
========================================================== */

function openLoginModal()
{
    loginModal.classList.add(
        "login-modal--open"
    );

    loginModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE DE LA MODALE
========================================================== */

function closeLoginModal()
{
    loginModal.classList.remove(
        "login-modal--open"
    );

    loginModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* ==========================================================
   AFFICHAGE ADMINISTRATEUR
========================================================== */

function showAdmin()
{
    adminScreen.hidden =
        false;

    logoutButton.hidden =
        true;
}


/* ==========================================================
   MASQUAGE ADMINISTRATEUR
========================================================== */

function hideAdmin()
{
    adminScreen.hidden =
        true;
}


/* ==========================================================
   CONNEXION
========================================================== */

loginForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();


        loginError.textContent =
            "";


        loginButton.disabled =
            true;


        try
        {
            const loginData =
                await loginUser(
                    loginEmail.value.trim(),
                    loginPassword.value
                );


            closeLoginModal();


            /* ==============================================
               CONNEXION ÉLÈVE
            ============================================== */

            if (
                loginData.role ===
                "eleve"
            )
            {
                hideAdmin();

                logoutButton.hidden =
                    false;

                showDeparture();

                return;
            }


            /* ==============================================
               CONNEXION PROFESSEUR
            ============================================== */

            if (
                loginData.role ===
                "professeur"
            )
            {
                hideAdmin();

                logoutButton.hidden =
                    false;

                showTeacher();

                return;
            }


            /* ==============================================
               CONNEXION ADMINISTRATEUR
            ============================================== */

            if (
                loginData.role ===
                "administrateur"
            )
            {
                showAdmin();

                await loadAdminDashboard();

                return;
            }


            /* ==============================================
               RÔLE INCONNU
            ============================================== */

            throw new Error(
                "UNKNOWN_ROLE"
            );
        }
        catch (error)
        {
            console.error(
                error
            );


            if (
                error.message ===
                "INVALID_CREDENTIALS"
            )
            {
                loginError.textContent =
                    "E-mail ou mot de passe incorrect.";
            }
            else if (
                error.message ===
                "SERVER_UNAVAILABLE"
            )
            {
                loginError.textContent =
                    "Impossible de contacter le serveur.";
            }
            else
            {
                loginError.textContent =
                    "Une erreur est survenue lors de la connexion.";
            }
        }
        finally
        {
            loginButton.disabled =
                false;
        }
    }
);


/* ==========================================================
   DÉCONNEXION ÉLÈVE / PROFESSEUR
========================================================== */

logoutButton.addEventListener(
    "click",
    () =>
    {
        logoutUser();


        if (
            typeof resetQuizGame ===
            "function"
        )
        {
            resetQuizGame();
        }


        hideAdmin();


        showDeparture();


        logoutButton.hidden =
            true;


        loginForm.reset();


        loginError.textContent =
            "";


        openLoginModal();
    }
);


/* ==========================================================
   DÉCONNEXION ADMINISTRATEUR
========================================================== */

adminLogoutButton.addEventListener(
    "click",
    () =>
    {
        logoutUser();


        hideAdmin();


        loginForm.reset();


        loginError.textContent =
            "";


        openLoginModal();
    }
);


/* ==========================================================
   INITIALISATION
========================================================== */

hideAdmin();

openLoginModal();