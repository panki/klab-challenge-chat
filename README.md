klab-challenge-chat - Simple chat
=======

A basic chat application built with nodejs and redis.
Easy horizontally scalable.

Developed for K.LAB code challenge.

## Requirements

- Docker

## Run

Clone project repository, cd into it, then:
```
docker-compose up
```

By default it will run 3 containers, redis and two nodes with exposed ports 3031 and 3032.

## Get access to application

On linux open browser and navigate to http://localhost:303X

On mac os, at first, get the docker machine ip address:
```
docker-machine ip
```

then, navigate to that address with one of ports specified above.

## Adding nodes

Simply add new nodes to docker-composer.yml.







