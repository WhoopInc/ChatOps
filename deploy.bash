#!/bin/bash -e

task=$(aws --region=us-west-2 ecs register-task-definition --cli-input-json "$(cat ecs-task.json)" --query=taskDefinition.taskDefinitionArn --output=text)

aws --region=us-west-2 ecs update-service --service=ChatOps --desired-count=0

aws --region=us-west-2 ecs wait services-stable --services=ChatOps

aws --region=us-west-2 ecs update-service --service=ChatOps --task-definition=$task --desired-count=1

aws --region=us-west-2 ecs wait services-stable --services=ChatOps
