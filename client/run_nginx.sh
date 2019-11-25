#!/bin/sh
export DOLLAR=$
envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -c /etc/nginx/nginx.conf -t
nginx -g "daemon off;"