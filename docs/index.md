# Welcome to OIG Portal



## Architecture 

* Python backend - The runs the technical checks every 2 hours and saves the results to the a Database.
* React frontend that pulls through all data from DB.


### Core components

* Technical checks - Every 2 hours the python backend runs all the technical checks as required by the OIG and scores accordingly. 
* Technical scores - The scores assigned to each technical check can be configured in admin panel. 
* Minimum requirement score - The minimum score requirement is configured in admin panel.
* Technical score minimum requirements - Each technical check can be configured as a minimum requirement, so that if a guild fails that checks 1000 points is automatically dedicated from the final score ensuring that the Guild fails.
* Metasnapshots - Metasnapshots take a snapshot of the database as it currently is on the date of the snapshot. Current Guilds, current technical snapshot score, product data etc...
* Technical snapshots - Allows saving the state of technical checks of a specific date, which acts as a input for the metasnapshots. The technical snapshot is also what the score paged is based on to allow the OIG to edit technical scores before saving a metasnapshot, without having it overwritten by the 2 hourly technical checks.  are also the ones 
* Scores
* Latest Results 



### Technical snapshots

The latest results will always show the latest tech results, however to plan ahead for a date of when to base the technical scores on you can set such a date in the admin page. Each time the python backend code runs, it checks whether this has been set. If the date the checks run matches the date set for the snapshot it will save that tech results to the DB which will be the ones show in the scores page.

Please see the [Set the date for technical snapshots](admin.md) for further details.

### Metasnapshot


