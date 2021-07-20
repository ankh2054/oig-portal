#!/bin/bash
## Run update script passing name of container and master Postgresqpassword
## The script will copy over the updated backend files 
# Example: ./update.sh oig-portal pgpassword

dbupdate='True'

# Copy over backend files
sudo docker cp backend/*.py $2:/app/backend
sudo docker cp backend/*.sql $2:/app/backend

# Perform a file content check on db_changes.sql
# Set ENV & Update DB

if dbupdate == 'True' then
    sudo docker exec -ti $2 export PGPASSWORD=$3
    sudo docker exec -ti $2 psql -d oig -W < db_changes.sql
    sudo docker exec -ti $2 export PGPASSWORD='XZsacr%Drabbit!!'
else then
    echo "DB udadate not required"

echo "Updates completed"

