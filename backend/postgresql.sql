
/* Remember to connect to DB before creating schema 
Schema is created inside a DB. If on console make sure you create DB first and conect to DB.
CREATE DATABASE oig;
*/

CREATE SCHEMA oig;


CREATE TABLE oig.producer (
	owner_name VARCHAR ( 12 ),
	candidate VARCHAR ( 40 ) NOT NULL,
	url VARCHAR ( 50 ) NOT NULL,
	jsonurl VARCHAR ( 50 ) NOT NULL,
    chainsurl VARCHAR ( 50 ) NOT NULL,
    active BOOLEAN NOT NULL,
    logo_svg VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a logo */
    country_code VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a country specified */
    top21 BOOLEAN NOT NULL,
    account_name VARCHAR ( 12 ), /* Used for login */
    metasnapshot_date timestamp with time zone
);
CREATE UNIQUE INDEX producer_idx ON oig.producer(owner_name,metasnapshot_date);


CREATE TABLE oig.nodes (
	owner_name VARCHAR ( 12 ) ,
	node_type VARCHAR ( 20 ) NOT NULL,
	http_node_url VARCHAR ( 50 ) ,
    https_node_url VARCHAR ( 50 ) ,
    p2p_url VARCHAR ( 50 ) ,
    features TEXT []
);

/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX idx_nodes_type ON oig.nodes(owner_name, node_type,http_node_url );


CREATE TABLE oig.results (
	owner_name VARCHAR ( 12 ),
	cors_check BOOLEAN NOT NULL,
    cors_check_error VARCHAR ( 1000 ),
    http_check BOOLEAN NOT NULL,
    http_check_error VARCHAR ( 1000 ),
    https_check BOOLEAN NOT NULL,
    https_check_error VARCHAR ( 1000 ),
    http2_check BOOLEAN NOT NULL,
    http2_check_error VARCHAR ( 1000 ),
    tls_check VARCHAR ( 10 ),
    tls_check_error VARCHAR ( 1000 ),
    producer_api_check VARCHAR ( 10 ),
    producer_api_error VARCHAR ( 1000 ),
    net_api_check VARCHAR ( 10 ),
    net_api_error VARCHAR ( 1000 ),
    dbsize_api_check VARCHAR ( 10 ),
    dbsize_api_error VARCHAR ( 1000 ),
    full_history BOOLEAN NOT NULL,
    full_history_error VARCHAR ( 1000 ),
    v2_history BOOLEAN NOT NULL,
    v2_history_error VARCHAR ( 1000 ),
    atomic_api BOOLEAN NOT NULL,
    atomic_api_error VARCHAR ( 1000 ),
    snapshots BOOLEAN NOT NULL,
    snapshots_error VARCHAR ( 1000 ),
    seed_node BOOLEAN NOT NULL,
    seed_node_error VARCHAR ( 1000 ),
    api_node BOOLEAN NOT NULL,
    api_node_error VARCHAR ( 1000 ),
    oracle_feed BOOLEAN NOT NULL,
    oracle_feed_error VARCHAR ( 1000 ),
    wax_json BOOLEAN NOT NULL,
    chains_json BOOLEAN NOT NULL,
    cpu_time DECIMAL NOT NULL,
    cpu_avg DECIMAL NOT NULL,
    date_check TIMESTAMPTZ NOT NULL,
    score DECIMAL NOT NULL,
    snapshot_date TIMESTAMPTZ,
    comments VARCHAR ( 1000 ),
    metasnapshot_date timestamp with time zone
    
);
/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX results_idx ON oig.results(owner_name,date_check,metasnapshot_date);


CREATE TABLE oig.pointsystem (
	points_type VARCHAR ( 50 ),
	points SMALLINT,
    multiplier DECIMAL NOT NULL,
    min_requirements BOOLEAN,
    metasnapshot_date timestamp with time zone 
);
CREATE UNIQUE INDEX pointsystem_idx ON oig.pointsystem(points_type,metasnapshot_date);

CREATE TABLE oig.products (
	owner_name VARCHAR ( 12 ),
	name VARCHAR ( 40 ) NOT NULL,
	description VARCHAR ( 1000 ) NOT NULL,
	development_stage VARCHAR ( 50 ) NOT NULL,
    analytics_url VARCHAR ( 100 ),
    spec_url VARCHAR ( 100 ),
    code_repo VARCHAR ( 100 ),
    points SMALLINT NOT NULL,
    score DECIMAL NOT NULL,
    date_updated TIMESTAMPTZ NOT NULL,
    comments VARCHAR ( 1000 ),
    metasnapshot_date timestamp with time zone
);
CREATE UNIQUE INDEX product_idx ON oig.products(owner_name,name,metasnapshot_date);

CREATE TABLE oig.bizdev (
	owner_name VARCHAR ( 12 ),
	name VARCHAR ( 40 ) NOT NULL,
	description VARCHAR ( 1000 ) NOT NULL,
	deal_stage VARCHAR ( 50 ) NOT NULL,
    analytics_url VARCHAR ( 100 ),
    spec_url VARCHAR ( 100 ),
    points SMALLINT NOT NULL,
    score DECIMAL NOT NULL,
    date_updated TIMESTAMPTZ NOT NULL,
    comments VARCHAR ( 1000 ),
    metasnapshot_date timestamp with time zone
);
CREATE UNIQUE INDEX bizdev_idx ON oig.bizdev(owner_name,name,metasnapshot_date);

