"use strict";
require("./config/env");
const express = require("express");
const cors = require("cors");
const { createMongoConnection } = require("./adaptor");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT;
let  mongoclient;
const init = async () => {
  try {
    console.log("Server is running on [%s] environment", process.env.NODE_ENV);
    mongoclient = await createMongoConnection();

    // starting express server
    await startExpressServer();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const startExpressServer = async () => {
  app.disable("etag");
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  // all routes
//   const routes = require("./routes");
  app.use("/v1", routes);

  // so all the API's can use the connection.
  app.request.mongoclient = mongoclient;

  app.get("/", function (req, res) {
    res.status(200).send({ message: "API Routes are up and working." });
  });

  app.listen(PORT, () => {
    console.log("server is running on port : %s", PORT);
  });
};

process.on("uncaughtException", (error, source) => {
  console.log(error, source);
});

// initializing server
init();
