*This project has been created as part of the 42 curriculum by Obajja, Tbeauman, Tcoeffet and Ande-vat*

# Description

**transcendence** is the final project of the 42 common core curriculum. It serves as an introduction to web development, with a strong focus on creativity, adaptability to new technologies, and teamwork skills.

For this project, we chose to create a web platform centered around a 1v1 turn-based strategic card game called **OTTA**.

## The Website

The website is composed of several sections:

* A **landing page** where users can sign in and access the platform.
* A **lobby** that allows players to join game rooms and communicate through an integrated chat system.
* A **community section** where players can browse user profiles, view game statistics, and update their own profile information.

## OTTA

OTTA is an 8-turn strategic card game in which the objective is to achieve a higher score than your opponent by the end of the match.

At the beginning of each turn, players gain runes that can be spent to play cards from their hand. Cards belong to different categories, each offering unique strategic possibilities.

### Creatures

Creatures are the core card type of the game. Every creature has an **Attack** and a **Defense** value.

Creatures can be placed on any of the 8 slots available on the battlefield. During the resolution phase, if two opposing creatures face each other, they engage in combat:

* Each creature deals damage equal to its Attack value.
* The damage is subtracted from the opposing creature's Defense.
* A creature whose Defense reaches zero or below is destroyed.
* Any excess damage dealt beyond the target's Defense is inflicted directly to the opposing player.

Whenever a creature deals damage directly to an opponent, its controller gains an equivalent amount of score. This is the only way to score points in the game.

### Buildings

Like creatures, buildings occupy one of the 8 battlefield slots.

Buildings have a Defense value but no Attack value. They generally provide additional effects described on the card, allowing players to develop various strategies.

### Spells

Spells have special effects described on the card and often play a key strategic role during a match.

Unlike creatures and buildings, spells do not remain on the battlefield. Their effects resolve immediately during the turn in which they are played.

## Turn Structure

At the start of each turn:

1. Players gain runes according to the current turn number.
2. Players draw cards until they have at least 8 cards in hand.

Players may then play cards and prepare their strategy for the turn.

Once both players have finished, they can end their turn, triggering the **resolution phase**, during which:

* Spells resolve their effects.
* Creatures engage in combat and deal damage.

After the eighth turn, the player with the highest score wins the game.



# Instructions

## Requirements
**OTTA** is a container-based Docker-compose network, all the software it requires is installed by Docker inside the images. Therefore only the following tools (already present on every machine at 42) are required:
- Docker (Podman emulating Docker at 42)
- Docker compose
- Git
- Make

On ubuntu:
`sudo apt update && sudo apt install -y docker.io docker-compose-plugin git make`

## Environment file

A number of environment variables are needed for this project to run. In the root directory, create a .env file with the following template:

```env
# MySQL
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

# Node
NODE_ENV=development

# JWT
JWT_SECRET=

# PRISMA
DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@mysql:3306/${MYSQL_DATABASE}"

ELASTIC_PASSWORD=
KIBANA_SYSTEM_PASSWORD=
GRAFANA_ADMIN_PASSWORD=

```

## Deployment

Once that's done, build and start the network with `make`. Once started, the project's frontend can be accessed at http://localhost:3001. It is also deployed on the open web at https://transcendence42-production.up.railway.app/

Useful debugging commands:
- `docker ps` prints all containers state and basic info
- `docker logs [CONTAINER]` prints a containers logs since startup.
- `docker exec -it [CONTAINER] sh` opens an interactive shell within a container


# Ressources

