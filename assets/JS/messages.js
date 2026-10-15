
"use strict";

/* ==========================================================
   ÉLÉMENTS HTML
========================================================== */

const messagesButton =
    document.getElementById("messages-button");

const teacherMessagesButton =
    document.getElementById("teacher-messages-button");

const messagesModal =
    document.getElementById("messages-modal");

const messagesModalClose =
    document.getElementById("messages-modal-close");

const messagesReceivedButton =
    document.getElementById("messages-received-button");

const messagesSentButton =
    document.getElementById("messages-sent-button");

const messagesNewButton =
    document.getElementById("messages-new-button");

const messagesList =
    document.getElementById("messages-list");

const messagesForm =
    document.getElementById("messages-form");

const messagesRecipient =
    document.getElementById("messages-recipient");

const messagesSubject =
    document.getElementById("messages-subject");

const messagesContent =
    document.getElementById("messages-content");

const messagesFormMessage =
    document.getElementById("messages-form-message");

const messagesSendButton =
    document.getElementById("messages-send-button");


/* ==========================================================
   IDENTIFICATION DE L'ESPACE PROFESSEUR
========================================================== */

function isTeacherMessaging()
{
    const teacherScreen =
        document.getElementById("teacher-screen");

    return (
        teacherScreen !== null &&
        getComputedStyle(teacherScreen).display !== "none"
    );
}


/* ==========================================================
   DÉTECTION DES ERREURS API
========================================================== */

function isMessagesServerUnavailable(error)
{
    return (
        error?.message === "SERVER_UNAVAILABLE" ||
        error instanceof TypeError
    );
}


/* ==========================================================
   SIGNALEMENT DE LA PANNE AU TABLEAU DE BORD
========================================================== */

function notifyTeacherApiUnavailable(error)
{
    if (!isMessagesServerUnavailable(error))
    {
        return false;
    }

    if (!isTeacherMessaging())
    {
        return false;
    }

    document.dispatchEvent(
        new Event("teacher-api-unavailable")
    );

    return true;
}


/* ==========================================================
   VÉRIFICATION DU BLOCAGE PROFESSEUR
========================================================== */

function isTeacherMessagingBlocked()
{
    return (
        isTeacherMessaging() &&
        typeof teacherServerOffline !== "undefined" &&
        teacherServerOffline
    );
}


/* ==========================================================
   AFFICHAGE DES ERREURS
========================================================== */

function displayMessagingError(container, error, fallback)
{
    if (notifyTeacherApiUnavailable(error))
    {
        return;
    }

    const errorMessage =
        document.createElement("p");

    errorMessage.textContent =
        isMessagesServerUnavailable(error)
            ? "Connexion au serveur impossible. Veuillez réessayer ultérieurement."
            : fallback;

    container.appendChild(errorMessage);
}


/* ==========================================================
   MISE À JOUR DES COMPTEURS
========================================================== */

async function updateMessageCounters()
{
    if (isTeacherMessagingBlocked())
    {
        return;
    }

    try
    {
        const [
            receivedMessages,
            sentMessages
        ] = await Promise.all([
            getReceivedMessages(),
            getSentMessages()
        ]);

        if (isTeacherMessagingBlocked())
        {
            return;
        }

        const unreadMessages =
            receivedMessages.filter(
                (message) =>
                    Number(message.est_lu) !== 1
            );

        messagesReceivedButton.textContent =
            `Messages reçus (${receivedMessages.length})`;

        messagesSentButton.textContent =
            `Messages envoyés (${sentMessages.length})`;

        messagesNewButton.textContent =
            `Nouveau message (${unreadMessages.length})`;
    }
    catch (error)
    {
        console.error(error);
        notifyTeacherApiUnavailable(error);
    }
}


/* ==========================================================
   OUVERTURE DE LA MESSAGERIE
========================================================== */

