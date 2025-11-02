"use strict";
require("dotenv").config();
require("@babel/polyfill");
require("@babel/register");

const app = require("./app").default;
const path = require("path");
const http = require("http");
const https = require("https");
const { sequelize } = require("./config/db.config");  // import your sequelize here!

const server = http.createServer(app);

const env = process.env.NODE_ENV || "local";
const envData = require(path.join(__dirname, "./config", `${env}.config`));

const PORT = envData.config?.port;

sequelize.authenticate()
    .then(() => {
        console.log("✅ CONNECTION SUCCESS TO DB local");

        // Sync all models (creates tables if missing)
        return sequelize.sync({ alter: true });  // in prod you can use { alter: false }
    })
    .then(() => {
        console.log("✅ All models synced to DB");

        if (process.env.NODE_ENV === "production") {
            // In production: use https.createServer(https_options, app)
            // Example:
            /*
            const https_options = {
              key: fs.readFileSync("/path/to/key"),
              cert: fs.readFileSync("/path/to/cert"),
              ca: [...]
            };
            https.createServer(https_options, app).listen(PORT, () => {
              console.log(`🚀 Server running on port ${PORT} (production HTTPS)`);
            });
            */
            // For now simple:
            https.createServer(app).listen(PORT);
            https.createServer(app).on("listening", () => {
                console.log(`🚀 Server running on port ${PORT} (production)`);
            });

        } else {
            // Dev server HTTP
            server.listen(PORT);
            server.on("listening", () => {
                console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
            });
        }

    })
    .catch((err) => {
        console.error("❌ DB connection or sync error:", err);
    });
