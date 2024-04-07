# The Pedalboard Daemon
The pedalboard daemon is responsible for maintaining the correct order of JACK connections between audio outputs, inputs, and pedals. It is configured via a config file, and it is controlld using HTTP requests at runtime.

## Usage
##### NAME
**pbd** - Pedalboard Daemon

##### SYNOPSIS
**pbd** [**-dnv**] [**-f** *file*]

##### DESCRIPTION
The **pdb** daemon is an http server which manages JACK connections. Pd

The options are as follows:
* **-d**
	- Debug mode. Run the server without detaching or becoming a daemon. This allows for easy monitoring.
* **-f** *file*
	- Specifies the configuration file. The default is */etc/pbd.conf*
* **-n**
	- Check that the configuration is valid, but do not start the daemon.
* **-v**
	- Verbose mode. Prints to the command line what would typically be written to the log.

## COMMANDS
The server will respond to the following http requests:
* **GET** /pedals/*pedal_uri*
	- Returns a "1" if the pedal exists already on the machine, and a "0" otherwise. This can be used to avoid sending files over the network.
* **PUT** /boards/*board_id*/pedals/*pedal_index*
	- Changes a parameter of a pedal 
	- Body is a JSON file which includes:
		+ param: *parameter name*
		+ value: *parameter value*
* **DELETE** /boards/*board_id*/pedals/*pedal_index*
	- Deletes the specified pedal from the pedal board
* **POST** /boards/*board_id*/pedals/*pedal_index*
	- Adds a pedal to the board at this index. Should this index be out of range, will insert it as the last pedal.
	- Body is a JSON file which includes the tarball. This tarball contains the manifest `.ttl`, the pedal `.ttl`, and the `.so` file for the pedal. If the pedal already exists on the server, the tarball does not need to be sent:
		+ "pedal_uri": *pedal_uri*
		+ "tarball" (optional): *pedal.tar.gz*
* **GET** /boards/current
	- Returns the id of the current board
* **PUT** /boards/current
	- Sets the current board to the specified board id
	- Body is a JSON file which includes:
		+ board_id: *board_id*

## FILES
* */etc/pbd.conf*
	- Default configuration file
* */var/log/pbd/access.log*
	- Default access log
* */var/log/pbd/error.log*
	- Default error log