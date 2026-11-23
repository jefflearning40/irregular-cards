
"use strict";

/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const loginModal =
    document.getElementById("login-modal");

const loginModalClose =
    document.getElementById("login-modal-close");

const loginForm =
    document.getElementById("login-form");

const loginEmail =
    document.getElementById("login-email");

const loginPassword =
    document.getElementById("login-password");

const loginButton =
    document.getElementById("login-button");

const loginError =
    document.getElementById("login-error");

const loginForgotPassword =
    document.getElementById("login-forgot-password");

const forgotPasswordModal =
    document.getElementById("forgot-password-modal");

const forgotPasswordForm =
    document.getElementById("forgot-password-form");

const forgotPasswordEmail =
    document.getElementById("forgot-password-email");

const forgotPasswordMessage =
    document.getElementById("forgot-password-message");

const forgotPasswordSubmit =
    document.getElementById("forgot-password-submit");

const forgotPasswordBack =
    document.getElementById("forgot-password-back");

const resetPasswordModal =
    document.getElementById("reset-password-modal");

const resetPasswordForm =
    document.getElementById("reset-password-form");

const resetPassword =
    document.getElementById("reset-password");

const resetPasswordConfirm =
    document.getElementById("reset-password-confirm");

const resetPasswordMessage =
    document.getElementById("reset-password-message");

const resetPasswordSubmit =
    document.getElementById("reset-password-submit");

const logoutButton =
    document.getElementById("logout-button");

const welcomeLoginButton =
    document.getElementById("welcome-login-button");

const adminScreen =
    document.getElementById("admin-screen");

const adminLogoutButton =
    document.getElementById("admin-logout-button");

const adminModeModal =
    document.getElementById("admin-mode-modal");

const adminModeNormalButton =
    document.getElementById("admin-mode-normal");

const adminModeFunButton =
    document.getElementById("admin-mode-fun");

const adminModeCancelButton =
    document.getElementById("admin-mode-cancel");


/* ==========================================================
   ÉLÉMENTS DOUBLE AUTHENTIFICATION
========================================================== */

const twoFactorModal =
    document.getElementById("two-factor-modal");

const twoFactorMethodSelection =
    document.getElementById("two-factor-method-selection");

const twoFactorSelectTotp =
    document.getElementById("two-factor-select-totp");

const twoFactorSelectEmail =
    document.getElementById("two-factor-select-email");

const twoFactorTotpSetup =
    document.getElementById("two-factor-totp-setup");

const twoFactorQrCode =
    document.getElementById("two-factor-qr-code");

const twoFactorSecret =
    document.getElementById("two-factor-secret");

const twoFactorForm =
    document.getElementById("two-factor-form");

const twoFactorCode =
    document.getElementById("two-factor-code");

const twoFactorMessage =
    document.getElementById("two-factor-message");

const twoFactorSubmit =
    document.getElementById("two-factor-submit");

const twoFactorCancel =
    document.getElementById("two-factor-cancel");


/* ==========================================================
   ÉTAT TEMPORAIRE 2FA
========================================================== */

let twoFactorChallengeToken = null;

let twoFactorBusy = false;


/* ==========================================================
   GESTION DES MODALES
========================================================== */

function openModal(modal)
{
    modal.classList.add("login-modal--open");

    modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal)
{
    modal.classList.remove("login-modal--open");

    modal.setAttribute("aria-hidden", "true");
}

function openLoginModal()
{
    openModal(loginModal);
}

function closeLoginModal()
{
    closeModal(loginModal);
}

function openForgotPasswordModal()
{
    openModal(forgotPasswordModal);
}

function closeForgotPasswordModal()
{
    closeModal(forgotPasswordModal);
}

function openResetPasswordModal()
{
    openModal(resetPasswordModal);
}

function closeResetPasswordModal()
{
    closeModal(resetPasswordModal);
}

function openTwoFactorModal()
{
    openModal(twoFactorModal);
}

function closeTwoFactorModal()
{
    closeModal(twoFactorModal);
}


/* ==========================================================
   RÉINITIALISATION DE L'ÉTAT 2FA
========================================================== */

function resetTwoFactorState()
{
    twoFactorChallengeToken = null;

    twoFactorBusy = false;

    twoFactorMethodSelection.hidden = true;

    twoFactorTotpSetup.hidden = true;

    twoFactorForm.hidden = true;

    twoFactorForm.reset();

    twoFactorMessage.textContent = "";

    twoFactorQrCode.removeAttribute("src");

    twoFactorSecret.textContent = "";

    twoFactorSelectTotp.disabled = false;

    twoFactorSelectEmail.disabled = false;

    twoFactorSubmit.disabled = false;
}


