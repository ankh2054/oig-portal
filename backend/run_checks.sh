#!/bin/bash

# Checks if the python process is already running
# Each Linux or Unix bash shell command returns a status when it terminates normally or abnormally. 
# You can use command exit status in the shell script to display an error message or take some sort of action.

COMMAND='/usr/bin/python3 /app/oig-portal/backend/start.py'
PIDFILE='/tmp/oig.pidc'
LOGFILE='/app/python-oig.log'

if [ -f $PIDFILE ]; then
  PID=$(cat $PIDFILE)
  if ps -p $PID > /dev/null; then
    echo "Not running as process already running"
    exit 1
  else
    # process not running, remove the stale pid file
    rm $PIDFILE
  fi
fi

$COMMAND >> $LOGFILE 2>&1 &
echo $! > $PIDFILE


