FROM ubuntu:18.04

# APT ENV
ENV PACKAGES="\
  build-essential \
  supervisor \
  nginx \
  sudo \
"


#tzdata
ARG DEBIAN_FRONTEND=noninteractive



#NodeJS ENV
ENV PATH /app/node_modules/.bin:$PATH

# To prevent - Warning: apt-key output should not be parsed (stdout is not a terminal)
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

# Install required packages to add APT certifcate and APT REPOs
RUN apt update && apt install --no-install-recommends -y wget gnupg2 ca-certificates software-properties-common


# Install nodejs seperately 
RUN wget -qO- https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

RUN apt update && apt install --no-install-recommends -y $PACKAGES  && \
    rm -rf /var/lib/apt/lists/* && \
    apt clean



WORKDIR /app


COPY frontend/fastify fastify
COPY frontend/react-front react


RUN mkdir -p fastify/logs && mkdir -p react/logs && mkdir -p backend/logs

# .ENV files
RUN mv fastify/DEFAULTS.env fastify/.env 



# Install nodejs modules 
WORKDIR /app/react
RUN npm ci --silent && \
    npm install react-scripts@3.4.1 -g --silent && \
    npm run builddocker

WORKDIR /app/fastify
RUN npm ci --silent && \
    npm install  --silent


# Nginx
COPY files/nginx.conf /etc/nginx/nginx.conf


# Entrypoint
ADD files/start.sh /
RUN chmod +x /start.sh
CMD /start.sh

