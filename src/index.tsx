import * as React from "react";
import * as ReactDOM from "react-dom";

const ROT = require('rot-js');

import './style.scss'; // global stylesheet... though all of them are

import { UI } from './components/ui';
import { Inventory } from './components/inventory';
import { Board } from './components/board';

const random = (min: number, max: number) => {
	return min + Math.floor(Math.random() * (max - min + 1));
}

interface Unit {
	name: string;
	currentHP: number;
	maxHP: number;
	tile: Tile;
	damage: Damage;
	isPlayer: boolean;
}

interface Damage {
	min: number;
	max: number;
}

class Player implements Unit {
	currentHP: number;
	maxHP: number;
	damage: Damage;
	isPlayer: boolean;

	constructor(public name: string, public tile: Tile) {
		this.maxHP = 15;
		this.currentHP = 15;
		this.isPlayer = true;
	}
}

class Princess implements Unit {
	name: string;
	currentHP: number;
	maxHP: number;
	damage: Damage;
	isPlayer: boolean;

	constructor(public tile: Tile) {
		this.name = "Princess";
		this.maxHP = 10;
		this.currentHP = 10;
	}
}

class Enemy implements Unit {
	currentHP: number;
	isPlayer: boolean;

	constructor(public name: string, public maxHP: number, public tile: Tile, public damage: Damage) {
		this.currentHP = maxHP;
		this.tile.unit = this; // places the unit on its tile upon creation
		this.isPlayer = false;
	}
}

class Tile {
	unit: Unit;
	ground: string;
	visible: boolean;
	explored: boolean;

	constructor(readonly x: number, readonly y: number, readonly wall: boolean = false) {
		this.unit = null;
		this.ground = null;
		this.visible = false;
		this.explored = false;
	}
}

interface LogItem {
	text: string;
	color: string;
}

abstract class Item {
	game: Game;
	icon: string;
	name: string;
	description: string;
	effect: Function;

	constructor(game: Game) {
		this.game = game;
	}
}

class HealPotion extends Item {
	game: Game;
	icon = "flask_big_green";
	name = 'Healing Potion';
	description = "Can be consumed to heal you for 5-8 life.";
	effect = function () {
		let heal = random(5, 8);
		this.game.playerGainLife(heal);
		this.game.updateLog(`The potion restores ${heal} life.`, 'green');
		this.game.endTurn();
		this.game.useItem(this.game.state.inventory.indexOf(this));
	}

	constructor(game: Game) {
		super (game);
	}
}

enum GameState {
	IsRunning,
	Paused,
	Inventory,
	Dead
}

interface MyState {
	player: Player,
	princess: Princess,
	board: Tile[][],
	floor: number,
	gameState: GameState,
	playerTurn: boolean,
	turn: number,
	enemies: Enemy[],
	log: LogItem[],
	inventory: Item[],
}

class Game extends React.Component<any, MyState> {
	
	columns: number = 34;
	rows: number = 20;

	constructor(props: any) {
		super(props);


		this.createFloor = this.createFloor.bind(this);
		this.controls = this.controls.bind(this);
		this.playerMove = this.playerMove.bind(this);
		this.nextFloor = this.nextFloor.bind(this);
		this.updateLog = this.updateLog.bind(this);
		this.monsterMove = this.monsterMove.bind(this);
		this.playerLoseLife = this.playerLoseLife.bind(this);
		this.playerAttack = this.playerAttack.bind(this);
		this.playerGainLife = this.playerGainLife.bind(this);
		this.wait = this.wait.bind(this);
		this.endTurn = this.endTurn.bind(this);
		this.calculateFOV = this.calculateFOV.bind(this);
		this.toggleInventory = this.toggleInventory.bind(this);
		this.useItem = this.useItem.bind(this);

		let floor = this.createFloor(1);
		let player = new Player('Test', floor.playerTile);
		let princess = new Princess(floor.princessTile);

		floor.playerTile.unit = player;
		floor.princessTile.unit = princess;

		this.state = {
			player: player,
			princess: princess,
			board: floor.board,
			floor: 1,
			gameState: GameState.IsRunning,
			playerTurn: true,
			turn: 1,
			enemies: floor.enemies,
			log: [],
			inventory: [new HealPotion(this)]
		}
	}

