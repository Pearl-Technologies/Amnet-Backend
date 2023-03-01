import {getTime} from "./getTime.js";
import client from "../database/config.js";
export const SearchArticlesAdvance=("/", async (req, res)=>{
    const { content, term, published, month, fromDate, toDate, pubDate, journal_name, pub_year, volume, issue, page, citation_number } = req.body; 
    let newMonth = getTime(month).slice(0, 7);
    const startDate = fromDate?.slice(0, 7);
    const endDate = toDate?.slice(0, 7);
    console.log(req.body);

    try {
        if (content && term && published && pubDate) {
            if (pubDate == 'last') {
                const findByAdvSearch = await client.query(
                    `SELECT journal_name, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                    FROM article, journal WHERE journal.article_id = article.article_id AND ((${content} = $1) AND (journal_doc @@ plainto_tsquery($2)) AND (to_tsvector(pub_date) @@ plainto_tsquery($3)))`,
                    [term, published, newMonth]
                );
                res.json(findByAdvSearch.rows);
            } else if (pubDate == 'custom range') {
                const findByAdvSearch = await client.query(
                    `SELECT journal_name, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                    FROM article, journal WHERE journal.article_id = article.article_id AND
         ${content} = $1 AND journal_doc @@ plainto_tsquery($2) AND (pub_date between $3 and $4)`,
                    [term, published, startDate, endDate]
                );
                res.json(findByAdvSearch.rows);
            }
        } else if (content && term && published) {
            const findByAdvSearch = await client.query(
                `SELECT journal_name, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                FROM article, journal WHERE journal.article_id = article.article_id
        AND ${content} = $1 AND journal_doc @@ plainto_tsquery($2)`,
                [term, published]
            );
            res.json(findByAdvSearch.rows);
        } else if (content && term) {  
            const findByAdvSearch = await client.query(
                `SELECT journal_name, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                FROM article, journal WHERE article.article_id=journal.article_id AND to_tsvector(${content}) @@ plainto_tsquery($1) `,
                [term]                     
            );
            res.json(findByAdvSearch.rows);
        } else if (published) {
            const findByAdvSearch = await client.query(
                `SELECT journal_name, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
        FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(pub_date || ' ' || article_category || ' ' || journal_name) @@ plainto_tsquery($1)`,
                [published]
            );
            res.json(findByAdvSearch.rows);
        } else if (pubDate) {
            if (pubDate == 'last') {
               if(month === 'year'){
                   newMonth = newMonth.slice(0, 4);
                   const findByAdvSearch = await client.query(
                       `SELECT article_title, journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
           FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1)`,
                       [newMonth]
                   );   
                   res.json(findByAdvSearch.rows);
               }else{
                const findByAdvSearch = await client.query(
                    `SELECT article_title, journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
        FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1)`,
                    [newMonth]
                );
                res.json(findByAdvSearch.rows);
               }
            } else if (pubDate == 'custom range') {
                const findByAdvSearch = await client.query(
                    `SELECT article_title, journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                    FROM article, journal WHERE article.article_id=journal.article_id AND pub_date between $1 and $2`,
                    [startDate, endDate]
                );
                res.json(findByAdvSearch.rows);
            }
        }else if(journal_name){
           const findByAdvSearch = await client.query(
               `SELECT article_title, journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
               FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(title) @@ plainto_tsquery($1)`,
               [journal_name]
           );
           res.json(findByAdvSearch.rows);
        }else{
           res.json([]);
        }


    } catch (error) {
        console.error(error);
        res.send("argument not correct");
    }



})