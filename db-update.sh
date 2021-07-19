#!/bin/bash
## Run update script passing name of container and master Postgresqpassword
# EXample: ./update.sh oig-portal pgpassword

# Copy over backend files
sudo docker cp backend/* $2:/app/backend


# Set ENV & Update DB
sudo docker exec -ti $2 export PGPASSWORD=$3
sudo docker exec -ti $2 psql -d oig -W < db_changes.sql