import React, {useState, useEffect} from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';
const minAmplifcation = 0;
const maxAmplifcation = 2;

const defaultAmplifcation = 1;


function AmpPedal({width, height, isStatic, toggled, param_vals, togglePedal, deletePedal, showInfoModal, updatePedal, index}) {
  useEffect(() => {
    if(!updatePedal){
      console.log("No update pedal for AmpPedal yet. Temp setting it");
      updatePedal = (input) => {console.log(input)};
    }
  },[updatePedal])
  
  function updateAmplifcation(amplification){
    console.log("updateAmplification: ", amplification)
    if(isStatic){
      console.log("Not updating since it is a static pedal");
      return;
    }

    updatePedal((pedal) => {
      // checking it has param_vals
      if(!pedal.param_vals){
        pedal.param_vals = {};
      }
      // setting the new amplification
      pedal.param_vals.amplification = amplification;

      return pedal;
    })
  }
  // setting the default for amp if it is not already set
  useEffect(() => {
    // checking if there are param_vals or not
    console.log("do i need to update?")
    console.log(!param_vals || !param_vals.amplification)
    if(!param_vals || param_vals.amplification == null){
      updateAmplifcation(defaultAmplifcation)
    }
  },[])

  // TODO: make this attached to the pedal that was clicked for info
  if(isStatic){
    toggled = true;
    param_vals = {};
  }

  let amplification = (param_vals &&  param_vals.amplification != null)
? param_vals.amplification : defaultAmplifcation;


  let amplifcationRotation = amplification / (maxAmplifcation - minAmplifcation) * 270 - 135

  function increment_amplification(event) {
    console.log("increment_amplification")
    console.log(event)
    if(event == null || event.activatorEvent == null){
      console.log("returning early since: event == null || event.activatorEvent == null");
      return 
    }
    if(isStatic){
      console.log("not doing anything cause static")
      return ;
    }

    let increment_amount = (maxAmplifcation - minAmplifcation) / 100;
    if(event.activatorEvent.ctrlKey){
      increment_amount *= -1;
    }
    let newAmplification = Number((amplification + increment_amount).toPrecision(3));
    console.log("newAmplification: ", newAmplification)
    if(newAmplification > maxAmplifcation){
      newAmplification = minAmplifcation;
    } else if (newAmplification < minAmplifcation){
      newAmplification = maxAmplifcation;
    }
    updateAmplifcation(newAmplification);
  }

  let style = {
    "opacity": toggled ? 1 : .5,
  }


  let svg_output = (
    <svg width={width} height={height + height/5} viewBox={`0 ${-height/5} ${width} ${height + height/5 + height/5}`}fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      
       <text x={0} y={-height/10} fontFamily="BUNGEE" fontSize={height/5} fill="black" dominant-baseline="middle" text-anchor="left" opacity="75%">{index + 1}</text>
        <rect width={width} height={height} rx="1" fill="#D9D9D9"/>
        <Knob x={width * .5} y={height * .40} width={width * .40} rotation={amplifcationRotation} text="Amplification" isStatic={isStatic} increment={increment_amplification} number={amplification}/>
        <PedalBottom width={width} height={height/5} startHeight={height} toggled={toggled} togglePedal={togglePedal} deletePedal={deletePedal} showInfoModal={showInfoModal}/>
    </svg>
  );

  return svg_output;
}


export default AmpPedal;