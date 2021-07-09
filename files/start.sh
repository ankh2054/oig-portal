#!/bin/sh

env_setup() {
cd /app

# Add DB API database settings
sed -i "s/pgdb/$DB_DATABASE/" dbapi/.env && \
sed -i "s/pgmuser/$DB_USER/" dbapi/.env && \
sed -i "s/pgpassword/$DB_PASSWORD/" dbapi/.env
sed -i "s/pgdockername/$PGNAME/" dbapi/.env 
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
[program:nginx]
command=/usr/sbin/nginx
autorestart=true
autostart=true
[program:frontend]
command=bash -c 'node server.js &> logs/frontend.log'
directory=/app/fastify
priority=4
autostart=true
autorestart=true
numprocs=1

EOF
}


## If python comands to not work you need to install point python to the right version
# sudo rm /usr/bin/python3
#sudo ln -s python3.7 /usr/bin/python3

# Running all our scripts
env_setup
create_supervisor_conf




# Start Supervisor 
echo "Starting Supervisor"
/usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf



