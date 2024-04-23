import React from 'react';

function InfoButton({cx, cy, r, showInfoModal}) {
  return (
    <svg x={cx-r} y={cy-r} width={r*2} height={r*2} viewBox={`0 0 ${r*2} ${r*2}`} fill="none" onClick={showInfoModal}>
        <circle cx={r} cy={r} r={r} fill="#F05A24" onClick={showInfoModal}/>
        <text x={r} y={r + r / 4 } fontFamily="BUNGEE" fontSize={r*2.1} fill="white" dominantBaseline="middle" textAnchor="middle" onClick={showInfoModal}>I</text>
    </svg>
  );
} 
export default InfoButton;