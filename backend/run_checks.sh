#!/bin/bash

# Checks if the python process is already running
# Each Linux or Unix bash shell command returns a status when it terminates normally or abnormally. 
# You can use command exit status in the shell script to display an error message or take some sort of action.

COMMAND='/usr/bin/python3 /app/oig-portal/backend/start.py'
ps -aux | grep $COMMAND >/dev/null && echo "Not running as process already running" || $COMMAND >> /app/python-oig.log 2>&1


