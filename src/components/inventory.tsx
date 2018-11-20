import * as React from 'react';

import "./inventory.scss";

interface Item {
	name: string,
	description: string,
}

interface Props {
	inventory: Item[];
}

export class Inventory extends React.Component<Props, object> {

	render() {

		const inventory = this.props.inventory.map((item: Item, index) => {
			return <p key={index + item.name} className="">{item.name} - {item.description}</p>
		})



		return (
			<div className="inventory">
				<h4>Inventory</h4>
				{inventory}
			</div>
		)
	}	
}