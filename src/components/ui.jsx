import React from 'react';

class Controls extends React.Component {

	render() {
		return <button>Controls</button>
	}
}

class Log extends React.Component {

	render() {

		const items = this.props.log.map((item, index) => {
			return <p key={index + item.text} className={item.color}>{item.text}</p>
		})

		return (
			<div className="log">
				{items}
			</div>
		)
	}
}

export default class UI extends React.Component {

	render() {

		const player = this.props.player;

		return (
			<div className="ui">
				<div className="info">
					<h5>{player.name}</h5>
					<p>Level 1 Knight</p>
					<div className="health-line">
						<span>Life:</span>
						<div className="health-bar">
							<span className="health-span">{player.currentHP} / {player.maxHP}</span>
							<div className="health" style={{ width: (player.currentHP / player.maxHP * 100) + '%' }}></div>
						</div>
					</div>
				</div>
				<Log log={this.props.log} />
				<Controls />
			</div>
		)
	}
}