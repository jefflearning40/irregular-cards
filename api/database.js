"use strict";

const mysql = require("mysql2");


const database = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "irregular_cards"
});


database.connect(
    (error) =>
    {
        if (error)
        {
            console.error(
                "Erreur de connexion MySQL :",
                error.message
            );

            return;
        }


        console.log(
            "Connexion MySQL réussie"
        );
    }
);


module.exports = database;