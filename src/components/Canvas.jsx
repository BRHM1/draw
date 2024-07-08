import { useRef, useLayoutEffect, useState } from "react";
import React from "react";

import rough from "roughjs/bundled/rough.esm";

import Draw from "../utils/Draw";
import Erase from "../utils/Erase";
import Toolbar from "./Toolbar";
import Shape from "../utils/Shape";

const Canvas = () => {
  const [elements, setElements] = useState([]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const { startDrawing, draw, stopDrawing } = Draw({ contextRef });
  const { startErasing, Erasing, stopErasing } = Erase({ contextRef });
  const { onMouseDown, onMouseMove, onMouseUp } = Shape(
    elements,
    setElements,
    "Circle"
  );

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
      {/* <Toolbar className="col-start-1 row-start-1" /> */}
      <CanvasElement
        className="col-start-1 row-start-1 w-full h-screen"
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
