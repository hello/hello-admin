#!/bin/sh

VERSION=$1

if [ -z "$1" ]
  then
    echo "[ERROR] \xE2\x9A\xA0 Missing version number"
    exit 1
fi
s3cmd get s3://hello-maven/release/com/hello/suripu/suripu-admin/$VERSION/suripu-admin-$VERSION.jar . --force
s3cmd get s3://hello-deploy/configs/com/hello/suripu/suripu-admin/$VERSION/suripu-admin.prod.yml . --force

echo "Updating symlink for suripu-admin"
rm /home/build/build/suripu-admin.jar
ln -s /home/build/build/suripu-admin-$1.jar /home/build/build/suripu-admin.jar
echo "Moving admin config to  /etc/"
cp /home/build/build/suripu-admin.prod.yml /etc/suripu-admin.prod.yml
echo "restarting"

restart suripu-admin