/* ==========================================================
   ERREURS API 2FA
========================================================== */

function getTwoFactorErrorMessage(error)
{
    if (error.message === "SERVER_UNAVAILABLE")
    {
        return "Impossible de contacter le serveur.";
    }

    if (error.message === "INVALID_CREDENTIALS")
    {
        return "E-mail ou mot de passe incorrect.";
    }

    if (error.message === "INVALID_CODE")
    {
        return "Code incorrect. Vérifiez les six chiffres.";
    }

    if (error.message === "EXPIRED_CHALLENGE")
    {
        return "La vérification a expiré. Recommencez la connexion.";
    }

    if (error.message === "TOO_MANY_ATTEMPTS")
    {
        return "Trop de tentatives. Recommencez plus tard.";
    }

    return error.message === "LOGIN_ERROR"
        ? "La connexion a échoué."
        : "Une erreur est survenue. Veuillez réessayer.";
}


/* ==========================================================
   APPEL API AUTHENTIFICATION
========================================================== */

async function sendAuthenticationRequest(path, body)
{
    let response;

    try
    {
        response = await fetch(
            `${API_URL}${path}`,
            {
                method: "POST",

                headers:
                {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(body)
            }
        );
    }
    catch
    {
        throw new Error("SERVER_UNAVAILABLE");
    }

    let data = {};

    try
    {
        data = await response.json();
    }
    catch
    {
        data = {};
    }

    if (!response.ok)
    {
        if (response.status === 401)
        {
            throw new Error(
                path === "/auth/login"
                    ? "INVALID_CREDENTIALS"
                    : "INVALID_CODE"
            );
        }

        if (response.status === 429)
        {
            throw new Error("TOO_MANY_ATTEMPTS");
        }

        if (
            response.status === 400 ||
            response.status === 403 ||
            response.status === 410
        )
        {
            throw new Error(
                path === "/auth/2fa/verify"
                    ? "INVALID_CODE"
                    : "LOGIN_ERROR"
            );
        }

        throw new Error("LOGIN_ERROR");
    }

    return data;
}


/* ==========================================================
   ENREGISTREMENT DE LA SESSION
   UNIQUEMENT APRÈS AUTHENTIFICATION COMPLÈTE
========================================================== */

function registerAuthenticatedSession(data)
{
    if (
        !data ||
        !data.token ||
        !data.role ||
        !data.utilisateur
    )
    {
        throw new Error("LOGIN_ERROR");
    }

    apiToken = data.token;

    currentRole = data.role;

    currentUser = data.utilisateur;

    currentStudent =
        currentRole === "eleve"
            ? currentUser
            : null;

    return {
        role: currentRole,
        utilisateur: currentUser
    };
}


/* ==========================================================
   CONNEXION INITIALE
========================================================== */

async function loginWithTwoFactor(email, password)
{
    const data = await sendAuthenticationRequest(
        "/auth/login",
        {
            email: email,
            mot_de_passe: password
        }
    );

    if (data.requires_2fa === true)
    {
        if (!data.challenge_token)
        {
            throw new Error("LOGIN_ERROR");
        }

        return data;
    }

    /*
       Les élèves reçoivent directement leur session.
       Les administrateurs et professeurs doivent
       obligatoirement passer par la 2FA.
    */

    if (data.role !== "eleve")
    {
        throw new Error("LOGIN_ERROR");
    }

    return registerAuthenticatedSession(data);
}


/* ==========================================================
   AFFICHAGE DE L'ÉTAPE 2FA
========================================================== */

function prepareTwoFactorVerification(data)
{
    resetTwoFactorState();

    twoFactorChallengeToken = data.challenge_token;

    closeLoginModal();

    openTwoFactorModal();

    if (data.setup_required === true)
    {
        twoFactorMethodSelection.hidden = false;

        twoFactorSelectTotp.focus();

        return;
    }

    if (
        data.method !== "totp" &&
        data.method !== "email"
    )
    {
        throw new Error("LOGIN_ERROR");
    }

    twoFactorForm.hidden = false;

    twoFactorMessage.textContent =
        data.method === "email"
            ? "Saisissez le code reçu par e-mail."
            : "Saisissez le code de votre application Authenticator.";

    twoFactorCode.focus();
}


/* ==========================================================
   CONFIGURATION AUTHENTICATOR
========================================================== */

twoFactorSelectTotp.addEventListener(
    "click",
    async () =>
    {
        if (twoFactorBusy)
        {
            return;
        }

        twoFactorBusy = true;

        twoFactorSelectTotp.disabled = true;

        twoFactorSelectEmail.disabled = true;

        try
        {
            const data = await sendAuthenticationRequest(
                "/auth/2fa/setup/totp",
                {
                    challenge_token:
                        twoFactorChallengeToken
                }
            );

            if (!data.qr_code || !data.secret)
            {
                throw new Error("LOGIN_ERROR");
            }

            twoFactorMethodSelection.hidden = true;

            twoFactorTotpSetup.hidden = false;

            twoFactorForm.hidden = false;

            twoFactorQrCode.src = data.qr_code;

            twoFactorSecret.textContent = data.secret;

            twoFactorMessage.textContent =
                "Après avoir ajouté le compte dans Authenticator, saisissez son code à 6 chiffres.";

            twoFactorCode.focus();
        }
        catch (error)
        {
            console.error(error);

            twoFactorMessage.textContent =
                getTwoFactorErrorMessage(error);

            twoFactorMethodSelection.hidden = false;

            twoFactorForm.hidden = false;
        }
        finally
        {
            twoFactorBusy = false;

            twoFactorSelectTotp.disabled = false;

            twoFactorSelectEmail.disabled = false;
        }
    }
);


/* ==========================================================
   CONFIGURATION PAR E-MAIL
========================================================== */

twoFactorSelectEmail.addEventListener(
    "click",
    async () =>
    {
        if (twoFactorBusy)
        {
            return;
        }

        twoFactorBusy = true;

        twoFactorSelectTotp.disabled = true;

        twoFactorSelectEmail.disabled = true;

        try
        {
            const data = await sendAuthenticationRequest(
                "/auth/2fa/setup/email",
                {
                    challenge_token:
                        twoFactorChallengeToken
                }
            );

            if (data.challenge_token)
            {
                twoFactorChallengeToken =
                    data.challenge_token;
            }

            twoFactorMethodSelection.hidden = true;

            twoFactorTotpSetup.hidden = true;

            twoFactorForm.hidden = false;

            twoFactorMessage.textContent =
                "Un code de vérification a été envoyé à votre adresse e-mail.";

            twoFactorCode.focus();
        }
        catch (error)
        {
            console.error(error);

            twoFactorMessage.textContent =
                getTwoFactorErrorMessage(error);

            twoFactorMethodSelection.hidden = false;

            twoFactorForm.hidden = false;
        }
        finally
        {
            twoFactorBusy = false;

            twoFactorSelectTotp.disabled = false;

            twoFactorSelectEmail.disabled = false;
        }
    }
);


/* ==========================================================
   VÉRIFICATION DU CODE 2FA
========================================================== */

twoFactorForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();

        if (twoFactorBusy)
        {
            return;
        }

        const code = twoFactorCode.value.trim();

        if (!/^[0-9]{6}$/.test(code))
        {
            twoFactorMessage.textContent =
                "Le code doit contenir exactement 6 chiffres.";

            return;
        }

        twoFactorBusy = true;

        twoFactorSubmit.disabled = true;

        twoFactorMessage.textContent = "";

        try
        {
            const data = await sendAuthenticationRequest(
                "/auth/2fa/verify",
                {
                    challenge_token:
                        twoFactorChallengeToken,

                    code: code
                }
            );

            const loginData =
                registerAuthenticatedSession(data);

            closeTwoFactorModal();

            resetTwoFactorState();

            loginForm.reset();

            await completeLogin(loginData);
        }
        catch (error)
        {
            console.error(error);

            twoFactorMessage.textContent =
                getTwoFactorErrorMessage(error);

            twoFactorCode.value = "";

            twoFactorCode.focus();
        }
        finally
        {
            twoFactorBusy = false;

            twoFactorSubmit.disabled = false;
        }
    }
);


