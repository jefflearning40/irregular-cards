"use strict";


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const database = require("./database");

const professeurRoutes =
    require("./routes/professeur.routes");


/* ==========================================================
   APPLICATION
========================================================== */

const app = express();

const PORT = 3000;


/* ==========================================================
   MIDDLEWARES
========================================================== */

app.use(
    express.json()
);


/* ==========================================================
   ROUTES
========================================================== */

app.get(
    "/api/test",
    (request, response) =>
    {
        response.json({
            message: "API irregular-cards fonctionne"
        });
    }
);


app.use(
    "/api/professeurs",
    professeurRoutes
);


/* ==========================================================
   DÉMARRAGE DU SERVEUR
========================================================== */

app.listen(
    PORT,
    () =>
    {
        console.log(
            `API démarrée sur le port ${PORT}`
        );
    }
);