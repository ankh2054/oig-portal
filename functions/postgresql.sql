
/* 
/* Remember to connect to DB before creating schema 
Schema is created inside a DB. If on console make sure you create DB first 
CREATE DATABASE oig;
*/

CREATE SCHEMA oig;


CREATE TABLE oig.producer (
	owner_name VARCHAR ( 12 ) PRIMARY KEY,
	candidate VARCHAR ( 40 ) NOT NULL,
	url VARCHAR ( 50 ) NOT NULL,
	jsonurl VARCHAR ( 50 ) NOT NULL,
    chainsurl VARCHAR ( 50 ) NOT NULL
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
	owner_name VARCHAR ( 12 ) PRIMARY KEY,
	cors_check BOOLEAN NOT NULL,
    http_check BOOLEAN NOT NULL,
    http2_check BOOLEAN NOT NULL,
    full_history BOOLEAN NOT NULL,
    snapshots BOOLEAN NOT NULL,
    seed_node BOOLEAN NOT NULL,
    api_node BOOLEAN NOT NULL,
    oracle_feed BOOLEAN NOT NULL,
    wax_json BOOLEAN NOT NULL,
    chains_json BOOLEAN NOT NULL,
    last_check TIMESTAMP NOT NULL
);

/* 
/* CREATE ROLE oig WITH LOGIN PASSWORD 'nightshade900'; */


CREATE USER oiguser WITH ENCRYPTED PASSWORD 'nightshade900';
GRANT ALL PRIVILEGES ON DATABASE oig TO oiguser ;
GRANT ALL PRIVILEGES ON SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA oig TO oiguser ;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA oig TO oiguser ;