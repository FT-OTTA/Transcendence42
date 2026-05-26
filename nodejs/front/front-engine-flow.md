- Player creates room => fake lobby with waiting screen
- Player joins  => "Game starts in 5 seconds"
- Select heroes + deck (with TO)

- Game start :
	-Shuffle decks
	- startTurn()
	- game_update with init hand



New card play workflow:
	- Click card : => preview shows up, asks for targets if needed
	- Select targets (if relevant)
	- target types:
		> self_hero = self stats (nothing on frontend)
		> self = self board (request select)
		> opponent = opponent board (request select)
		> opponent_hero = opponents stats (nothing on frontend)
		> all_allies = self all cards on board + hero (nothing on frontend)
		> all_enemies = self all cards on board + hero (nothing on frontend)
	- confirm => emits play_card


Normal operations:

	- play_card => triggers game_update (at least removes card from hand + resolve effects if immediate)
	- Playground listens to game_update to trigger rerenders
	- Playground emits play_card on *every* card
	- Playground emits end_turn on end turn button clicked, triggers resolveRound (after other player did too or TO) in engine
	- game_update with all new things (draw + new runes + new score etc)
