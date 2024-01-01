IMAGE_NAME="massive-frontend:latest"
if docker images | awk '{print $1}' | grep -q "^$IMAGE_NAME$"; then
    echo "The image $IMAGE_NAME already exists locally."
else
    echo "The image $IMAGE_NAME doesn't exist locally. Building it now."
    echo " # # # # Building started # # # # "
    docker build -t $IMAGE_NAME . || error_exit "Error to build the Docker image."
fi

CONTAINER_ID=$(docker ps -q -f name=massive-front)

if [ -n "$CONTAINER_ID" ]; then
    docker stop "$CONTAINER_ID" && docker rm "$CONTAINER_ID"
fi

docker ps -aq -f status=exited -f name=massive-front | xargs -r docker rm
docker ps -aq -f status=created -f name=massive-front | xargs -r docker rm

docker run -d -p 5173:5173 --name=massive-front $IMAGE_NAME