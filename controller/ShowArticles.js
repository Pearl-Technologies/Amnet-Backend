import client from "../database/config.js";

export const ShowArticles=("/", async(req, res)=>{
    console.log("hello")
    try {
        const searchByPub_date = await client.query(
            `SELECT pub_date from article`,            
        );
        res.json(searchByPub_date.rows);
    } catch (error) {
        console.log(error);
    }
});

export const getArticlesAdmin=("/getArticlesAdmin", async(req, res)=>{
    try {
        const {
            limit,
            page,
            search
        } = req.query
        var getData;
        var count;
        if (search != "" && search != undefined) {
            getData = await client.query(
                `select *, case when 
                (extra_meta->>'volume' = '' is not TRUE and extra_meta->>'volume' = null is not TRUE AND 
                extra_meta->>'fpage' = '' is not TRUE and extra_meta->>'fpage' = null is not TRUE AND 
                extra_meta->>'issue' = '' is not TRUE and extra_meta->>'issue' = null is not true) then 1
                when (extra_meta->>'volume' = '' is TRUE OR extra_meta->>'volume' = null is TRUE OR 
                extra_meta->>'fpage' = '' is TRUE OR extra_meta->>'fpage' = null is TRUE OR 
                extra_meta->>'issue' = '' is TRUE OR extra_meta->>'issue' = null is true) then 2 
                end as is_published from article, journal WHERE journal.article_id = article.article_id AND
                document_idx @@ plainto_tsquery('${search}') order by is_published limit ${limit} offset ${((page * limit)-limit)}`
            );    
            count = await client.query(
                `select Count(*) from article, journal WHERE journal.article_id = article.article_id AND
                document_idx @@ plainto_tsquery('${search}')`
            );    
        }
        else {
            getData = await client.query(
                `select *, case when 
                (extra_meta->>'volume' = '' is not TRUE and extra_meta->>'volume' = null is not TRUE AND 
                extra_meta->>'fpage' = '' is not TRUE and extra_meta->>'fpage' = null is not TRUE AND 
                extra_meta->>'issue' = '' is not TRUE and extra_meta->>'issue' = null is not true) then 1
                when (extra_meta->>'volume' = '' is TRUE OR extra_meta->>'volume' = null is TRUE OR 
                extra_meta->>'fpage' = '' is TRUE OR extra_meta->>'fpage' = null is TRUE OR 
                extra_meta->>'issue' = '' is TRUE OR extra_meta->>'issue' = null is true) then 2 
                end as is_published from article, journal WHERE journal.article_id = article.article_id 
                order by is_published limit ${limit} offset ${((page * limit)-limit)}`,            
            );    
            count = await client.query(
                `select Count(*) from article, journal WHERE journal.article_id = article.article_id`
            );    
        }
        
        res.json({ 
            "status": 200,
            "data": getData.rows,
            "count": count.rows[0].count
         });
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const deleteArticlesAdmin=("/deleteArticlesAdmin", async(req, res)=>{
    try {
        const {
            q
        } = req.query;
        await client.query(
            `delete from article where article_id='${q}';`,
        );
        await client.query(
            `delete from journal  where article_id='${q}';`,
        );
        res.json({ 
            "status": 200,
            "message": "Deleted Succesfully"
         });
    }     
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});