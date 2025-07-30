import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport-setup.js";

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
app.use(passport.initialize());

// routes import
import userRouter from "./routes/user.routes.js";
import noteRouter from "./routes/note.route.js"
import { errorMiddleware } from "./utils/ApiError.js";

// routes declaration
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/notes", noteRouter);




//this middleware should be end.
app.use(errorMiddleware);
export { app };
