
import React from 'react';

function Trashcan({x, y, width, height, deletePedal}) {
  return (
    
    <svg x={x} y={y} width={width} height={height} width={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg" onClick={deletePedal}>
        {/* bottom of trashcan */}
        <rect x={width/6} y={height /3} width={width * 2/3} height={height * 2/3} rx={width/6}fill="#F05A24"/>

        {/* fixing the top part of trashcan */}
        <rect x={width/6} y={height /3} width={width * 2/3} height={height /6} fill="#F05A24"/>

        {/* adding the two lines */}
        <rect x={width / 3 } y={height/3} width={width/12} height={height * 8/15} ry={width/24} fill="white"/>
        <rect x={width * 2 / 3 - width / 12} y={height/3} width={width/12} height={height * 8/15} ry={width/24} fill="white"/>

        {/* fixing the top of lines */}
        <rect x={width / 3 } y={height/3} width={width/12} height={height /15} fill="white"/>
        <rect x={width * 2 / 3 - width / 12} y={height/3} width={width/12} height={height/15} fill="white"/>
        
        {/* making the bottom of the lid */}
        <rect x={0} y={height/3 - height * 3 /15} width={width} height={height *2/15} rx={width/12} fill="#F05A24"/>

        {/* making the top of the lid */}
        <rect x={width/2 - width /4} y={height/3 - height *5/15} width={width/2} height={height * 4/15} rx={width/6} fill="#F05A24"/>
    </svg>
  );
} 
export default Trashcan;
