#!/bin/bash
if [ "$PROXY_USE_CERT" != "1" ]
then
    echo "Running in HTTP only."
    exit 0
fi

echo "Running with letsencrypt and https."
exit 0
certbot --nginx --non-interactive --redirect --agree-tos -m $ADMIN_EMAIL -d $PROXY_DOMAIN

echo "Done setting up certificate."
