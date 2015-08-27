#!/bin/sh

ADMIN_VERSION=$1
if [ -z "$1" ]
  then
    echo "[ERROR] \xE2\x9A\xA0 Missing admin version number"
    exit 1
fi

echo "Updating symlink for suripu-admin"
rm /home/build/build/suripu-admin.jar
ln -s /home/build/build/suripu-admin-solo-$ADMIN_VERSION.jar /home/build/build/suripu-admin.jar
echo "Moving admin config to /etc/"
cp /home/build/build/suripu-admin.staging.yml /etc/suripu-admin.prod.yml
echo "restarting"

restart suripu-admin
echo "sleeping for 30 seconds ..."
sleep 30