/* ==========================================================
   ANNULATION DE LA 2FA
========================================================== */

twoFactorCancel.addEventListener(
    "click",
    () =>
    {
        if (twoFactorBusy)
        {
            return;
        }

        resetTwoFactorState();

        closeTwoFactorModal();

        logoutUser();

        loginForm.reset();

        loginError.textContent = "";

        openLoginModal();
    }
);


/* ==========================================================
   FERMETURE DE LA FENÊTRE DE CONNEXION
========================================================== */

loginModalClose.addEventListener(
    "click",
    () =>
    {
        closeLoginModal();

        loginForm.reset();

        loginError.textContent = "";

        loginError.style.color =
            "var(--color-error)";
    }
);


/* ==========================================================
   AFFICHAGE DES BOUTONS CONNEXION / DÉCONNEXION
========================================================== */

function updateWelcomeButtons(isConnected)
{
    if (welcomeLoginButton)
    {
        welcomeLoginButton.hidden = isConnected;
    }

    if (logoutButton)
    {
        logoutButton.hidden = !isConnected;
    }
}


/* ==========================================================
   ACCUEIL PUBLIC
========================================================== */

function showPublicWelcome()
{
    hideAdmin();

    showDeparture();

    updateWelcomeButtons(false);

    closeLoginModal();

    closeForgotPasswordModal();

    closeResetPasswordModal();

    closeTwoFactorModal();

    resetTwoFactorState();
}


