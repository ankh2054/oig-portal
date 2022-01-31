# Welcome to OIG Portal



## Architecture 

* Python backend - The runs the technical checks every 2 hours and saves the results to the a Database.
* React frontend that pulls through all data from DB.


### Core components

* **Technical checks** - Every 2 hours the python backend runs all the technical checks as required by the OIG and scores accordingly. 
* **Technical scores** - The scores assigned to each technical check can be configured in [admin panel](admin.md). 
* **Minimum requirement score** - The minimum score requirement is configured in [admin panel](admin.md).
* **Technical score minimum requirements** - Each technical check can be configured as a minimum requirement, so that if a guild fails that checks 1000 points is automatically dedicated from the final score ensuring that the Guild fails.
* **Metasnapshots** - Metasnapshots take a snapshot of the database as it currently is on the date of the snapshot. Current Guilds, current technical snapshot score, product data etc...
* **Technical snapshots** - Allows saving the state of technical checks of a specific date, which acts as a input for the metasnapshots. The technical snapshot is also what the score page is based on to allow the OIG to edit technical scores before saving a metasnapshot, without having it overwritten by the 2 hourly technical checks. 
* **Scores** - This shows the current scoring of all the Guilds and allows the OIG to change scoring, add new products or add notes to help with the collaborative working environment.
* **Latest Results** - The most recent technical results are published here. 



### Technical snapshots

The latest results will always show the latest tech results, however to plan ahead for a date of when to base the technical scores on you can set this date in the admin page. Each time the checks are run, this date is checked and if it falls on that date, those set of results will be **flagged**. When viewing the scores page, the tech results shown are the latest **flagged** tech results.

Please see the [Set the date for technical snapshots](admin.md) for further details.

### Metasnapshot

Metasnapshots which is manually triggered by the OIG within the [admin panel](admin.md) take a snapshot of the database as it currently stands. The idea behind this function is to allow the OIG to adjust the scoring for each Guild and once satisfied with the results, save these results. Each metasnapshot that is created can be accessed, re-edited and re-saved to account for any appeals that occur before the final score is published.




