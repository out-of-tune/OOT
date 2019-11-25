#!/bin/bash
if [ "$NODE_ENV" != "production" ]
then
    echo "Running in development mode."
    exit 0
fi

echo "Running for production."
certbot --nginx --non-interactive --redirect --agree-tos -m $ADMIN_EMAIL -d $PROXY_DOMAIN

echo "Done setting up certificate."