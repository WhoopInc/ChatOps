#!/bin/bash -e

export VERSION=$(git log -n 1 | head -1 | cut -f2 -d' ')

input=$(node makeTask.js)

task=$(aws --region=us-west-2 ecs register-task-definition --cli-input-json "$input" --query=taskDefinition.taskDefinitionArn --output=text)

aws --region=us-west-2 ecs update-service --service=ChatOps --desired-count=0

aws --region=us-west-2 ecs wait services-stable --services=ChatOps

aws --region=us-west-2 ecs update-service --service=ChatOps --task-definition=$task --desired-count=1

aws --region=us-west-2 ecs wait services-stable --services=ChatOps