async function openMessagesModal()
{
    if (isTeacherMessagingBlocked())
    {
        return;
    }

    /* ======================================================
       CONTRÔLE DE L'API AVANT OUVERTURE PROFESSEUR
    ====================================================== */

    if (isTeacherMessaging())
    {
        teacherMessagesButton.disabled = true;

        try
        {
            await getReceivedMessages();
        }
        catch (error)
        {
            console.error(error);

            if (notifyTeacherApiUnavailable(error))
            {
                return;
            }

            messagesModal.classList.add("is-open");

            messagesModal.setAttribute(
                "aria-hidden",
                "false"
            );

            messagesForm.hidden = true;
            messagesList.hidden = false;
            messagesList.replaceChildren();

            displayMessagingError(
                messagesList,
                error,
                "Impossible de récupérer les messages reçus."
            );

            return;
        }
        finally
        {
            teacherMessagesButton.disabled =
                isTeacherMessagingBlocked();
        }

        if (isTeacherMessagingBlocked())
        {
            return;
        }
    }

    /* ======================================================
       OUVERTURE UNIQUEMENT SI LE CONTRÔLE EST RÉUSSI
    ====================================================== */

    messagesModal.classList.add("is-open");

    messagesModal.setAttribute(
        "aria-hidden",
        "false"
    );

    await showReceivedMessages();

    if (
        !messagesModal.classList.contains("is-open") ||
        isTeacherMessagingBlocked()
    )
    {
        return;
    }

    await updateMessageCounters();
}


/* ==========================================================
   FERMETURE DE LA MESSAGERIE
========================================================== */

function closeMessagesModal()
{
    messagesModal.classList.remove("is-open");

    messagesModal.setAttribute(
        "aria-hidden",
        "true"
    );

    messagesForm.hidden = true;
    messagesList.hidden = false;

    messagesFormMessage.textContent = "";
}


/* ==========================================================
   AFFICHAGE DES MESSAGES REÇUS
========================================================== */

async function showReceivedMessages()
{
    if (isTeacherMessagingBlocked())
    {
        return;
    }

    messagesForm.hidden = true;
    messagesList.hidden = false;

    messagesList.replaceChildren();

    try
    {
        const messages =
            await getReceivedMessages();

        if (isTeacherMessagingBlocked())
        {
            return;
        }

        if (messages.length === 0)
        {
            const emptyMessage =
                document.createElement("p");

            emptyMessage.textContent =
                "Aucun message reçu.";

            messagesList.appendChild(emptyMessage);

            return;
        }

        messages.forEach(
            (message) =>
            {
                const row =
                    document.createElement("div");

                row.className =
                    "messages-list-row";

                const selector =
                    document.createElement("input");

                selector.type = "checkbox";

                selector.className =
                    "messages-list-selector";

                selector.value = message.id;

                selector.setAttribute(
                    "aria-label",
                    `Sélectionner le message ${message.objet}`
                );

                const messageButton =
                    document.createElement("button");

                messageButton.type = "button";

                messageButton.className =
                    "messages-list-item";

                const subject =
                    document.createElement("span");

                subject.className =
                    "messages-list-item__subject";

                subject.textContent =
                    message.objet;

                const status =
                    document.createElement("span");

                status.className =
                    "messages-list-item__status";

                if (Number(message.est_lu) === 1)
                {
                    status.textContent = "Lu";

                    status.classList.add(
                        "messages-list-item__status--read"
                    );
                }
                else
                {
                    status.textContent = "Non lu";
                }

                messageButton.append(
                    subject,
                    status
                );

                /* ==========================================
                   LECTURE D'UN MESSAGE
                ========================================== */

                messageButton.addEventListener(
                    "click",
                    async () =>
                    {
                        if (isTeacherMessagingBlocked())
                        {
                            return;
                        }

                        if (Number(message.est_lu) !== 1)
                        {
                            try
                            {
                                await markMessageAsRead(
                                    message.id
                                );

                                if (isTeacherMessagingBlocked())
                                {
                                    return;
                                }

                                message.est_lu = 1;

                                await updateMessageCounters();

                                if (isTeacherMessagingBlocked())
                                {
                                    return;
                                }
                            }
                            catch (error)
                            {
                                console.error(error);

                                if (notifyTeacherApiUnavailable(error))
                                {
                                    return;
                                }
                            }
                        }

                        if (
                            !messagesModal.classList.contains("is-open")
                        )
                        {
                            return;
                        }

                        messagesList.replaceChildren();

                        const messageReader =
                            document.createElement("div");

                        messageReader.className =
                            "messages-reader";

                        const readerHeader =
                            document.createElement("div");

                        readerHeader.className =
                            "messages-reader__header";

                        const readerSubject =
                            document.createElement("h3");

                        readerSubject.className =
                            "messages-reader__subject";

                        readerSubject.textContent =
                            message.objet;

                        const readerClose =
                            document.createElement("button");

                        readerClose.type = "button";

                        readerClose.className =
                            "messages-reader__close";

                        readerClose.setAttribute(
                            "aria-label",
                            "Fermer le message"
                        );

                        readerClose.textContent = "×";

                        const readerContent =
                            document.createElement("p");

                        readerContent.className =
                            "messages-reader__content";

                        readerContent.textContent =
                            message.contenu;

                        readerClose.addEventListener(
                            "click",
                            showReceivedMessages
                        );

                        readerHeader.append(
                            readerSubject,
                            readerClose
                        );

                        messageReader.append(
                            readerHeader,
                            readerContent
                        );

                        messagesList.appendChild(
                            messageReader
                        );
                    }
                );

                row.append(
                    selector,
                    messageButton
                );

                messagesList.appendChild(row);
            }
        );

        /* ==============================================
           SUPPRESSION DES MESSAGES REÇUS
        ============================================== */

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "messages-delete-button";

        deleteButton.textContent = "Supprimer";

        deleteButton.addEventListener(
            "click",
            async () =>
            {
                if (isTeacherMessagingBlocked())
                {
                    return;
                }

                const selectedMessages =
                    messagesList.querySelectorAll(
                        ".messages-list-selector:checked"
                    );

                const messageIds =
                    Array.from(selectedMessages).map(
                        (selector) =>
                            Number(selector.value)
                    );

                if (messageIds.length === 0)
                {
                    return;
                }

                deleteButton.disabled = true;

                try
                {
                    await deleteReceivedMessages(messageIds);

                    if (isTeacherMessagingBlocked())
                    {
                        return;
                    }

                    await showReceivedMessages();

                    if (
                        messagesModal.classList.contains("is-open")
                    )
                    {
                        await updateMessageCounters();
                    }
                }
                catch (error)
                {
                    console.error(error);
                    notifyTeacherApiUnavailable(error);
                }
                finally
                {
                    deleteButton.disabled =
                        isTeacherMessagingBlocked();
                }
            }
        );

        messagesList.appendChild(deleteButton);
    }
    catch (error)
    {
        console.error(error);

        displayMessagingError(
            messagesList,
            error,
            "Impossible de récupérer les messages reçus."
        );
    }
}


