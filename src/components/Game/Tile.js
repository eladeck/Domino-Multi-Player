import React, { Component } from "react";
import theme from "./theme.css"

class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verticality: Number(this.props.verticality),
      top:         Number(this.props.top),
      bottom:      Number(this.props.bottom)
    };

    this.handleClick = this.handleClick.bind(this);
    this.determineVerticality = this.determineVerticality.bind(this);
    this.generateTiles = this.generateTiles.bind(this);
  }


  handleClick(event) {
    if(this.props.isGameOver) return;
    
      if(this.props.isSelected) {
        this.setState(prevState => {
          return {
            verticality: (prevState.verticality + 1) % 4,
          };
        });
      }
  }

  determineVerticality() {
    let vertialictyStyle = {};
    switch(this.state.verticality) {
      case 0: 
        vertialictyStyle = {transform:"rotate(0deg)"};
        break;
      case 1: 
        vertialictyStyle = {transform:"rotate(90deg)"};
        break;
      case 2: 
        vertialictyStyle = {transform:"rotate(180deg)"};
        break;
      case 3: 
        vertialictyStyle = {transform:"rotate(270deg)"};
        break;
    }
    
    return vertialictyStyle;
  }

  
  render(props) {
    let vertialictyStyle = this.determineVerticality();
    // console.log(this.props.isSelected);
    return (
      <div
        className={`tile ${this.props.isGameOver && this.props.win ? 'glow' : ''}`}
        onClick={this.handleClick} 
        style={vertialictyStyle}
        id={`verticality${this.state.verticality}`}
      >
        {this.generateTiles()}

      </div>
    );
  } // render

