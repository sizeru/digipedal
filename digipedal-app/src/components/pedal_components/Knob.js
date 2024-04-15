import React from 'react';
import { useState } from 'react';

function Knob({x, y, width, isStatic, rotation, text, style, increment}) {
    let text_height = Math.round(width * 3/ text.length)

    style = {
        ...style,
        "transformOrigin": `${x}px ${y}px`,
        "transform": `rotate(${rotation}deg)`
    }

    return <>
        <circle cx={x} cy={y} r={width} fill="#5BB7B3" onClick={increment}/>
        <path d={`M${x} ${y}L${x} ${y-width}`} stroke="black" strokeWidth="2" strokeLinecap="round" style={style} onClick={increment}/> 
        <text x={x} y={y+width+text_height} fontFamily="BUNGEE" fontSize={text_height} fill="black" dominantBaseline="middle" textAnchor="middle">{text}</text>
    </>;
}

export default Knob;