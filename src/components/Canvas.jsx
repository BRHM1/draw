import { useRef, useLayoutEffect, useState } from "react";
import React from "react";

import rough from "roughjs/bundled/rough.esm";

import Draw from "../utils/Draw";
import Erase from "../utils/Erase";
import Toolbar from "./Toolbar";
import Shape from "../utils/Shape";

const Canvas = () => {
  const [elements, setElements] = useState([]);
  const [type, setType] = useState("Rectangle");
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  // this is the logic behind the toolbar connection with the canvas 17 - 46
  const [action, setAction] = useState("draw");

  
  const { startDrawing, draw, stopDrawing } = Draw({ contextRef });
  const { startErasing, Erasing, stopErasing } = Erase({ contextRef });
  const { onMouseDown, onMouseMove, onMouseUp } = Shape(
    elements,
    setElements,
    type
  );

  const handleToolbarClick = (selected, shape) => {
    setAction(selected);
    setType(shape);
  };
  const actionTypes = {
    draw: [startDrawing, draw, stopDrawing],
    erase: [startErasing, Erasing, stopErasing],
    shape: [onMouseDown, onMouseMove, onMouseUp],
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
    elements.forEach(({ roughElement }) => roughCanvas.draw(roughElement));

    // this context is used to draw on the canvas
    // and will be shared with the toolbar and the draw functions
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
  }, [elements]);

  return (
    <div className="w-full h-screen grid">
      <Toolbar
        className={"row-start-1 col-start-1 justify-self-center left-1/4"}
        onToolbarClick={handleToolbarClick}
        contextRef={contextRef}
      />
      <CanvasElement
        className="row-start-1 col-start-1 w-full h-screen"
        ref={canvasRef}
        onMouseDown={Down}
        onMouseMove={Move}
        onMouseUp={Up}
        onMouseLeave={Up}
      />
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
