import bodyParser from "body-parser";
import express from "express";
import orgRouter from "./routes/organizations";
import cors from "cors";

const app = express();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use("/api/organisations", orgRouter);

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err: Error) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
