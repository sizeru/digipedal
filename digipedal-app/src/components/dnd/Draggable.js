import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';



function Draggable(props) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.id,
  });

  let style = {
    position: `absolute`,
    left: `${props.x}px`,
    top: `${props.y}px`,
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div id={`${props.id}d`} ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}
export default Draggable;