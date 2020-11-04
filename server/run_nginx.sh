#!/bin/bash
export DOLLAR=$
envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -c /etc/nginx/nginx.conf -t
/bin/bash ./cert.sh
service nginx stop
trap exit TERM; while sleep 30; do ./cert-renew.sh; done &
nginx -g "daemon off;"