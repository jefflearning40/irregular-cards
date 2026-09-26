"use strict";

require("dotenv").config();

const bcrypt =
    require("bcrypt");

const database =
    require("./database");


/* ==========================================================
   PREMIER ADMINISTRATEUR
========================================================== */

const nom =
    "Admin";

const prenom =
    "Principal";

const email =
    "admin@irregular-cards.fr";

const motDePasse =
    "Admin1234!";


/* ==========================================================
   VÉRIFICATION DE L'E-MAIL
========================================================== */

database.query(
    `
    SELECT id
    FROM administrateur
    WHERE email = ?
    `,
    [
        email
    ],
    async (error, results) =>
    {
        if (error)
        {
            console.error(
                "Erreur lors de la vérification :",
                error.message
            );

            database.end();

            return;
        }


        if (results.length > 0)
        {
            console.log(
                "Un administrateur avec cet e-mail existe déjà."
            );

            database.end();

            return;
        }


        try
        {
            /* ==============================================
               HASH DU MOT DE PASSE
            ============================================== */

            const hashedPassword =
                await bcrypt.hash(
                    motDePasse,
                    12
                );


            /* ==============================================
               CRÉATION DE L'ADMINISTRATEUR
            ============================================== */

            database.query(
                `
                INSERT INTO administrateur
                (
                    nom,
                    prenom,
                    email,
                    mot_de_passe
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    nom,
                    prenom,
                    email,
                    hashedPassword
                ],
                (insertError) =>
                {
                    if (insertError)
                    {
                        console.error(
                            "Erreur lors de la création :",
                            insertError.message
                        );

                        database.end();

                        return;
                    }


                    console.log(
                        "Administrateur créé avec succès."
                    );

                    console.log(
                        `E-mail : ${email}`
                    );


                    database.end();
                }
            );
        }
        catch (hashError)
        {
            console.error(
                "Erreur lors du hash du mot de passe :",
                hashError.message
            );


            database.end();
        }
    }
);