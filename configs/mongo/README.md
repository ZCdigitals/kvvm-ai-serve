# MongoDB

```bash
# pull image
docker pull mongo

# create volume for data
docker volume create mongo-data
# create volume for logs
docker volume create mongo-logs

# run container
docker run -d --name mongo-dev -p 27017:27017 -v $(pwd)/mongo/mongod.conf:/etc/mongod.conf -v mongo-data:/data/db -v mongo-logs:/var/log/mongodb mongo --config /etc/mongod.conf

docker run -d --name mongo-dev -p 27017:27017 -v $(pwd)/mongod.conf:/etc/mongod.conf -v mongo-data:/data/db mongo --config /etc/mongod.conf
```

```bash
ssh -L 27017:localhost:27017 -N zcd
```
