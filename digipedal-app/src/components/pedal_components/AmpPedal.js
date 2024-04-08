import React, { useState } from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';
const minAmplifcation = 0;
const maxAmplifcation = 2;


function AmpPedal({width, height, isStatic, toggled, param_vals, togglePedal, deletePedal, openInfoModal}) {
  
  if(isStatic){
    toggled = true;
    param_vals ={};
  }

  // setting default amplifcation to 1
  let amplification = 1
  if(param_vals.Amplification){
    amplification = param_vals.Amplification
  }

  let amplifcationRotation = amplification / (maxAmplifcation - minAmplifcation) * 360

  let style = {
    "opacity": toggled ? 1 : .5,
  }


  let svg_output = (
    <svg width={width} height={height + height/5} viewBox={`0 0 ${width} ${height + height / 5}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
        <rect width={width} height={height} rx="1" fill="#D9D9D9"/>
        <Knob x={width * .5} y={height * .40} width={width * .40} rotation={amplifcationRotation} text="Type" isStatic={isStatic}/>
        <PedalBottom width={width} height={height/5} startHeight={height} toggled={toggled} togglePedal={togglePedal} deletePedal={deletePedal} openInfoModal={openInfoModal}/>
    </svg>
  );

  return svg_output;
}


export default AmpPedal;