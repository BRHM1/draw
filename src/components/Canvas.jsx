import { useRef, useEffect, useState } from "react";
import Draw from "./Draw";
import Toolbar from "./Toolbar";

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing , setIsDrawing] = useState(false);
  const {startDrawing , draw , stopDrawing} = Draw({contextRef});
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // this context is used to draw on the canvas 
    // and will be shared with the toolbar and the draw functions
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);

  return (
    <div className="w-full h-screen grid">
      <Toolbar className="col-start-1 row-start-1" />
      <canvas
        className="col-start-1 row-start-1 w-full h-screen"
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
      />
    </div>
  );
};

export default Canvas;