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

interface Props {
	board: Tile[][];
}

export class Board extends React.Component<Props, object> {

	render() {
		const board = this.props.board.map((row, rowIndex) => {

			const rows = row.map((tile, colIndex) => {

				let tileClass: string = 'tile';
				let unit = null;

				// rewrite this logic tree later
				if (!tile.explored) {
					tileClass = '';
				} else if (tile.wall) {
					tileClass = 'wall';
				} else if (!tile.visible) {
					unit = <span className="fog" />
				} else if (tile.unit) {

					if (tile.unit.name === "Test") {
						unit = <span className="player" />
					} else {

						switch (tile.unit.name) {
							case 'Princess':
								unit = <span className="princess" />
								break;
							case 'Orc':
								unit = <span className="orc" />
								break;
							case 'Goblin':
								unit = <span className="goblin" />
								break;
						}
					}
				}

				if (tile.explored && tile.ground === 'stairs') {
					tileClass = 'stairs';
				} else if (tile.explored && tile.ground === 'spikes') {
					tileClass = 'spikes';
				}

				return (
					<div className={tileClass} key={colIndex}>
						{unit}
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