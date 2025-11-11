# KVVM AI Serve

This KVVM AI Backend server.

## Build

### Docker image

```bash
docker build -t kvvm-ai-serve .
```

## Deploy

### Docker

#### For test and on internal network

```bash
docker compose -d up
```

#### On public network

> !!!WARNGING!!! Must use tls on public network, or you will be under great risk.

1. Edit `docker-compose.prod.yml`, change `JWT_SECRET` `VERIFY_CODE` `COTURN_SECRET`
2. Edit `docker-compose.prod.yml`, add `volumes` which point to cert files
3. Edit `configs/coturn/turnserver.conf`, change `tls-listening-port` `external-ip` `realm` `cert` `pkey`, see `configs/coturn/turnserver.example.conf`

```bash
docker compose -d -f docker-compose.prod.yml up
```

## Develop

### Controller

Adopts a thin `controller` design; business logic should be implemented in the service.

The `controller` should only handle parameter validation and simple flow control.

### Model

Since `typegoose` is used, the model must be exported using `getModelForClass` in any `service` that uses the model.

To reduce coupling, models should only be used within `service`.

If exported in `model/modelName.ts`, it may lead to circular dependency errors that are only discovered at runtime.

### Service

CRUD endpoints for RESTful APIs are registered by default, but they can only operate on models registered in the `mongoose` connection.

If a new model A is added but no controller or route depends on it (i.e., it is not mounted to the `app`'s require chain and not registered in `mongoose`), it cannot be operated on.

Model A will also not appear in the response of the `[GET] /model/dict` endpoint.

### Utils

Functions in `utils` must be side-effect-free, meaning they should not modify variables outside their scope nor depend on anything outside the current file and `node_modules`.
