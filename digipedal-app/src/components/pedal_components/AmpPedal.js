import React from 'react';
import Knob from './Knob'

const minAmplifcation = 0;
const maxAmplifcation = 2;


function AmpPedal(props) {
  console.log("loading an AmpPedal with these settings:")
  console.log(props)
  let width = props.width;
  let height = props.height;
  let isStatic = props.isStatic | false;

  let toggled = props.toggled;
  let param_vals = props.param_vals;

  // setting default amplifcation to 1
  let amplification = 1
  if(param_vals.Amplification){
    amplification = param_vals.Amplification
  }

  let amplifcationRotation = amplification / (maxAmplifcation - minAmplifcation) * 360

  console.log(amplifcationRotation)

  let style = {
    "opacity": toggled ? 1 : .5,
  }


  let svg_output = (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
        <rect width={width} height={height} rx="1" fill="#D9D9D9"/>
        <Knob x={width * .5} y={height * .40} width={width * .40} rotation={amplifcationRotation} text="Type" isStatic={isStatic}/>
    </svg>
  );

  return svg_output;
}


export default AmpPedal;