ALTER TABLE article
  ADD COLUMN document_idx tsvector;

update article
set document_idx = to_tsvector(keywords || ' ' || article_title || ' ' || abstract || ' ' || doi || ' ' || article_category || ' ' || author_name || ' ' || pub_date);

CREATE INDEX document_w_idx
  ON article
  USING GIN (document_idx);

ALTER TABLE journal
  ADD COLUMN journal_doc tsvector;
update journal
set journal_doc = to_tsvector(journal_name || ' ' || journal_id || ' ' || publisher_name || '' || abbrev_journal_title);

SELECT article_title, author_name, doi, pub_date, article_category, journal_name, extra_meta
     FROM article, journal WHERE article.article_id=journal.article_id AND document_idx @@ plainto_tsquery('learn')

ALTER TABLE article
  ADD COLUMN article_with_wgt tsvector;
update article
set article_with_wgt = setweight(to_tsvector(keywords), 'A') ||
  setweight(to_tsvector(article_title), 'B') ||
    setweight(to_tsvector(abstract), 'C');
	
CREATE INDEX document_wgt_idx
  ON article
  USING GIN (article_with_wgt);

select 
from article
where document_idx @@ plainto_tsquery('deep learn')
order by ts_rank_cd(article_with_wgt, plainto_tsquery('learn'));

