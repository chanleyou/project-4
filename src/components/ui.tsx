import * as React from 'react';

import "./ui.scss";

interface LogItem {
	text: string,
	color: string,
}

interface Props {
	player: {
		name: string,
		currentHP: number,
		maxHP: number,
	};
	log: LogItem[];
	toggleInventory: Function;
}

class Buttons extends React.Component<any, any> {
	constructor(Props: any) {
		super(Props)
	}
	
	render() {
		return (
			<div>
				<button onClick={this.props.toggleInventory}><span className="amber">[I]</span> Inventory</button>
				<button><span className="amber">[?]</span> Controls</button>			
			</div>
		) 
	}
}

export class UI extends React.Component<Props, object> {
	constructor(Props: Props) {
		super (Props)

	}

	render() {

		const player = this.props.player;

		const log = this.props.log.map((item, index) => {
			return <p key={index + item.text} className={item.color}>{item.text}</p>
		})

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
				<div className="log">
					{log}
				</div>
				<Buttons toggleInventory={this.props.toggleInventory} />
			</div>
		)
	}	
}