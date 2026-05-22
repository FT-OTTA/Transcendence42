# TCG Dev Edition — Makefile

.PHONY: up down build logs clean certs fclean re

## Lance tous les services
up:
	docker compose up -d --remove-orphans

## Stoppe tous les services
down:
	docker compose down

## Rebuild et relance
build:
	docker compose up -d --remove-orphans --build

backend:
	docker restart nodejs

## Affiche les logs en live
logs:
	docker compose logs -f

logstash-logs:
	docker logs transcendence42-logstash-1 --tail 10 -f
## Stoppe et supprime les volumes (reset complet)
clean:
	docker compose down -v

fclean: clean
	docker system prune -af

re: down build

## Génère des certificats SSL auto-signés pour le dev local
certs:
	mkdir -p nginx/certs
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/certs/key.pem \
		-out nginx/certs/cert.pem \
		-subj "/C=FR/ST=IDF/L=Paris/O=TCG/CN=localhost"
	@echo "Certificats générés dans nginx/certs/"