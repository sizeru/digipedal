import React from 'react';
import { useState } from 'react';

function Knob(props) {
    let x = props.x;
    let y = props.y;
    let width = props.width;
    let isStatic = props.isStatic | false;
    let [rotation, setRotation] = useState(props.rotation);
    let text = props.text;
    let text_height = Math.round(width / 3)

    let style={
        ...props.style,
        "transform-origin": `${x}px ${y}px`,
        "transform": `rotate(${rotation}deg)`
    }

    function increment_rotation(event){
        if(isStatic){
            return;
        }
        setRotation((rotation + 10) % 360)
    }

    return <>
        <circle cx={x} cy={y} r={width} fill="#5BB7B3" onClick={increment_rotation}/>
        <path d={`M${x} ${y}L${x} ${y-width}`} stroke="black" stroke-width="2" stroke-linecap="round" style={style} onClick={increment_rotation}/> 
        <text x={x} y={y+width+text_height} fontFamily="BUNGEE" fontSize={text_height} fill="black" dominant-baseline="middle" text-anchor="middle">{text}</text>
    </>;
}

export default Knob;