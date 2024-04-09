# The Pedalboard Daemon
The pedalboard daemon is responsible for maintaining the correct order of JACK connections between audio outputs, inputs, and pedals. It is configured via a config file, and it is controlld using HTTP requests at runtime.

## Dependencies
* jackd - To run the JACK server
* jack-example-tools - Tools for configuring JACK connections
* aj-snapshot - Tools for snapshoting JACK state (pedalboards)
* jalv - JACK plugin host

## Testing
Put a new board onto the board
```
curl -X POST --json '{"board_index":0,"pedal_index":0,"pedal_uri":"http://calf.sourceforge.net/plugins/Reverb","audio_in":"in_l","audio_out":"out_l"}' 127.0.0.1:3444/board/pedal
```

Configure the settings of this pedal
```
curl -X PUT --json '{"board_index":0,"pedal_index":0,"param_vals":{"amount":"1"}}'
```

## Usage
##### NAME
**pbd** - Pedalboard Daemon

##### SYNOPSIS
**pbd** [**-dnv**] [**-f** *file*]

##### DESCRIPTION
The **pdb** daemon is an http server which manages JACK connections. Pd

The options are as follows:
* **-d**
    - Daemonize. Detach the server and become a daemon.
* **-f** *file*
    - Specifies the configuration file. The default is */etc/pbd.conf*
* **-n**
    - Check that the configuration is valid, but do not start the daemon.
* **-v**
    - Verbose mode. Prints to the command line what would typically be written to the log.

## COMMANDS
The server will respond to the following http requests:
* **DELETE** /board?board_index=*board_index*
    - Deletes the all pedals from a board
* **GET** /board/active
    - Returns the index of the active board
* **PUT** /board/active
    - Sets the current board to the specified board index
    - Body is a JSON file which includes:
        + "board_index": *board_index*
* **POST** /board/pedal
    - Adds a pedal to the board at this index. Should this index be out of range, will insert it as the last pedal.
    - Body is a JSON file which includes the tarball. This tarball contains the manifest `.ttl`, the pedal `.ttl`, and the `.so` file for the pedal. If the pedal already exists on the server, the tarball does not need to be sent:
        + "board_index": *board index*
        + "pedal_index": *pedal index*
        + "pedal_uri": *pedal_uri*
        + "audio_in": *audio_in_port_name*
        + "audio_out": *audio_out_port_name*
        + "tarball" (optional): *pedal.tar.gz*
* **PUT** /board/pedal
    - Changes a parameter of a pedal 
    - Body is a JSON file which includes:
        + board_index: *board index*
        + pedal_index: *pedal index*
        + param_vals:
            * "*parameter 1 name*": "*parameter 1 value*"
            * "*parameter 2 name*": "*parameter 2 value*"
            * ...
* **DELETE** /board/pedal?board_index=*board_index*&pedal_index=*pedal_index*
    - Deletes the specified pedal from the pedal board
* **GET** /pedal?pedal_uri=*pedal_uri*
    - Returns a "200" HTTP response code if the pedal exists already on the machine, and a "404" otherwise. This can be used to avoid sending files over the network.

## FILES
* */etc/pbd.conf*
    - Default configuration file
* */var/log/pbd/access.log*
    - Default access log
* */var/log/pbd/error.log*
    - Default error log
