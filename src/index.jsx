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

		this.state = {
			player: {
				name: 'Test',
				currentHP: 10,
				maxHP: 10, 
				weapon: null,
				tile: null,
			},
			inventory: [],
			isRunning: true,
			turn: true,
			turnCounter: 1,
			floor: 1,
			board: null,
			enemies: null,
			log: []
		}
		
		let floor = this.createFloor(1);
		
		this.state.player.tile = floor.board[floor.y][floor.x];
		this.state.board = floor.board;
		this.state.enemies = floor.enemies;
		
		this.controls = this.controls.bind(this);
		this.attemptMove = this.attemptMove.bind(this);
		this.createFloor = this.createFloor.bind(this);
		this.nextFloor = this.nextFloor.bind(this);
		this.updateLog = this.updateLog.bind(this);
		this.monsterMove = this.monsterMove.bind(this);
		this.playerLoseLife = this.playerLoseLife.bind(this);
		this.playerAttack = this.playerAttack.bind(this);
		this.playerGainLife = this.playerGainLife.bind(this);
		this.wait = this.wait.bind(this);
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

		board[playerY][playerX].unit = this.state.player;

		// places random enemies
		let enemies = [];

		for (let n = 0; n < 1 + floor; n++) {
			let unitX = random(0, xA - 1);
			let unitY = random(0, yA - 1);

			while (board[unitY][unitX].unit) {
				unitX = random(0, xA - 1);
				unitY = random(0, yA - 1);
			}

			let unit = {
				name: 'Orc',
				currentHP: 5,
				maxHP: 5,
				damage: {
					min: 1,
					max: 3,
				},
				tile: board[unitY][unitX]
			}

			enemies.push(unit)

			board[unitY][unitX].unit = unit;
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
			case 101: // numpad 5
			case 53: // 5
				this.wait()
				break;
		}
	}

	wait () {
		this.updateLog('You stop and wait.');
		this.state.turn = false;
		this.state.turnCounter += 1;

		this.monsterMove();
	}

	playerGainLife (heal) {
		this.state.player.currentHP += heal;

		if (this.state.player.currentHP > this.state.player.maxHP) {
			this.state.player.currentHP = this.state.player.maxHP;
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
		if (!this.state.turn || !this.state.isRunning) {
			return false;
		}

		if (y < 0 || x < 0 || y >= this.state.board.length || x >= this.state.board[0].length) {
			return false;
		}

		const targetTile = this.state.board[y][x];

		if (targetTile.unit === 'wall') {
			return false;
		} else if (!targetTile.unit) {
			this.state.player.tile.unit = null;
			targetTile.unit = this.state.player;
			this.state.player.tile = targetTile;	
		} else {
			this.playerAttack(targetTile.unit);
		}

		this.state.turnCounter++;
		this.state.turn = false;

		this.monsterMove();
	}

	playerAttack(unit) {
		let damage = random(2, 4);
		unit.currentHP -= damage;
		this.updateLog(`You hit the ${unit.name.toLowerCase()} for ${damage} damage!`);
		if (unit.currentHP <= 0) {
			this.state.enemies.splice(this.state.enemies.indexOf(unit), 1);
			this.updateLog(`You slay the ${unit.name.toLowerCase()}!`);
			unit.tile.unit = null;
		}
		
	}

	monsterMove() {

		// player regens 1 hp every 3 rounds
		if (this.state.turnCounter % 3 === 0) {
			this.playerGainLife(1);
		}

		const path = new ROT.Path.AStar(this.state.player.tile.x, this.state.player.tile.y, (x, y) => {
			return this.state.board[y][x].unit !== 'wall';
		});

		for (let i in this.state.enemies) {
			let unit = this.state.enemies[i];

			const pathToPlayer = [];

			path.compute(unit.tile.x, unit.tile.y, (x, y) => {
				pathToPlayer.push(this.state.board[y][x]);
			});

			if (pathToPlayer[1].unit && pathToPlayer[1].unit.name === 'Test') {
				// monster attack player
				let damage = random(unit.damage.min, unit.damage.max);
				this.updateLog(`The ${unit.name.toLowerCase()} hits you for ${damage} damage!`, 'red');
				this.playerLoseLife(damage);
			} else if (!pathToPlayer[1].unit) {
				// move
				let targetTile = pathToPlayer[1];
				unit.tile.unit = null;
				targetTile.unit = unit;
				unit.tile = targetTile;
			}
		}

		setTimeout(() => {
			this.setState({ turn: true });
		}, 1);
	}

	playerLoseLife(damage) {
		if (this.state.player.currentHP - damage <= 0) {
			this.state.isRunning = false;
			this.state.player.currentHP = 0;
			this.updateLog('You died...', 'grey');
			// player dies
		} else {
			this.state.player.currentHP -= damage;
		}
	}

	updateLog(text, color = "") {
		this.state.log.push({ text: text, color: color });

		
		while (this.state.log.length > 30) {
			this.state.log.shift();
		}

		document.querySelector(".log").scrollTop = document.querySelector(".log").scrollHeight; // this is not working as well it should
	}

	componentDidMount() {
		window.addEventListener('keydown', this.controls);
	}

	render() {

		console.log(`Turn ${this.state.turnCounter}:`, this.state);

		const board = this.state.board.map((row, rowIndex) => {

			const rows = row.map((tile, colIndex) => {

				let tileClass = "tile";
				let unit = <template />

				if (tile.floor === 'select') {
					tileClass += " select";
				}

				if (tile.unit === "wall") {
					tileClass = "";
				} else if (tile.unit) {
					if (tile.unit.name === 'Test') {
						unit = <span className="player"></span>
					} else if (tile.unit.name === 'Orc') {
						unit = <span className="orc"></span>
					}
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