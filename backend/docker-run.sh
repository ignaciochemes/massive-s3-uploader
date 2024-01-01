NETWORK="massive-uploader-network"

IMAGE_NAME="massive-backend:latest"
if docker images | awk '{print $1}' | grep -q "^$IMAGE_NAME$"; then
    echo "The image $IMAGE_NAME already exists locally."
else
    echo "The image $IMAGE_NAME doesn't exist locally. Building it now."
    docker build -t $IMAGE_NAME .
fi

# Create network if it doesn't exist
if ! docker network ls | grep -q $NETWORK; then
    echo "The network $NETWORK doesn't exist. Creating it now."
    docker network create $NETWORK
fi

# Check if docker-compose is running (MariaDB)
if ! docker-compose ps | grep -q "massive-uploader-mariadb"; then
    echo "The container massive-backend is not running. Starting it now."
    docker-compose -f docker-compose.yml up -d
fi

CONTAINER_ID=$(docker ps -q -f name=massive-backend)

if [ -n "$CONTAINER_ID" ]; then
    echo "The container massive-backend is already running. Stopping it now."
    docker stop "$CONTAINER_ID" && docker rm "$CONTAINER_ID"
fi

# Remove all containers with the name massive-backend
docker ps -aq -f name=massive-backend | xargs -r docker rm
docker ps -aq -f status=exited -f name=massive-backend | xargs -r docker rm
docker ps -aq -f status=created -f name=massive-backend | xargs -r docker rm

# To start the container: "sh docker-run.sh local" (or any other environment)
# local, dev, prod are the environments
docker run -d -e ENVIRONMENT='local' -e PORT=':33003' -p 33003:33003 --name=massive-backend --network=$NETWORK $IMAGE_NAME "$@"