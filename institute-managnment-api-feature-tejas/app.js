import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { isDBConnected } from "./config/db.config";
import { userRouter } from "./routes/user.routes";
import loggerMiddleware from "./middlewares/loggerMiddleware";
import { authRouter } from "./routes/authRoutes";
import { enquiryRouter } from "./routes/enquiryRoutes";
import { mailRouter } from "./routes/mailRoute";
import { customerRouter } from "./routes/customerRoutes";
import { roleRouter } from "./routes/roleRoutes";
import { teacherRouter } from "./routes/teacherRoutes";
import { courseRouter } from "./routes/coursesRoutes";
import { batchesRouter } from "./routes/batchesRouter.js";
import { admissionRouter } from "./routes/admissionRoutes.js";

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});
// app.use(forceSsl());

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.static("files"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
isDBConnected();
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(loggerMiddleware);

app.use("/api/v1/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/enquiries", enquiryRouter);
app.use("/api", mailRouter);
app.use("/api/customers", customerRouter);
app.use("/api/roles", roleRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/courses", courseRouter);
app.use("/api/batches", batchesRouter);
app.use("/api/admissions", admissionRouter);

// if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging") {
app.use(express.static(path.join(__dirname, "frontend")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
});
// }
// else {
//   app.get("/", (req, res) => {
//     res.send("API is running....");
//   });
// }

export default app;
