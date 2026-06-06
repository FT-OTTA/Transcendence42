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

[Throw in relevant links for every tech used]

# Team information

- Tbeauman: Product owner

- Tcoeffet: Project Manager

- Ande-vat: Technical lead
	- Early design/tech stack decisions, code reviews

- Obajja: Developer

# Project management

The team organized the work through weekly discord calls where task assignation happened. Tasks and deadlines were tracked with Github projects. Communication happened primarly on Discord, a dedicated server was created for work-related talk and a bot was added to it to track PRs.
Work was divided primarly by domain ownership: each member took responsibility for a set of features and modules, with cross-review on critical pull requests. The Tech Lead made early decisions on project architecture and tech stack, while the Product Owner held final say on feature implementation and game design.

# Technical stack

## Frontend

For the frontend, we chose Nextjs with Typescript. We wanted a React framework and Next is the most widely used and supported websocket which were needed for the live chat and game engine. It runs in a standalone containers that only communicates only with NGINX and the backend. Tailwind CSS was used for styling and i18n multi-language support was implemented.

## Backend

Backend is an express server with socket.io. It channels all the database usage with Prisma ORM and runs the game engine, handles the chat and the users/friends system as well as the match history and game stats.

## Database

We chose a MYSQL database with prisma ORM for Typescript integration, the exact schema is described in the next section.

## Infrastructure

We use docker-compose for containerization and easy single-command deployment, the website is served through nginx and enforces https.

## ELK stack

Elasticsearch, logstash and kibana (ELK) are implemented to manage and vizualize logs

## Prometheus + Grafana

---

# Database schema

---

# Features list

User registration & login: Email/password authentication. Secure password management with hashed and salted passwords

User profiles: Profile pages with avatar, stats, and match history

Friend system: Add/remove friends, view online status

Real-time chat: Lobby and in-game direct messaging between users via WebSockets

Game lobby: Room creation, deletion and joining.

Game engine: Fully implemented turn based card game as described above

Remote multiplayer: Two players on separate machines playing in real-time

Game statistics: Win/loss tracking, and match history per user

Internationalization: UI available in French, English and Swedish with a language switcher

ELK log management: Centralized logs via Elasticsearch, Logstash, and Kibana

Prometheus + Grafana: System metrics collection and monitoring dashboard and visualization


# Modules

- Major: Use a framework for both the frontend and backend. (2 pts)
	- Frontend framework (React/Nextjs)
	- Backend framework (Express)
This module is the core of any transcendance project, it's basically the core of any website, we used react for the frontend as the tech lead was already familiar with it, and express felt like a natural choice for the backend.

- Implement real-time features using WebSockets or similar technology.
	Websockets (socket.io) are a critical part of the project, they're used for all the real-time features (chat and gameplay).

- Major: Allow users to interact with other users. (2 pts)
Minimum requirements implemented:
	- Basic chat system: general chat + in-game chat
	- Profile system: Custom avatars and mood phrases.
	- Friends system: Add/remove friend button
This module was added because it felt natural in an online game to have user accounts. It is implemented in the API through three routes: /friends/add and /friends/remove (post), to add and remove friends and friends/:username which returns the friends list for an user.

- Minor: Use an ORM for the database. (1 pt)
Every interaction with the database in the backend is done with Prisma ORM, a popular Javascript ORM compatible with Typescript. ORMs are used to make database interactions feel more natural and avoir writing SQL directly.

- Minor: Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components). (1 pt)
Graphical assets were designed for the project, as well as custom CSS styles. They're available in the /nodejs/illustrations/ folder.

- Minor: Support for multiple languages (at least 3 languages) (1 pt)
We implemented i18n using the Next-intl package. For the languages, we chose French, English and Swedish.

- Minor: Support for additional browsers. (1pt)
The website's features at least on every chromium-based browser (Google chrome, Brave, etc..) as well as Firefox. React and next handles multi-browser support natively, no additional work has been needed on that part.

- File upload and management system:
	Profile pictures can be uploaded to the server and are used as a profile personalization option

- Major: Standard user management and authentication. (2pts)
	Customizable usernames, mood phrases, profile pictures; add/remove friends. Profile page at /community.

- Major: Implement a complete web-based game where users can play against each other. (2 pts)
	Otta is a real-time multiplayer turn-based game (see rules above). All real-time features (chat, gameplay) are implemented with websocket.

- Major: Remote players — Enable two players on separate computers to play the same game in real-time. (2 pts)
Network latency is not an issue in a turn-based game, but it it handled by giving generous timeout delays to each player to play their turn. Reconnections are handled properly in case of a user leaving a game, they can rejoin as long as the game is ongoing.

-  Minor: Implement spectator mode for games. (1 pt)
	Each game provides a ?spectate endpoint, allowing other users to connect to and watch the game. Game-critical data (players hands, pending moves) is hidden to them and they can follow the boards state in real time.

- Major: Game staticstics and match history. (2 pts)
	Individual games are posted in the database, win/losses/draws are tracked per user and stats are displayed in the /community page.
- Major: Infrastructure for log management using ELK (Elasticsearch, Logstash, Kibana). (2 pts)

- Major: Monitoring system with Prometheus and Grafana. (2 pts)

Total points: 2 + 2 + 2 + 1 + 1 + 1 + 1 + 2 + 2 + 2 + 1 + 2 + 2 + 2 = 23

# Individual contributions


