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

    const loginForgotPassword =
    document.getElementById(
        "login-forgot-password"
    );

const forgotPasswordModal =
    document.getElementById(
        "forgot-password-modal"
    );

const forgotPasswordForm =
    document.getElementById(
        "forgot-password-form"
    );

const forgotPasswordEmail =
    document.getElementById(
        "forgot-password-email"
    );

const forgotPasswordMessage =
    document.getElementById(
        "forgot-password-message"
    );

const forgotPasswordSubmit =
    document.getElementById(
        "forgot-password-submit"
    );

const forgotPasswordBack =
    document.getElementById(
        "forgot-password-back"
    );

    const resetPasswordModal =
    document.getElementById(
        "reset-password-modal"
    );

const resetPasswordForm =
    document.getElementById(
        "reset-password-form"
    );

const resetPassword =
    document.getElementById(
        "reset-password"
    );

const resetPasswordConfirm =
    document.getElementById(
        "reset-password-confirm"
    );

const resetPasswordMessage =
    document.getElementById(
        "reset-password-message"
    );

const resetPasswordSubmit =
    document.getElementById(
        "reset-password-submit"
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
   OUVERTURE MOT DE PASSE OUBLIÉ
========================================================== */

function openForgotPasswordModal()
{
    forgotPasswordModal.classList.add(
        "login-modal--open"
    );

    forgotPasswordModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE MOT DE PASSE OUBLIÉ
========================================================== */

function closeForgotPasswordModal()
{
    forgotPasswordModal.classList.remove(
        "login-modal--open"
    );

    forgotPasswordModal.setAttribute(
        "aria-hidden",
        "true"
    );
}
/* ==========================================================
   OUVERTURE RÉINITIALISATION DU MOT DE PASSE
========================================================== */

function openResetPasswordModal()
{
    resetPasswordModal.classList.add(
        "login-modal--open"
    );

    resetPasswordModal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* ==========================================================
   FERMETURE RÉINITIALISATION DU MOT DE PASSE
========================================================== */

function closeResetPasswordModal()
{
    resetPasswordModal.classList.remove(
        "login-modal--open"
    );

    resetPasswordModal.setAttribute(
        "aria-hidden",
        "true"
    );
}

/* ==========================================================
   ACCÈS MOT DE PASSE OUBLIÉ
========================================================== */

loginForgotPassword.addEventListener(
    "click",
    () =>
    {
        closeLoginModal();

        forgotPasswordEmail.value =
            loginEmail.value.trim();

        forgotPasswordMessage.textContent =
            "";

        openForgotPasswordModal();
    }
);


/* ==========================================================
   RETOUR À LA CONNEXION
========================================================== */

forgotPasswordBack.addEventListener(
    "click",
    () =>
    {
        closeForgotPasswordModal();

        forgotPasswordForm.reset();

        forgotPasswordMessage.textContent =
            "";

        openLoginModal();
    }
);
/* ==========================================================
   ENVOI DU LIEN DE RÉINITIALISATION
========================================================== */

forgotPasswordForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();


        forgotPasswordMessage.textContent =
            "";


        forgotPasswordSubmit.disabled =
            true;


        try
        {
            const data =
                await requestPasswordReset(
                    forgotPasswordEmail.value.trim()
                );


            forgotPasswordMessage.textContent =
                data.message ||
                "Si cette adresse correspond à un compte, un e-mail de réinitialisation sera envoyé.";
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
                forgotPasswordMessage.textContent =
                    "Impossible de contacter le serveur.";
            }
            else
            {
                forgotPasswordMessage.textContent =
                    "Une erreur est survenue lors de la demande.";
            }
        }
        finally
        {
            forgotPasswordSubmit.disabled =
                false;
        }
    }
);

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
   RÉINITIALISATION DU MOT DE PASSE
========================================================== */

resetPasswordForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();


        resetPasswordMessage.textContent =
            "";


        const password =
            resetPassword.value;

        const passwordConfirm =
            resetPasswordConfirm.value;


        if (
            password !==
            passwordConfirm
        )
        {
            resetPasswordMessage.textContent =
                "Les deux mots de passe ne correspondent pas.";

            return;
        }


        if (
            password.length < 8 ||
            password.length > 72
        )
        {
            resetPasswordMessage.textContent =
                "Le mot de passe doit contenir entre 8 et 72 caractères.";

            return;
        }


        const passwordHasLetter =
            /\p{L}/u.test(
                password
            );

        const passwordHasNumber =
            /\d/.test(
                password
            );


        if (
            !passwordHasLetter ||
            !passwordHasNumber
        )
        {
            resetPasswordMessage.textContent =
                "Le mot de passe doit contenir au moins une lettre et un chiffre.";

            return;
        }


        resetPasswordSubmit.disabled =
            true;


        try
        {
            await resetUserPassword(
                resetToken,
                password
            );


            resetPasswordForm.reset();


            closeResetPasswordModal();


            window.history.replaceState(
                {},
                document.title,
                window.location.pathname
            );


            loginError.textContent =
                "Mot de passe modifié. Vous pouvez maintenant vous connecter.";


            openLoginModal();
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
                resetPasswordMessage.textContent =
                    "Impossible de contacter le serveur.";
            }
            else
            {
                resetPasswordMessage.textContent =
                    "Le lien est invalide ou a expiré.";
            }
        }
        finally
        {
            resetPasswordSubmit.disabled =
                false;
        }
    }
);
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


const urlParams =
    new URLSearchParams(
        window.location.search
    );

const resetToken =
    urlParams.get(
        "reset_token"
    );


async function initializeLogin()
{
    if (!resetToken)
    {
        openLoginModal();

        return;
    }


    closeLoginModal();

    closeForgotPasswordModal();


    try
    {
        await verifyPasswordResetToken(
            resetToken
        );


        openResetPasswordModal();
    }
    catch (error)
    {
        console.error(
            error
        );


        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        if (
            error.message ===
            "SERVER_UNAVAILABLE"
        )
        {
            loginError.textContent =
                "Impossible de vérifier le lien de réinitialisation.";
        }
        else
        {
            loginError.textContent =
                "Le lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien.";
        }


        openLoginModal();
    }
}


initializeLogin();