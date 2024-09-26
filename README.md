# oig-portal
WAX OIG portal

# 1 Pull down repo & Create the docker network 
`git pull https://github.com/ankh2054/oig-portal.git`
`docker network create sentnl-net`

# 2 Build the website  container

### Build Production Frontend
```
docker build -f Dockerfile.alpine \
--build-arg VITE_APP_DEV_API_URL=http://localhost:3000/api \
--build-arg VITE_APP_PROD_API_URL=https://wax.sengine.co/api -t oig-frontend:prod .
```

### Build Staging Frontend
```
docker build -f Dockerfile.alpine \
--build-arg VITE_APP_DEV_API_URL=http://localhost:3000/api \
--build-arg VITE_APP_PROD_API_URL=https://oigstage.sentnl.io/api -t oig-frontend:stage .
```

# 3 Build the DB container

`docker build -f Dockerfile.db -t oig-postgresql:prod .`




## ENV Variables

|ENV & ARG                 |Value                                  |Description                           |
|--------------------------|---------------------------------------|--------------------------------------|
|**PGPASSWORD**            |`postgresqlpassword`                   | PostgreSQL password                  |
|**DB_DATABASE**           |`waxram`                               | Database Name for RAM data           |
|**DB_USER**               |`oigdbuser`                            | Database user with access to DB      |
|**DB_PASSWORD**           |`oigdbpassword`                        | Password for Database user       	  |
|**PGNAME**                |`oig.db`                               | PG container name                    |
|**PYTHONAPI**             |`oig.db`                               | Python API container name            |
|**JWTSECRET**             |`secret`                               | JWT secret for fastify               |
|**PYTHON_FASTAPI**        |`http://oig.db:8000`                   | Python API server                    |
|**MISSINGBLOCKS_MAIN**    |`https://missm.sentnl.io`              | Missing Blocks API for Mainnet       |
|**MISSINGBLOCKS_TEST**    |`https://misst.sentnl.io`              | Missing Blocks API for Testnet       |



 
# 4 Run the frontend container

- For Production use oig-frontend:prod
- For staging use oig-frontend:stage

```
docker run --network=sentnl-net --name oig.sentnl.io --expose 80 \
-d -e "VIRTUAL_HOST=oig.sentnl.io" \
-e "LETSENCRYPT_HOST=oig.sentnl.io" \
-e "LETSENCRYPT_EMAIL=charles.holtzkampf@gmail.com" \
-e "PGPASSWORD=postgresqlpassword" \
-e "DB_DATABASE=oig" \
-e "DB_USER=waxramuser" \
-e "DB_PASSWORD=waxramuserpassword" \
-e "PGNAME=oignew.db" \
-e "PYTHONAPI=oignew.db" \
-e "PYTHON_FASTAPI=http://oignew.db:8000" \
-e "JWTSECRET=secret" \
-e "MISSINGBLOCKS_MAIN=https://missm.sentnl.io" \
-e "MISSINGBLOCKS_TEST=https://misst.sentnl.io" \
oig-frontend:prod
```


# 5 Run the DB container 
- Upddate backebd/postgresql.sql file with the same username and password you specify below.

```
docker run --network=sentnl-net  --name oignew.db --expose 5432 --expose 8000 \
-d -e "PGPASSWORD=postgresqlpassword" \
-e "DB_DATABASE=dbname" \
-e "DB_USER=dbuser" \
-e "DB_PASSWORD=dbpassword" \
-v /data/sites/oig.sentnl.io/postgresql:/var/lib/postgresql \
oig-postgresql:prod
```


# 6 Update frontendcontainer 
- Rebuild container image
- Delete original container 
- Restart container


# 7 Update the backend container 
 * Run update script passing name of container and master Postgresqpassword
## EXample: ./db-update.sh oig-portal pgpassword

