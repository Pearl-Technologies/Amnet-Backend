import client from "../database/config.js";
export const copyRightsTemplate = ("/copyRightsTemplate", async(req, res) => {

    const {
        link,
        body,
        title
    } = req.body;
    console.log(req.body);

    try {
        await client.query(
            `INSERT INTO copyrightstemplate (id, link, body, title, created_by) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *`, [id, link, body, title, 1]
        );
        res.json({
            "response":"Created Copyrights Template",
            "link":link
        });
    } catch (err) {
        console.error(err);
    }

});


export const getCopyRightsTemplateAdmin = ("/getcopyRightsTemplateAdmin", async(req, res) => {

    try {
        const {
            limit,
            page
        } = req.query
        const data = await client.query(
            `SELECT * FROM copyrightstemplate limit ${limit} offset ${((page * limit)-limit)}`
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

export const deleteCopyRightsTemplateAdmin = ("/deleteCopyRightsTemplateAdmin", async(req, res) => {

    try {
        const {
            q
        } = req.query
        const data = await client.query(
            `DELETE FROM copyrightstemplate where id='${q}'`
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

export const copyRightsTemplateAdvance = ("/copyRightsTemplateAdvance", async(req, res) => {

    const {
        q
    } = req.query;
    console.log(req.query);

    try {
        let idget = await client.query(
            `SELECT * from copyrightstemplate where status=1 and link='${q}'`
        );
        idget.rows
        res.json(idget.rows);
    } catch (err) {
        console.error(err);
    }

});