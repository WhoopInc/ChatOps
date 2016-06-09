#!/bin/bash -e

export VERSION=$(git log -n 1 | head -1 | cut -f2 -d' ')

DOCKER_VERSION=1.11.1-0~trusty
echo "Installing Docker ${DOCKER_VERSION}..."
sudo apt-get update
apt-cache madison docker-engine # list available versions of docker-engine
sudo apt-get -o Dpkg::Options::="--force-confnew" install -y docker-engine=${DOCKER_VERSION}
sudo apt-get install -o Dpkg::Options::="--force-confold" --force-yes -y docker-engine

echo "Building and pushing Docker container..."
docker build -t whoop/chat-ops:latest .
docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker push docker.io/whoop/chat-ops:latest

echo "Deploying to AWS..."
input=$(node makeTask.js)

task=$(aws --region=us-west-2 ecs register-task-definition --cli-input-json "$input" --query=taskDefinition.taskDefinitionArn --output=text)

echo "Stopping old image..."
aws --region=us-west-2 ecs update-service --service=ChatOps --desired-count=0 > /dev/null

echo "Waiting for stable state..."
aws --region=us-west-2 ecs wait services-stable --services=ChatOps > /dev/null

echo "Starting new image..."
aws --region=us-west-2 ecs update-service --service=ChatOps --task-definition=$task --desired-count=1 > /dev/null

echo "Waiting for stable state..."
aws --region=us-west-2 ecs wait services-stable --services=ChatOps > /dev/null

echo "Done."
