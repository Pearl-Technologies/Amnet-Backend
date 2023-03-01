import client from "../database/config.js";
export const pageTemplate = ("/pageTemplate", async(req, res) => {

    const {
        link,
        header,
        body,
        footer
    } = req.body;
    console.log(req.body);

    try {
        await client.query(
            `INSERT INTO pagetemplate (id, link, header, body, footer, created_by, created_date, status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [id, link, header, body, footer, 1, date, 1]
        );
        res.json({
            "response":"Created page templated",
            "link":link
        });
    } catch (err) {
        console.error(err);
    }

});


export const getPageTemplateAdmin = (async(req, res) => {

    try {
        const {
            limit,
            page
        } = req.query
        const data = await client.query(
            `SELECT * FROM pagetemplate limit ${limit} offset ${((page * limit)-limit)}`
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

export const deletePageTemplateAdmin = ("/deletePageTemplateAdmin", async(req, res) => {

    try {
        const {
            q
        } = req.query
        const data = await client.query(
            `DELETE FROM pagetemplate where id='${q}'`
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

export const pageTemplateAdvance = ("/pageTemplate", async(req, res) => {

    const {
        q
    } = req.query;
    console.log(req.query);

    try {
        let idget = await client.query(
            `SELECT * from pagetemplate where status=1 and link='${q}'`
        );
        idget.rows
        res.json(idget.rows);
    } catch (err) {
        console.error(err);
    }

});