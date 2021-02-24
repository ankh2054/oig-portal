# oig-portal
OIG portals to easily check services of BPs for reporting

Backend will run as Python

Frontend
Nodejs fastify server will contain the CRUD operatios to database & the APIS we can call to access data in DB.
Nodejs React as our user frontend which when build will reside in express server.
Nginx then proxy any port 80 requets to the express server running on port 3000

DB
PostgreSQL

## Install (Frontend)
cd frontend/fastify \
&& npm ci \
&& cd ../react-front \
&& npm ci

### Start Fastify
cd frontend/fastify \
&& npm run dev

### Start React (after Fastify)
\[Seperate Tab - needs fastify running to get data\]:
```
cd frontend/react-front \
&& npm run start
```
### Start React (after Fastify) [Powershell]
\[Seperate Tab - needs fastify running to get data\]:
```
cd frontend/react-front
npm run start-win
```
### Start React (after Fastify) [Powershell]
\[Seperate Tab - needs fastify running to get data\]:
```
cd frontend/react-front
npm start-win
```
### Run producer-data
Start PostGreSQL

python3 backend/producer-data.py

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