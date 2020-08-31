
/* 
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
    active BOOLEAN NO NULL,
    logo_svg VARCHAR ( 100 ) /*Can be Null as sometimes people dont have a logo */
);


CREATE TABLE oig.nodes (
	owner_name VARCHAR ( 12 ) ,
	node_type VARCHAR ( 20 ) NOT NULL,
	http_node_url VARCHAR ( 50 ) ,
    https_node_url VARCHAR ( 50 ) ,
    p2p_url VARCHAR ( 50 ) 
);

/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX idx_nodes_type ON oig.nodes(owner_name, node_type);


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
    full_history BOOLEAN NOT NULL,
    full_history_error VARCHAR ( 1000 ),
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
    date_check TIMESTAMP NOT NULL
);
/* Unique index to cover two culumns*/
CREATE UNIQUE INDEX idx_results_type ON oig.results(owner_name, date_check);
/* 
/* CREATE ROLE oig WITH LOGIN PASSWORD 'nightshade900'; */

CREATE TABLE oig.pointsystem (
	points_type VARCHAR ( 50 ) PRIMARY KEY,
	points SMALLINT NOT NULL,
    multiplier DECIMAL NOT NULL
);

CREATE TABLE oig.updates (
	owner_name VARCHAR ( 12 ),
	tech_ops VARCHAR ( 10000 ),
    product VARCHAR ( 10000 ),
    bizdev VARCHAR ( 10000 ),
    community VARCHAR ( 10000 ),
    date_update TIMESTAMP NOT NULL 
);
CREATE UNIQUE INDEX idx_updates_type ON oig.results(owner_name, date_update);

CREATE USER oiguser WITH ENCRYPTED PASSWORD 'nightshade900';
GRANT ALL PRIVILEGES ON DATABASE oig TO oiguser ;
GRANT ALL PRIVILEGES ON SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA oig TO oiguser ;