/* ==========================================================
   BOUTON CONNEXION DE LA CARTE POSTALE
========================================================== */

if (welcomeLoginButton)
{
    welcomeLoginButton.addEventListener(
        "click",
        () =>
        {
            loginForm.reset();

            loginError.textContent = "";

            loginError.style.color =
                "var(--color-error)";

            openLoginModal();
        }
    );
}


/* ==========================================================
   MOT DE PASSE OUBLIÉ
========================================================== */

loginForgotPassword.addEventListener(
    "click",
    () =>
    {
        closeLoginModal();

        forgotPasswordEmail.value =
            loginEmail.value.trim();

        forgotPasswordMessage.textContent = "";

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

        forgotPasswordMessage.textContent = "";

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

        forgotPasswordMessage.textContent = "";

        forgotPasswordSubmit.disabled = true;

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
            console.error(error);

            if (error.message === "SERVER_UNAVAILABLE")
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
            forgotPasswordSubmit.disabled = false;
        }
    }
);


/* ==========================================================
   AFFICHAGE ADMINISTRATEUR
========================================================== */

function showAdmin()
{
    adminScreen.hidden = false;

    logoutButton.hidden = true;

    if (welcomeLoginButton)
    {
        welcomeLoginButton.hidden = true;
    }
}

function hideAdmin()
{
    adminScreen.hidden = true;
}


/* ==========================================================
   RÉINITIALISATION DU MOT DE PASSE
========================================================== */

resetPasswordForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();

        resetPasswordMessage.textContent = "";

        const password =
            resetPassword.value;

        const passwordConfirm =
            resetPasswordConfirm.value;

        if (password !== passwordConfirm)
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
            /\p{L}/u.test(password);

        const passwordHasNumber =
            /\d/.test(password);

        if (
            !passwordHasLetter ||
            !passwordHasNumber
        )
        {
            resetPasswordMessage.textContent =
                "Le mot de passe doit contenir au moins une lettre et un chiffre.";

            return;
        }

        resetPasswordSubmit.disabled = true;

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

            loginError.style.color =
                "var(--color-success)";

            openLoginModal();
        }
        catch (error)
        {
            console.error(error);

            if (error.message === "SERVER_UNAVAILABLE")
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
            resetPasswordSubmit.disabled = false;
        }
    }
);


/* ==========================================================
   CHOIX DU MODE ADMINISTRATEUR
========================================================== */

function chooseAdminMode()
{
    return new Promise((resolve) =>
    {
        adminModeModal.classList.add(
            "admin-mode-modal--open"
        );

        adminModeModal.setAttribute(
            "aria-hidden",
            "false"
        );

        let finished = false;

        function close(mode)
        {
            if (finished)
            {
                return;
            }

            finished = true;

            adminModeModal.classList.remove(
                "admin-mode-modal--open"
            );

            adminModeModal.setAttribute(
                "aria-hidden",
                "true"
            );

            adminModeNormalButton.removeEventListener(
                "click",
                selectNormal
            );

            adminModeFunButton.removeEventListener(
                "click",
                selectFun
            );

            adminModeCancelButton.removeEventListener(
                "click",
                cancel
            );

            adminModeModal.removeEventListener(
                "keydown",
                handleKeyboard
            );

            resolve(mode);
        }

        function selectNormal()
        {
            close("normal");
        }

        function selectFun()
        {
            close("fun");
        }

        function cancel()
        {
            close(null);
        }

        function handleKeyboard(event)
        {
            if (event.key === "Escape")
            {
                event.preventDefault();

                cancel();

                return;
            }

            if (event.key !== "Tab")
            {
                return;
            }

            const buttons = [
                adminModeNormalButton,
                adminModeFunButton,
                adminModeCancelButton
            ];

            if (
                event.shiftKey &&
                document.activeElement === buttons[0]
            )
            {
                event.preventDefault();

                buttons[2].focus();
            }
            else if (
                !event.shiftKey &&
                document.activeElement === buttons[2]
            )
            {
                event.preventDefault();

                buttons[0].focus();
            }
        }

        adminModeNormalButton.addEventListener(
            "click",
            selectNormal
        );

        adminModeFunButton.addEventListener(
            "click",
            selectFun
        );

        adminModeCancelButton.addEventListener(
            "click",
            cancel
        );

        adminModeModal.addEventListener(
            "keydown",
            handleKeyboard
        );

        adminModeNormalButton.focus();
    });
}


