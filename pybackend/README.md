## A/B Testing Scripts
To prepare for A/B Experiments, we need to reset the boards to the default configurations. This is what the `PreExperiment.py` script is for. The other script, `helppage.py` is used to create a backup JSON for the Firebase data.

Steps:
1. Create a Python virtual environment, and activate it
	- `python -m venv venv`
	- Windows: `venv/Scripts/Activate` 
2. Install Firebase
	- `pip install firebase-admin` 
3. You will also need to create a file called for the Firebase Credentials in the same folder
	- The credential that goes in this file can be found on the Firebase dashboard
		- Digipedal > Project Settings > Service Accounts > Generate new Private Key
	- Replace the parameter on line 7 of `PreExperiment.py` with this filename
4.  Run `PreExperiment.py`
	- `python PreExperiment.py`
5. Conduct Experiment
6. Repeat

To verify, confirm that `Backup A` and `Board of the Flies` look the same in the Digipedal app (or in Firestore). You can do the same check for `Backup B` and `Pedals of Fury`