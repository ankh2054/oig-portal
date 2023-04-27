# oig-portal
WAX OIG portal

# 1 Pull down repo & Create the docker network 
`git pull https://github.com/ankh2054/oig-portal.git`
`docker network create sentnl-net`

# 2 Build the website  container
`docker build -f Dockerfile.alpine -t oig-frontend:prod .`


# 3 Build the DB container

`docker build -f Dockerfile.db -t oig-postgresql:prod .`




## ENV Variables

|ENV & ARG                 |Value                          |Description                                   |
|--------------------------|---------------------------------------|--------------------------------------|
|**PGPASSWORD**            |`postgresqlpassword`                   | PostgreSQL password                  |
|**DB_DATABASE**           |`waxram`                               | Database Name for RAM data           |
|**DB_USER**               |`oigdbuser`                            | Database user with access to DB      |
|**DB_PASSWORD**           |`oigdbpassword`                        | Password for Database user       	  |
|**PGNAME**                |`oig.db`                               | PG container name                    |
|**PYTHONAPI**             |`oig.db`                               | Python API container name            |
|**JWTSECRET**             |`secret`                               | JWT secret for fastify               |


sed -i "s/pythonapi/$PYTHONAPI/" fastify/.env 
sed -i "s/jwtsecret/$JWTSECRET/" fastify/.env 
# 4 Run the frontend container

```
docker run --network=sentnl-net --name oig.sentnl.io --expose 80 \
-d -e "VIRTUAL_HOST=oig.sentnl.io" \
-e "LETSENCRYPT_HOST=oig.sentnl.io" \
-e "LETSENCRYPT_EMAIL=charles.holtzkampf@gmail.com" \
-e "PGPASSWORD=postgresqlpassword" \
-e "DB_DATABASE=oig" \
-e "DB_USER=waxramuser" \
-e "DB_PASSWORD=waxramuserpassword" \
-e "PGNAME=oig.db" \
-e "PYTHONAPI=oig.db" \
-e "JWTSECRET=secret" \
oig-frontend:prod
```


# 5 Run the DB container 

```
docker run --network=sentnl-net  --name oig.db --expose 5432 \
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

