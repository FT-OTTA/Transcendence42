 Major: Use a framework for both the frontend and backend.
	◦ Use a frontend framework (React, Vue, Angular, Svelte, etc.).
	◦ Use a backend framework (Express, NestJS, Django, Flask, Ruby on Rails,
	etc.).
	◦ Full-stack frameworks (Next.js, Nuxt.js, SvelteKit) count as both if you use
	both their frontend and backend capabilities.
	- tout le monde
	
 Major: Allow users to interact with other users. The minimum requirements are:
	◦ A basic chat system (send/receive messages between users).
	◦ A profile system (view user information).
	◦ A friends system (add/remove friends, see friends list).
	- Omar - Antoine

 Minor: Use an ORM for the database.
 	- Beauman
 
 Minor: A complete notification system for all creation, update, and deletion ac-
tions.
	- Beauman
	
 Minor: Custom-made design system with reusable components, including a proper
color palette, typography, and icons (minimum: 10 reusable components).
	- Teddy

 Minor: Support for multiple languages (at least 3 languages).
◦ Implement i18n (internationalization) system.
◦ At least 3 complete language translations.
◦ Language switcher in the UI.
◦ All user-facing text must be translatable
	- Omar - Antoine

 Minor: Support for additional browsers.
◦ Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge,
etc.).
◦ Test and fix all features in each browser.
◦ Document any browser-specific limitations.
◦ Consistent UI/UX across all supported browsers
	- Beauman

 Major: Standard user management and authentication.
◦ Users can update their profile information.
◦ Users can upload an avatar (with a default avatar if none provided).
◦ Users can add other users as friends and see their online status.
◦ Users have a profile page displaying their information.
	- Teddy - Omar - Antoine

 Major: Implement a complete web-based game where users can play against each
other.
◦ The game can be real-time multiplayer (e.g., Pong, Chess, Tic-Tac-Toe, Card
games, etc.).
◦ Players must be able to play live matches.
◦ The game must have clear rules and win/loss conditions.
◦ The game can be 2D or 3D.
	- Tout le monde
	
 Major: Remote players — Enable two players on separate computers to play the
same game in real-time.
◦ Handle network latency and disconnections gracefully.
◦ Provide a smooth user experience for remote gameplay.
◦ Implement reconnection logic.
 	- Antoine + dev
 	
 Minor: Implement spectator mode for games.
◦ Allow users to watch ongoing games.
◦ Real-time updates for spectators.
◦ Optional: spectator chat
	- Antoine + dev
	
 Major: Infrastructure for log management using ELK (Elasticsearch, Logstash,
Kibana).
◦ Elasticsearch to store and index logs.
◦ Logstash to collect and transform logs.
◦ Kibana for visualization and dashboards.
18
ft_transcendence Surprise.
◦ Implement log retention and archiving policies.
◦ Secure access to all components.
	- Beauman le product owner qui s'est fait une tache de con.
	
 Major: Monitoring system with Prometheus and Grafana.
◦ Set up Prometheus to collect metrics.
◦ Configure exporters and integrations.
◦ Create custom Grafana dashboards.
◦ Set up alerting rules.
◦ Secure access to Grafana.
	- Beauman
