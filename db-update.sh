#!/bin/bash
## Run update script passing name of container
## The script will copy over the updated backend files. you will be prompted for the PostgreSQL password
# Example: ./update.sh oig.db


dbupdate='True'

# Copy over backend files
sudo docker cp backend/. $1:/app/backend


# Perform a file content check on db_changes.sql
# Set ENV & Update DB

if [[ $dbupdate == 'True' ]]
then
  sudo docker exec -ti oig.db /bin/bash -c "psql -d oig -W < /app/backend/db_changes.sql"
else
  echo "DB udadate not required"
fi


echo "Updates completed"

