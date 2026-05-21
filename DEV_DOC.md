# DEV_DOC — TCG Dev Edition

## Prérequis
- Docker & Docker Compose installés
- `make` disponible

## Première installation

```bash
cp .env.example .env   # créer le fichier d'environnement
make certs             # générer les certificats SSL auto-signés
make build             # builder et lancer tous les services
```

## Commandes Makefile

| Commande | Description |
|---|---|
| `make up` | Lance tous les services (sans rebuild) |
| `make down` | Stoppe tous les services |
| `make build` | Rebuild les images et relance |
| `make logs` | Affiche les logs en live |
| `make clean` | Stoppe et supprime les volumes ⚠️ remet la DB à zéro |
| `make fclean` | Supprime tout (containers, images, volumes) ⚠️ reset complet |
| `make re` | `down` + `build` — repart de zéro |
| `make certs` | Génère les certificats SSL (à faire une seule fois) |

## Vérifier que tout tourne

```bash
docker ps
# Les 3 containers nginx, nodejs, mysql doivent être "Up"
```

## Accès

- App : https://localhost
- Logs d'un service spécifique : `docker logs nodejs`

## Env

To setup Kibana token for access to Elasticsearch, use a temporary container

  # kibana-setup:
  #   image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
  #   depends_on:
  #     - elasticsearch
  #   networks:
  #     - otta
  #   restart: "no"
  #   entrypoint: ["bash", "-c", "sleep 10 && curl -s -X POST -u elastic:$$ELASTIC_PASSWORD http://elasticsearch:9200/_security/service/elastic/kibana/credential/token/kibana_token"]
  #   env_file:
  #     - ./.env

paste this in the docker compose, then
docker compose up kibana-setup --build && docker logs transcendence42-kibana-setup
get the token and put it in .env