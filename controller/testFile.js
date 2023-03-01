import { createWriteStream, readFile, readSync, writeFile } from 'fs';
import { Parser } from 'xml2js';
import pkg from 'jszip';
const { loadAsync, external } = pkg
import { Parse } from 'unzipper';
import { DOMParser } from "xmldom";
import { select } from "xpath";
import AdmZip from 'adm-zip';
// const pool = require('./db');
const zipFilePath = process.cwd() + '/media/tempZip/';
const xmlPath = process.cwd() + '/media/xml/';

export const test = ('/test', async (req, res) => {
    try {
    var files = req.files
    for(let p=0; p<files.length; p++) {
        var filesName = req.files[p].originalname
        if(zipFilePath) {
            const fileStream = createWriteStream(zipFilePath + filesName);
            fileStream.write(files[p].buffer);
            fileStream.end();

            fileStream.on('finish', () => {
                console.log('File saved');
            });
        
            const zip = new AdmZip(zipFilePath+filesName);
            const zipEntries = zip.getEntries();
            const files1 = [];
            const files2 = [];
            zipEntries.forEach((zipEntry) => {
                const fileName = zipEntry.entryName;
                const buffer = zipEntry.getData();
                // const buffer = zipEntry;
                files2.push(fileName);
                files1.push(buffer);
            });

            for (let q=0; q<files1.length; q++) {
                var keyword = "";
                var abstract = "";
                var article_title = "";
                var author_name="";
                var bibilography = "";
                var xmlString = files1[q].toString('utf-8');
                // var doc = xmlString.toString();
                var doc = new DOMParser().parseFromString(xmlString);
                var article_info = select(".//article-meta/article-id/text()", doc);
                var journal_info = select(".//journal-meta/journal-id/text()", doc);
                var journal_name_info = select(".//article/front//journal-title/text()", doc);
                var abbrev_journal_name_info = select(".//abbrev-journal-title/text()", doc);
                var publisher_name_info = select(".//front/journal-meta/publisher/publisher-name/text()", doc);
                var article_category_info = select(".//article-categories/subj-group/subject/text()", doc);
                var article_title_info = select(".//article-meta/title-group/article-title/text()", doc);
                var article_title_info2 = select(".//article-meta/title-group/article-title/italic/text()", doc);
                var bibilography_info = select(".//article/body/sec/p/xref/text()", doc);

                //article_title_looping;
                if (article_title_info.length) {
                    for (var i = 0; i < article_title_info.length; i++) {
                        if (article_title) {
                            article_title = article_title + ", " + article_title_info[i]?.data
                        } 
                        else {
                            article_title = article_title_info[i]?.data
                        }
                    }
                } 
                else if (article_title_info2.length) {
                    for (var i = 0; i < article_title_info2.length; i++) {
                        if (article_title) {
                            article_title = article_title + ", " + article_title_info2[i]?.data
                        } 
                        else {
                            article_title = article_title_info2[i]?.data
                        }
                    }
                }
                if (bibilography_info.length) {
                    for (var i = 0; i < bibilography_info.length; i++) {
                        if (bibilography_info) {
                            if(bibilography_info[i]?.data != undefined){
                                bibilography += bibilography_info[i]?.data + " "
                            }
                        }
                    }
                } 
                var author_surname_info = select(".//article-meta/contrib-group/contrib/name//surname/text()", doc);
                var author_first_info = select(".//article-meta/contrib-group/contrib/name//given-names/text()", doc);
                var doi_info = select(".//article-meta/article-id[@pub-id-type='doi']/text()", doc);
                var pub_date_month_info = select(".//pub-date[@pub-type='epub']/month/text()", doc);
                var pub_date_year_info = select(".//pub-date[@pub-type='epub']/year/text()", doc);
                var firstPage = select(".//front/article-meta/fpage/text()", doc);
                var lastPage = select(".//front/article-meta/lpage/text()", doc);
                var issue = select(".//front/article-meta/issue/text()", doc);
                var volume = select(".//front/article-meta/volume/text()", doc);

                var keywords_info = select(".//article/front/article-meta/kwd-group//kwd/italic/text()", doc);
                var keywords_info2 = select(".//article/front/article-meta/kwd-group//kwd/text()", doc);

                var abstract_info = select(".//article/front/article-meta/abstract/p/italic/text()", doc);
                var abstract_info2 = select(".//article/front/article-meta/abstract/sec/p/text()", doc);
                var abstract_info3 = select(".//article/front/article-meta/abstract/p/text()", doc);

                if (keywords_info.length) {
                    for (var i = 0; i < keywords_info.length; i++) {
                        if (keyword) {
                            keyword = keyword + ", " + keywords_info[i]?.data
                        } 
                        else {
                            keyword = keywords_info[i]?.data
                        }
                    }
                } 
                else if (keywords_info2.length) {
                    for (var i = 0; i < keywords_info2.length; i++) {
                        if (keyword) {
                            keyword = keyword + ", " + keywords_info2[i]?.data
                        } 
                        else {
                            keyword = keywords_info2[i]?.data
                        }
                    }
                };
                if (abstract_info.length) {
                    for (var i = 0; i < abstract_info.length; i++) {
                        if (abstract) {
                            abstract = abstract + ", " + abstract_info[i]?.data
                        } 
                        else {
                            abstract = abstract_info[i]?.data
                        }
                    }
                } 
                else if (abstract_info2.length) {
                    for (var i = 0; i < abstract_info2.length; i++) {
                        if (abstract) {
                            abstract = abstract + ", " + abstract_info2[i]?.data
                        } 
                        else {
                            abstract = abstract_info2[i]?.data
                        }
                    }
                } 
                else if (abstract_info3.length) {
                    for (var i = 0; i < abstract_info3.length; i++) {
                        if (abstract) {
                            abstract = abstract + ", " + abstract_info3[i]?.data
                        } 
                        else {
                            abstract = abstract_info3[i]?.data
                        }
                    }
                }
                if(author_first_info.length){
                    for(var i=0; i < author_first_info.length; i++){              
                        if(author_name) {
                            author_name += ", "+(author_first_info[i]?.data ?? "") + " " + (author_surname_info[i]?.data ?? "");                
                        } 
                        else {
                            author_name = (author_first_info[i]?.data ?? "") + " " + (author_surname_info[i]?.data ?? "");
                        }
                    
                    }

                };
                var article_id = article_info[0]?.data ?? "";
                var journal_id = journal_info[0]?.data ?? "";
                var journal_name = journal_name_info[0]?.data ?? "";
                var journal_abbrev = abbrev_journal_name_info[0]?.data ?? "";
                var publisher_name = publisher_name_info[0]?.data ?? "";
                var article_category = article_category_info[0]?.data ?? "";
                var doi = doi_info[0]?.data ?? "";
                var pub_month = pub_date_month_info[0]?.data ?? "";
                var pub_year = pub_date_year_info[0]?.data ?? "";
                var fPage = firstPage[0]?.data ?? "";
                var lPage = lastPage[0]?.data ?? "";
                var aIssue = issue[0]?.data ?? "";
                var aVolume = volume[0]?.data ?? "";
                var doiNew = doi.replace('/', '-')
                const extra_meta = { fpage: fPage, lpage: lPage, issue: aIssue, volume: aVolume }

                const pub_date = pub_year + "-" + pub_month;
                const journalinfo = await client.query(`SELECT FROM journal WHERE article_id=$1`, [article_id]);
                if (journalinfo.rows.length > 0) {
                    await client.query(`DELETE FROM article WHERE article_id=$1`, [article_id]);
                    await client.query(
                        `INSERT INTO article (article_id,article_category, article_title, author_name, keywords, abstract, extra_meta, doi, pub_date, bibliography) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                        [article_id, article_category, article_title, author_name, keyword, abstract, extra_meta, doi, pub_date, bibilography]
                    );
                    // res.json("updated with existing article");

                } 
                else {
                    await client.query(
                        `INSERT INTO journal (journal_id,article_id,journal_name,abbrev_journal_title, publisher_name) 
                    VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                        [journal_id, article_id, journal_name, journal_abbrev, publisher_name],
                    );
                    await client.query(
                        `INSERT INTO article (article_id, article_category, article_title, author_name, keywords, abstract, extra_meta, doi, pub_date, bibliography) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                        [article_id, article_category, article_title, author_name, keyword, abstract, extra_meta, doi, pub_date, bibilography]
                    );
                }

                if (existsSync(xmlPath+files2[q])) {
                    unlink(xmlPath+files2[q], (err) => {
                        if (err) throw err;
                        console.log(`${xmlPath+files2[q]} was deleted`);
                    });
                    console.log('file exists');
                } 
                writeFile(xmlPath+files2[q], xmlString, (err) => {
                    if (err) throw err;
                    console.log('Raw body saved to file');
                    }
                );

                }
            }
        }
        res.status(200).json({message:"XML Inserted Succesfully"});
    }
    catch (err){
        console.log(err)
    }
});
