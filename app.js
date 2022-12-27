require("dotenv").config();
require("express-async-errors");

//extra security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

//Swagger
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./Swagger.yaml");

const express = require("express");

const app = express();

// error handler
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const connectDB = require("./db/connect");
const authRouter = require("./routes/auth");
const jobRouter = require("./routes/jobs");
const authenticatedUser = require("./middleware/authentication");
app.use(express.json());
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());

// extra packages

app.get("/", (req, res) => {
  res.send("<h1>jobs api</h1><a href='/api-docs'>documentation</a>");
});
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticatedUser, jobRouter);
app.get("/", (req, res) => {
  res.send("jobs api");
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();