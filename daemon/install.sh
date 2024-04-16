#!/bin/sh
readonly EXEC="pdb"
readonly USER="digipedald"

# Ensure running as root
if [ "$EUID" -ne 0 ]; then
    echo "You must run the install script as root (user 0)"
    exit
fi

# Create relevant user
useradd -MrU ${USER}
echo "Created user: ${USER}"

# Create relevant directories
cp --preserve=all default.conf /etc/${EXEC}.conf # config file
chmod 644 /etc/${EXEC}.conf
echo "Created file /etc/${EXEC}.conf"
mkdir -pm 664 /var/lib/${EXEC} # save files (saved pedals)
mkdir -pm 664 /var/log/${EXEC} # log files
chown -R ${USER}:${USER} /etc/${EXEC}.conf /var/lib/${EXEC} /var/log/${EXEC}
echo "Created dir /var/lib/${EXEC}"
echo "Created dir /var/log/${EXEC}"

echo "Installed!"