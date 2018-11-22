import * as React from 'react';

enum GameState {
	StartMenu,
	IsRunning,
	Paused,
	Inventory,
	Dead
}

interface Props {
	gameState: GameState;
	setName: Function;
}

interface MyState {
	name: string;
	introduction: string;
	prompt: string
}

export class StartMenu extends React.Component<Props, MyState> {
	constructor(props: Props) {
		super(props);

		this.state = {
			name: 'Knight',
			introduction: 'An evil wizard has teleported you and the princess into his evil lair! Your quest is to escort the princess through the dungeon, using the limited resources at your disposal to overcome its obstacles and defeat the monsters within. Brave knight, will your valiant efforts be enough to save the princess?',
			prompt: 'What is your name?'
		}

		this.changeHandler = this.changeHandler.bind(this);
	}


	changeHandler = function (event: any) {
		this.setState({
			[event.target.name]: event.target.value
		})
	}

	render() {

		if (this.props.gameState === GameState.StartMenu) {
			return (
				<div className="startmenu modal">
					<div>
						<h1>Save the Princess</h1>
						<img src="../sprites/knight_f_idle_anim_f0.png" />
						<img src="../sprites/elf_f_idle_anim_f0.png" />
						<p>{this.state.introduction}</p>
						<form onSubmit={() => { event.preventDefault(); this.props.setName(this.state.name) }}>
							<label>{this.state.prompt}</label>
							<input type="text" autoFocus autoComplete="off" onChange={this.changeHandler} name="name" value={this.state.name}></input>
							<button type="submit" >Start Game</button>
						</form>
					</div>
				</div>
			)
		} else {
			return null;
		}
	}
}