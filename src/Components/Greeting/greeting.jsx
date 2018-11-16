import React from 'react';

const style = {
    display: 'block'
}

export default class Greeting extends React.Component {
    constructor(){
        super();
    }

    render() {
        return(
            <div className="greeting" style={style}>
                Hello, {this.props.name}
            </div>
        )
    }
}