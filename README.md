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

Once that's done, build and start the network with `make`. Once started, the project's frontend can be accessed at https://localhost:8443. To access Grafana go to https://localhost:3002, log in using the .env's password and go to /dashboards to view the dashboard.

Useful debugging commands:
- `docker ps` prints all containers state and basic info
- `docker logs [CONTAINER]` prints a containers logs since startup.
- `docker exec -it [CONTAINER] sh` opens an interactive shell within a container


# Ressources

## Technologies

- [Next.js Documentation](https://nextjs.org/docs) — Frontend framework
- [Express.js Documentation](https://expressjs.com/) — Backend framework
- [Socket.io Documentation](https://socket.io/docs/v4/) — Real-time WebSocket communication
- [Prisma ORM Documentation](https://www.prisma.io/docs) — Database ORM for TypeScript
- [MySQL Documentation](https://dev.mysql.com/doc/) — Database
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) — CSS utility framework
- [next-intl Documentation](https://next-intl-docs.vercel.app/) — i18n for Next.js
- [Docker Compose Documentation](https://docs.docker.com/compose/) — Containerization
- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) — Log storage and indexing
- [Logstash Documentation](https://www.elastic.co/guide/en/logstash/current/index.html) — Log collection and processing
- [Kibana Documentation](https://www.elastic.co/guide/en/kibana/current/index.html) — Log visualization
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/) — Metrics collection
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/) — Metrics visualization and dashboards

## AI Usage

AI (Claude, chatGPT and Github Copilot) was used to generate boilerplate, help with debugging, test design decisions and draft parts of the documentation. All AI-generated code has been carefully reviewed and tested before inclusion.

# Team information

### Tbeauman: Product Owner

* Final decision-maker on all project-related matters.
* Overall project direction and vision.
* DevOps.

### Tcoeffet: Project Manager

* Team organization.
* Meeting planning and coordination.
* Management of the team's communication channels.
* Project roadmap management.

### Ande-vat: Technical Lead

* Early design/tech stack decisions, code reviews, README writing.

### Obajja: Developer

* Chief Happiness Manager.
* Occasional support across all aspects of the project.
* Setup and maintenance of various services.

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

We use docker-compose for containerization and easy single-command deployment, the website is served through nginx on port 8443 (Port 433 is unavailable on the machines at 42) and enforces https.

## ELK Stack (Log Management)
Elasticsearch, Logstash, and Kibana are integrated to provide centralized log management:

- Logstash collects application logs from the backend containers, parses and transforms them into a structured format, then ships them to Elasticsearch.
- Elasticsearch stores and indexes these logs, enabling fast full-text search and filtering across the entire log history.
- Kibana provides a web dashboard for visualizing logs, building queries, and monitoring application activity in real time.

## Prometheus + Grafana (System Monitoring)
Prometheus scrapes system and application metrics from running containers at regular intervals and stores them as time-series data. Grafana connects to Prometheus as a data source and renders these metrics in customizable dashboards, with support for alerting rules when metrics exceed defined thresholds. Together they provide visibility into container health, request rates, memory usage, and other operational metrics.

# Database schema

```
┌──────────┐         ┌────────────┐         ┌──────────┐
│   User   │─────────│ Friendship │─────────│   User   │
└──────────┘         └────────────┘         └──────────┘
      │
      │          ┌────────────┐
      ├──────────│    Room    │
      │          └────────────┘
      │                │
      │                │
      ├──────────┌─────────────┐       (User and stats management)
      │          │   Message   │
      │          └─────────────┘
      │
      │          ┌────────────┐
      └──────────│ GameResult │
                 └────────────┘

┌──────┐     ┌──────┐
│ Card │     │ Hero │   (static game data, not linked to User)
└──────┘     └──────┘
```
## Tables

### `User`
| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| createdAt | DateTime | default: now() |
| username | String | unique |
| password_hash | String | bcrypt hash |
| moodphrase | String? | optional |
| avatarUrl | String? | optional |

### `GameResult`
Stores the result of every completed match.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| createdAt | DateTime | default: now() |
| player1Id | Int | FK → User |
| player2Id | Int | FK → User |
| winnerId | Int? | FK → User, null = draw |
| loserId | Int? | FK → User, null = draw |
| player1Class | String | hero class used |
| player2Class | String | hero class used |
| turns | Int | number of turns played |
| player1Score | Int | default: 0 |
| player2Score | Int | default: 0 |

### `Friendship`
Many-to-many self-join on User, with a unique constraint preventing duplicates.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| userId | Int | FK → User |
| friendId | Int | FK → User |
| @@unique | [userId, friendId] | no duplicate pairs |

### `Room`
Represents a game lobby room before and during a match.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| player1Id | Int | FK → User (creator) |
| player2Id | Int? | FK → User, null until someone joins |
| status | String | default: "waiting" |
| createdAt | DateTime | default: now() |

### `Message`
Chat messages scoped to a room. `roomId` is nullable for potential direct messages; cascade-deleted when the room is deleted.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | PK, autoincrement |
| content | Text | message body |
| createdAt | DateTime | default: now() |
| senderId | Int | FK → User |
| roomId | Int? | FK → Room, onDelete: Cascade |

### `Card`
Static game data — all playable cards with multilingual fields for i18n support.

| Field | Type | Notes |
|-------|------|-------|
| id | String | PK (e.g. "creature_001") |
| name_en / name_fr / name_sv | String | localized names |
| type_en / type_fr / type_sv | String | localized type labels |
| effect_text_en / _fr / _sv | String | localized effect descriptions |
| class | String | card category (creature / building / spell) |
| force | Int? | Attack value, creatures only |
| endurance | Int? | Defense value, creatures and buildings |
| rune_cost | Int | cost to play |
| effect | Text | effect logic identifier / JSON |
| illustration | String | asset path |
| target_number | Int? | number of targets, if applicable |
| target_type | String? | what the card can target |
| timing | String | default: "end_of_turn" |

### `Hero`
Static game data — playable hero classes, each with a predefined deck and a passive ability.

| Field | Type | Notes |
|-------|------|-------|
| id | String | PK |
| name_en / name_fr / name_sv | String | localized names |
| passive_text_en / _fr / _sv | String | localized passive descriptions |
| base_armor | Int | starting defense value |
| passive_json_path | String | path to passive effect handler |
| illustration | String | asset path |
| deck | Text | JSON array of card IDs forming the hero's deck |


# Features list

User registration & login: Email/password authentication. Secure password management with hashed and salted passwords (tbeauman)

User profiles: Profile pages with avatar, stats, and match history  (obajja, tcoeffet)

Friend system: Add/remove friends, view online status (tbeauman, obajja)

Real-time chat: Lobby and in-game direct messaging between users via WebSockets (obajja, ande-vat)

Game lobby: Room creation, deletion and joining. (ande-vat, obajja)

Game engine: Fully implemented turn based card game as described above (ande-vat, tbeauman)

Remote multiplayer: Two players on separate machines playing in real-time (ande-vat, tbeauman)

Game statistics: Win/loss tracking, and match history per user (tbeauman, tcoeffet)

Internationalization: UI available in French, English and Swedish with a language switcher (obajja) 

ELK log management: Centralized logs via Elasticsearch, Logstash, and Kibana (tbeauman)

Prometheus + Grafana: System metrics collection and monitoring dashboard and visualization (obajja)


# Modules

- Major: Use a framework for both the frontend and backend. (2 pts)
	- Frontend framework (React/Nextjs)
	- Backend framework (Express)
This module is the core of any transcendance project, it's basically the core of any website, we used react for the frontend as the tech lead was already familiar with it, and express felt like a natural choice for the backend.
Major contributors: everyone

- Implement real-time features using WebSockets or similar technology. (2 pts)
	Websockets (socket.io) are a critical part of the project, they're used for all the real-time features (chat and gameplay).
Major contributors: everyone

- Major: Allow users to interact with other users. (2 pts)
Minimum requirements implemented:
	- Basic chat system: general chat + in-game chat
	- Profile system: Custom avatars and mood phrases.
	- Friends system: Add/remove friend button
This module was added because it felt natural in an online game to have user accounts. It is implemented in the API through three routes: /friends/add and /friends/remove (post), to add and remove friends and friends/:username which returns the friends list for an user.
Major contributors: everyone

- Minor: Use an ORM for the database. (1 pt)
Every interaction with the database in the backend is done with Prisma ORM, a popular Javascript ORM compatible with Typescript. ORMs are used to make database interactions feel more natural and avoir writing SQL directly.
Major contributors: everyone

- Minor: Custom-made design system with reusable components, including a proper color palette, typography, and icons (minimum: 10 reusable components). (1 pt)
Graphical assets were designed for the project, as well as custom CSS styles. They're available in the /nodejs/illustrations/ folder.
Major contributors: tcoeffet

- Minor: Support for multiple languages (at least 3 languages) (1 pt)
We implemented i18n using the Next-intl package. For the languages, we chose French, English and Swedish.
Major contributors: obajja


- Minor: Support for additional browsers. (1pt)
The website's features at least on every chromium-based browser (Google chrome, Brave, etc..) as well as Firefox. React and next handles multi-browser support natively, only minor css styling issues appeared. The specific changes made are detailed in MultiBrowser.md
Major contributors: obajja


- File upload and management system:
	Profile pictures can be uploaded to the server and are used as a profile personalization option
Major contributors: tcoeffet, tbeauman

- Major: Standard user management and authentication. (2pts)
	Customizable usernames, mood phrases, profile pictures; add/remove friends. Profile page at /community.
Major contributors: tbeauman, tcoeffet

- Major: Implement a complete web-based game where users can play against each other. (2 pts)
	Otta is a real-time multiplayer turn-based game (see rules above). All real-time features (chat, gameplay) are implemented with websocket.
Major contributors: tbeauman, ande-vat

- Major: Remote players — Enable two players on separate computers to play the same game in real-time. (2 pts)
Network latency is not an issue in a turn-based game, but it it handled by giving generous timeout delays to each player to play their turn. Reconnections are handled properly in case of a user leaving a game, they can rejoin as long as the game is ongoing.
Major contributors: tbeauman, ande-vat

-  Minor: Implement spectator mode for games. (1 pt)
	Each game provides a ?spectate endpoint, allowing other users to connect to and watch the game. Game-critical data (players hands, pending moves) is hidden to them and they can follow the boards state in real time.
Major contributors: tbeauman

- Major: Game staticstics and match history. (2 pts)
	Individual games are posted in the database, win/losses/draws are tracked per user and stats are displayed in the /community page.
Major contributors: tcoeffet, tbeauman

- Major: Infrastructure for log management using ELK (Elasticsearch, Logstash, Kibana). (2 pts)
Major contributors: tbeauman

- Major: Monitoring system with Prometheus and Grafana. (2 pts)
Major contributors: obajja

Total points: 2 + 2 + 2 + 1 + 1 + 1 + 1 + 2 + 2 + 2 + 1 + 2 + 2 + 2 = 23

# Individual contributions

## Tbeauman — Product Owner
- Created several routes of the Express server to access db including auth, cards, users, heroes.
- Created the playset of Cards.
- Made the game engine to fit the designed rules and connected it to the front playground
- Set up the Elasticsearch / Logstash / Kibana and logs to the db accesses.
- Features worked on: Project structure, Playground, Match History, ELK, Lobby, Routes, Websockets, Game Design
...

## Tcoeffet — Project Manager

- Managed team organization, GitHub workflow, roadmap planning, and weekly meetings.
- Designed the website mockup in Figma.
- Created graphical assets (fonts, color palette, icons, etc.).
- Designed the frontend visual identity.
- Defined UI/UX guidelines and in-game feedback design.
- Developed the landing page and user profile page.
- Contributed to game design (rules, balancing, etc.).


## Ande-vat — Technical Lead

- Made early architectural decisions: Next.js + Express + MySQL + Prisma + Socket.io + Docker Compose.
- Set up the initial project structure, Docker Compose network, and NGINX configuration.
- Conducted code reviews on critical pull requests, ensured best practices in code.
- Features worked on: Project structure, Playground, game engine, Lobby, Websockets, Routes.

## Obajja — Developer

- Worked as main support to the other roles.
- Developed the lobby page, the login authentication and their corresponding components.
- Created tables, routes and sockets to make the lobby page fully functional.
- Made the friend list functional, room creation, join, and chat.
- Worked on Grafana's and Prometheus setup, dashboard and data sources handling.
- Translated the site in French, English and Swedish.
- Worked on multi-browser support.
- Features worked on: Project structure, Lobby, Grafana, WebSockets, Routes.
