
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