import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';



function Draggable(props) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });

  // Within your component that receives `transform` from `useDraggable`:
  let style = {
    position: `absolute`,
    left: `${props.x}px`,
    top: `${props.y}px`,
    transform: CSS.Translate.toString(transform),
  }

  return (
    <button id={`${props.id}d`} ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </button>
  );
}
export default Draggable;