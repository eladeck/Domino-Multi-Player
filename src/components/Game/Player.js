import React, { Component } from "react";
import Tile from './Tile.js'

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //tiles: this.props.tiles // FOR NEW WE USED ONLY THE props.tiles
    };

    this.handleClick = this.handleClick.bind(this);
  } 
  


  
  handleClick(event) {
    if(this.props.isGameOver || !this.props.isMyTurn)
      return;

    const tile = event.target.closest('div');
    if(tile) {
      this.props.handleSelected(tile.id);
    }
  } // handleClick

  render() {
    return (
        <div onClick={this.handleClick} className='player'>
            {this.props.tiles.map(indices =>
               <Tile
                 verticality={0}
                 key={indices}
                 top={indices[0]}
                 bottom={indices[1]}
                 isSelected={this.props.selectedTile !== null && this.props.selectedTile == indices}
                 isGameOver={this.props.isGameOver}
              /> 
              )}
        </div>
    );
  } // render
} // Player Component

export default Player;