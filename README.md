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



# Run the frontend container

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
oig-frontend:prod
```


# 4 Run the DB container 

```
docker run --network=sentnl-net  --name oig.db --expose 5432 \
-d -e "PGPASSWORD=postgresqlpassword" \
-e "DB_DATABASE=dbname" \
-e "DB_USER=dbuser" \
-e "DB_PASSWORD=dbpassword" \
-v /data/sites/oig.sentnl.io/postgresql:/var/lib/postgresql \
oig-postgresql:prod
```



### Known errors
````
<IconButton>
    <HttpsIcon ... />
</IconButton>
````
This causes a `validateDOMNesting` error: button inside a button.

Error: Objects are not valid as a React child (found: object with keys {id}). If you meant to render a collection of children, use an array instead.

Editing the name of a product causes a new entry for that product rather than replacing it (in snapshot editor). Fixed via disabling the name update field.

Opening the product table for a BP in snapshot editor results in:
````
Warning: findDOMNode is deprecated in StrictMode. findDOMNode was passed an instance of Transition which is inside StrictMode. 
```

### Future proofing / refactoring ideas
Replace moment.js with Luxon or a similarly maintained, lighter framework

## Generating cached images

```SELECT logo_svg from "oig"."producer"```

Save in logolist.txt

Run wget -r --cut-dirs=20 -A .png,.jpeg,.jpg  -i ./logolist.txt

Then place in logo_cache