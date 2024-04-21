import React, {useState, useEffect} from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';

const minDelay = 0.4;
const maxDelay = 15;
const defaultDelay = 1.5;

const minAmount = 0;
const maxAmount = 2;
const defaultAmount = 0.25;

/*
const minOn = 0;
const maxOn = 1;
const defaultOn = 1;
*/

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

  /*
  function updateDry(dry){
    console.log("updateDry: ", dry)
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
      pedal.param_vals.dry = dry;

      return pedal;
    })
  }

  function updateOn(on){
    console.log("updateOn: ", on)
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
      pedal.param_vals.on = on;

      return pedal;
    })
  }

  function updateAmount(amount){
    console.log("updateAmount: ", amount)
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
      pedal.param_vals.amount = amount;

      return pedal;
    })
  }

  function updateDelay(delay){
    console.log("updateDelay: ", delay)
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
      pedal.param_vals.delay = delay;

      return pedal;
    })
  }
  */

  // setting the default for amp if it is not already set
  useEffect(() => {
    // checking if there are param_vals or not
    console.log("do i need to update?")
    console.log(!param_vals || !param_vals.amplification)
    if(!param_vals){
//      updateAmount(defaultAmount);
//      updateDelay(defaultDelay);
//      updateOn(defaultOn);
//      updateDry(defaultDry);
      if (!param_vals.amount) updateParam("amount", defaultAmount);
      if (!param_vals.delay) updateParam("delay", defaultDelay);
//      updateParam("on", defaultOn);
      if (!param_vals.dry) updateParam("dry", defaultDry);
    }
  },[])

  // TODO: make this attached to the pedal that was clicked for info
  if(isStatic){
    toggled = true;
    param_vals = {};
  }

  let dry = (param_vals && param_vals.dry != null) ? param_vals.dry : defaultDry;
 // let on = (param_vals && param_vals.on != null) ? param_vals.on : defaultOn;
  let amount = (param_vals && param_vals.amount != null) ? param_vals.amount : defaultAmount;
  let delay = (param_vals && param_vals.delay != null) ? param_vals.delay : defaultDelay;


  let dryRotation = dry / (maxDry - minDry) * 270 - 135

  let amountRotation = amount / (maxAmount - minAmount) * 270 - 135

  let delayRotation = delay / (maxDelay - minDelay) * 270 - 135

  let dryVal = (param_vals && param_vals.dry) ? param_vals.dry : dry;
  
  let amtVal = (param_vals && param_vals.amount) ? param_vals.amount : amount;

  let delayVal = (param_vals && param_vals.delay) ? param_vals.delay : delay;

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

  /*
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
  */

  let style = {
    "opacity": toggled ? 1 : .5,
  }


  let svg_output = (
    <svg width={pedalWidth} height={pedalHeight + pedalHeight/5} viewBox={`0 ${-pedalHeight/5} ${pedalWidth} ${pedalHeight + pedalHeight/5 + pedalHeight/5}`}fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      
       <text x={0} y={-pedalHeight/10} fontFamily="BUNGEE" fontSize={pedalHeight/5} fill="black" dominant-baseline="middle" text-anchor="left" opacity="75%">{index + 1}</text>
        <rect width={pedalWidth} height={pedalHeight} rx="1" fill="#D9D9D9"/>
        <Knob x={pedalWidth * .5} y={pedalHeight * .2} width={pedalWidth * .26} rotation={delayRotation} text=" Delay " isStatic={isStatic} increment={(e) => increment_param(e, "delay", minDelay, maxDelay)} number={delayVal}/>
        <Knob x={pedalWidth * .25} y={pedalHeight * .7} width={pedalWidth * .18} rotation={dryRotation} text="Dry Amt" isStatic={isStatic} increment={(e) => increment_param(e, "dry", minDry, maxDry)} number={dryVal}/>
        <Knob x={pedalWidth * .75} y={pedalHeight * .7} width={pedalWidth * .18} rotation={amountRotation} text="Wet Amt" isStatic={isStatic} increment={(e) => increment_param(e, "amount", minAmount, maxAmount)} number={amtVal}/>
        <PedalBottom width={pedalWidth} height={pedalHeight/5} startHeight={pedalHeight} toggled={toggled} togglePedal={togglePedal} deletePedal={deletePedal} showInfoModal={showInfoModal}/>
        <text x={pedalWidth - 50} y={-pedalHeight / 10} fill="red" fontSize="20" textAnchor="end" onClick={decreaseSize}>-</text>
        <text x={pedalWidth - 20} y={-pedalHeight / 10} fill="green" fontSize="20" textAnchor="end" onClick={increaseSize}>+</text>
    </svg>
  );

  return svg_output;
}


export default ReverbPedal;