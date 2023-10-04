#!/bin/bash

#adduser webhooks

# Create a node-owned folder to put the app in
# You call this whatever you like, probably the name of your application
#chown -R webhooks:webhooks /opt/oot/webhooks

echo "Installing webhooks service"
if [ ! -f ".env" ]; then
    echo "Copying sample.env to .env, please chek the file contents and adjust if necessary"
    cp sample.env .env
fi

npm ci

mkdir -p /opt
unlink /opt/oot
ln -s $(pwd)/../.. /opt/oot

cp ./webhooks.service /lib/systemd/system/webhooks.service
systemctl daemon-reload
echo "Success, run 'systemctl enable --now webhooks' to start the service"


