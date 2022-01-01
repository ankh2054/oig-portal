# Welcome to OIG Portal



## Architecture 

* Python backend - The runs the technical checks every 2 hours and saves the results to the a Database.
* React frontend that pulls through all data from DB.


### Technical snapshots

The latest results will always show the latest tech results, however to plan ahead for a date of when to base the technical scores on you can set such a date in the admin page. Each time the python backend code runs, it checks whether this has been set. If the date the checks run matches the date set for the snapshot it will save that tech results to the DB which will be the ones show in the scores page.

Please see the [Set the date for technical snapshots](admin.md) for further details.

### Metasnapshot


