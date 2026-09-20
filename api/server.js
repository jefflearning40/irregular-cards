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