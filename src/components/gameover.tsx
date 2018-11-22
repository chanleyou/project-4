import * as React from 'react';

enum GameState {
	StartMenu,
	IsRunning,
	Paused,
	Inventory,
	Dead
}

interface Props {
	gameState: GameState;
}

export class GameOver extends React.Component<Props, object> {

	render() {

		if (this.props.gameState === GameState.Dead) {
			return (
				<div className="gameover modal">
					<h1>Game Over</h1>
					<label>Better luck next time...</label>
					<button autoFocus onClick={() => {location.reload()}}>Play Again?</button>
				</div>
			)
		} else {
			return null;
		}
	}
}