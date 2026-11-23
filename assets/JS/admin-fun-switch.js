
"use strict";

/* ==========================================================
   ADMINISTRATION — PASSAGE FUN VERS NORMAL
========================================================== */

(function () {

    const adminScreen =
        document.getElementById("admin-screen");

    const adminDashboard =
        document.getElementById("admin-dashboard-view");

    const adminMenu =
        document.querySelector("#admin-screen .admin-menu");

    if (
        !adminScreen ||
        !adminDashboard ||
        !adminMenu
    ) {
        return;
    }

    /* ======================================================
       CRÉATION DE LA NOTIFICATION
    ====================================================== */

    const notification =
        document.createElement("div");

    notification.id =
        "admin-fun-notification";

    notification.className =
        "admin-fun-notification";

    notification.innerHTML = `
        <h3>
            &gt; MODE FUN ACTIVÉ
        </h3>

        <p>
            Vous utilisez actuellement
            l'administration rétro IBM PC 5150.
        </p>

        <p>
            Toutes les fonctionnalités avancées
            de gestion sont disponibles
            dans le mode NORMAL.
        </p>

        <button
            id="admin-switch-to-normal"
            class="admin-fun-switch-button"
            type="button"
        >
            PASSER EN MODE NORMAL
        </button>
    `;

    adminDashboard.appendChild(notification);

    /* ======================================================
       STYLES
    ====================================================== */

    const style =
        document.createElement("style");

    style.textContent = `

        /* NOTIFICATION */

        .admin-fun-notification {
            margin-top: 30px;
            padding: 24px;

            border: 2px solid var(--admin-theme-color);

            background: var(--admin-theme-background);

            color: var(--admin-theme-color);

            font-family: inherit;

            box-shadow:
                0 0 15px var(--admin-theme-glow);
        }

        .admin-fun-notification h3 {
            margin: 0 0 20px;

            color: var(--admin-theme-color);

            font-family: inherit;
            font-size: 1.15rem;
        }

        .admin-fun-notification p {
            margin: 12px 0;

            line-height: 1.6;
        }

        /* BOUTON DE CHANGEMENT DE MODE */

        .admin-fun-switch-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;

            margin-top: 22px;
            padding: 14px 22px;

            border: 2px solid var(--admin-theme-color);

            background: transparent;
            color: var(--admin-theme-color);

            font-family: inherit;
            font-size: 0.95rem;
            font-weight: 700;

            cursor: pointer;

            transition:
                background-color 0.2s ease,
                color 0.2s ease,
                transform 0.2s ease;
        }

        .admin-fun-switch-button:hover {
            background: var(--admin-theme-color);
            color: var(--admin-theme-background);

            transform: scale(1.03);
        }

        .admin-fun-switch-button:focus-visible {
            outline: 3px solid var(--admin-theme-color);
            outline-offset: 4px;
        }

        /* AFFICHAGE UNIQUEMENT EN MODE FUN */

        #admin-screen[data-admin-mode="normal"]
        .admin-fun-notification {
            display: none !important;
        }

        /* MASQUER LES FONCTIONS AVANCÉES EN MODE FUN */

        #admin-screen[data-admin-mode="fun"]
        .admin-menu__button[data-admin-view="professeurs"],

        #admin-screen[data-admin-mode="fun"]
        .admin-menu__button[data-admin-view="eleves"],

        #admin-screen[data-admin-mode="fun"]
        .admin-menu__button[data-admin-view="contacts"],

        #admin-screen[data-admin-mode="fun"]
        .admin-menu__button[data-admin-view="compte"] {
            display: none !important;
        }

        /* RESPONSIVE */

        @media (max-width: 600px) {

            .admin-fun-notification {
                padding: 16px;
            }

            .admin-fun-switch-button {
                width: 100%;
                padding: 12px;
                font-size: 0.85rem;
            }
        }
    `;

    document.head.appendChild(style);

    /* ======================================================
       CHANGEMENT DE MODE
    ====================================================== */

    const switchButton =
        document.getElementById(
            "admin-switch-to-normal"
        );

    switchButton.addEventListener(
        "click",
        () => {

            /* Arrêter les sons du mode FUN */

            if (
                typeof stopAdminBootSessionAudio === "function"
            ) {
                stopAdminBootSessionAudio();
            }

            /* Activer le thème NORMAL */

            adminScreen.dataset.adminMode =
                "normal";

            /* Revenir au tableau de bord */

            const dashboardButton =
                adminMenu.querySelector(
                    '[data-admin-view="dashboard"]'
                );

            if (dashboardButton) {
                dashboardButton.click();
            }

            /* Remettre la page en haut */

            adminScreen.scrollTop = 0;

        }
    );

})();
