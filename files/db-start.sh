#!/bin/bash

postgresql_install() {

# Initialise postgreSQL - 
# Check if exsting DB exists
if [ ! -d "$PG_DATA" ]; then

  chown postgres:postgres /var/lib/postgresql
  sudo -u postgres echo "${PGPASSWORD}" > ${PG_PASSWORD_FILE}
  chmod 600 ${PG_PASSWORD_FILE} && chown postgres:postgres ${PG_PASSWORD_FILE} && \
  

  sudo -u postgres ${PG_BINDIR}/initdb --pgdata=${PG_DATA} --pwfile=${PG_PASSWORD_FILE} \
    --username=postgres --encoding=UTF8 --auth=trust
else
  echo "DB already exists"
fi
}


oig_db_setup(){

echo "Starting PostgreSQL"
sudo -u postgres ${PG_BINDIR}/postgres -D ${PG_DATA} -c config_file=${PG_CONFIG_FILE} >logfile 2>&1 &

echo "creating initdb.sql file"
  cat > initdb.sql <<EOF
      CREATE SCHEMA oig;

      CREATE TABLE oig.producer (
        owner_name VARCHAR ( 12 ) PRIMARY KEY,
        candidate VARCHAR ( 40 ) NOT NULL,
        url VARCHAR ( 50 ) NOT NULL,
        jsonurl VARCHAR ( 50 ) NOT NULL,
          chainsurl VARCHAR ( 50 ) NOT NULL,
          active BOOLEAN NOT NULL,
          logo_svg VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a logo */
          country_code VARCHAR ( 100 ), /*Can be Null as sometimes people dont have a country specified */
          top21 BOOLEAN NOT NULL
      );


      CREATE TABLE oig.nodes (
        owner_name VARCHAR ( 12 ) ,
        node_type VARCHAR ( 20 ) NOT NULL,
        http_node_url VARCHAR ( 50 ) ,
          https_node_url VARCHAR ( 50 ) ,
          p2p_url VARCHAR ( 50 ) ,
          features TEXT []
      );

      /* Unique index to cover two culumns*/
      CREATE UNIQUE INDEX idx_nodes_type ON oig.nodes(owner_name, node_type);


      CREATE TABLE oig.results (
        owner_name VARCHAR ( 12 ),
        cors_check BOOLEAN NOT NULL,
          cors_check_error VARCHAR ( 1000 ),
          http_check BOOLEAN NOT NULL,
          http_check_error VARCHAR ( 1000 ),
          https_check BOOLEAN NOT NULL,
          https_check_error VARCHAR ( 1000 ),
          http2_check BOOLEAN NOT NULL,
          http2_check_error VARCHAR ( 1000 ),
          tls_check VARCHAR ( 10 ),
          tls_check_error VARCHAR ( 1000 ),
          producer_api_check VARCHAR ( 10 ),
          producer_api_error VARCHAR ( 1000 ),
          net_api_check VARCHAR ( 10 ),
          net_api_error VARCHAR ( 1000 ),
          dbsize_api_check VARCHAR ( 10 ),
          dbsize_api_error VARCHAR ( 1000 ),
          full_history BOOLEAN NOT NULL,
          full_history_error VARCHAR ( 1000 ),
          v2_history BOOLEAN NOT NULL,
          v2_history_error VARCHAR ( 1000 ),
          snapshots BOOLEAN NOT NULL,
          snapshots_error VARCHAR ( 1000 ),
          seed_node BOOLEAN NOT NULL,
          seed_node_error VARCHAR ( 1000 ),
          api_node BOOLEAN NOT NULL,
          api_node_error VARCHAR ( 1000 ),
          oracle_feed BOOLEAN NOT NULL,
          oracle_feed_error VARCHAR ( 1000 ),
          wax_json BOOLEAN NOT NULL,
          chains_json BOOLEAN NOT NULL,
          cpu_time DECIMAL NOT NULL,
          cpu_avg DECIMAL NOT NULL,
          date_check TIMESTAMPTZ NOT NULL,
          score DECIMAL NOT NULL,
          snapshot_date TIMESTAMPTZ,
          comments VARCHAR ( 1000 )
      );
      /* Unique index to cover two culumns*/
      CREATE UNIQUE INDEX idx_results_type ON oig.results(owner_name, date_check);

      CREATE TABLE oig.pointsystem (
        points_type VARCHAR ( 50 ) PRIMARY KEY,
        points SMALLINT,
          multiplier DECIMAL NOT NULL
      );

      CREATE TABLE oig.products (
        owner_name VARCHAR ( 12 ),
        name VARCHAR ( 40 ) NOT NULL,
        description VARCHAR ( 1000 ) NOT NULL,
        development_stage VARCHAR ( 50 ) NOT NULL,
          analytics_url VARCHAR ( 100 ),
          spec_url VARCHAR ( 100 ),
          code_repo VARCHAR ( 100 ),
          points SMALLINT NOT NULL,
          score DECIMAL NOT NULL,
          date_updated TIMESTAMPTZ NOT NULL,
          comments VARCHAR ( 1000 )
      );
      CREATE UNIQUE INDEX idx_products_type ON oig.products(owner_name, name);

      CREATE TABLE oig.bizdev (
        owner_name VARCHAR ( 12 ),
        name VARCHAR ( 40 ) NOT NULL,
        description VARCHAR ( 1000 ) NOT NULL,
        deal_stage VARCHAR ( 50 ) NOT NULL,
          analytics_url VARCHAR ( 100 ),
          spec_url VARCHAR ( 100 ),
          points SMALLINT NOT NULL,
          score DECIMAL NOT NULL,
          date_updated TIMESTAMPTZ NOT NULL,
          comments VARCHAR ( 1000 )
      );
      CREATE UNIQUE INDEX idx_bizdev_type ON oig.bizdev(owner_name, name);

      CREATE TABLE oig.community (
        owner_name VARCHAR ( 12 ) PRIMARY KEY,
        origcontentpoints SMALLINT NOT NULL,
          transcontentpoints SMALLINT NOT NULL,
          eventpoints SMALLINT NOT NULL,
          managementpoints SMALLINT NOT NULL,
          outstandingpoints SMALLINT NOT NULL,
          score DECIMAL NOT NULL,
          date_updated TIMESTAMPTZ NOT NULL,
          comments VARCHAR ( 1000 )
      );

      CREATE TABLE oig.snapshotsettings (
          snapshot_date TIMESTAMPTZ 
      );

      CREATE TABLE oig.updates (
        owner_name VARCHAR ( 12 ),
        tech_ops VARCHAR ( 10000 ),
          product VARCHAR ( 10000 ),
          bizdev VARCHAR ( 10000 ),
          community VARCHAR ( 10000 ),
          date_update TIMESTAMPTZ NOT NULL 
      );
      CREATE UNIQUE INDEX idx_updatess_type ON oig.updates(owner_name, date_update);

      CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
      GRANT ALL PRIVILEGES ON DATABASE ${DB_DATABASE} TO ${DB_USER} ;
      GRANT ALL PRIVILEGES ON SCHEMA oig TO ${DB_USER} ;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA oig TO ${DB_USER} ;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA oig TO ${DB_USER} ;
EOF

sleep 5 


echo "installing DB: ${DB_DATABASE}" 
createdb -U postgres ${DB_DATABASE}

echo "Setting up OIGDB"
psql -U postgres ${DB_DATABASE} < initdb.sql

echo "Stopping Postgres DB ready for Supervisor "
ps -aux | ps axf | grep "/usr/lib/postgresql/13/bin/postgres"  | grep -v grep | awk '{print "kill -9 " $1}' | sh

}