	createFloor(floor: number) {

		const map = new ROT.Map.Uniform(this.columns, this.rows, { roomDugPercentage: 0.25 });

		const board: Tile[][] = [];

		for (let i = 0; i < this.rows; i++) {
			let row: Tile[] = [];
			board.push(row);
		}

		map.create(function (x: number, y: number, value: number) {
			if (value) {
				board[y][x] = new Tile(x, y, true);
			} else {
				board[y][x] = new Tile(x, y, false);
			}
		})

		// places staircase to next floor in a random room
		const rooms = map.getRooms();
		const randomRoom = ROT.RNG.getItem(rooms);
		let stairX = random(randomRoom.getLeft(), randomRoom.getRight());
		let stairY = random(randomRoom.getTop(), randomRoom.getBottom());

		board[stairY][stairX].ground = 'stairs';

		// should rewrite this to place the player in a random room
		let playerX = random(0, this.columns - 1);
		let playerY = random(0, this.rows - 1);

		while (board[playerY][playerX].wall) {
			playerX = random(0, this.columns - 1);
			playerY = random(0, this.rows - 1);
		}

		let playerTile = board[playerY][playerX];

		// places the princess next to the player
		let princessTile: Tile;

		if (!board[playerY][playerX - 1].wall) {
			princessTile = board[playerY][playerX - 1];
		} else if (!board[playerY][playerX + 1].wall) {
			princessTile = board[playerY][playerX + 1];
		} else if (!board[playerY - 1][playerX].wall) {
			princessTile = board[playerY - 1][playerX];
		} else {
			princessTile = board[playerY + 1][playerX];
		}
		
		// places enemies
		const enemies: Enemy[] = [];

		for (let n = 0; n < 1 + floor; n++) {

			let unitTile = board[random(0, this.rows - 1)][random(0, this.columns - 1)];

			while (unitTile.wall || unitTile.unit || unitTile === princessTile || unitTile === playerTile) {
				console.log('!!!');
				unitTile = board[random(0, this.rows - 1)][random(0, this.columns - 1)];
			}

			// to be replaced with random enemy generation
			let unit = new Enemy('Orc', 5, unitTile, { min: 1, max: 3 });
			enemies.push(unit);
		}

		return {
			board: board,
			enemies: enemies,
			playerTile: playerTile,
			princessTile: princessTile
		}
	}

	controls(event: any) {
		let x = this.state.player.tile.x;
		let y = this.state.player.tile.y;

		var keyPressed = event.keyCode;
		switch (keyPressed) {
			// case 87: // w
			case 104: // numpad 8
				this.playerMove(y - 1, x);
				break;
			// case 83: // s
			case 98: // numpad 2
				this.playerMove(y + 1, x);
				break;
			// case 65: // a
			case 100: // numpad 4
				this.playerMove(y, x - 1);
				break;
			// case 68: // d
			case 102: // numpad 6
				this.playerMove(y, x + 1);
				break;
			case 103: // numpad 7
				this.playerMove(y - 1, x - 1);
				break;
			case 105: // numpad 9
				this.playerMove(y - 1, x + 1);
				break;
			case 97: // numpad 1
				this.playerMove(y + 1, x - 1);
				break;
			case 99: // numpad 3
				this.playerMove(y + 1, x + 1);
				break;
			case 73: // i
				this.toggleInventory();
				break;
			case 190: // >
				if (this.state.player.tile.ground === 'stairs') {
					this.nextFloor();
				}
				break;
			case 101: // numpad 5
			case 53: // 5
				this.wait()
				break;
		}
	}

	wait() {
		if (this.state.gameState !== GameState.IsRunning) {
			return false;
		} else {
			this.updateLog('You wait.');
			this.endTurn();
		}
	}

	playerGainLife(heal: number) {
		this.state.player.currentHP += heal;

		if (this.state.player.currentHP > this.state.player.maxHP) {
			this.state.player.currentHP = this.state.player.maxHP;
		}
	}

	nextFloor() {
		let newFloor = this.createFloor(this.state.floor + 1);

		this.updateLog(`Moving to DL:${this.state.floor + 1}.`);

		this.state.player.tile = newFloor.playerTile;
		this.state.player.tile.unit = this.state.player;

		this.state.princess.tile = newFloor.princessTile;
		this.state.princess.tile.unit = this.state.princess;

		this.setState({
			floor: this.state.floor + 1,
			board: newFloor.board,
			enemies: newFloor.enemies
		});
	}

