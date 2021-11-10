
/*
From the consolse connect to POostgresql
1. psql -d oig -W  < db_changes.sql
2. "Enter the PostgreSQL password as specified during initital container start"
The command will execute all new DB changes required since last update

*/
alter table oig.results
add atomic_api boolean;

alter table oig.results
add atomic_api_error VARCHAR ( 1000 );

INSERT INTO oig.pointsystem(points_type,points,multiplier,min_requirements)
VALUES ('atomic_api','2','11',false);

-- Do this while logged into oiguser / the user fastify will log in as

CREATE TABLE oig.adminsettings (
    minimum_tech_score SMALLINT NOT NULL 
);

INSERT INTO oig.adminsettings(minimum_tech_score) VALUES(120);


drop index if exists oig.idx_nodes_type;
drop index if exists oig.idx_nodes_types;
CREATE UNIQUE INDEX idx_nodes_type ON oig.nodes(owner_name, node_type, http_node_url );


-- Add metasnapshot_date column
ALTER TABLE oig.adminsettings ADD COLUMN metasnapshot_date timestamp with time zone;
ALTER TABLE oig.bizdev ADD COLUMN metasnapshot_date timestamp with time zone;
ALTER TABLE oig.community ADD COLUMN metasnapshot_date timestamp with time zone;
ALTER TABLE oig.pointsystem ADD COLUMN metasnapshot_date timestamp with time zone;
ALTER TABLE oig.producer ADD COLUMN metasnapshot_date timestamp with time zone;
ALTER TABLE oig.products ADD COLUMN metasnapshot_date timestamp with time zone;
ALTER TABLE oig.results ADD COLUMN metasnapshot_date timestamp with time zone;

-- Drop all current indexes and primary keys that do not use metasnapshot dates
DROP INDEX oig.idx_bizdevs_type;
ALTER TABLE oig.community DROP CONSTRAINT community_pkey;
ALTER TABLE oig.pointsystem DROP CONSTRAINT pointsystem_pkey;
ALTER TABLE oig.producer DROP CONSTRAINT producer_pkey;
DROP INDEX oig.idx_bizdev_type;
DROP INDEX oig.idx_products_type;
DROP INDEX oig.idx_results_type;

-- Make replacement indexes using metasnapshot date
CREATE UNIQUE INDEX adminsettings_idx ON oig.adminsettings(metasnapshot_date);
CREATE UNIQUE INDEX bizdev_idx ON oig.bizdev(owner_name,name,metasnapshot_date);
CREATE UNIQUE INDEX community_idx ON oig.community(owner_name,metasnapshot_date);
CREATE UNIQUE INDEX pointsystem_idx ON oig.pointsystem(points_type,metasnapshot_date);
CREATE UNIQUE INDEX producer_idx ON oig.producer(owner_name,metasnapshot_date);
CREATE UNIQUE INDEX product_idx ON oig.products(owner_name,name,metasnapshot_date);
CREATE UNIQUE INDEX results_idx ON oig.results(owner_name,date_check,metasnapshot_date);

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
