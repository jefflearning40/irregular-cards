"use strict";

const express = require("express");

const database = require("./database");

const app = express();

app.use(express.json());

const PORT = 3000;


app.get(
    "/api/test",
    (request, response) =>
    {
        response.json({
            message: "API irregular-cards fonctionne"
        });
    }
);


app.listen(
    PORT,
    () =>
    {
        console.log(
            `API démarrée sur le port ${PORT}`
        );
    }
);