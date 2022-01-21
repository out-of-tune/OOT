FROM nginx:latest
RUN apt-get update && apt-get install --assume-yes software-properties-common certbot
RUN apt-get install --assume-yes python3-certbot-nginx
COPY nginx.conf.template  /etc/nginx/nginx.conf.template
COPY mime.types  /etc/nginx/mime.types
COPY run_nginx.sh /
COPY cert.sh /
COPY cert-renew.sh /
RUN chmod 777 run_nginx.sh
RUN chmod 777 cert.sh
RUN chmod 777 cert-renew.sh
CMD [ "./run_nginx.sh" ]
