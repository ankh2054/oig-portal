
/* Remember to connect to DB before creating schema 
Schema is created inside a DB. If on console make sure you create DB first and conect to DB.
CREATE DATABASE oig;
*/

CREATE SCHEMA oig;


CREATE TABLE oig.producer (
	owner_name VARCHAR ( 12 ) PRIMARY KEY,
	candidate VARCHAR ( 40 ) NOT NULL,
	url VARCHAR ( 50 ) NOT NULL,
	jsonurl VARCHAR ( 50 ) NOT NULL,
    chainsurl VARCHAR ( 50 ) NOT NULL,
    active BOOLEAN NOT NULL,
    logo_svg VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a logo */
    country_code VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a country specified */
    top21 BOOLEAN NOT NULL,
    account_name VARCHAR ( 12 ) /* Used for login */
);


CREATE TABLE oig.nodes (
	owner_name VARCHAR ( 12 ) ,
	node_type VARCHAR ( 20 ) NOT NULL,
	http_node_url VARCHAR ( 50 ) ,
    https_node_url VARCHAR ( 50 ) ,
    p2p_url VARCHAR ( 50 ) ,
    features TEXT []
);

/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX idx_nodes_type ON oig.nodes(owner_name, node_type, features);


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
    comments VARCHAR ( 1000 )
);
/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX idx_results_type ON oig.results(owner_name, date_check);


CREATE TABLE oig.pointsystem (
	points_type VARCHAR ( 50 ) PRIMARY KEY,
	points SMALLINT,
    multiplier DECIMAL NOT NULL,
    min_requirements BOOLEAN 
);

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
    comments VARCHAR ( 1000 )
);
CREATE UNIQUE INDEX idx_products_type ON oig.products(owner_name, name);

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
    comments VARCHAR ( 1000 )
);
CREATE UNIQUE INDEX idx_bizdev_type ON oig.bizdev(owner_name, name);

CREATE TABLE oig.community (
	owner_name VARCHAR ( 12 ) PRIMARY KEY,
	origcontentpoints SMALLINT NOT NULL,
    transcontentpoints SMALLINT NOT NULL,
    eventpoints SMALLINT NOT NULL,
    managementpoints SMALLINT NOT NULL,
    outstandingpoints SMALLINT NOT NULL,
    score DECIMAL NOT NULL,
    date_updated TIMESTAMPTZ NOT NULL,
    comments VARCHAR ( 1000 )
);

CREATE TABLE oig.snapshotsettings (
    snapshot_date TIMESTAMPTZ 
);

CREATE TABLE oig.updates (
	owner_name VARCHAR ( 12 ),
	tech_ops VARCHAR ( 10000 ),
    product VARCHAR ( 10000 ),
    bizdev VARCHAR ( 10000 ),
    community VARCHAR ( 10000 ),
    date_update TIMESTAMPTZ NOT NULL 
);
CREATE UNIQUE INDEX idx_updatess_type ON oig.updates(owner_name, date_update);

CREATE USER oiguser WITH ENCRYPTED PASSWORD 'nightshade900';
GRANT ALL PRIVILEGES ON DATABASE oig TO oiguser ;
GRANT ALL PRIVILEGES ON SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA oig TO oiguser ;

