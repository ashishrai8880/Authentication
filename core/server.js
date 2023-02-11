const printEnvDetails = require("./print_env");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = YAML.load("./utils/swagger/swagger.yaml");
const basicAuth = require('express-basic-auth')
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
// importing auth routes
const authRoute = require("../api/v1/routes/auth");

//importing user routes
const userRoute = require("../api/v1/routes/user");

//import asset route
const assetRoute = require("../api/v1/routes/asset_route")

//importing grouping_packs routes
const packageGroupRoute = require("../api/v1/routes/package_groups");

//importing grouping_packs routes
const tabRoute = require("../api/v1/routes/tabs");

// importing admin routes
//Not in Use
//const adminAuthRoute = require("../api/v1/routes/admin/auth");

i18next
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        fallbackLng: "en",
        backend: {
            loadPath: "./locales/{{lng}}/translation.json",
        },
    });

const {
    MAX_REQ_BODY_SIZE,
    PUBLIC_DIRECTORY,
} = require("../core/config").EXPRESS_CONFIG;

function _configureServer(app) {
  // console.log("Configuring server...");

    // i18next init
    app.use(middleware.handle(i18next));

    //  body parser
    app.use(express.json());
    // app.use(express.static(__dirname + '/docs'));

    // allows rendering of static files in this directory
    app.use(express.static(path.join(__dirname, PUBLIC_DIRECTORY)));

    // adds helmet module to express server
    // Helmet helps you secure your Express apps by setting various HTTP headers.
    // It's not a silver bullet, but it can help!
    app.use(helmet());

    // Creating a limiter by calling rateLimit function with options:
    // max contains the maximum number of request and windowMs
    // contains the time in millisecond so only max amount of
    // request can be made in windowMS time.
    const limiter = rateLimit({
        max: 60,
        windowMs: 60 * 1000,
        message: "Too many request from this IP",
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Add the limiter function to the express middleware
    // so that every request coming from user passes
    // through this middleware.
    app.use(limiter);

    // restricts the size of json body to 200kb
    app.use(bodyParser.json({ limit: MAX_REQ_BODY_SIZE }));
    app.use(bodyParser.urlencoded({ extended: true }));

    // for websites, to allow cross origin api access
    app.use(cors());

    // logs request to console
    console.log("Setting up request logging...");
    app.use((req, _, next) => {
        if (!req.url.includes("/uploads")) {
            console.log(
                `\nReq: ${req.method} ${req.url} ${new Date().toString()} ${
          req.connection.remoteAddress
        }`
            );
        }
        next();
    });

    _setRoutes(app);
}

function _setRoutes(app) {
  console.log("Setting up routes for api v1");
  //  auth middleware
  app.use("/api/v1/auth", authRoute);
  //  user middleware
  app.use("/api/v1/user", userRoute);
  app.use("/api/v1/package_group", packageGroupRoute);
  app.use("/api/v1/tabdata", tabRoute);
  app.use("/api/v1/assetdetail" , assetRoute)

  // admin routes
  // auth middleware
  //app.use("/api/v1/admin/auth", adminAuthRoute);

  app.use("/explorer", basicAuth({
    users: {'username': 'password'},
    challenge: true,
}), swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    _handleInvalidRoutes(app);
}

function _handleInvalidRoutes(app) {
    // handling 404 routes
    /* eslint-disable no-alert, no-unused-vars, no-console */
    app.use(function(req, res, next) {
        res.status(404);

        // respond with html page
        if (req.accepts("html")) {
            res.send("<h2> Welcome to Digivive Services Pvt. Ltd.</h2>");
            return;
        }

        // respond with json
        if (req.accepts("json")) {
            res.send({ error: "Route not found" });
            return;
        }

        // default to plain-text. send()
        res.type("txt").send("Route not found");
        return;
    });
}

module.exports.initServer = (app, appConfig) => {
    // setup the server before starting it
    _configureServer(app);

    console.log("Starting server...");
    app.listen(appConfig.app.port, (err) => {
        if (err) {
            // server run failed
            console.log(`Failed to listen on port ${appConfig.app.port}`);
            console.error(err);
            process.exit(1);
        } else {
            // server run success
            console.log(`Listening on port ${appConfig.app.port}`);
            printEnvDetails(appConfig);
        }
    });
};