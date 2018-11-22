import * as React from 'react';

enum GameState {
	StartMenu,
	IsRunning,
	Paused,
	Inventory,
	Dead
}

interface Item {
	icon: string;
	name: string;
	effect: Function;
	description: string;
}

interface Props {
	inventory: Item[];
	useItem: Function;
	gameState: GameState;
}

export class Inventory extends React.Component<Props, object> {

	render() {

		const inventory = this.props.inventory.map((item: Item, index) => {
			return (
				<div key={index + item.name} className="item">
					<div className={"icon " + item.icon} />
					<div className="description">
						<h5>{item.name}</h5>
						<p>{item.description}</p>
					</div>
					<button onClick={() => item.effect('player')} >Use (You)</button>
					<button onClick={() => item.effect('princess')} >Use (Princess)</button>
				</div>
			)
		})

		if (this.props.gameState === GameState.Inventory) {
			return (
				<div className="inventory modal">
					<h1>Inventory</h1>
					{inventory}
				</div>
			)
		} else {
			return null;
		}
	}
}