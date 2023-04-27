
/*
From the consolse connect to POostgresql
1. psql -d oig -W  < db_changes.sql
2. "Enter the PostgreSQL password as specified during initital container start"
The command will execute all new DB changes required since last update

*/




-- Add publickey to oig.producer 
alter table oig.producer add publickey varchar(100);



-- Removing metasnapshot date
DELETE FROM oig.results WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';
DELETE FROM oig.producer WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';
DELETE FROM oig.pointsystem WHERE metasnapshot_date != timestamp '1980-01-01 00:00:00';
DROP TABLE  oig.products,oig.bizdev,oig.community,oig.snapshotsettings,oig.adminsettings,oig.updates CASCADE;


-- Step 1: Drop the existing unique index
DROP INDEX oig.results_idx;

-- Step 2: Drop the metasnapshot_date column
ALTER TABLE oig.results DROP COLUMN metasnapshot_date;

-- Step 3: Create a new unique index without the metasnapshot_date column
CREATE UNIQUE INDEX results_idx ON oig.results(owner_name, date_check);


-- Step 1: Drop the existing unique index
DROP INDEX oig.producer_idx;

-- Step 2: Drop the metasnapshot_date column
ALTER TABLE oig.producer DROP COLUMN metasnapshot_date;

-- Step 3: Create a new unique index without the metasnapshot_date column
CREATE UNIQUE INDEX producer_idx ON oig.producer(owner_name);



-- Step 1: Drop the existing unique index
DROP INDEX oig.pointsystem_idx;

-- Step 2: Drop the metasnapshot_date column
ALTER TABLE oig.pointsystem DROP COLUMN metasnapshot_date;

-- Step 3: Create a new unique index without the metasnapshot_date column
CREATE UNIQUE INDEX pointsystem_idx ON oig.pointsystem(points_type);