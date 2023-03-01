import client from "../database/config.js";
export const ViewArchives = ("/viewArchives", async(req, res) => {
    var findUgly;
    var findEarly;

    const {q,year,page,limit} = req.query;

    try {
        if (q == '1') {
            const years = await client.query(
                `SELECT  substring(pub_date,1,4) as year
                FROM article, journal WHERE journal.article_id = article.article_id  
                AND ((extra_meta->>'volume' = '') is not TRUE and (extra_meta->>'volume' = null) is not TRUE) 
                AND ((extra_meta->>'fpage' = '') is not TRUE and (extra_meta->>'fpage' = null) is not TRUE)
                AND ((extra_meta->>'issue' = '') is not TRUE and (extra_meta->>'issue' = null) is not true)
                group by substring(pub_date,1,4)`
            );
            res.json(years.rows);

        } else if (q == '2') {
            const yearBasedData = await client.query(
                `SELECT  substring(pub_date,6,7) as month, count(substring(pub_date,6,7))
                FROM article, journal WHERE journal.article_id = article.article_id  
                AND ((extra_meta->>'volume' = '') is not TRUE and (extra_meta->>'volume' = null) is not TRUE) 
                AND ((extra_meta->>'fpage' = '') is not TRUE and (extra_meta->>'fpage' = null) is not TRUE)
                AND ((extra_meta->>'issue' = '') is not TRUE and (extra_meta->>'issue' = null) is not true)
                and (to_tsvector(pub_date) @@ plainto_tsquery('${year}')) group by substring(pub_date,6,7)`
            );

            res.json(yearBasedData.rows);

        } else if (q == '3') {
            const yearBasedData = await client.query(
                `SELECT *, count(*)
                FROM article, journal WHERE journal.article_id = article.article_id  
                AND ((extra_meta->>'volume' = '') is not TRUE and (extra_meta->>'volume' = null) is not TRUE) 
                AND ((extra_meta->>'fpage' = '') is not TRUE and (extra_meta->>'fpage' = null) is not TRUE)
                AND ((extra_meta->>'issue' = '') is not TRUE and (extra_meta->>'issue' = null) is not true)
                and (to_tsvector(pub_date) @@ plainto_tsquery('${year}')) limit ${limit} offset ${((page * limit)-limit)}`
            );

            res.json(yearBasedData.rows);
        } else {
            findEarly = await client.query(
                `SELECT  *
                            FROM article, journal WHERE journal.article_id = article.article_id  
                            AND ((extra_meta->>'volume' = '') is not TRUE and (extra_meta->>'volume' = null) is not TRUE) 
                            AND ((extra_meta->>'fpage' = '') is not TRUE and (extra_meta->>'fpage' = null) is not TRUE)
                            AND ((extra_meta->>'issue' = '') is not TRUE and (extra_meta->>'issue' = null) is not true)`
            );
            findUgly = await client.query(
                `SELECT  *
                            FROM article, journal WHERE journal.article_id = article.article_id  
                            AND (((extra_meta->>'volume' = '') is TRUE OR (extra_meta->>'volume' = null) is TRUE) 
                            OR ((extra_meta->>'fpage' = '') is TRUE OR (extra_meta->>'fpage' = null) is TRUE)
                            OR ((extra_meta->>'issue' = '') is TRUE OR (extra_meta->>'issue' = null) is true))`
            );

            console.log(findEarly.rows);
            console.log(findUgly.rows);

            res.json({
                "Ugly": findUgly.rows,
                "Early": findEarly.rows,
            });
        }
    } catch (error) {
        res.json({
            status: 500,
            desc: "argument not correct"
        });
    };
});