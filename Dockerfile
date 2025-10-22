FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY static/ .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