	playerMove(y: number, x: number) {
		if (!this.state.turn || this.state.gameState !== GameState.IsRunning) {
			return false;
		}

		if (y < 0 || x < 0 || y >= this.state.board.length || x >= this.state.board[0].length) {
			return false;
		}

		const targetTile: Tile = this.state.board[y][x];

		if (targetTile.wall) {
			return false;
		} else if (!targetTile.unit) {
			this.state.player.tile.unit = null;
			targetTile.unit = this.state.player;
			this.state.player.tile = targetTile;
		} else {
			this.playerAttack(targetTile.unit);
		}

		this.endTurn();
	}

	playerAttack(unit: Enemy) {
		let damage = random(2, 4); // to be rewritten when items are introduced
		unit.currentHP -= damage;
		this.updateLog(`You hit the ${unit.name.toLowerCase()} for ${damage} damage!`);
		if (unit.currentHP <= 0) {
			this.state.enemies.splice(this.state.enemies.indexOf(unit), 1);
			this.updateLog(`You slay the ${unit.name.toLowerCase()}!`, 'amber');
			unit.tile.unit = null;
		}

	}

	monsterMove() {

		// player regens 1 hp every 3 rounds
		if (this.state.turn % 3 === 0) {
			this.playerGainLife(1);
		}

		const path = new ROT.Path.AStar(this.state.player.tile.x, this.state.player.tile.y, (x: number, y: number) => {
			return !this.state.board[y][x].wall;
		});

		for (let i in this.state.enemies) {
			let unit = this.state.enemies[i];

			const pathToPlayer: Tile[] = [];

			path.compute(unit.tile.x, unit.tile.y, (x: number, y: number) => {
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
			this.setState({ playerTurn: true });
		}, 1);
	}

	playerLoseLife(damage: number) {
		if (this.state.player.currentHP - damage <= 0) {

			this.state.player.currentHP = 0;
			this.setState({
				gameState: GameState.Dead
			})
			this.updateLog('You died...', 'grey');
			// player dies
		} else {
			this.state.player.currentHP -= damage;
		}
	}

	updateLog(text: string, color: string = "") {
		this.state.log.push({ text: text, color: color });


		while (this.state.log.length > 30) {
			this.state.log.shift();
		}

		document.querySelector(".log").scrollTop = document.querySelector(".log").scrollHeight; // this is not working as well it should

		this.setState({
			log: this.state.log
		})
	}

	endTurn() {
		this.setState({
			playerTurn: false,
			turn: this.state.turn + 1
		})
		this.monsterMove();
	}

	componentDidMount() {
		window.addEventListener('keydown', this.controls);
	}

	calculateFOV() {

		for (let i in this.state.board) {
			for (let y in this.state.board[i]) {
				this.state.board[i][y].visible = false;
			}
		}

		const fov = new ROT.FOV.PreciseShadowcasting((x: number, y: number) => {
			if (y < 0 || x < 0 || y >= this.rows || x >= this.columns) {
				return false;
			} else {
				return !this.state.board[y][x].wall;
			}
		});

		fov.compute(this.state.player.tile.x, this.state.player.tile.y, 8, (x: number, y: number, r: number, visibility: Function) => {
			if (this.state.board[y][x]) {
				this.state.board[y][x].explored = true;
				this.state.board[y][x].visible = true;
			}
		})
	}

	toggleInventory() {
		if (this.state.gameState === GameState.IsRunning) {
			this.setState({
				gameState: GameState.Inventory
			})
		} else if (this.state.gameState === GameState.Inventory) {
			this.setState({
				gameState: GameState.IsRunning
			})
		}
	}

	useItem(index: number) {
		this.state.inventory.splice(index, 1);
		this.setState({
			gameState: GameState.IsRunning
		})
	}

	render() {

		this.calculateFOV();

		// LOGGING
		console.log(`T${this.state.turn}:`, this.state);

		return (
			<div className="root">
				<Inventory gameState={this.state.gameState} useItem={this.useItem} inventory={this.state.inventory} />
				<Board board={this.state.board} />
				<UI player={this.state.player} log={this.state.log} toggleInventory={this.toggleInventory} />
			</div>
		)
	}
}

ReactDOM.render(
	<Game />,
	document.getElementById('app')
);