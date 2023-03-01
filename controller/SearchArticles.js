import {
    getTime
} from "./getTime.js";
import client from "../database/config.js";
export const SearchArticles = ("/search", async(req, res) => {
    var findArticle;
    var findByAdvSearch;

    const {
        q,
        query_author,
        query_category,
        limit,
        page
    } = req.query;
    // console.log(req.query)
    try {
        if (q) {
            try {
                if (q && query_author && query_category) {
                    findArticle = await client.query(
                        `SELECT article_title,abstract, author_name, doi, pub_date,keywords , article_category, journal_name, extra_meta
                    FROM article, journal WHERE article.article_id=journal.article_id AND document_idx @@ plainto_tsquery('${q}') 
                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                    AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}'))
                    order by ts_rank_cd(article_with_wgt, plainto_tsquery('${q}')) limit ${limit} offset ${((page * limit)-limit)}`
                    );
                } else if (q && query_author || query_category) {
                    findArticle = await client.query(
                        `SELECT article_title,abstract, author_name, doi, pub_date,keywords , article_category, journal_name, extra_meta
                    FROM article, journal WHERE article.article_id=journal.article_id AND document_idx @@ plainto_tsquery('${q}') 
                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                    OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}'))
                    order by ts_rank_cd(article_with_wgt, plainto_tsquery('${q}')) limit ${limit} offset ${((page * limit)-limit)}`
                    );
                } else {
                    findArticle = await client.query(
                        `SELECT article_title,abstract, author_name, doi, pub_date,keywords , article_category, journal_name, extra_meta
                    FROM article, journal WHERE article.article_id=journal.article_id AND document_idx @@ plainto_tsquery('${q}') 
                    order by ts_rank_cd(article_with_wgt, plainto_tsquery('${q}')) limit ${limit} offset ${((page * limit)-limit)}`
                    );
                }

                const findCategory = await client.query(
                    `SELECT unnest(string_to_array(article_category, ',')), count(article_category) FROM amnet.public.article, amnet.public.journal 
                    WHERE amnet.public.journal.article_id = amnet.public.article.article_id
                    AND document_idx @@ plainto_tsquery('${q}') group by article_category`
                );

                const findAuthor = await client.query(
                    `SELECT unnest(string_to_array(author_name, ',')), count(author_name) FROM amnet.public.article, amnet.public.journal 
                    WHERE amnet.public.journal.article_id = amnet.public.article.article_id
                    AND document_idx @@ plainto_tsquery('${q}') group by author_name`
                );

                console.log(findArticle.rows);
                console.log(findCategory.rows);
                console.log(findAuthor.rows);

                res.json({
                    "Article": findArticle.rows,
                    "Category": findCategory.rows,
                    "Author": findAuthor.rows
                });
            } catch (error) {
                res.json({
                    status: 500,
                    desc: "argument not correct"
                });
            };
        } else {

            const {
                content,
                term,
                published,
                month,
                fromDate,
                toDate,
                pubDate,
                journal_name,
                pub_year,
                volume,
                issue,
                page,
                citation_number,
                find,
                query_author,
                query_category,
            } = req.query;
            console.log(req.query)
            if (find == "1") {
                let newMonth = getTime(month).slice(0, 7);
                const startDate = fromDate.slice(0, 7);
                const endDate = toDate.slice(0, 7);

                try {
                    if (content && term && published && pubDate) {
                        if (pubDate == 'last') {
                            if (query_author && query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1)) AND (journal_doc @@ plainto_tsquery($2)) AND (to_tsvector(pub_date) @@ plainto_tsquery($3)) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, published, newMonth]
                                );
                            } else if (query_author || query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1)) AND (journal_doc @@ plainto_tsquery($2)) AND (to_tsvector(pub_date) @@ plainto_tsquery($3)) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, published, newMonth]
                                );
                            } else {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1)) AND (journal_doc @@ plainto_tsquery($2)) AND (to_tsvector(pub_date) @@ plainto_tsquery($3)) 
                                 limit ${limit} offset ${((page * limit)-limit)}`, [term, published, newMonth]
                                );
                            }
                            const findCategory = await client.query(
                                `SELECT unnest(string_to_array(article_category, ',')), count(article_category) FROM article, journal 
                                WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1)) 
                                AND (journal_doc @@ plainto_tsquery($2)) AND (to_tsvector(pub_date) @@ plainto_tsquery($3)) 
                                group by article_category`, [term, published, newMonth]
                            );

                            const findAuthor = await client.query(
                                `SELECT unnest(string_to_array(author_name, ',')), count(author_name) FROM article, journal 
                                WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1)) 
                                AND (journal_doc @@ plainto_tsquery($2)) AND (to_tsvector(pub_date) @@ plainto_tsquery($3)) 
                                group by author_name`, [term, published, newMonth]
                            );

                            res.json({
                                "Article": findByAdvSearch.rows,
                                "Category": findCategory.rows,
                                "Author": findAuthor.rows
                            });
                        } else if (pubDate == 'custom range') {
                            if (query_author && query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND
                                to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2) 
                                AND (pub_date between $3 and $4) AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, published, startDate, endDate]
                                );
                            } else if (query_author || query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND
                                to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2) 
                                AND (pub_date between $3 and $4) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, published, startDate, endDate]
                                );
                            } else {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND
                                to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2) 
                                AND (pub_date between $3 and $4) limit ${limit} offset ${((page * limit)-limit)}`, [term, published, startDate, endDate]
                                );
                            }

                            const findCategory = await client.query(
                                `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                            FROM article, journal WHERE journal.article_id = article.article_id AND
                            to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2) 
                            AND (pub_date between $3 and $4) group by article_category`, [term, published, startDate, endDate]
                            );

                            const findAuthor = await client.query(
                                `SELECT unnest(string_to_array(author_name, ',')), count(author_name) FROM article, journal WHERE journal.article_id = article.article_id AND
                                to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2) 
                                AND (pub_date between $3 and $4) group by author_name`, [term, published, startDate, endDate]
                            );

                            res.json({
                                "Article": findByAdvSearch.rows,
                                "Category": findCategory.rows,
                                "Author": findAuthor.rows
                            });
                        }
                    } else if (content && term && published != "") {
                        if (query_author && query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name, article_title,abstract , author_name, doi, pub_date, article_category, author_name, extra_meta
                            FROM article, journal WHERE journal.article_id = article.article_id
                            AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2)) 
                            AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                            AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                            limit ${limit} offset ${((page * limit)-limit)}`, [term, published]
                            );
                        } else if (query_author || query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name, article_title,abstract , author_name, doi, pub_date, article_category, author_name, extra_meta
                            FROM article, journal WHERE journal.article_id = article.article_id
                            AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2)) 
                            AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                            OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                            limit ${limit} offset ${((page * limit)-limit)}`, [term, published]
                            );
                        } else {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name, article_title,abstract , author_name, doi, pub_date, article_category, author_name, extra_meta
                            FROM article, journal WHERE journal.article_id = article.article_id
                            AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2)) 
                             limit ${limit} offset ${((page * limit)-limit)}`, [term, published]
                            );

                        }

                        const findCategory = await client.query(
                            `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                            FROM article, journal WHERE journal.article_id = article.article_id
                            AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2)) group by article_category`, [term, published]
                        );

                        const findAuthor = await client.query(
                            `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                            FROM article, journal WHERE journal.article_id = article.article_id
                AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND journal_doc @@ plainto_tsquery($2)) group by author_name`, [term, published]
                        );

                        res.json({
                            "Article": findByAdvSearch.rows,
                            "Category": findCategory.rows,
                            "Author": findAuthor.rows
                        });
                    } else if (content && term && pubDate) {
                        if (pubDate == 'last') {
                            if (query_author && query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND (to_tsvector(pub_date) @@ plainto_tsquery($2))) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, newMonth]
                                );
                            } else if (query_author || query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND (to_tsvector(pub_date) @@ plainto_tsquery($2))) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, newMonth]
                                );
                            } else {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND (to_tsvector(pub_date) @@ plainto_tsquery($2))) 
                                 limit ${limit} offset ${((page * limit)-limit)}`, [term, newMonth]
                                );
                            }

                            const findCategory = await client.query(
                                `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                                FROM article, journal WHERE journal.article_id = article.article_id 
                                AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND (to_tsvector(pub_date) @@ plainto_tsquery($2))) group by article_category`, [term, newMonth]
                            );

                            const findAuthor = await client.query(
                                `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                                FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(${content}) @@ plainto_tsquery($1) AND (to_tsvector(pub_date) @@ plainto_tsquery($2))) group by author_name`, [term, newMonth]
                            );

                            res.json({
                                "Article": findByAdvSearch.rows,
                                "Category": findCategory.rows,
                                "Author": findAuthor.rows
                            });
                        } else if (pubDate == 'custom range') {
                            if (query_author && query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) 
                                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                    AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [term, startDate, endDate]
                                );
                            } else if (query_author || query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) 
                                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                    OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [term, startDate, endDate]
                                );
                            } else {
                                findByAdvSearch = await client.query(
                                    `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [term, startDate, endDate]
                                );
                            }

                            const findCategory = await client.query(
                                `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                                    FROM article, journal WHERE journal.article_id = article.article_id 
                                    AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) group by article_category`, [term, startDate, endDate]
                            );

                            const findAuthor = await client.query(
                                `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                                    FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) group by author_name`, [term, startDate, endDate]
                            );

                            res.json({
                                "Article": findByAdvSearch.rows,
                                "Category": findCategory.rows,
                                "Author": findAuthor.rows
                            });
                        }
                    } else if (pubDate == 'custom range') {
                        if (query_author && query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, startDate, endDate]
                            );
                        } else if (query_author || query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, startDate, endDate]
                            );
                        } else {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [term, startDate, endDate]
                            );
                        }

                        const findCategory = await client.query(
                            `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                                FROM article, journal WHERE journal.article_id = article.article_id 
                                AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) group by article_category`, [term, startDate, endDate]
                        );

                        const findAuthor = await client.query(
                            `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                                FROM article, journal WHERE journal.article_id = article.article_id AND ((to_tsvector(${content}) @@ plainto_tsquery($1)) AND (pub_date between $2 and $3)) group by author_name`, [term, startDate, endDate]
                        );

                        res.json({
                            "Article": findByAdvSearch.rows,
                            "Category": findCategory.rows,
                            "Author": findAuthor.rows
                        });
                    } else if (content && term) {
                        if (query_author && query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                            FROM article, journal WHERE article.article_id=journal.article_id AND to_tsvector(${content}) @@ plainto_tsquery($1) 
                            AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                            AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                            limit ${limit} offset ${((page * limit)-limit)}`, [term]
                            );
                        } else if (query_author || query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                            FROM article, journal WHERE article.article_id=journal.article_id AND to_tsvector(${content}) @@ plainto_tsquery($1) 
                            AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                            OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                            limit ${limit} offset ${((page * limit)-limit)}`, [term]
                            );
                        } else {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract, article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                            FROM article, journal WHERE article.article_id=journal.article_id AND to_tsvector(${content}) @@ plainto_tsquery($1) 
                            limit ${limit} offset ${((page * limit)-limit)}`, [term]
                            );
                        }

                        const findCategory = await client.query(
                            `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                            FROM article, journal WHERE article.article_id=journal.article_id AND to_tsvector(${content}) @@ plainto_tsquery($1) group by article_category`, [term]
                        );

                        const findAuthor = await client.query(
                            `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                            FROM article, journal WHERE article.article_id=journal.article_id AND to_tsvector(${content}) @@ plainto_tsquery($1) group by author_name`, [term]
                        );

                        res.json({
                            "Article": findByAdvSearch.rows,
                            "Category": findCategory.rows,
                            "Author": findAuthor.rows
                        });
                    } else if (published) {
                        if (query_author && query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(pub_date || ' ' || article_category || ' ' || journal_name) @@ plainto_tsquery($1) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [published]
                            );
                        } else if (query_author || query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(pub_date || ' ' || article_category || ' ' || journal_name) @@ plainto_tsquery($1) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [published]
                            );
                        } else {
                            findByAdvSearch = await client.query(
                                `SELECT journal_name,abstract , article_title, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(pub_date || ' ' || article_category || ' ' || journal_name) @@ plainto_tsquery($1) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [published]
                            );
                        }

                        const findCategory = await client.query(
                            `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                            FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(pub_date || ' ' || article_category || ' ' || journal_name) @@ plainto_tsquery($1) group by article_category`, [published]
                        );

                        const findAuthor = await client.query(
                            `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                            FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(pub_date || ' ' || article_category || ' ' || journal_name) @@ plainto_tsquery($1) group by author_name`, [published]
                        );
                        res.json({
                            "Article": findByAdvSearch.rows,
                            "Category": findCategory.rows,
                            "Author": findAuthor.rows
                        });
                    } else if (pubDate) {
                        if (pubDate == 'last') {
                            if (month === 'year') {
                                newMonth = newMonth.slice(0, 4);
                                if (query_author && query_category) {
                                    findByAdvSearch = await client.query(
                                        `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) 
                                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                    AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [newMonth]
                                    );
                                } else if (query_author || query_category) {
                                    findByAdvSearch = await client.query(
                                        `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) 
                                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                    OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [newMonth]
                                    );
                                } else {
                                    findByAdvSearch = await client.query(
                                        `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [newMonth]
                                    );
                                }

                                const findCategory = await client.query(
                                    `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) group by article_category`, [newMonth]
                                );

                                const findAuthor = await client.query(
                                    `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) group by author_name`, [newMonth]
                                );
                                res.json({
                                    "Article": findByAdvSearch.rows,
                                    "Category": findCategory.rows,
                                    "Author": findAuthor.rows
                                });
                            } else {
                                if (query_author && query_category) {
                                    findByAdvSearch = await client.query(
                                        `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) 
                                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                    AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [newMonth]
                                    );
                                } else if (query_author && query_category) {
                                    findByAdvSearch = await client.query(
                                        `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) 
                                    AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                    OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [newMonth]
                                    );
                                } else {
                                    findByAdvSearch = await client.query(
                                        `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) 
                                    limit ${limit} offset ${((page * limit)-limit)}`, [newMonth]
                                    );
                                }

                                const findCategory = await client.query(
                                    `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) group by article_category`, [newMonth]
                                );

                                const findAuthor = await client.query(
                                    `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                                    FROM article, journal WHERE article.article_id=journal.article_id and to_tsvector(pub_date) @@ plainto_tsquery($1) group by author_name`, [newMonth]
                                );
                                res.json({
                                    "Article": findByAdvSearch.rows,
                                    "Category": findCategory.rows,
                                    "Author": findAuthor.rows
                                });
                            }
                        } else if (pubDate == 'custom range') {
                            if (query_author && query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE article.article_id=journal.article_id AND pub_date between $1 and $2 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [startDate, endDate]
                                );
                            } else if (query_author || query_category) {
                                findByAdvSearch = await client.query(
                                    `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE article.article_id=journal.article_id AND pub_date between $1 and $2 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [startDate, endDate]
                                );
                            } else {
                                findByAdvSearch = await client.query(
                                    `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE article.article_id=journal.article_id AND pub_date between $1 and $2 
                                limit ${limit} offset ${((page * limit)-limit)}`, [startDate, endDate]
                                );
                            }

                            const findCategory = await client.query(
                                `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                                FROM article, journal WHERE article.article_id=journal.article_id AND pub_date between $1 and $2 group by article_category`, [startDate, endDate]
                            );

                            const findAuthor = await client.query(
                                `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                                FROM article, journal WHERE article.article_id=journal.article_id AND pub_date between $1 and $2 group by author_name`, [startDate, endDate]
                            );
                            res.json({
                                "Article": findByAdvSearch.rows,
                                "Category": findCategory.rows,
                                "Author": findAuthor.rows
                            });
                        }
                    } else if (journal_name) {
                        if (query_author && query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(title) @@ plainto_tsquery($1) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [journal_name]
                            );
                        } else if (query_author || query_category) {
                            findByAdvSearch = await client.query(
                                `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(title) @@ plainto_tsquery($1) 
                                AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                                OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [journal_name]
                            );
                        } else {
                            findByAdvSearch = await client.query(
                                `SELECT article_title,abstract , journal_name, author_name, doi, pub_date, article_category, author_name, extra_meta
                                FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(title) @@ plainto_tsquery($1) 
                                limit ${limit} offset ${((page * limit)-limit)}`, [journal_name]
                            );
                        }

                        const findCategory = await client.query(
                            `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                            FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(title) @@ plainto_tsquery($1) group by article_category`, [journal_name]
                        );

                        const findAuthor = await client.query(
                            `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                            FROM article, journal WHERE journal.article_id = article.article_id AND to_tsvector(title) @@ plainto_tsquery($1) group by author_name`, [journal_name]
                        );
                        res.json({
                            "Article": findByAdvSearch.rows,
                            "Category": findCategory.rows,
                            "Author": findAuthor.rows
                        });
                    } else {
                        res.json([]);
                    }


                } catch (error) {
                    console.error(error);
                    res.send("argument not correct");
                }
            } else if (find == "2") {
                if (journal_name != "" && volume != "" && page != "" && pubDate != "" && issue != "") {
                    if (query_author && query_category) {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) AND (to_tsvector(pub_date) @@ plainto_tsquery('${pubDate}')) 
                        AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                        AND (extra_meta->>'issue' @@ plainto_tsquery('${issue}')) 
                        AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                        AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                        limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    } else if (query_author || query_category) {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) AND (to_tsvector(pub_date) @@ plainto_tsquery('${pubDate}')) 
                        AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                        AND (extra_meta->>'issue' @@ plainto_tsquery('${issue}')) 
                        AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                        OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                        limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    } else {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) AND (to_tsvector(pub_date) @@ plainto_tsquery('${pubDate}')) 
                        AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                        AND (extra_meta->>'issue' @@ plainto_tsquery('${issue}')) 
                        limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    }

                    const findCategory = await client.query(
                        `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                    FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) AND (to_tsvector(pub_date) @@ plainto_tsquery('${pubDate}')) 
                    AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                    AND (extra_meta->>'issue' @@ plainto_tsquery('${issue}')) group by article_category`
                    );

                    const findAuthor = await client.query(
                        `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                    FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) AND (to_tsvector(pub_date) @@ plainto_tsquery('${pubDate}')) 
                    AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                    AND (extra_meta->>'issue' @@ plainto_tsquery('${issue}')) group by author_name`
                    );
                    res.json({
                        "Article": findByAdvSearch.rows,
                        "Category": findCategory.rows,
                        "Author": findAuthor.rows
                    });
                } else if (journal_name != "" && volume != "" && page != "") {
                    if (query_author && query_category) {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) 
                        AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                        AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                        AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                        limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    } else if (query_author || query_category) {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) 
                        AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                        AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                        OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) 
                        limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    } else {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) 
                        AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) 
                        limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    }

                    const findCategory = await client.query(
                        `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) 
               AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) group by article_category`
                    );

                    const findAuthor = await client.query(
                        `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(name) @@ plainto_tsquery('${journal_name}')) 
               AND (extra_meta->>'volume' @@ plainto_tsquery('${volume}')) AND (extra_meta->>'fpage' @@ plainto_tsquery('${page}')) group by author_name`
                    );
                    res.json({
                        "Article": findByAdvSearch.rows,
                        "Category": findCategory.rows,
                        "Author": findAuthor.rows
                    });
                } else if (journal_name != "") {
                    if (query_author && query_category) {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(journal_name) @@ plainto_tsquery('${journal_name}')) 
                        AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                        AND to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    } else if (query_author || query_category) {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(journal_name) @@ plainto_tsquery('${journal_name}')) 
                        AND (to_tsvector(article_category) @@ plainto_tsquery('${query_category}')
                        OR to_tsvector(author_name) @@ plainto_tsquery('${query_author}')) limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    } else {
                        findByAdvSearch = await client.query(
                            `SELECT  *
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(journal_name) @@ plainto_tsquery('${journal_name}')) 
                        limit ${limit} offset ${((page * limit)-limit)}`
                        );
                    }

                    const findCategory = await client.query(
                        `SELECT unnest(string_to_array(article_category, ',')), count(article_category)
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(journal_name) @@ plainto_tsquery('${journal_name}')) group by article_category`
                    );

                    const findAuthor = await client.query(
                        `SELECT unnest(string_to_array(author_name, ',')), count(author_name) 
                        FROM article, journal WHERE journal.article_id = article.article_id AND (to_tsvector(journal_name) @@ plainto_tsquery('${journal_name}')) group by author_name`
                    );
                    console.log("san", findByAdvSearch.rows)
                    res.json({
                        "Article": findByAdvSearch.rows,
                        "Category": findCategory.rows,
                        "Author": findAuthor.rows
                    });
                }
            } else {
                res.json([]);
            }
        }

    } catch {
        res.json([]);
    }
})




// export const SearchArticles=("/search",async (req,res)=>{

//              try {     
//              const findArticle = await client.query(
//                  `SELECT title, name, author_name, doi, pub_date, category, author_name, extra_meta
//      FROM jat_article, jat_journal WHERE jat_article.article_id=jat_journal.article_id AND bst_idx @@ plainto_tsquery($1)`,
//                  [q]
//              );
//             res.json(findArticle.rows);

//          } catch (error) {
//              console.error(error);
//              res.send("argument not correct");
//          }
// })