///////////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
  generateTiles()
  {
      const zero = parseInt(0);
      const one = parseInt(1);
      const two = parseInt(2);
      const three = parseInt(3);
      const four = parseInt(4);
      const five = parseInt(5);
      const six = parseInt(6);
      if(this.state.top === zero && this.state.bottom === zero)
      {
          return(<div id={`${zero}${zero}`} className={this.props.isSelected ? "domino selected" : "domino"}> 
                  <span className="line"></span>
                  </div>)
      }
      if(this.state.top === zero && this.state.bottom === one)
      {
          return(
                   <div id={`${zero}${one}`} className={this.props.isSelected ? "domino selected" : "domino"} >
            <span className="line"></span>
            <span className="BC135"></span>
          </div>)
      }
      if(this.state.top === zero && this.state.bottom === two)
      {
          return( <div id={`${zero}${two}`} className={this.props.isSelected ? "domino selected" : "domino"} >
          <span className="line"></span>
          <span className="BL23456"></span>
          <span className="BR23456"></span>
        </div>)
      }
      if(this.state.top === zero && this.state.bottom === three)
      {
          return(<div id={`${zero}${three}`} className={this.props.isSelected ? "domino selected" : "domino"} >
          <span className="line"></span>
          <span className="BL23456"></span>
          <span className="BC135"></span>
          <span className="BR23456"></span>
        </div>
  )
      }
      if(this.state.top === zero && this.state.bottom === four)
      {
          return( <div id={`${zero}${four}`} className={this.props.isSelected ? "domino selected" : "domino"} >
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL23456"></span>
          <span className="BR23456"></span>
          <span className="BR456"></span>
        </div>
        )
      }
      if(this.state.top === zero && this.state.bottom === five)
      {
          return( <div id={`${zero}${five}`} className={this.props.isSelected ? "domino selected" : "domino"} >
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL23456"></span>
          <span className="BC135"></span>
          <span className="BR23456"></span>
          <span className="BR456"></span>
        </div>)
      }
      if(this.state.top === zero && this.state.bottom === six)
      {
          return( 
            <div id={`${zero}${six}`} className={this.props.isSelected ? "domino selected" : "domino"} >
              <span className="line"></span>
              <span className="BL456"></span>
              <span className="BL6"></span>
              <span className="BL23456"></span>
              <span className="BR23456"></span>
              <span className="BR6"></span>
              <span className="BR456"></span>
            </div>)
      }
  
  
      if(this.state.top === one && this.state.bottom === one)
      {
        return(<div id={`${one}${one}`} className={this.props.isSelected ? "domino selected" : "domino"} >
        <span className="TC135"></span>
        <span className="line"></span>
        <span className="BC135"></span>
      </div>)
      }
      
      if(this.state.top === one && this.state.bottom === two)
      {
        return( <div id={`${one}${two}`} className={this.props.isSelected ? "domino selected" : "domino"}>
        <span className="TC135"></span>
        <span className="line"></span>
        <span className="BL23456"></span>
        <span className="BR23456"></span>
      </div>)
      }
      
      if(this.state.top === one && this.state.bottom === three)
      {
        return(  
          <div id={`${one}${three}`} className={this.props.isSelected ? "domino selected" : "domino"}>
            <span className="TC135"></span>
            <span className="line"></span>
            <span className="BL23456"></span>
            <span className="BC135"></span>
            <span className="BR23456"></span>
          </div>
          )
      }
      
      if(this.state.top === one && this.state.bottom === four)
      {
        return(      
          <div id={`${one}${four}`} className={this.props.isSelected ? "domino selected" : "domino"}>
            <span className="TC135"></span>
            <span className="line"></span>
            <span className="BL456"></span>
            <span className="BL23456"></span>
            <span className="BR23456"></span>
            <span className="BR456"></span>
          </div>)
      }
      
      if(this.state.top === one && this.state.bottom === five)
      {
        return(     
          <div id={`${one}${five}`} className={this.props.isSelected ? "domino selected" : "domino"}>
            <span className="TC135"></span>
            <span className="line"></span>
            <span className="BL456"></span>
            <span className="BL23456"></span>
            <span className="BC135"></span>
            <span className="BR23456"></span>
            <span className="BR456"></span>
          </div>)
      }
      
      if(this.state.top === one && this.state.bottom === six)
      {
        return(
          <div id={`${one}${six}`} className={this.props.isSelected ? "domino selected" : "domino"}>
            <span className="TC135"></span>
            <span className="line"></span>
            <span className="BL456"></span>
            <span className="BL6"></span>
            <span className="BL23456"></span>
            <span className="BR23456"></span>
            <span className="BR6"></span>
            <span className="BR456"></span>
          </div>
          )
      }
      
      if(this.state.top === two && this.state.bottom === two)
      {
        return(
          <div id={`${two}${two}`} className={this.props.isSelected ? "domino selected" : "domino"}>
            <span className="TL23456"></span>
            <span className="TR23456"></span>
            <span className="line"></span>
            <span className="BL23456"></span>
            <span className="BR23456"></span>
          </div>
          )
      }
      
      if(this.state.top === two && this.state.bottom === three)
      {
        return( <div id={`${two}${three}`} className={this.props.isSelected ? "domino selected" : "domino"}>
        <span className="TL23456"></span>
        <span className="TR23456"></span>
        <span className="line"></span>
        <span className="BL23456"></span>
        <span className="BC135"></span>
        <span className="BR23456"></span>
      </div>)
      }
      
      if(this.state.top === two && this.state.bottom === four)
      {
        return(  <div id={`${two}${four}`} className={this.props.isSelected ? "domino selected" : "domino"}>
        <span className="TL23456"></span>
        <span className="TR23456"></span>
        <span className="line"></span>
        <span className="BL456"></span>
        <span className="BL23456"></span>
        <span className="BR23456"></span>
        <span className="BR456"></span>
      </div>)
      }
      
      if(this.state.top === two && this.state.bottom === five)
      {
        return( <div id={`${two}${five}`} className={this.props.isSelected ? "domino selected" : "domino"}>
        <span className="TL23456"></span>
        <span className="TR23456"></span>
        <span className="line"></span>
        <span className="BL456"></span>
        <span className="BL23456"></span>
        <span className="BC135"></span>
        <span className="BR23456"></span>
        <span className="BR456"></span>
      </div>)
      }
      
      if(this.state.top === two && this.state.bottom === six)
      {
        return(    <div id={`${two}${six}`} className={this.props.isSelected ? "domino selected" : "domino"}>
        <span className="TL23456"></span>
        <span className="TR23456"></span>
        <span className="line"></span>
        <span className="BL456"></span>
        <span className="BL6"></span>
        <span className="BL23456"></span>
        <span className="BR23456"></span>
        <span className="BR6"></span>
        <span className="BR456"></span>
      </div>)
      }
  
      if(this.state.top === three && this.state.bottom === three)
      {
        return(
          <div id={`${three}${three}`} className={this.props.isSelected ? "domino selected" : "domino"}>
          <span className="TL23456"></span>
          <span className="TC135"></span>
          <span className="TR23456"></span>
          <span className="line"></span>
          <span className="BL23456"></span>
          <span className="BC135"></span>
          <span className="BR23456"></span>
        </div>
          )
      }
      if(this.state.top === three && this.state.bottom === four)
      {
        return(
          <div id={`${three}${four}`} className={this.props.isSelected ? "domino selected" : "domino"}>
              <span className="TL23456"></span>
              <span className="TC135"></span>
              <span className="TR23456"></span>
              <span className="line"></span>
              <span className="BL456"></span>
              <span className="BL23456"></span>
              <span className="BR23456"></span>
              <span className="BR456"></span>
            </div>
          )
      }
      if(this.state.top === three && this.state.bottom === five)
      {
        return(
          <div id={`${three}${five}`} className={this.props.isSelected ? "domino selected" : "domino"}>
          <span className="TL23456"></span>
          <span className="TC135"></span>
          <span className="TR23456"></span>
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL23456"></span>
          <span className="BC135"></span>			
          <span className="BR23456"></span>
          <span className="BR456"></span>
        </div>
          )
      }
      if(this.state.top === three && this.state.bottom === six)
      {
        return(
          <div id={`${three}${six}`} className={this.props.isSelected ? "domino selected" : "domino"}>
          <span className="TL23456"></span>
          <span className="TC135"></span>
          <span className="TR23456"></span>
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL6"></span>
          <span className="BL23456"></span>
          <span className="BR6"></span>		
          <span className="BR23456"></span>
          <span className="BR456"></span>
        </div>
          )
      }
      if(this.state.top === four && this.state.bottom === four)
      {
        return(
          <div id={`${four}${four}`} className={this.props.isSelected ? "domino selected" : "domino"} >
              <span className="TL456"></span>
              <span className="TL23456"></span>
              <span className="TR23456"></span>
              <span className="TR456"></span>
              <span className="line"></span>
              <span className="BL456"></span>
              <span className="BL23456"></span>
              <span className="BR23456"></span>
              <span className="BR456"></span>
            </div>
          )
      }
      if(this.state.top === four && this.state.bottom === five)
      {
        return(
          <div id={`${four}${five}`} className={this.props.isSelected ? "domino selected" : "domino"}>
              <span className="TL456"></span>
              <span className="TL23456"></span>
              <span className="TR23456"></span>
              <span className="TR456"></span>
              <span className="line"></span>
              <span className="BL456"></span>
              <span className="BL23456"></span>
              <span className="BC135"></span>	
              <span className="BR23456"></span>
              <span className="BR456"></span>
            </div>
          )
      }
      if(this.state.top === four && this.state.bottom === six)
      {
        return(
          <div id={`${four}${six}`} className={this.props.isSelected ? "domino selected" : "domino"}>
          <span className="TL456"></span>
          <span className="TL23456"></span>
          <span className="TR23456"></span>
          <span className="TR456"></span>
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL6"></span>
          <span className="BL23456"></span>
          <span className="BR6"></span>		
          <span className="BR23456"></span>
          <span className="BR456"></span>
        </div>
          )
      }
      if(this.state.top === five && this.state.bottom === five)
      {
        return(
          <div id={`${five}${five}`} className={this.props.isSelected ? "domino selected" : "domino"}>
          <span className="TL456"></span>
          <span className="TL23456"></span>
          <span className="TC135"></span>	
          <span className="TR23456"></span>
          <span className="TR456"></span>
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL23456"></span>
          <span className="BC135"></span>	
          <span className="BR23456"></span>
          <span className="BR456"></span>
        </div>
          )
      }
      if(this.state.top === five && this.state.bottom === six)
      {
        return(
          <div id={`${five}${six}`} className={this.props.isSelected ? "domino selected" : "domino"}>
          <span className="TL456"></span>
          <span className="TL23456"></span>
          <span className="TC135"></span>	
          <span className="TR23456"></span>
          <span className="TR456"></span>
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL6"></span>
          <span className="BL23456"></span>
          <span className="BR6"></span>		
          <span className="BR23456"></span>
          <span className="BR456"></span>
        </div>
          )
      }
  
      if(this.state.top === six && this.state.bottom === six)
      {
        return(
          <div id={`${six}${six}`} className={this.props.isSelected ? "domino selected" : "domino"}>
          <span className="TL456"></span>
          <span className="TL23456"></span>
          <span className="TL6"></span>
          <span className="TR23456"></span>
          <span className="TR6"></span>
          <span className="TR456"></span>
          <span className="line"></span>
          <span className="BL456"></span>
          <span className="BL6"></span>
          <span className="BL23456"></span>
          <span className="BR6"></span>		
          <span className="BR23456"></span>
          <span className="BR456"></span>
      </div>
          )
      }
      else
      {
        return(<div><h3>nothing was rendered  {this.state.cardNum} </h3> </div>)
      }
    } // generateTiles
} // Tiles Component
export default Tile;