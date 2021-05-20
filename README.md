# oig-portal
WAX OIG portal


# Build the production OIG container
```
CD into directory of choice
docker build https://github.com/ankh2054/oig-portal.git -t oig-portal 

```


## ENV Variables

|ENV & ARG                 |Value                          |Description                                   |
|--------------------------|---------------------------------------|--------------------------------------|
|**PGPASSWORD**            |`postgresqlpassword`                   | PostgreSQL password                  |
|**DB_DATABASE**           |`waxram`                               | Database Name for RAM data           |
|**DB_USER**               |`waxramuser`                           | Database user with access to DB      |
|**DB_PASSWORD**           |`waxramuserpassword`                   | Password for Database user       	  |




# Run the container using nginx proxy

```
docker run  --name oig.sentnl.io --expose 80 \
-d -e "VIRTUAL_HOST=oig.sentnl.io" \
-e "LETSENCRYPT_HOST=oig.sentnl.io" \
-e "LETSENCRYPT_EMAIL=charles.holtzkampf@gmail.com" \
-e "PGPASSWORD=postgresqlpassword" \
-e "DB_DATABASE=waxdb" \
-e "DB_USER=waxramuser" \
-e "DB_PASSWORD=waxramuserpassword" \
-v /data/sites/oig.sentnl.io/postgresql:/var/lib/postgresql \
oig-portal:latest
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