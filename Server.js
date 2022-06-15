import express from "express";
import dotEnv from "dotenv";
import connectToDB from "./Backend/config/db.js";
import producRoutes from "./Backend/routes/productRoutes.js";
import userRoutes from "./Backend/routes/userRoutes.js";
import orderRoutes from "./Backend/routes/orderRoutes.js";
import morgan from "morgan";
import path from "path";

//ErrorHandlers
import {
  errorHandler,
  notFound,
} from "./Backend/Middleware/errorMiddleware.js";

//File Upload Middleware
import { fileUpload } from "./Backend/Middleware/fileUpload.js";

const app = express();
dotEnv.config();

connectToDB();

//Body parse
app.use(express.json());

const __dirname = path.resolve();

//Serve Images Statically
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "/uploads/images"))
);

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//CORS ERROR
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Test API
app.get("/api/islive", (req, res) => {
  res.send("Api is Working");
});

//Routes
app.use("/api/products", producRoutes);

app.use("/api/users", userRoutes);

app.use("/api/orders", orderRoutes);

//Send Config or API key
app.get("/api/config/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID);
});

//Upload a Image
app.post("/api/upload", fileUpload.single("image"), (req, res) => {
  const path = "/" + req.file.path;
  res.send(path);
});

//Production Mode
if (process.env.NODE_ENV == "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

//404 error
app.use(notFound);

//Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`listen on port ${PORT} in ${process.env.NODE_ENV}`)
);
