import {getTime} from "./getTime.js";
import client from "../database/config.js";

export const bulkSearch=("/bulkSearch", async (req, res)=>{
    console.log(req.body)
    res.send("Hello")
})