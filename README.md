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
&& npm start
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

Referencing:
    in WithStyles(ForwardRef(Collapse)) (at snapshot_scoring.js:148)
    in WithStyles(ForwardRef(Card)) (at snapshot_scoring.js:104)
    in WithStyles(ForwardRef(Grid)) (at snapshot_scoring.js:103)
    in WithStyles(ForwardRef(Grid)) (at snapshot_scoring.js:101)
    in App (at snapshot-results.js:107)
    in div (at snapshot-results.js:69)
    in App (at App.js:109)
    in Route (at App.js:109)
    in BrowserRouter (at App.js:104)
    in WithStyles(ForwardRef(Paper)) (at App.js:103)
    in WithStyles(ForwardRef(Grid)) (at App.js:102)
    in WithStyles(ForwardRef(Grid)) (at App.js:101)
     in WithStyles(ForwardRef(Container)) (at App.js:99)
    in Switch (at App.js:96)
    in main (at App.js:95)
    in Route (at src/index.js:12)
    in BrowserRouter (at src/index.js:11)
    in StrictMode (at src/index.js:10)