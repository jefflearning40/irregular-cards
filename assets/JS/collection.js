
"use strict";


/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const collectionOpenButton =
    document.getElementById("collection-open-button");

const collectionModal =
    document.getElementById("collection-modal");

const collectionCloseButton =
    document.getElementById("collection-close-button");

const collectionPreviousButton =
    document.getElementById("collection-previous-button");

const collectionNextButton =
    document.getElementById("collection-next-button");

const collectionCarouselBooks =
    document.getElementById("collection-carousel-books");

const collectionBookTitle =
    document.getElementById("collection-book-title");

const collectionBookDescription =
    document.getElementById("collection-book-description");

const collectionBookStatus =
    document.getElementById("collection-book-status");


/* ==========================================================
   CONFIGURATION DES TOMES
========================================================== */

const collectionBooks = [
    {
        id: 1,
        title: "Tome 1 — Verbes irréguliers",
        image: "assets/images/icones/Tome1-Verbes-irreguliers.png",
        description:
            "Apprendre, mémoriser et pratiquer les verbes " +
            "irréguliers anglais grâce à une traversée " +
            "interactive de la Manche, des quiz et un " +
            "suivi de progression.",
        available: true,
        owned: true
    },
    {
        id: 2,
        title: "Tome 2 — Vocabulaire",
        image: "assets/images/icones/Tome2-Vocabulaire Anglais.png",
        description:
            "Découvrir le vocabulaire anglais à travers " +
            "des thèmes illustrés, des expressions " +
            "courantes et des exercices interactifs.",
        available: false,
        owned: false
    },
    {
        id: 3,
        title: "Tome 3 — Grammaire",
        image: "assets/images/icones/Tome3-grammaire.png",
        description:
            "Comprendre et maîtriser les règles de " +
            "grammaire anglaise avec des explications " +
            "progressives et des exercices pratiques.",
        available: false,
        owned: false
    }
];


/* ==========================================================
   ÉTAT DU CARROUSEL
========================================================== */

let collectionCurrentIndex = 0;

let collectionPreviousFocus = null;


/* ==========================================================
   AFFICHAGE DES TOMES
========================================================== */

function renderCollection()
{
    collectionCarouselBooks.replaceChildren();

    const total =
        collectionBooks.length;

    collectionBooks.forEach(
        (book, index) =>
        {
            const position =
                (index - collectionCurrentIndex + total) % total;

            const bookElement =
                document.createElement("div");

            bookElement.classList.add(
                "collection-book"
            );

            if (position === 0)
            {
                bookElement.classList.add(
                    "collection-book--active"
                );
            }
            else if (position === 1)
            {
                bookElement.classList.add(
                    "collection-book--next"
                );
            }
            else
            {
                bookElement.classList.add(
                    "collection-book--previous"
                );
            }

            const image =
                document.createElement("img");

            image.src =
                book.image;

            image.alt =
                book.title;

            image.draggable =
                false;

            bookElement.appendChild(
                image
            );

            if (book.owned)
            {
                const ownedBadge =
                    document.createElement("span");

                ownedBadge.className =
                    "collection-book__owned";

                ownedBadge.textContent =
                    "✓";

                ownedBadge.setAttribute(
                    "aria-label",
                    "Tome possédé"
                );

                bookElement.appendChild(
                    ownedBadge
                );
            }

            collectionCarouselBooks.appendChild(
                bookElement
            );
        }
    );

    updateCollectionDescription();
}


/* ==========================================================
   DESCRIPTION DU TOME SÉLECTIONNÉ
========================================================== */

function updateCollectionDescription()
{
    const book =
        collectionBooks[collectionCurrentIndex];

    collectionBookTitle.textContent =
        book.title;

    collectionBookDescription.textContent =
        book.description;

    if (book.owned)
    {
        collectionBookStatus.textContent =
            "✓ Tome possédé";
    }
    else if (book.available)
    {
        collectionBookStatus.textContent =
            "Tome disponible — Non acquis";
    }
    else
    {
        collectionBookStatus.textContent =
            "À venir";
    }
}


/* ==========================================================
   NAVIGATION
========================================================== */

function showPreviousCollectionBook()
{
    collectionCurrentIndex =
        (
            collectionCurrentIndex -
            1 +
            collectionBooks.length
        ) % collectionBooks.length;

    renderCollection();
}


function showNextCollectionBook()
{
    collectionCurrentIndex =
        (
            collectionCurrentIndex +
            1
        ) % collectionBooks.length;

    renderCollection();
}


/* ==========================================================
   OUVERTURE DE LA MODALE
========================================================== */

function openCollectionModal()
{
    collectionPreviousFocus =
        document.activeElement;

    collectionCurrentIndex = 0;

    renderCollection();

    collectionModal.hidden =
        false;

    collectionModal.setAttribute(
        "aria-hidden",
        "false"
    );

    collectionCloseButton.focus();
}


/* ==========================================================
   FERMETURE DE LA MODALE
========================================================== */

function closeCollectionModal()
{
    collectionModal.hidden =
        true;

    collectionModal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        collectionPreviousFocus &&
        typeof collectionPreviousFocus.focus === "function"
    )
    {
        collectionPreviousFocus.focus();
    }
}


/* ==========================================================
   ÉVÉNEMENTS
========================================================== */

collectionOpenButton.addEventListener(
    "click",
    openCollectionModal
);


collectionCloseButton.addEventListener(
    "click",
    closeCollectionModal
);


collectionPreviousButton.addEventListener(
    "click",
    showPreviousCollectionBook
);


collectionNextButton.addEventListener(
    "click",
    showNextCollectionBook
);


/* ==========================================================
   FERMETURE PAR CLIC SUR LE FOND
========================================================== */

collectionModal.addEventListener(
    "click",
    (event) =>
    {
        if (event.target === collectionModal)
        {
            closeCollectionModal();
        }
    }
);


/* ==========================================================
   NAVIGATION CLAVIER
========================================================== */

document.addEventListener(
    "keydown",
    (event) =>
    {
        if (collectionModal.hidden)
        {
            return;
        }

        if (event.key === "Escape")
        {
            closeCollectionModal();
        }

        if (event.key === "ArrowLeft")
        {
            event.preventDefault();

            showPreviousCollectionBook();
        }

        if (event.key === "ArrowRight")
        {
            event.preventDefault();

            showNextCollectionBook();
        }

        if (event.key === "Tab")
        {
            const buttons = [
                collectionCloseButton,
                collectionPreviousButton,
                collectionNextButton
            ];

            const first =
                buttons[0];

            const last =
                buttons[buttons.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === first
            )
            {
                event.preventDefault();

                last.focus();
            }
            else if (
                !event.shiftKey &&
                document.activeElement === last
            )
            {
                event.preventDefault();

                first.focus();
            }
        }
    }
);
