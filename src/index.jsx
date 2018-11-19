// This file serves as webpack's entry point of compilation. Webpack will take this file, and all its dependencies (i.e. its imports, and the imports of those imports, etc) and run them through the _transpiler_ that we've configured, Babel in this case, then roll everything up into a single bundle.js file.

// Note that we have also configured webpack to load up css files, which are necessary if you wish to keep the styles of your React components in separate css files.

// Inspect webpack.config.js for details.

// Babel is responsible for taking the ES6 code in here and turning it into ES5 (this is not always possible, e.g. if you use ES6 proxies in your code since those are not equivalent to any ES5 construct). Here, we have configured it to use the env, react, and stage-2 presets in its transpilation. The react preset is required for Babel to understand the jsx mumbo jumbo that React uses. The other 2 presets refer to different JS standards that we wish for Babel to transpile into ES5.

// contains all elements that will always be on page

import React from 'react';
import ReactDOM from 'react-dom';
const ROT = require('rot-js');

import './style.scss'; // global stylesheet
import UI from './components/ui';

// rng
const random = (min, max) => {
	return min + Math.floor(Math.random() * (max - min + 1));
}

class Game extends React.Component {
	constructor() {
		super()

		let floor = this.createFloor(1);

		this.state = {
			player: {
				name: 'Test',
				currentHP: 10,
				maxHP: 10,
				tile: floor.board[floor.y][floor.x]
			},
			turn: true,
			floor: 1,
			board: floor.board,
			enemies: floor.enemies,
			log: []
		}

		this.controls = this.controls.bind(this);
		this.attemptMove = this.attemptMove.bind(this);
		this.createFloor = this.createFloor.bind(this);
		this.nextFloor = this.nextFloor.bind(this);
		this.updateLog = this.updateLog.bind(this);
		this.monsterMove = this.monsterMove.bind(this);
	}

	createFloor(floor) {
		const xA = 34;
		const yA = 20;
		const map = new ROT.Map.Uniform(xA, yA, { roomDugPercentage: 0.25 });

		const board = [];

		for (let i = 0; i < yA; i++) {
			board.push([]);
		}

		map.create(function (x, y, value) {
			if (value) {
				board[y][x] = {
					unit: "wall",
					floor: "wall"
				}
			} else {
				board[y][x] = {
					unit: null,
					floor: null
				}
			}
			board[y][x].x = x;
			board[y][x].y = y;
		})

		// places staircase to next floor in a random room
		const rooms = map.getRooms();
		const randomRoom = ROT.RNG.getItem(rooms);
		let stairX = random(randomRoom.getLeft(), randomRoom.getRight());
		let stairY = random(randomRoom.getTop(), randomRoom.getBottom());

		board[stairY][stairX].floor = 'stairs';


		// places the player
		let playerX = random(0, xA - 1);
		let playerY = random(0, yA - 1);

		while (board[playerY][playerX].unit) {
			playerX = random(0, xA - 1);
			playerY = random(0, yA - 1);
		}

		board[playerY][playerX].unit = 'player';

		// places random enemies
		let enemies = [];

		for (let n = 0; n < 1 + floor; n++) {
			let unitX = random(0, xA - 1);
			let unitY = random(0, yA - 1);

			while (board[unitY][unitX].unit) {
				unitX = random(0, xA - 1);
				unitY = random(0, yA - 1);
			}
			
			enemies.push({
				name: 'Orc',
				currentHP: 5,
				maxHP: 5,
				tile: board[unitY][unitX]
			})

			board[unitY][unitX].unit = 'orc';
		}

		return {
			board: board,
			enemies: enemies,
			x: playerX,
			y: playerY
		}
	}

	controls(event) {

		let x = this.state.player.tile.x;
		let y = this.state.player.tile.y;

		var keyPressed = event.keyCode;
		switch (keyPressed) {
			// case 87: // w
			case 104: // numpad 8
				this.attemptMove(y - 1, x);
				break;
			// case 83: // s
			case 98: // numpad 2
				this.attemptMove(y + 1, x);
				break;
			// case 65: // a
			case 100: // numpad 4
				this.attemptMove(y, x - 1);
				break;
			// case 68: // d
			case 102: // numpad 6
				this.attemptMove(y, x + 1);
				break;
			case 103: // numpad 7
				this.attemptMove(y - 1, x - 1);
				break;
			case 105: // numpad 9
				this.attemptMove(y - 1, x + 1);
				break;
			case 97: // numpad 1
				this.attemptMove(y + 1, x - 1);
				break;
			case 99: // numpad 3
				this.attemptMove(y + 1, x + 1);
				break;
			case 190: // >
				if (this.state.player.tile.floor === 'stairs') {
					this.nextFloor();
				}
				break;
		}
	}

	nextFloor() {
		let newFloor = this.createFloor(this.state.floor + 1);

		this.updateLog(`Moving to DL ${this.state.floor + 1}.`);

		this.state.player.tile = newFloor.board[newFloor.y][newFloor.x];

		this.setState({
			floor: this.state.floor + 1,
			board: newFloor.board,
			enemies: newFloor.enemies
		});
	}

	attemptMove(y, x) {
		if (!this.state.turn) {
			return false;
		}

		if (y < 0 || x < 0 || y >= this.state.board.length || x >= this.state.board[0].length) {
			return false;
		}

		const targetTile = this.state.board[y][x];

		if (targetTile.unit) {
			return false;
		}

		this.state.player.tile.unit = null;
		targetTile.unit = "player";
		this.state.player.tile = targetTile;

		this.state.turn = false;

		this.monsterMove();
		return true;
	}

	monsterMove() {
		
		const path = new ROT.Path.AStar(this.state.player.tile.x, this.state.player.tile.y, (x, y) => {
			return this.state.board[y][x].unit !== 'wall';
		});

		for (let i in this.state.enemies) {
			let unit = this.state.enemies[i];
			
			const pathToPlayer = [];
			
			path.compute(unit.tile.x, unit.tile.y, (x, y) => {
				pathToPlayer.push(this.state.board[y][x]);
			});
			
			if (pathToPlayer[1].unit === 'player') {
				// monster attack player
				this.updateLog('Monster attacks you!', 'red');
			} else if (!pathToPlayer[1].unit) {
				// move
				let targetTile = pathToPlayer[1];
				unit.tile.unit = null;
				targetTile.unit = unit.name.toLowerCase();
				unit.tile = targetTile;
			}
		}

		setTimeout(() => {
			this.setState({turn: true});
		}, 1);
	}

	updateLog(text, color = "") {
		this.state.log.push({ text: text, color: color });

		document.querySelector(".log").scrollTop = document.querySelector(".log").scrollHeight;

		while (this.state.log.length > 30) {
			this.state.log.shift();
		}
	}

	componentDidMount() {
		window.addEventListener('keydown', this.controls);
	}

	render() {

		console.log(this.state);

		const board = this.state.board.map((row, rowIndex) => {

			const rows = row.map((tile, colIndex) => {

				let tileClass = "tile";
				let unit = <template />

				if (tile.floor === 'select') {
					tileClass += " select";
				}

				if (tile.unit === "wall") {
					tileClass = "";
				} else if (tile.unit === "player") {
					unit = <span className="player"></span>
				} else if (tile.unit == "orc") {
					unit = <span className="orc"></span>

				}

				if (tile.floor === "stairs") {
					tileClass = "stairs";
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
			<div className="root">
				<div className="board">
					{board}
				</div>`
				<UI player={this.state.player} log={this.state.log} />
			</div>
		)
	}
};

ReactDOM.render(
	<Game />,
	document.getElementById('app')
);

module.hot.accept();