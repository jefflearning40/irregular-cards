"use strict";

require("dotenv").config();


/* ==========================================================
   IMPORTS
========================================================== */

const express = require("express");

const database = require("./database");

const professeurRoutes =
    require("./routes/professeur.routes");

const eleveRoutes =
    require("./routes/eleve.routes");

const sessionQuizRoutes =
    require("./routes/session_quiz.routes");

const erreurQuizRoutes =
    require("./routes/erreur_quiz.routes");

const progressionRoutes =
    require("./routes/progression.routes");

const revisionRoutes =
    require("./routes/revision.routes");

const authRoutes =
    require("./routes/auth.routes");

const statistiqueRoutes =
    require("./routes/statistique.routes");

    const administrateurRoutes =
    require("./routes/administrateur.routes");


/* ==========================================================
   APPLICATION
========================================================== */

const app = express();

const PORT = 3000;


/* ==========================================================
   MIDDLEWARES
========================================================== */

app.use(
    (request, response, next) =>
    {
        response.setHeader(
            "Access-Control-Allow-Origin",
            "http://127.0.0.1:5500"
        );

        response.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );

        response.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );

        if (request.method === "OPTIONS")
        {
            return response.sendStatus(204);
        }

        next();
    }
);


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


app.use(
    "/api/eleves",
    eleveRoutes
);


app.use(
    "/api/sessions-quiz",
    sessionQuizRoutes
);


app.use(
    "/api/erreurs-quiz",
    erreurQuizRoutes
);


app.use(
    "/api/progressions",
    progressionRoutes
);


app.use(
    "/api/revisions",
    revisionRoutes
);


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/statistiques",
    statistiqueRoutes
);

app.use(
    "/api/administrateur",
    administrateurRoutes
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