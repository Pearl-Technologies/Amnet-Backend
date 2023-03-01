import client from "../database/config.js";
import { writeFile, existsSync, unlink, createWriteStream } from "fs";
const savePath = process.cwd() + '/media/copyrights_log/';

export const companyProfile = ("/companyProfile", async(req, res) => {

    const {
        name,
        email,
        mobile_number,
        statement,
        social_media_link,
        footer_description
    } = req.body;
    var files;
    console.log(req.body);
    let bool = 0;
    try{
        files = req.files;
        bool = 1;
    }
    catch{
        bool = 0;
    }
    try {
        let query = await client.query(`SELECT * from companyprofile where status = 1`);
        query = query.rows;
        if(query.length===0) {
            if (bool == 0) {
                await client.query(
                    `INSERT INTO companyprofile (name, email, mobile_number, statement, social_media_link, footer_description, created_by) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [name, email, mobile_number, statement, social_media_link, footer_description, 1]
                );
                res.status(200).json({"response":"Company Profile Created Successfully",});
            }
            else if (bool == 1) {
                await client.query(
                    `INSERT INTO companyprofile (name, email, mobile_number, statement, social_media_link, footer_description, logo_name, logo_path, created_by) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [name, email, mobile_number, statement, social_media_link, footer_description, files[0].originalname, savePath+files[0].originalname, 1]
                );
                writeFile(savePath+files[0].originalname, files[0].buffer, async (err) => {
                    if (err) throw err;
                    console.log('Raw body saved to file');
                    }
                );
                res.status(200).json({"response":"Company Profile Created Successfully",});
            }
        }
        else{
            res.status(500).json({"response":"Delete The Old Company Profile To Create New One",});
        }
    } catch (err) {
        console.error(err);
    }

});


export const getCompanyProfileAdmin = ("/getCompanyProfileAdmin", async(req, res) => {

    try {
        const {
            limit,
            page
        } = req.query
        const data = await client.query(
            `SELECT * FROM companyprofile limit ${limit} offset ${((page * limit)-limit)}`
        );
        res.json({
            "status":200,
            "data":data.rows
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const deleteCompanyProfileAdmin = ("/deleteCompanyProfileAdmin", async(req, res) => {

    try {
        const {
            q
        } = req.query
        const data = await client.query(
            `DELETE FROM companyprofile where id='${q}'`
        );
        res.json({
            "status":200,
            "message":"Delete Succesfully"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const companyProfileAdvance = ("/companyProfileAdvance", async(req, res) => {

    const {
        q
    } = req.query;
    console.log(req.query);

    try {
        let idget = await client.query(
            `SELECT * from companyprofile where status=1 and link='${q}'`
        );
        idget.rows
        res.json(idget.rows);
    } catch (err) {
        console.error(err);
    }

});