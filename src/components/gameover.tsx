import * as React from 'react';

import "./gameover.scss";

enum GameState {
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
				<div className="gameover">
					<h1>Game Over</h1>
					<p>Better luck next time!</p>
					<button onClick={() => {location.reload()}}>Play Again?</button>
				</div>
			)
		} else {
			return null;
		}
	}
}