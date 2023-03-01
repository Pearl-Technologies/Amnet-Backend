import client from "../database/config.js";
import { readFileSync, existsSync, writeFile, unlink } from "fs";
const savePath = process.cwd() + '/media/slides/';

export const getSildePic = ("/getSildePic", async(req, res) => {
    
    try {
        let arr = [];
        let slideget = await client.query(`SELECT * from webslidepic where status = 1 limit 5`);
        slideget = slideget.rows;
        if(slideget.length===0) {
            res.json({ 
                "status": 200,
                "message": "No Slides Available"
             });
        }
        else {
            for(let i=0; i<slideget.length; i++){
                let imageBuffer = readFileSync(savePath + slideget[i].name);
                let base64String = imageBuffer.toString('base64');
                arr.push(base64String);
            }
            res.json({ 
                "status": 200,
                "message": arr
             });
        }
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const postSildePic = ("/postSildePic", async(req, res) => {
    
    try {
        let arr = [];
        let files = req.files;
        let slideget = await client.query(`SELECT * from webslidepic where status = 1 limit 5`);
        slideget = slideget.rows;
        if(slideget.length>=5) {
            res.json({ 
                "status": 200,
                "message": "Delete the exist slides to update new slides"
             });
        }
        else {
            for(let i=0; i<files.length; i++){
                let sample = await client.query(`INSERT INTO webslidepic (name, path, created_by) values($1, $2, $3) RETURNING *`,
                    [files[i].originalname, savePath+files[i].originalname, 1])
                writeFile(savePath+files[i].originalname, files[i].buffer, async (err) => {
                    if (err) throw err;
                    console.log('Raw body saved to file');
                    }
                );
            }
            res.json({ 
                "status": 200,
                "message": arr
             });
        }
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export const deleteSildePic = ("/deleteSildePic", async(req, res) => {
    
    try {
        const {
            id
        } = req.query
        let sample = await client.query(`DELETE from webslidepic where id=${id}`)
        let sampleget = await client.query(`SELECT * from webslidepic where id=${id} and status=1`)
        if (existsSync(savePath + sampleget.rows[0].name)) {
            unlink(savePath + sampleget.rows[0].name, (err) => {
                if (err) throw err;
                console.log(`${savePath+doiNew+'.xml'} was deleted`);
              });
            console.log('file exists');
        }
        res.json({ 
            "status": 200,
            "message": "Slides Deleted Successfully"
            });
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
