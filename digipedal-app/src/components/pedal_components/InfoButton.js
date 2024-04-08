import React from 'react';

function InfoButton({cx, cy, r, openInfoModal}) {
  return (
    <svg x={cx-r} y={cy-r} width={r*2} height={r*2} viewBox={`0 0 ${r*2} ${r*2}`} fill="none" onClick={openInfoModal}>
        <circle cx={r} cy={r} r={r} fill="#F05A24"/>
            <text x={r} y={r + r / 4 } fontFamily="BUNGEE" fontSize={r*15/8} fill="white" dominant-baseline="middle" text-anchor="middle">i</text>
    </svg>
  );
} 
export default InfoButton;