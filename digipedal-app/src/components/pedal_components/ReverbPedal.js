import React, {useEffect, useState} from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';

const minDecay = 0.4;
const maxDecay = 15;
const defaultDecay = 1.5;

const minAmount = 0;
const maxAmount = 2;
const defaultAmount = 0.25;

const minDry = 0;
const maxDry = 2;
const defaultDry = 1;


function ReverbPedal({width, height, isStatic, toggled, param_vals, togglePedal, deletePedal, showInfoModal, updatePedal, index}) {

  const increaseSize = () => {
    updatePedal((pedal) => {
      pedal.width *= 1.1; 
      pedal.height *= 1.1; 
      return pedal })
  };

  const decreaseSize = () => {
    updatePedal((pedal) => {
      pedal.width *= .9; 
      pedal.height *= .9; 
      return pedal })
  };

  useEffect(() => {
    if(!updatePedal){
      console.log("No update pedal for ReverbPedal yet. Temp setting it");
      updatePedal = (input) => {console.log(input)};
    }
  },[updatePedal])
  
  function updateParam(param, value) {
    console.log("updateParam: ", param, value)
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
      pedal.param_vals[param] = value;

      return pedal;
    })
  }

  // setting the default for amp if it is not already set
  useEffect(() => {
    // checking if there are param_vals or not
    console.log("do i need to update?")
    console.log(param_vals)
    if(param_vals == null){
      param_vals = {}
    }
    if (param_vals.amount == null) {
      updateParam("amount", defaultAmount);
    }
    if (param_vals.decay_time == null) {
      console.log('updateParam("decay", defaultDecay);')
      updateParam("decay_time", defaultDecay);}
    if (param_vals.dry == null){
      console.log('updateParam("dry", defaultDry);')
      updateParam("dry", defaultDry);
    }
  },[])

  // TODO: make this attached to the pedal that was clicked for info
  if(isStatic){
    toggled = true;
    param_vals = {};
  }

  let dry = (param_vals && param_vals.dry != null) ? param_vals.dry : defaultDry;
  let amount = (param_vals && param_vals.amount != null) ? param_vals.amount : defaultAmount;
  let decay = (param_vals && param_vals.decay_time != null) ? param_vals.decay_time : defaultDecay;


  let dryRotation = dry / (maxDry - minDry) * 270 - 135

  let amountRotation = amount / (maxAmount - minAmount) * 270 - 135

  let decayRotation = decay / (maxDecay - minDecay) * 270 - 135


  function increment_param(event, param, min, max) {
    console.log("increment_param")
    console.log(event)
    if(event == null || event.activatorEvent == null){
      console.log("returning early since: event == null || event.activatorEvent == null");
      return 
    }
    if(isStatic){
      console.log("not doing anything cause static")
      return ;
    }

    let increment_amount = (max - min) / 40;
    if (param == "decay_time"){
      increment_amount = (max - min) / 100;
    }
    if(event.activatorEvent.ctrlKey){
      increment_amount *= -1;
    }
    let newValue = Number((param_vals[param] + increment_amount).toPrecision(3));
    console.log("newValue: ", newValue)
    if(newValue > max){
      newValue = min;
    } else if (newValue < min){
      newValue = max;
    }
    updateParam(param, newValue);
  }

  let style = {"opacity": toggled ? 1 : .5};

  let svg_output = (
    <svg width={width} height={height + height/5} viewBox={isStatic ? `0 0 ${width} ${height + height/5}`: `0 ${-height/5} ${width} ${height + height/5 + height/5}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      
       {!isStatic ? 
       <text x={0} y={-height/10} fontFamily="BUNGEE" fontSize={height/5} fill="black" dominant-baseline="middle" text-anchor="left" opacity="75%"> {index + 1} </text> 
       : 
       <></> }
        <rect width={width} height={height} rx="1" fill="#D9D9D9"/>
        <Knob x={width * .5} y={height * .2} width={width * .26} rotation={decayRotation} text="Decay" isStatic={isStatic} increment={(e) => increment_param(e, "decay_time", minDecay, maxDecay)} number={decay}/>
        <Knob x={width * .25} y={height * .7} width={width * .18} rotation={dryRotation} text=" Dry " isStatic={isStatic} increment={(e) => increment_param(e, "dry", minDry, maxDry)} number={dry}/>
        <Knob x={width * .75} y={height * .7} width={width * .18} rotation={amountRotation} text=" Wet " isStatic={isStatic} increment={(e) => increment_param(e, "amount", minAmount, maxAmount)} number={amount}/>
        <PedalBottom width={width} height={height/5} startHeight={height} toggled={toggled} togglePedal={togglePedal} deletePedal={deletePedal} showInfoModal={showInfoModal}/>
        {isStatic ? 
        <></> 
        :
        <g>
          <text x={width - width/3} y={-height / 20} fill="red" fontSize={width/3} fontWeight="bold" textAnchor="end" onClick={decreaseSize}>-</text>
          <text x={width} y={-height / 20} fill="green" fontSize={width/3} fontWeight="bold" textAnchor="end" onClick={increaseSize}>+</text>
        </g>
        }
    </svg>
  );

  return svg_output;
}


export default ReverbPedal;