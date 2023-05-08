#!/bin/bash
if [ "$PROXY_USE_CERT" != "1" ]
then
    exit 0
fi

echo "Renewing Certificate"
certbot renew -q
nginx -s reload
