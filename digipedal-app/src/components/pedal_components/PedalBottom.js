import React from 'react';
import Toggle from './Toggle'
import InfoButton from './InfoButton'

import Trashcan from './Trashcan'
function PedalBottom({width, height, startHeight, toggled, togglePedal, deletePedal, showInfoModal}) {
    let svg_output = (
        <svg x={0} y={startHeight} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* background rectangle */}
            <rect width={width} height={height} fill="#D9D9D9" fillOpacity="0.5"/>
            <Toggle x={width/2 - width / 6} y={height/2 - height/3} width={width / 3} height={height * 2/3} toggled={toggled} togglePedal={togglePedal}/>
            {/* info button */}
            <InfoButton cx={width * 5/6} cy={height/2} r = {height/3} showInfoModal={showInfoModal} />
            <Trashcan x={width/12} y={height/6} width={width/6} height={height*2/3} deletePedal={deletePedal} />
        </svg>);
    return svg_output;
}

export default PedalBottom;

