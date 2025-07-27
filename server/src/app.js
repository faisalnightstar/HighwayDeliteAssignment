import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN_PRODUCTION || process.env.CORS_ORIGIN,
        credentials: true, //access-control-allow-credentials
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], // add here all http methods you use
        allowedHeaders: ["Content-Type", "Authorization"], // add here all headers your
    })
);

app.use(
    express.json({
        limit: "500kb",
    })
);
app.use(express.urlencoded({ extended: true, limit: "500kb" })); //when fetching data from url
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import tripRouter from "./routes/trip.routes.js";
import eventRouter from "./routes/event.routes.js";
import reviewRouter from "./routes/review.routes.js";

import { errorMiddleware } from "./utils/ApiError.js";

// routes declaration
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/users/trips", tripRouter);
app.use("/api/v1/users/events", eventRouter);
app.use("/api/v1/users", reviewRouter);

//this middleware should be end.
app.use(errorMiddleware);
export { app };
