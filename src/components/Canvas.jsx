import { useRef, useEffect} from "react";
import React from "react";
import Draw from "../utils/Draw";
import Erase from "../utils/Erase";
import Toolbar from "./Toolbar";

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const { startDrawing, draw, stopDrawing } = Draw({ contextRef });
  const { startErasing, Erasing, stopErasing } = Erase({ contextRef });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

    // this context is used to draw on the canvas
    // and will be shared with the toolbar and the draw functions
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;

  }, []);


  return (
    <div className="w-full h-screen grid">
      <Toolbar className="col-start-1 row-start-1" />
      <CanvasElement
        className="col-start-1 row-start-1 w-full h-screen"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

const CanvasElement = React.forwardRef((props , ref) => (
        <canvas ref={ref} {...props} />
))


export default Canvas;
