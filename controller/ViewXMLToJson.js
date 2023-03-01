import client from "../database/config.js";
import { xml2json } from "xml-js";
import { readFile, readFileSync } from "fs";
const savePath = process.cwd() + '/uploads/';

export const ViewXMLToJson = ("/ViewXMLToJson", async (req, res) => {

    const {
        q
    } = req.query
    try{
        if(q){
            readFile(savePath+q+'.xml', (err, data) => {
                if (err) throw err;
                // console.log(data);
              });
            let xml = readFileSync(savePath+q+'.xml', { encoding: 'utf8', flag: 'r' });
            // console.log(xml);
            var xmlData = xml2json(xml, {
                compact: true,
                space: 4
            });
            // console.log(xmlData);
            res.send(xmlData)
        }
    }
    catch{

    }
})