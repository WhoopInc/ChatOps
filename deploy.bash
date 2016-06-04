#!/bin/bash -ex

# aws ecs register-task-definition --generate-cli-skeleton > ecs-task.json

# aws ecs describe-services --service=ChatOps --query=services[].taskDefintion

# aws ecs describe-task-definition --task=[output from prev line]

# [copy contents of above into ecs-task.json]

# aws ecs register-task-definition --cli-input-json "$(cat ecs-task.json)"

task=$(aws ecs register-task-definition --cli-input-json "$(cat ecs-task.json)" --query=taskDefinition.taskDefinitionArn --output=text)

aws ecs update-service --service=ChatOps --desired-count=0

aws ecs wait services-stable --services=ChatOps

aws ecs update-service --service=ChatOps --task-definition=$task --desired-count=1

aws ecs wait services-stable --services=ChatOps