/* ==========================================================
   AFFICHAGE DES MESSAGES ENVOYÉS
========================================================== */

async function showSentMessages()
{
    if (isTeacherMessagingBlocked())
    {
        return;
    }

    messagesForm.hidden = true;
    messagesList.hidden = false;

    messagesList.replaceChildren();

    try
    {
        const messages =
            await getSentMessages();

        if (isTeacherMessagingBlocked())
        {
            return;
        }

        if (messages.length === 0)
        {
            const emptyMessage =
                document.createElement("p");

            emptyMessage.textContent =
                "Aucun message envoyé.";

            messagesList.appendChild(emptyMessage);

            return;
        }

        messages.forEach(
            (message) =>
            {
                const row =
                    document.createElement("div");

                row.className =
                    "messages-list-row";

                const selector =
                    document.createElement("input");

                selector.type = "checkbox";

                selector.className =
                    "messages-list-selector";

                selector.value = message.id;

                selector.setAttribute(
                    "aria-label",
                    `Sélectionner le message ${message.objet}`
                );

                const messageItem =
                    document.createElement("div");

                messageItem.className =
                    "messages-list-item";

                const subject =
                    document.createElement("span");

                subject.className =
                    "messages-list-item__subject";

                subject.textContent =
                    message.objet;

                const content =
                    document.createElement("span");

                content.className =
                    "messages-list-item__content";

                content.textContent =
                    message.contenu;

                messageItem.append(
                    subject,
                    content
                );

                row.append(
                    selector,
                    messageItem
                );

                messagesList.appendChild(row);
            }
        );

        /* ==============================================
           SUPPRESSION DES MESSAGES ENVOYÉS
        ============================================== */

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.className =
            "messages-delete-button";

        deleteButton.textContent = "Supprimer";

        deleteButton.addEventListener(
            "click",
            async () =>
            {
                if (isTeacherMessagingBlocked())
                {
                    return;
                }

                const selectedMessages =
                    messagesList.querySelectorAll(
                        ".messages-list-selector:checked"
                    );

                const messageIds =
                    Array.from(selectedMessages).map(
                        (selector) =>
                            Number(selector.value)
                    );

                if (messageIds.length === 0)
                {
                    return;
                }

                deleteButton.disabled = true;

                try
                {
                    await deleteSentMessages(messageIds);

                    if (isTeacherMessagingBlocked())
                    {
                        return;
                    }

                    await showSentMessages();

                    if (
                        messagesModal.classList.contains("is-open")
                    )
                    {
                        await updateMessageCounters();
                    }
                }
                catch (error)
                {
                    console.error(error);
                    notifyTeacherApiUnavailable(error);
                }
                finally
                {
                    deleteButton.disabled =
                        isTeacherMessagingBlocked();
                }
            }
        );

        messagesList.appendChild(deleteButton);
    }
    catch (error)
    {
        console.error(error);

        displayMessagingError(
            messagesList,
            error,
            "Impossible de récupérer les messages envoyés."
        );
    }
}


