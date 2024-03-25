import express from "express";
import { router as index } from "./api/index";
import { router as user } from "./api/user";
import { router as img } from "./api/img";
import { router as vote } from "./api/vote";
import cors from "cors";
import bodyParser from "body-parser";


export const app = express();
app.use(
    cors({
      origin: "*",
    })
  );
app.use(bodyParser.json());
app.use("/", index);
app.use("/user", user);
app.use("/img",img );
app.use("/vote",vote );
