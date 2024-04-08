import React, {useState} from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';
const minAmplifcation = 0;
const maxAmplifcation = 2;


function AmpPedal({width, height, isStatic, toggled, param_vals, togglePedal, deletePedal, showInfoModal}) {
  
  if(isStatic){
    toggled = true;
    param_vals = {};
  }
  let [amplification, setAmplification] = useState((param_vals & param_vals.Amplification) ? param_vals.Amplification : 1)

  let amplifcationRotation = amplification / (maxAmplifcation - minAmplifcation) * 270 - 135

  function increment_amplification(event) {
    console.log("increment_amplification")
    if(isStatic){
      console.log("not doing anything cause static")
      return ;
    }
    console.log(event)
    let newAmplification = amplification + (maxAmplifcation - minAmplifcation) / 20
    if(newAmplification > maxAmplifcation){
      newAmplification = minAmplifcation
    }
    setAmplification(newAmplification + .1)
  }

  let style = {
    "opacity": toggled ? 1 : .5,
  }


  let svg_output = (
    <svg width={width} height={height + height/5} viewBox={`0 0 ${width} ${height + height / 5}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
        <rect width={width} height={height} rx="1" fill="#D9D9D9"/>
        <Knob x={width * .5} y={height * .40} width={width * .40} rotation={amplifcationRotation} text="Amplification" isStatic={isStatic} increment={increment_amplification}/>
        <PedalBottom width={width} height={height/5} startHeight={height} toggled={toggled} togglePedal={togglePedal} deletePedal={deletePedal} showInfoModal={showInfoModal}/>
    </svg>
  );

  return svg_output;
}


export default AmpPedal;