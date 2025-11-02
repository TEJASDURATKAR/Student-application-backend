import path from "path";
import { Sequelize, QueryTypes } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const env = process.env.NODE_ENV || "local";
const envData = require(path.join(__dirname, "./", `${env}.config`));

console.log("envData", envData)

export const Op = Sequelize.Op;
export { QueryTypes };



export const sequelize = new Sequelize(
  envData.config.db.database,
  envData.config.db.username,
  envData.config.db.password,
  {
    dialect: "postgres",
    host: envData.config.db.host,
    //   port: envData.config.db.port,
    //   dialectOptions: {
    //     ssl: {
    //         require: true,
    //         rejectUnauthorized: false // For self-signed certificates
    //     }
    // },
    logging: false// Configure Sequelize to log to a file
  }
);

export const isDBConnected = async () => {
  try {
    await sequelize.authenticate();
    console.log("CONNECTION SUCCESS TO DB", env);
  } catch (err) {
    console.log("UNABLE TO CONNECT TO DB", err);
  }
};