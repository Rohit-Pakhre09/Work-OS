import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./src/middleware/error.middleware.js";
import authRouter from "./src/routes/auth.routes.js";
import userRouter from "./src/routes/user.routes.js";
import roleRouter from "./src/routes/role.routes.js";
import permissionRouter from "./src/routes/permission.routes.js";


export const app = express();

app.use(express.json());
app.use(cors({
    origin: [process.env.CORS_ORIGIN],
    credentials: true
}));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/roles", roleRouter);
app.use("/api/permissions", permissionRouter);

app.use(errorHandler);
