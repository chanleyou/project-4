// This file serves as webpack's entry point of compilation. Webpack will take this file, and all its dependencies (i.e. its imports, and the imports of those imports, etc) and run them through the _transpiler_ that we've configured, Babel in this case, then roll everything up into a single bundle.js file.

// Note that we have also configured webpack to load up css files, which are necessary if you wish to keep the styles of your React components in separate css files.

// Inspect webpack.config.js for details.

// Babel is responsible for taking the ES6 code in here and turning it into ES5 (this is not always possible, e.g. if you use ES6 proxies in your code since those are not equivalent to any ES5 construct). Here, we have configured it to use the env, react, and stage-2 presets in its transpilation. The react preset is required for Babel to understand the jsx mumbo jumbo that React uses. The other 2 presets refer to different JS standards that we wish for Babel to transpile into ES5.

// contains all elements that will always be on page

import React from 'react';
import ReactDOM from 'react-dom';
const ROT = require('rot-js');

import './style.scss'; // global stylesheet
// import Greeting from './Components/Greeting/greeting';

// rng
const random = (min, max) => {
	return min + Math.floor(Math.random() * (max - min + 1));
}

class HealthBar extends React.Component {

	render() {

		console.log(this.props.hp);

		return (
			<div className="health-bar">
				<span className="health-span">{this.props.hp}</span>
				<div className="health" style={{ width: this.props.hp + '%' }}></div>
			</div>
		)
	}
}

class App extends React.Component {
	constructor() {
		super()

		const xA = 32;
		const yA = 16;

		const map = new ROT.Map.Uniform(xA, yA, {roomDugPercentage: 0.2});
		const mapArray = [];

		for (let i = 0; i < yA; i++) {
			mapArray.push([]);
		}	

		map.create(function(x, y, value) {
			mapArray[y][x] = value;
		})

		let newBoard = []
		for (let y = 0; y < yA; y++) {
			let row = [];
			for (let x = 0; x < xA; x++) {
				let tile = {};
				if (mapArray[y][x]) {
					tile = {
						unit: 'wall',
						floor: 'wall'
					}
				} else {
					tile = {
						unit: null,
						floor: null
					};
				}
				row.push(tile);
			}
			newBoard.push(row);
		}

		let randomX = random(0, xA - 1);
		let randomY = random(0, yA - 1);

		while (mapArray[randomY][randomX]) {
			randomX = random(0, xA - 1);
			randomY = random(0, yA - 1);
		}

		newBoard[randomY][randomX].unit = 'player';

		this.state = {
			pX: randomX,
			pY: randomY,
			playerHP: 50,
			board: newBoard,
			playerTile: newBoard[randomY][randomX]
		}

		this.movePlayer = this.movePlayer.bind(this);
		this.attemptMove = this.attemptMove.bind(this);

	}

	movePlayer(event) {

		let x = this.state.pX;
		let y = this.state.pY;

		var keyPressed = event.keyCode;
		switch (keyPressed) {
			case 87: // w
				this.attemptMove(y - 1, x);
				break;
			case 83: // s
				this.attemptMove(y + 1, x);
				break;
			case 65: // a
				this.attemptMove(y, x - 1);
				break;
			case 68: // d
				this.attemptMove(y, x + 1);
				break;
		}
	}

	attemptMove(y, x) {
		if (y < 0 || x < 0 || y >= this.state.board.length || x >= this.state.board[0].length) {
			console.log("Can't move out of map.");
			return false;
		}

		const targetTile = this.state.board[y][x];

		if (targetTile.unit) {
			console.log("Can't move into another unit!");
			return false;
		}

		this.state.playerTile.unit = null;
		targetTile.unit = "player";
		this.state.playerTile = targetTile;
		this.setState({
			pX: x,
			pY: y
		})

		return true;
	}

	render() {

		window.addEventListener('keydown', this.movePlayer);

		console.log(this.state);

		const board = this.state.board.map((row, rowIndex) => {

			const rows = row.map((tile, colIndex) => {

				let tileClass = "tile";
				let player = <template />

				if (tile.unit === "wall") {
					tileClass = "wall";
				} else if (tile.unit === "player") {
					player = <div className="player"></div>
				}

				return (
					<div className={tileClass} key={colIndex}>
						{player}
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
				<HealthBar hp={this.state.playerHP} />
				<div className="board">
					{board}
				</div>
			</div>
		)
	}
};

ReactDOM.render(
	<App />,
	document.getElementById('app')
);

module.hot.accept();