# ########################
# Creating supervisor file
###########################

create_supervisor_conf() {
  rm -rf /etc/supervisor/supervisord.conf
  cat > /etc/supervisor/supervisord.conf <<EOF
[unix_http_server]
file=/var/run/supervisor.sock   ; 
chmod=0700                       ; 
[supervisord]
logfile=/var/log/supervisord.log ; 
pidfile=/var/run/supervisord.pid ; 
childlogdir=/var/log/           ; 
[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface
[supervisorctl]
serverurl=unix:///var/run/supervisor.sock ; 
[program:postgresql]
command=${PG_BINDIR}/postgres -D ${PG_DATA} -c config_file=${PG_CONFIG_FILE}
directory=${PG_BINDIR}
priority=1
autostart=true
autorestart=true
numprocs=1
user=postgres
[program:crond]
priority = 100
#command = bash -c "while true; do sleep 0.1; [[ -e /var/run/crond.pid ]] || break; done && exec /usr/sbin/cron -f" 
command = /usr/sbin/cron -f
startsecs = 0
autorestart = true
redirect_stderr = true
stdout_logfile = /var/log/cron
stdout_events_enabled = true
EOF
}


## If python comands to not work you need to install point python to the right version
# sudo rm /usr/bin/python3
#sudo ln -s python3.7 /usr/bin/python3

# Running all our scripts
create_supervisor_conf
postgresql_install
oig_db_setup



# Start Supervisor 
echo "Starting Supervisor"
/usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf



