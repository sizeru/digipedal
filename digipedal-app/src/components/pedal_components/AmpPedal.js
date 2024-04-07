import React from 'react';
import Knob from './Knob'


function AmpPedal(props) {
  let width = props.width;
  let height = props.height;
  let isStatic = props.isStatic | false;
  let svg_output = (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width={width} height={height} rx="1" fill="#D9D9D9"/>
        <Knob x={width * .5} y={height * .40} width={width * .40} rotation={0} text="Type" isStatic={isStatic}/>
        
    </svg>
  );

  return svg_output;
}


export default AmpPedal;