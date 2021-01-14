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

### Start React
\[Seperate Tab\]:
```
cd frontend/react-front \
&& npm start
```