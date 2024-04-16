readonly EXEC="pdb"
readonly USER="digipedald"

# Ensure running as root
if [ "$EUID" -ne 0 ]; then
    echo "You must run the uninstall script as root (user 0)"
    exit
fi

# Remove directories
rm -rf /etc/${EXEC}.conf /var/lib/${EXEC} /var/log/${EXEC}
echo "Removed all directories"

# Remove user and group 
userdel ${USER}
groupdel ${USER}

echo "Uninstalled!"