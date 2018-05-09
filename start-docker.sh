#!/usr/bin/env bash

docker rm -f rabbitmq
docker rm -f mongo
docker rm -f postgres

# Pure RabbitMQ
#docker run -d -p 5672:5672 -p 15672:15672 -p 4369:4369 -p 5671:5671 -p 25672:25672 --name rabbitmq rabbitmq
docker run -d -p 5672:5672 -p 15672:15672 -p 4369:4369 -p 5671:5671 -p 25672:25672 --name rabbitmq rabbitmq:3-management
docker run -d -p 27017:27017 --name mongo mongo:3.0.15