import React from 'react';
import { useState } from 'react';

function Knob({x, y, width, isStatic, rotation, text, style, increment, number}) {
    let text_height = Math.round(width * 3/ text.length)

    style = {
        ...style,
        "transformOrigin": `${x}px ${y}px`,
        "transform": `rotate(${rotation}deg)`
    }

    return <>
        <circle cx={x} cy={y} r={width} fill="#5BB7B3" onClick={increment}/>
        <text x={x} y={y} fontFamily="BUNGEE" fontSize={width*3/4} fill="black" dominant-baseline="middle" text-anchor="middle" onClick={increment} opacity="25%">{Number( number.toPrecision(3) )}</text>
        <path d={`M${x} ${y}L${x} ${y-width}`} stroke="black" stroke-width="2" stroke-linecap="round" style={style} onClick={increment}/> 
        <text x={x} y={y+width+text_height} fontFamily="BUNGEE" fontSize={text_height} fill="black" dominant-baseline="middle" text-anchor="middle">{text}</text>
    </>;
}

export default Knob;