/* ==========================================================
   NOUVEAU MESSAGE
========================================================== */

async function showNewMessageForm()
{
    if (isTeacherMessagingBlocked())
    {
        return;
    }

    messagesList.hidden = true;
    messagesForm.hidden = false;

    messagesFormMessage.textContent = "";

    messagesRecipient.replaceChildren();

    try
    {
        const recipients =
            await getMessageRecipients();

        if (isTeacherMessagingBlocked())
        {
            return;
        }

        recipients.forEach(
            (recipient) =>
            {
                const option =
                    document.createElement("option");

                option.value = recipient.id;

                option.dataset.type =
                    recipient.type;

                option.textContent =
                    `${recipient.prenom} ${recipient.nom}`;

                messagesRecipient.appendChild(option);
            }
        );
    }
    catch (error)
    {
        console.error(error);

        if (notifyTeacherApiUnavailable(error))
        {
            return;
        }

        messagesFormMessage.textContent =
            isMessagesServerUnavailable(error)
                ? "Connexion au serveur impossible. Veuillez réessayer ultérieurement."
                : "Impossible de récupérer le destinataire.";
    }
}


/* ==========================================================
   ENVOI DU MESSAGE
========================================================== */

messagesForm.addEventListener(
    "submit",
    async (event) =>
    {
        event.preventDefault();

        if (isTeacherMessagingBlocked())
        {
            return;
        }

        messagesFormMessage.classList.remove(
            "messages-form-message--success",
            "messages-form-message--error"
        );

        messagesFormMessage.textContent = "";

        const selectedOption =
            messagesRecipient.options[
                messagesRecipient.selectedIndex
            ];

        if (!selectedOption)
        {
            messagesFormMessage.classList.add(
                "messages-form-message--error"
            );

            messagesFormMessage.textContent =
                "Destinataire indisponible.";

            return;
        }

        const subject =
            messagesSubject.value.trim();

        const content =
            messagesContent.value.trim();

        if (!subject || !content)
        {
            messagesFormMessage.classList.add(
                "messages-form-message--error"
            );

            messagesFormMessage.textContent =
                "L'objet et le message sont obligatoires.";

            return;
        }

        messagesSendButton.disabled = true;

        try
        {
            await sendMessage(
                selectedOption.dataset.type,
                selectedOption.value,
                subject,
                content
            );

            if (isTeacherMessagingBlocked())
            {
                return;
            }

            messagesForm.reset();

            messagesFormMessage.classList.add(
                "messages-form-message--success"
            );

            messagesFormMessage.textContent =
                "Message envoyé.";

            await updateMessageCounters();
        }
        catch (error)
        {
            console.error(error);

            if (notifyTeacherApiUnavailable(error))
            {
                return;
            }

            messagesFormMessage.classList.add(
                "messages-form-message--error"
            );

            messagesFormMessage.textContent =
                isMessagesServerUnavailable(error)
                    ? "Connexion au serveur impossible. Veuillez réessayer ultérieurement."
                    : "Impossible d'envoyer le message.";
        }
        finally
        {
            messagesSendButton.disabled =
                isTeacherMessagingBlocked();
        }
    }
);


/* ==========================================================
   ÉVÉNEMENTS
========================================================== */

messagesButton.addEventListener(
    "click",
    openMessagesModal
);

teacherMessagesButton.addEventListener(
    "click",
    openMessagesModal
);

messagesModalClose.addEventListener(
    "click",
    closeMessagesModal
);

messagesReceivedButton.addEventListener(
    "click",
    showReceivedMessages
);

messagesSentButton.addEventListener(
    "click",
    showSentMessages
);

messagesNewButton.addEventListener(
    "click",
    showNewMessageForm
);
