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

					<ul>
						<li>Movement: <span className="amber">NumPad</span> or <span className="amber">WSAD</span> & <span className="amber">QEZC</span></li>
						<li>Inventory: <span className="amber">I</span></li>
						<li>Wait: <span className="amber">5</span></li>
						<li>Stairs: <span className="amber">></span></li>
					</ul>
				</div>
			)
		} else {
			return null;
		}
	}
}