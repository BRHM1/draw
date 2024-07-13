import { useRef, useLayoutEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import React from "react";

import rough from "roughjs/bundled/rough.esm";

import Draw from "../utils/Draw";
import Erase from "../utils/Erase";
import Shape from "../utils/Shape";
import Select from "../utils/Select";
import Toolbar from "./Toolbar";

const Canvas = () => {
  const [elements, setElements] = useState([]);
  const [type, setType] = useState("Rectangle");

  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // this is the logic behind the toolbar connection with the canvas 17 - 46
  const [action, setAction] = useState("draw");

  // 1- call the tool to distruct the MouseDown, MouseMove, MouseUp functions
  const { startDrawing, draw, stopDrawing, myPath } = Draw(elements , setElements);
  const { startErasing, Erasing, stopErasing } = Erase({ contextRef });
  const { onMouseDown, onMouseMove, onMouseUp } = Shape(
    elements,
    setElements,
    type
  );
    let { moveMouseDown, moveMouseMove, moveMouseUp } = Select(
      elements,
      setElements,
    );

  const handleToolbarClick = (selected, shape) => {
    setAction(selected);
    setType(shape);
  };

  // 2- create a key value pair to call the tool functions dynamically
  const actionTypes = {
    draw: [startDrawing, draw, stopDrawing],
    erase: [startErasing, Erasing, stopErasing],
    shape: [onMouseDown, onMouseMove, onMouseUp],
    select: [moveMouseDown, moveMouseMove, moveMouseUp],
  };

  let Down = (e) => {
      actionTypes[action][0](e);
    },
    Move = (e) => {
      actionTypes[action][1](e);
    },
    Up = (e) => {
      actionTypes[action][2](e);
    };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const roughCanvas = rough.canvas(canvas);
    elements.forEach(element => element.x1 ? roughCanvas.draw(element.roughElement) : context.fill(element));
    context.fill(myPath);
  
    contextRef.current = context;
  }, [elements, myPath]);

  return (
    <div className="w-full h-screen grid">
      <Toolbar
        className={"row-start-1 col-start-1 justify-self-center left-1/4"}
        onToolbarClick={handleToolbarClick}
        contextRef={contextRef}
      />
      <CanvasElement
        className={twMerge("row-start-1 col-start-1 min-w-full min-h-full overflow-hidden" , 
        action === "draw" || action === "shape" ? "cursor-crosshair" : "cursor-default"
        )}
        ref={canvasRef}
        onMouseDown={Down}
        onMouseMove={Move}
        onMouseUp={Up}
        // onMouseLeave={Up}
        onMouseEnter={Move}
      />
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
