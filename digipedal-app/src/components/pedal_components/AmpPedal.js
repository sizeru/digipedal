import React, { useState } from 'react';
import Knob from './Knob';
import PedalBottom from './PedalBottom';
const minAmplifcation = 0;
const maxAmplifcation = 2;


function AmpPedal(props) {
  // console.log("loading an AmpPedal with these settings:")
  // console.log(props)
  const [width, setWidth] = useState(props.width);
  // let width = props.width;
  // let height = props.height;
  const [height, setHeight] = useState(props.height);

  // let isStatic = props.isStatic | false;
  const [isStatic, setStatic] = useState(props.isStatic | false);

  const [toggled, setToggled] = useState(props.toggled);
  // let toggled = props.toggled;
  const [param_vals, setParamVals] = useState(props.param_vals);
  // let param_vals = props.param_vals;
  
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
        <PedalBottom width={width} height={height/5} startHeight={height} toggled={toggled} setToggled={setToggled}/>
    </svg>
  );

  return svg_output;
}


export default AmpPedal;