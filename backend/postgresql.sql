
/* Remember to connect to DB before creating schema 
Schema is created inside a DB. If on console make sure you create DB first and conect to DB.
CREATE DATABASE oig;
*/

CREATE SCHEMA oig;


CREATE TABLE oig.producer (
	owner_name VARCHAR ( 12 ),
    owner_name_testnet VARCHAR ( 12 ),
	candidate VARCHAR ( 40 ) NOT NULL,
	url VARCHAR ( 50 ) NOT NULL,
	jsonurl VARCHAR ( 100 ) NOT NULL,
    jsontestneturl VARCHAR ( 100 ),
    notion_url VARCHAR ( 250 ),
    chainsurl VARCHAR ( 50 ) NOT NULL,
    active BOOLEAN NOT NULL,
    logo_svg VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a logo */
    country_code VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a country specified */
    top21 BOOLEAN NOT NULL,
    account_name VARCHAR ( 12 ),
    publickey VARCHAR ( 250 )
);
CREATE UNIQUE INDEX producer_idx ON oig.producer(owner_name);


CREATE TABLE oig.nodes (
	owner_name VARCHAR ( 12 ) ,
	node_type VARCHAR ( 20 ) NOT NULL,
    net VARCHAR ( 20 ) NOT NULL,
	http_node_url VARCHAR ( 50 ) ,
    https_node_url VARCHAR ( 50 ) ,
    p2p_url VARCHAR ( 50 ) ,
    features TEXT []
);

/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX idx_nodes_type ON oig.nodes(owner_name, node_type, http_node_url,features);


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
    hyperion_v2 BOOLEAN NOT NULL,
    hyperion_v2_error VARCHAR ( 1000 ),
    hyperion_v2_testnet BOOLEAN NOT NULL,
    hyperion_v2_testnet_error VARCHAR ( 1000 ),
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
    chainscore DECIMAL
);
/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX results_idx ON oig.results(owner_name,date_check);


CREATE TABLE oig.pointsystem (
	points_type VARCHAR ( 50 ),
	points SMALLINT,
    multiplier DECIMAL NOT NULL,
    min_requirements BOOLEAN,
    points_deduct SMALLINT
);
CREATE UNIQUE INDEX pointsystem_idx ON oig.pointsystem(points_type);

CREATE TABLE oig.dates (
    id SERIAL PRIMARY KEY,
    submission_cutoff TIMESTAMPTZ,
    appeal_begin TIMESTAMPTZ,
    appeal_end TIMESTAMPTZ,
    final_report TIMESTAMPTZ
);
CREATE UNIQUE INDEX dates_idx ON oig.dates(id);

CREATE USER oig WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE oig TO oig ;
GRANT ALL PRIVILEGES ON SCHEMA oig TO oig ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA oig TO oig ;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA oig TO oig ;


