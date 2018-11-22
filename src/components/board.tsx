import * as React from 'react';

import '../index.tsx'

interface Unit {
	name: string;
	currentHP: number;
	maxHP: number;
	tile: Tile;
}

interface Tile {
	x: number;
	y: number;
	wall: boolean;
	unit: Unit;
	ground: string;
	visible: boolean;
	explored: boolean;
}

interface Player {
}

interface Props {
	board: Tile[][];
	player: Player;
}

export class Board extends React.Component<Props, object> {

	render() {
		const board = this.props.board.map((row, rowIndex) => {

			const rows = row.map((tile, colIndex) => {

				let tileClass: string = 'tile';
				let groundItem = null;
				let unit = null;

				// rewrite this logic tree later
				if (!tile.explored) {
					tileClass = '';
				} else if (tile.wall) {
					tileClass = 'wall';
				} else if (!tile.visible) {
					unit = <span className="fog" />
				} else if (tile.unit) {

					if (tile.unit === this.props.player) {
						unit = <span className="player player-unit unit" />
					} else {

						switch (tile.unit.name) {
							case 'Princess':
								unit = <span className="princess player-unit unit" />
								break;
							case 'Orc':
								unit = <span className="orc small-enemy unit" />
								break;
							case 'Goblin':
								unit = <span className="goblin small-enemy unit" />
								break;
							case 'Ogre':
								unit = <span className="ogre player-unit unit" />
								break;
						}
					}
				}

				if (tile.explored && tile.ground === 'stairs') {
					tileClass = 'stairs';
				} else if (tile.explored && tile.ground === 'spikes') {
					tileClass = 'spikes';
				} else if (tile.explored && tile.ground === 'chest-closed') {
					groundItem = <span className="chest-closed" />
				} else if (tile.explored && tile.ground === 'chest-open') {
					groundItem = <span className="chest-open" />
				}

				return (
					<div className={tileClass} key={colIndex}>
						{unit}
						{groundItem}
					</div>
				)
			})

			return (
				<div className="row" key={rowIndex}>
					{rows}
				</div>
			)
		})

		return (
			<div className="board">
				{board}
			</div>
		)
	}
}