import client from "../database/config.js";
export const addArticle = ("/addArticle", async(req, res) => {
    try {
        const { article } = req.body;
        const journal_id = article.front['journal-meta']['journal-id'];
        const journal_name = article.front['journal-meta']['journal-title-group']['journal-title'];
        const abbrev_journal_title = article.front['journal-meta']['journal-title-group']['abbrev-journal-title'];
        const publisher_name = article.front['journal-meta'].publisher['publisher-name'];
        const article_id = article.front['article-meta']['article-id'][0];
        const doi = article.front['article-meta']['article-id'][1];
        const article_category = article.front['article-meta']['article-categories']['subj-group'].subject;
        const article_title = article.front['article-meta']['title-group']['article-title'];
        const authName = article.front['article-meta']['contrib-group']['contrib'];
        const pub_month = article.front['article-meta']['pub-date'][0].month;
        const pub_year = article.front['article-meta']['pub-date'][0].year;
        const pub_date = pub_year + "-" + pub_month;
        const volume = article.front['article-meta'].volume;
        const issue = article.front['article-meta'].issue;
        const fpage = article.front['article-meta'].fpage;
        const lpage = article.front['article-meta'].lpage;
        const abstract = article.front['article-meta'].abstract.p.italic;
        const kwd_group = article.front['article-meta']['kwd-group'];
        //         // const ref_list = article?.back?.['ref-list'] ?? null;
        let author_name = ""
        let keywords = "";

        if (authName) {
            for (let i = 0; i < authName.length; i++) {
                if (author_name) {
                    author_name = author_name.concat(", ", authName[i].name['given-names'], author_name[i].name.surname);
                } else {
                    author_name = author_name.concat(authName[i].name['given-names'], author_name[i].name.surname);
                }
            }
        }

        if (kwd_group !== null && !kwd_group[0]) {
            for (let i = 0; i < kwd_group.kwd.length; i++) {
                if (keywords) {
                    keywords = keywords.concat(", ", kwd_group.kwd[i]);
                } else {
                    keywords = keywords.concat(kwd_group.kwd[i]);
                }
            }
        } else if (kwd_group !== null && kwd_group[0]) {
            let j = 0;
            while (kwd_group[j]) {
                let i = 0
                console.log(Boolean(kwd_group[j].kwd[i]));
                while (kwd_group[j].kwd[i]) {
                    if (keywords) {
                        keywords = keywords.concat(", ", kwd_group[j].kwd[i]);
                    } else {
                        keywords = keywords.concat(kwd_group[j].kwd[i]);
                    }
                    i++;
                }
                j++
            }
        }
        const extra_meta = { fpage, lpage, issue, volume }
        const journalinfo = await client.query(`SELECT article_id FROM journal WHERE article_id=$1`, [article_id]);
        if (journalinfo.rows.length > 0) {
            await client.query(`SELECT FROM article WHERE article_id=$1`, [article_id]);
            await client.query(
                `INSERT INTO article (article_id, article_category, article_title, author_name, journal_id, journal_name, keywords, abstract, extra_meta, doi, pub_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [article_id, article_category, article_title, author_name, journal_id, journal_name, keywords, abstract, extra_meta, doi, pub_date]
            );
            res.json("updated with existing article");
        } else {
            await client.query(
                `INSERT INTO journal (journal_id, article_id, journal_name, abbrev_journal_title, publisher_name) 
     VALUES ($1, $2, $3, $4, $5) RETURNING *`, [journal_id, article_id, journal_name, abbrev_journal_title, publisher_name],
            );
            await client.query(
                `INSERT INTO article (article_id, article_category, article_title, author_name, journal_id, journal_name, keywords, abstract, extra_meta, doi, pub_date) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`, [article_id, article_category, article_title, author_name, journal_id, journal_name, keywords, abstract, extra_meta, doi, pub_date]
            );
            res.json("new added");
        }
        //         // res.json(newArticle.rows[0], newJournal.rows[0]);

    } catch (err) {
        console.error(err);
    }


});