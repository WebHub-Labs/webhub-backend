## Deployment of the application

We will be using a containerized version of deployment using the docker.

We will use Nginx as a reverse proxy for the nodejs application.

### The Nginx server is listening on port 80 for http and the nodejs server is listening on port 8080.

#### The Nginx server is containerized in a docker container and listening on 80 and the nodejs server is bind to the docker container to 8080:8080
