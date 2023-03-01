import client from "../database/config.js";

export const getDashboardCount = ("/getDashboardCount", async(req, res) => {

    try {
        const overall_user = await client.query(`select count(*) from users;`);
        const active_user = await client.query(`select count(*) from users where status = 1;`);
        const inactive_user = await client.query(`select count(*) from users where status = 0;`);
        const overall_article = await client.query(`select count(*) from article, journal WHERE journal.article_id = article.article_id;`);
        const chart_view_user_lastmonth = await client.query(`
        SELECT count(*) from users where to_char(created_date,'yyyy-mm') = to_char(date_trunc('month', current_date - interval '1 month'),'yyyy-mm');
        `)
        res.json({
            "status":200,
            "data":{
                "overall_user": overall_user.rows[0].count,
                "active_user": active_user.rows[0].count,
                "inactive_user": inactive_user.rows[0].count,
                "overall_article": overall_article.rows[0].count,
                "chart_view_user_lastmonth": chart_view_user_lastmonth.rows[0].count
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});