import React from 'react';

function Toggle({x, y, width, height, toggled, togglePedal}) {
  return (
    <svg x={x} y={y} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" onClick={togglePedal}>
        <rect x={0} y={0} width={width} height={height} fill={toggled ? "#50BD4C": "#EF7557"} rx={height/2} ry={height/2}  strokeLinejoin="round" onClick={togglePedal}/>
        {/* the circle for toggle */}
        <circle cx={(toggled ? width - height/2 : height/2)} cy={height/2} r={height/2} fill={toggled ? "#2E772C" : "#95290E"} onClick={togglePedal}/>
    </svg>
  );
} 
export default Toggle;