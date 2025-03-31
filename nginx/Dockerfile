FROM nginx:alpine

ARG ENVIRONMENT=development
ENV ENVIRONMENT=${ENVIRONMENT}

RUN apk add --no-cache bash
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY development.conf.template /etc/nginx/development.conf.template
COPY production.conf.template /etc/nginx/production.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 