#!/bin/sh
while [ true ]
do
    curl -X POST "http://dedede.miapi.com:8080/a1/grab?query=22&cast=invites" 
    sleep 10
done
