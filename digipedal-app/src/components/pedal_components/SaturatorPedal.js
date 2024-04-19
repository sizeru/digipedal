import React, {useEffect, useState} from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';

const minDrive = 0.1;
const maxDrive = 10;
const defaultDrive = 5;

const minMix = 0;
const maxMix = 1;
const defaultMix = 1;

const minBlend = -10;
const maxBlend = 10;
const defaultBlend = 10;

function SaturatorPedal({width, height, isStatic, toggled, param_vals, togglePedal, deletePedal, showInfoModal, updatePedal, index}) {
  
  const [pedalWidth, setPedalWidth] = useState(width);
  const [pedalHeight, setPedalHeight] = useState(height);
  const [pedalY, setPedalY] = useState(null);
  const [pedalH, setPedalH] = useState(null);

  const increaseSize = () => {
    setPedalWidth(prevWidth => prevWidth * 1.1);
    setPedalHeight(prevHeight => prevHeight * 1.1);
  };

  const decreaseSize = () => {
    setPedalWidth(prevWidth => prevWidth / 1.1);
    setPedalHeight(prevHeight => prevHeight / 1.1);
  };

  useEffect(() => {
    if(pedalY == null || pedalH == null){
      setPedalY(isStatic ? 0 : -pedalHeight/5);
      setPedalH(isStatic ? height + height/5 : height + height / 5 + height / 5);
    }
  },[pedalWidth, pedalHeight]);

  useEffect(() => {
    if(!updatePedal){
      console.log("No update pedal for SaturatorPedal yet. Temp setting it");
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
    console.log(!param_vals || !param_vals.amplification)
    if(param_vals == null){
        param_vals = {}
    }
//      updateAmount(defaultAmount);
//      updateDelay(defaultDelay);
//      updateOn(defaultOn);
//      updateDry(defaultDry);
    if(param_vals.mix == null) updateParam("mix", defaultMix);
    if(param_vals.drive == null) updateParam("drive", defaultDrive);
    if(param_vals.blend == null) updateParam("blend", defaultBlend);
  },[])

  // TODO: make this attached to the pedal that was clicked for info
  if(isStatic){
    toggled = true;
    param_vals = {};
  }

  let mix = (param_vals && param_vals.mix != null) ? param_vals.mix : defaultMix;
 // let on = (param_vals && param_vals.on != null) ? param_vals.on : defaultOn;
  let blend = (param_vals && param_vals.blend != null) ? param_vals.blend : defaultBlend;
  let drive = (param_vals && param_vals.drive != null) ? param_vals.drive : defaultDrive;


  let mixRotation = mix / (maxMix - minMix) * 270 - 135

  let blendRotation = blend / (maxBlend - minBlend) * 270 - 135

  let driveRotation = drive / (maxDrive - minDrive) * 270 - 135

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

  let style = {
    "opacity": toggled ? 1 : .5,
  }

  const h = isStatic ? height + height/5 : height + height / 5 + height / 5;

  const y = isStatic ? 0 : -height/5;

  let svg_output = (
    <svg width={width} height={height + height/5} viewBox={`0 ${y} ${width} ${h}`}fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      
       {!isStatic ? <text x={0} y={-height/10} fontFamily="BUNGEE" fontSize={height/5} fill="black" dominant-baseline="middle" text-anchor="left" opacity="75%">{index + 1}</text> : <></> }
        <rect width={width} height={height} rx="1" fill="#D9D9D9"/>
        <Knob x={width * .5} y={height * .22} width={width * .28} rotation={driveRotation} text="Saturation" isStatic={isStatic} increment={(e) => increment_param(e, "drive", minDrive, maxDrive)} number={drive}/>
        <Knob x={width * .25} y={height * .7} width={width * .18} rotation={blendRotation} text=" Blend " isStatic={isStatic} increment={(e) => increment_param(e, "blend", minBlend, maxBlend)} number={blend}/>
        <Knob x={width * .75} y={height * .7} width={width * .18} rotation={mixRotation} text="  Mix  " isStatic={isStatic} increment={(e) => increment_param(e, "mix", minMix, maxMix)} number={mix}/>
        <PedalBottom width={width} height={height/5} startHeight={height} toggled={toggled} togglePedal={togglePedal} deletePedal={deletePedal} showInfoModal={showInfoModal}/>
        {isStatic ? 
        <></> 
        :
        <g>
          <text x={pedalWidth - 40} y={-pedalHeight / 20} fill="red" fontSize="50" fontWeight="bold" textAnchor="end" onClick={decreaseSize}>-</text>
          <text x={pedalWidth} y={-pedalHeight / 20} fill="green" fontSize="50" fontWeight="bold" textAnchor="end" onClick={increaseSize}>+</text>
        </g>
        }
    </svg>
  );

  return svg_output;
}


export default SaturatorPedal;