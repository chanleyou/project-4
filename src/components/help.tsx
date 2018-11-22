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

export class Help extends React.Component<Props, object> {

	render() {

		if (this.props.gameState === GameState.Paused) {
			return (
				<div className="help modal">
					<h1>Controls</h1>
					<p>Move with your <span className="amber">numpad</span> or <span className="amber">WSAD</span> and <span className="amber">QEZC</span>. The princess automatically follows you, and you can change places with her by moving into her tile. Enemies will attack your princess, but they'll attack you if you're in the way. Move into their tile to attack them. Good luck!</p>
				</div>
			)
		} else {
			return null;
		}
	}
}