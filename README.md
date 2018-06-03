# Leaderboard Microservice using Node.js, Redis and Kubernetes     

A simple leaderboard microservice example using Node.js and Redis to demonstrate deployment and scaling of a Kubernetes cluster. 

The deployment uses a master Redis with replicated slaves, as well as replicated sentinels for high availability.

The microservice uses Node.js for providing a REST API interface and Redis zadd and zrevrange functions for the leaderboard functionality.  
 
## Getting Started

To get started, you should have an elementary understanding of Node.js, Redis, Docker and Kubernetes. 

### Prerequisites

Docker and Minikube must be installed locally.

[Docker Installation](https://docs.docker.com/get-started/)

[Minikube](https://github.com/kubernetes/minikube)  

```
Minikube is a tool that makes it easy to run Kubernetes locally to try it out or develop with it. 
```

Start Minikube by running this command. (Replace xxx with any of the drivers, that Minikube supports.)

```
minikube start --vm-driver=xxx
```

Run the following command to configure your shell to communicate with the Minikube cluster.

``` 
eval $(minikube docker-env)
```

## Deployment

Deploy Redis master service to Kubernetes. The redis-master-deployment.yaml deployment file will create the containers and pod necesary for a single Redis master and sentinel server.

```
kubectl apply -f redis-master-deployment.yaml
```

Verify the deployment, to check that the pod is running. 

```
kubectl get pods
```

You can also check the logs if there are any issues with the deployment. 
```
minikube logs 

or 

kubectl logs <POD NAME> <CONTAINER NAME>
```

At this point we have a single Redis master and sentinel pod deployed to the Kubernetes cluster.  


Now we can add, replicas to scale the Redis deployment. The redis-deployment.yaml deployment file specifies three replicas, of Redis servers and sentinels.

```
kubectl apply -f redis-deployment.yaml
```

This will create three pods with replicas of the Redis server and sentinel on each pod. We now have a fully automated Kubernetes deployment, which is reliable and scalable. You can increase the replicas by updating the replicas specified in redis-deployment.yaml and applying the changes with the same command as above. Kubernetes will manage the changes. 

Verify that there are now three pods with Redis slave and sentinel running.

```
kubectl get pods

kubectl describe pods
```

At this point, we no longer need our initial Redis master as the sentinels will monitor the redis servers and elect a new master on failure. 

You can delete the master as follows,

```
kubectl delete deployment leaderboard-redis-master
```
 
Now we can deploy our leaderboard microservice, which provides the API for setting player scores and getting the top 5 players.

Build the Docker image based upon the Dockerfile in our project directory, which creates a Node.js deployment for the leaderboard application.

Run the following docker command from inside the leaderboard-service directory to create the container image for Node.js and the application. 

```
docker build -t leaderboard-sample:v1 .
```

Create the pods and the leaderboard service.

```
kubectl apply -f leaderboard-service.yaml
```
 
Verify the deployments by running the following commands to check that the pods and services are all running. 


```
kubectl get pods

kubectl get services

kubectl get all

```

If all the services are running, then the leaderboard microservice is available and ready to test.

Get the service IP and port, using the following minikube command to access the leaderboard microservice for testing.

```
minikube service leaderboard-service --url 
``` 

## Testing

To quickly test the deployment, we will use curl to post a few scores and then get the results. 

Add a few scores, by running the following REST API with different player names and scores. You can also update a player's ranking by posting a new score.

```
curl -d "player=Joe&score=85" -X POST http://<IP>:30025/api/setscore
```

Get the leaderboard by running the following REST API

```
curl http://<IP>:30025/api/setscore/getleaderboard
```

Additionally, you can also test that a pod failure is handled by Kebernetes by creating a new pod, so that the desired number of pod replicas are always maintained.  

```
kubectl get pods
```

Delete any one of the Redis or Node.js pods using the following command, where xxx is the pod identifier.

```
kubectl delete pod leaderboard-redis-xxx 
```


## Cleanup

To terminate the containers, pods and services in the Kubernetes cluster, run the following commands.

```
kubectl delete deployment leaderboard-service

kubectl delete deployment leaderboard-redis
```

To stop the Kubernetes cluster, run the following command.  

```
minikube stop
```
