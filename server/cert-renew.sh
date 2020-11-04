#!/bin/bash
if [ "$NODE_ENV" != "production" ]
then
    exit 0
fi

echo "Renewing Certificate"
certbot renew --force-renewal
nginx -s reload