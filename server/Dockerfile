FROM nginx:stable
RUN apt-get update \
    && apt-get install --assume-yes --no-install-recommends certbot python3-certbot-nginx \
    && rm -rf /var/lib/apt/lists/*
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types
COPY --chmod=755 run_nginx.sh cert.sh cert-renew.sh /
CMD [ "./run_nginx.sh" ]
