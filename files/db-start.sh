#!/bin/sh

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
# Check if exsting DB exists
if [ ! -d "$PG_DATA" ]; then
  echo "Starting PostgreSQL"
  sudo -u postgres ${PG_BINDIR}/postgres -D ${PG_DATA} -c config_file=${PG_CONFIG_FILE} >logfile 2>&1 &



  sleep 5 


  echo "installing DB: ${DB_DATABASE}" 
  createdb -U postgres ${DB_DATABASE}

  echo "Setting up OIGDB"
  psql -U postgres ${DB_DATABASE} < /app/backend/postgresql.sql

  echo "Edit postgrsql config file to allow to listen on all IPs"
  echo "listen_addresses = '*' " >> ${PG_CONFIG_FILE}

  echo "Stopping Postgres DB ready for Supervisor "
  ps -aux | ps axf | grep "/usr/lib/postgresql/15/bin/postgres"  | grep -v grep | awk '{print "kill -9 " $1}' | sh

else
  echo "DB already exists"
fi

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
[program:fastapi]
command=uvicorn main:app --reload --reload-delay  432000
directory=/app/oig-portal/backend
priority=1
autostart=true
autorestart=true
numprocs=1
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