CREATE TABLE oig.community (
	owner_name VARCHAR ( 12 ),
	origcontentpoints SMALLINT NOT NULL,
    transcontentpoints SMALLINT NOT NULL,
    eventpoints SMALLINT NOT NULL,
    managementpoints SMALLINT NOT NULL,
    outstandingpoints SMALLINT NOT NULL,
    score DECIMAL NOT NULL,
    date_updated TIMESTAMPTZ NOT NULL,
    comments VARCHAR ( 1000 ),
    metasnapshot_date timestamp with time zone
);
CREATE UNIQUE INDEX community_idx ON oig.community(owner_name,metasnapshot_date);

CREATE TABLE oig.snapshotsettings (
    snapshot_date TIMESTAMPTZ 
);

CREATE TABLE oig.adminsettings (
    minimum_tech_score SMALLINT NOT NULL, 
    metasnapshot_date timestamp with time zone
);
CREATE UNIQUE INDEX adminsettings_idx ON oig.adminsettings(metasnapshot_date);
INSERT INTO oig.adminsettings(minimum_tech_score) VALUES(120);

CREATE TABLE oig.updates (
	owner_name VARCHAR ( 12 ),
	tech_ops VARCHAR ( 10000 ),
    product VARCHAR ( 10000 ),
    bizdev VARCHAR ( 10000 ),
    community VARCHAR ( 10000 ),
    date_update TIMESTAMPTZ NOT NULL 
);
CREATE UNIQUE INDEX idx_updatess_type ON oig.updates(owner_name, date_update);

-- Create seed metasnapshot data - minimum tech score
INSERT INTO oig.adminsettings (minimum_tech_score, metasnapshot_date)
SELECT minimum_tech_score, CURRENT_DATE
FROM oig.adminsettings WHERE metasnapshot_date IS NULL;

-- Create seed metasnapshot data - bizdevs (primarily used to freeze comments)
INSERT INTO oig.bizdev (owner_name, name, description, stage, analytics_url, spec_url, score, date_updated, points, comments, metasnapshot_date)
SELECT owner_name, name, description, stage, analytics_url, spec_url, score, date_updated, points, comments, CURRENT_DATE
FROM oig.bizdev WHERE metasnapshot_date IS NULL;

-- Create seed metasnapshot data - community (primarily used to freeze comments)
INSERT INTO oig.community (owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated, comments, metasnapshot_date)
SELECT owner_name, origcontentpoints, transcontentpoints, eventpoints, managementpoints, outstandingpoints, score, date_updated, comments, CURRENT_DATE
FROM oig.community WHERE metasnapshot_date IS NULL;

-- Create seed metasnapshot data - pointsystem (used to reference old scoring criteria)
INSERT INTO oig.pointsystem (points_type, points, multiplier, min_requirements, metasnapshot_date)
SELECT points_type, points, multiplier, min_requirements, CURRENT_DATE
FROM oig.pointsystem WHERE metasnapshot_date IS NULL;

-- Create seed metasnapshot data - producer (used to reference historical top21 guilds)
INSERT INTO oig.producer (owner_name, candidate, url, jsonurl, chainsurl, active, logo_svg, top21, country_code, account_name, metasnapshot_date)
SELECT owner_name, candidate, url, jsonurl, chainsurl, active, logo_svg, top21, country_code, account_name, CURRENT_DATE
FROM oig.producer WHERE metasnapshot_date IS NULL;

-- Create seed metasnapshot data - products (primarily used to freeze comments)
INSERT INTO oig.products (owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, date_updated, points, comments, metasnapshot_date)
SELECT owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, date_updated, points, comments, CURRENT_DATE
FROM oig.products WHERE metasnapshot_date IS NULL;

-- Create seed metasnapshot data - tech results (primarily used to freeze comments)
INSERT INTO oig.results (owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, http2_check, http2_check_error, full_history, full_history_error, snapshots, snapshots_error, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, date_check, score, tls_check, tls_check_error, cpu_avg, snapshot_date, hyperion_v2, hyperion_v2_error, producer_api_error, producer_api_check, net_api_check, net_api_error, dbsize_api_check, dbsize_api_error, comments, atomic_api, atomic_api_error, metasnapshot_date)
SELECT DISTINCT ON (owner_name) owner_name, cors_check, cors_check_error, http_check, http_check_error, https_check, https_check_error, http2_check, http2_check_error, full_history, full_history_error, snapshots, snapshots_error, seed_node, seed_node_error, api_node, api_node_error, oracle_feed, oracle_feed_error, wax_json, chains_json, cpu_time, date_check, score, tls_check, tls_check_error, cpu_avg, snapshot_date, hyperion_v2, hyperion_v2_error, producer_api_error, producer_api_check, net_api_check, net_api_error, dbsize_api_check, dbsize_api_error, comments, atomic_api, atomic_api_error, CURRENT_DATE 
FROM oig.results WHERE snapshot_date IS NOT NULL AND metasnapshot_date IS NULL ORDER BY owner_name, snapshot_date DESC;



CREATE USER oiguser WITH ENCRYPTED PASSWORD 'nightshade900';
GRANT ALL PRIVILEGES ON DATABASE oig TO oiguser ;
GRANT ALL PRIVILEGES ON SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA oig TO oiguser ;

