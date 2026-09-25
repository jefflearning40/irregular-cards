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


            logoutButton.hidden =
                false;


            closeLoginModal();


            /* ==============================================
               CONNEXION ÉLÈVE
            ============================================== */

            if (
                loginData.role ===
                "eleve"
            )
            {
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
                showTeacher();

                return;
            }


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
   DÉCONNEXION
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
   INITIALISATION
========================================================== */

openLoginModal();