/* ==========================================================
   FINALISATION DE LA CONNEXION
========================================================== */

async function completeLogin(loginData)
{
    /* ======================================================
       CONNEXION ÉLÈVE
    ====================================================== */

    if (loginData.role === "eleve")
    {
        hideAdmin();

        updateWelcomeButtons(true);

        showDeparture();

        return;
    }

    /* ======================================================
       CONNEXION PROFESSEUR
    ====================================================== */

    if (loginData.role === "professeur")
    {
        hideAdmin();

        updateWelcomeButtons(true);

        showTeacher();

        return;
    }

    /* ======================================================
       CONNEXION ADMINISTRATEUR
    ====================================================== */

    if (loginData.role === "administrateur")
    {
        hideAllScreens();

        const selectedAdminMode =
            await chooseAdminMode();

        if (selectedAdminMode === null)
        {
            logoutUser();

            loginForm.reset();

            updateWelcomeButtons(false);

            showDeparture();

            openLoginModal();

            return;
        }

        adminScreen.dataset.adminMode =
            selectedAdminMode;

        if (selectedAdminMode === "fun")
        {
            await startAdminBoot();
        }
        else
        {
            if (
                typeof stopAdminBootSessionAudio ===
                "function"
            )
            {
                stopAdminBootSessionAudio();
            }
        }

        showAdmin();

        /* ==============================================
           INFORMATIONS ADMINISTRATEUR
        ============================================== */

        const adminAccountName =
            document.getElementById(
                "admin-account-name"
            );

        const adminAccountFirstname =
            document.getElementById(
                "admin-account-firstname"
            );

        const adminAccountEmail =
            document.getElementById(
                "admin-account-email"
            );

        adminAccountName.textContent =
            loginData.utilisateur.nom;

        adminAccountFirstname.textContent =
            loginData.utilisateur.prenom;

        adminAccountEmail.textContent =
            loginData.utilisateur.email;

        await loadAdminDashboard();

        return;
    }

    throw new Error("UNKNOWN_ROLE");
}


/* ==========================================================
   CONNEXION
========================================================== */

loginForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();

        loginError.textContent = "";

        loginError.style.color =
            "var(--color-error)";

        loginButton.disabled = true;

        try
        {
            const loginData =
                await loginWithTwoFactor(
                    loginEmail.value.trim(),
                    loginPassword.value
                );

            if (loginData.requires_2fa === true)
            {
                prepareTwoFactorVerification(loginData);

                return;
            }

            closeLoginModal();

            await completeLogin(loginData);
        }
        catch (error)
        {
            console.error(error);

            loginError.textContent =
                getTwoFactorErrorMessage(error);

            openLoginModal();
        }
        finally
        {
            loginButton.disabled = false;
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

        loginForm.reset();

        loginError.textContent = "";

        showPublicWelcome();
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

        if (
            typeof stopAdminBootSessionAudio ===
            "function"
        )
        {
            stopAdminBootSessionAudio();
        }

        loginForm.reset();

        loginError.textContent = "";

        showPublicWelcome();
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
    urlParams.get("reset_token");


async function initializeLogin()
{
    updateWelcomeButtons(false);

    closeLoginModal();

    closeForgotPasswordModal();

    closeResetPasswordModal();

    closeTwoFactorModal();

    resetTwoFactorState();

    if (!resetToken)
    {
        showPublicWelcome();

        return;
    }

    try
    {
        await verifyPasswordResetToken(
            resetToken
        );

        openResetPasswordModal();
    }
    catch (error)
    {
        console.error(error);

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

        if (error.message === "SERVER_UNAVAILABLE")
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
