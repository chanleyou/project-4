import * as React from 'react';

import "./inventory.scss";

interface Item {
	icon: string;
	name: string;
	effect: Function;
	description: string;
}

interface Props {
	inventory: Item[];
	useItem: Function;
}

export class Inventory extends React.Component<Props, object> {

	render() {

		const inventory = this.props.inventory.map((item: Item, index) => {
			return (
				<div key={index + item.name} className="item">
					<p><img src={'../sprites/'+ item.icon + '.png'} />{item.name} - {item.description}<button onClick={() => 
					item.effect()} >Use</button></p>
				</div>
			)
		})
			
		return (
			<div className="inventory">
				<h1>Inventory</h1>
				{inventory}
			</div>
		)
	}	
}