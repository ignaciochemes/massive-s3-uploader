#!/bin/bash

error_exit() {
  echo "Error: $1" >&2
  exit 1
}

version=1.0.0
repo=your-registry-container-name
account=your-registry-account

echo " # # # # Building started # # # # "
docker build -t $repo:$version . || error_exit "Error to build the Docker image."

echo " # # # # Tagging images # # # # "
docker tag $repo:$version $account/$repo:$version
docker tag $repo:$version $account/$repo:latest