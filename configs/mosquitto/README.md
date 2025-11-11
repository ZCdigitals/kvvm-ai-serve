# Mosquitto

```bash
# pull image
docker pull eclipse-mosquitto:openssl

# create volume for data
docker volume create mqtt-data
# create volume for logs
docker volume create mqtt-logs

# run container
docker run -d --name mqtt-dev -p 1883:1883 -v $(pwd)/mosquitto:/mosquitto/config -v mqtt-data:/mosquitto/data -v mqtt-logs:/mosquitto/log eclipse-mosquitto:openssl
```
