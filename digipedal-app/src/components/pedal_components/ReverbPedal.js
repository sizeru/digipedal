import React, {useEffect, useState} from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';

const minDelay = 0.4;
const maxDelay = 15;
const defaultDelay = 1.5;

const minAmount = 0;
const maxAmount = 2;
const defaultAmount = 0.25;

const minDry = 0;
const maxDry = 2;
const defaultDry = 1;


function ReverbPedal({width, height, isStatic, toggled, param_vals, togglePedal, deletePedal, showInfoModal, updatePedal, index}) {
  const [pedalWidth, setPedalWidth] = useState(width);
  const [pedalHeight, setPedalHeight] = useState(height);

  const increaseSize = () => {
    setPedalWidth(prevWidth => prevWidth * 1.1);
    setPedalHeight(prevHeight => prevHeight * 1.1);
  };

  const decreaseSize = () => {
    setPedalWidth(prevWidth => prevWidth / 1.1);
    setPedalHeight(prevHeight => prevHeight / 1.1);
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
    if (param_vals.delay == null) {
      console.log('updateParam("delay", defaultDelay);')
      updateParam("delay", defaultDelay);}
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
  let delay = (param_vals && param_vals.delay != null) ? param_vals.delay : defaultDelay;


  let dryRotation = dry / (maxDry - minDry) * 270 - 135

  let amountRotation = amount / (maxAmount - minAmount) * 270 - 135

  let delayRotation = delay / (maxDelay - minDelay) * 270 - 135


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
    if (param == "delay"){
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
    <svg width={pedalWidth} height={pedalHeight + pedalHeight/5} viewBox={isStatic ? `0 0 ${pedalWidth} ${pedalHeight + pedalHeight/5}`: `0 ${-pedalHeight/5} ${pedalWidth} ${pedalHeight + pedalHeight/5 + pedalHeight/5}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      
       {!isStatic ? 
       <text x={0} y={-pedalHeight/10} fontFamily="BUNGEE" fontSize={pedalHeight/5} fill="black" dominant-baseline="middle" text-anchor="left" opacity="75%"> {index + 1} </text> 
       : 
       <></> }
        <rect width={pedalWidth} height={pedalHeight} rx="1" fill="#D9D9D9"/>
        <Knob x={pedalWidth * .5} y={pedalHeight * .2} width={pedalWidth * .26} rotation={delayRotation} text="Delay" isStatic={isStatic} increment={(e) => increment_param(e, "delay", minDelay, maxDelay)} number={delay}/>
        <Knob x={pedalWidth * .25} y={pedalHeight * .7} width={pedalWidth * .18} rotation={dryRotation} text=" Dry " isStatic={isStatic} increment={(e) => increment_param(e, "dry", minDry, maxDry)} number={dry}/>
        <Knob x={pedalWidth * .75} y={pedalHeight * .7} width={pedalWidth * .18} rotation={amountRotation} text=" Wet " isStatic={isStatic} increment={(e) => increment_param(e, "amount", minAmount, maxAmount)} number={amount}/>
        <PedalBottom width={pedalWidth} height={pedalHeight/5} startHeight={pedalHeight} toggled={toggled} togglePedal={togglePedal} deletePedal={deletePedal} showInfoModal={showInfoModal}/>
        {isStatic ? 
        <></> 
        :
        <g>
          <text x={pedalWidth - 40} y={-pedalHeight / 20} fill="red" fontSize={pedalWidth/3} fontWeight="bold" textAnchor="end" onClick={decreaseSize}>-</text>
          <text x={pedalWidth} y={-pedalHeight / 20} fill="green" fontSize={pedalWidth/3} fontWeight="bold" textAnchor="end" onClick={increaseSize}>+</text>
        </g>
        }
    </svg>
  );

  return svg_output;
}


export default ReverbPedal;