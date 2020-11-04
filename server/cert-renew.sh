#!/bin/bash
if [ "$NODE_ENV" != "production" ]
then
    exit 0
fi

echo "Renewing Certificate"
certbot renew -q
nginx -s reload