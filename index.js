import express from "express";
import cors from "cors";
import client from "./database/config.js";
import route from "./routes/Article.js";
import bodyParser from "body-parser";
import multer from "multer";
import xmlparser from "express-xml-bodyparser";
// import { logger, errorLogger } from "express-winston";
// import { format, transports } from "winston";
const app = express();
const forms = multer();
app.use(cors());

//setting data limit
app.use(express.json({ limit: '500mb' }));
app.use(xmlparser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(forms.any());

// app.use(errorLogger({
//     transports: [
//       new transports.Console(),
//       new transports.File({ filename: 'logs/errors.log' })
//     ],
//     format: format.combine(
//       format.colorize(),
//       format.json()
//     ),
//     meta: true, // optional: control whether you want to log the meta data about the request (default to true)
//     msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
//     expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
//     colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
//     ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
//     }
// ));

client.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
app.use("/api", route);


app.listen(5000, () => {
    console.log("server has started on port 5000");
});