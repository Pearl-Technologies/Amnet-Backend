select keywords, article_name, abstract
from article
where to_tsvector(keywords) @@ to_tsquery('learn');

select keywords, article_name, abstract
from article
where to_tsvector(keywords || ' ' || abstract) @@ to_tsquery('learn');

select keywords, article_name, abstract
from article
where to_tsvector(keywords || ' ' || article_name || ' ' || abstract) @@ to_tsquery('learn');

ALTER TABLE article
  ADD COLUMN document tsvector;
update article
set document = to_tsvector(keywords || ' ' || article_name || ' ' || abstract);

select keywords, article_name, abstract
from article
where document @@ to_tsquery('learn');

explain analyze select keywords, article_name, abstract
                from article
                where to_tsvector(keywords || ' ' || article_name || ' ' || abstract) @@ to_tsquery('learn');
explain analyze select keywords, article_name, abstract
                from article
                where document @@ to_tsquery('learn');

ALTER TABLE article
  ADD COLUMN article_with_idx tsvector;
update article
set article_with_idx = to_tsvector(keywords || ' ' || article_name || ' ' || coalesce(abstract, ''));
CREATE INDEX document_idx
  ON article
  USING GIN (article_with_idx);

explain analyze select keywords, article_name, abstract
                from article
                where document @@ to_tsquery('learn');
explain analyze select keywords, article_name, abstract
                from article
                where article_with_idx @@ to_tsquery('learn');

select keywords, article_name, abstract
from article
where article_with_idx @@ plainto_tsquery('learn')
order by ts_rank(article_with_idx, plainto_tsquery('learn'));


ALTER TABLE article
  ADD COLUMN article_with_weights tsvector;
update article
set article_with_weights = setweight(to_tsvector(keywords), 'A') ||
  setweight(to_tsvector(article_name), 'B') ||
    setweight(to_tsvector(coalesce(abstract, '')), 'C');
CREATE INDEX document_weights_idx
  ON article
  USING GIN (article_with_weights);

select keywords, article_name, abstract
from article
where article_with_weights @@ plainto_tsquery('learn')
order by ts_rank(article_with_weights, plainto_tsquery('learn')) desc;

select keywords, article_name, abstract, ts_rank(article_with_weights, plainto_tsquery('learn'))
from article
where article_with_weights @@ plainto_tsquery('learn')
order by ts_rank(article_with_weights, plainto_tsquery('learn')) desc;

CREATE FUNCTION article_tsvector_trigger() RETURNS trigger AS $$
begin
  new.document :=
  setweight(to_tsvector('english', coalesce(new.keywords, '')), 'A')
  || setweight(to_tsvector('english', coalesce(new.article_name, '')), 'B')
  || setweight(to_tsvector('english', coalesce(new.abstract, '')), 'C');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON article FOR EACH ROW EXECUTE PROCEDURE article_tsvector_trigger();


SELECT journal.journal_name, 
journal.publisher_name, 
article.article_title, 
article.article_category, 
article.article_title,
article.author_name,
article.pub_date,
article.doi,
ts_rank(article_with_weights, plainto_tsquery('learn'))
FROM article
INNER JOIN journal
ON article.article_id =journal.article_id where article_with_weights @@ plainto_tsquery('learn')
order by ts_rank(article_with_weights, plainto_tsquery('learn'));
--------------------------------------------------------------------------------------
SELECT col FROM table WHERE col LIKE '%some_value%';

CREATE TABLE se_details (
    episode_id int,
    event_id int primary key,
    state text,
    event_type text,
    begin_date_time timestamp,
    episode_narrative text,
    event_narrative text,
);

ALTER TABLE se_details ADD COLUMN ts tsvector
    GENERATED ALWAYS AS (to_tsvector('english', event_narrative)) STORED;

CREATE INDEX ts_idx ON se_details USING GIN (ts);

SELECT state, begin_date_time, event_type, event_narrative
FROM se_details
WHERE ts @@ to_tsquery('english', 'tornado');


SELECT state, begin_date_time, event_type, event_narrative
FROM se_details
WHERE ts @@ to_tsquery('english', **'rain & of & debris'**);

phraseto_tsquery('english', 'rain of debris')

ALTER TABLE se_details ADD COLUMN ts tsvector
    GENERATED ALWAYS AS
     **(setweight(to_tsvector('english', coalesce(event_narrative, '')), 'A') ||**
     **setweight(to_tsvector('english', coalesce(episode_narrative, '')), 'B'))** STORED;

SELECT …
**ORDER BY ts_rank(ts, to_tsquery('english', 'tornado')) DESC**;

CREATE TABLE pagetemplate (
    id int primary key,
    link text,
    header text,
    body text,
    footer text,
    status smallint default 1,
    created_by int null,
    created_date timestamp,
    updated_by int null,
    updated_date timestamp null
);

CREATE TABLE copyrightstemplate (
    id SERIAL primary key,
    link text,
    body text,
    status smallint default 1,
    created_by int NOT NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_by int NULL,
    updated_date TIMESTAMP NULL
);

CREATE TABLE companyprofile (
    id SERIAL PRIMARY KEY,
    name text NULL,
    email text NULL,
    mobile_number text NULL,
    statement text NULL,
    social_media_link text NULL,
    footer_description text NULL,
    logo_name text NULL,
    logo_path text NULL,
    status smallint default 1,
    created_by int NOT NULL,
    created_date TIMESTAMP DEFAULT NOW(),
    updated_by int NULL,
    updated_date TIMESTAMP NULL
);

alter table article add bibliography text null;

alter table copyrightstemplate add title text;

alter table users add role int default 2; //1 - Admin, 2 - User

alter table article add id serial PRIMARY KEY;

alter table journal add id serial PRIMARY KEY;

alter table article add status smallint default 1;
alter table article add created_by int NOT null default 1;
alter table article add created_date TIMESTAMP DEFAULT NOW();
alter table article add updated_by int null;
alter table article add updated_date TIMESTAMP null;

alter table journal add status smallint default 1;
alter table journal add created_by int NOT null default 1;
alter table journal add created_date TIMESTAMP DEFAULT NOW();
alter table journal add updated_by int null;
alter table journal add updated_date TIMESTAMP null;

alter table users add token text null;
