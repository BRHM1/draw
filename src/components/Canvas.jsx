import { useRef, useEffect, useState } from "react";
import Toolbar from "./Toolbar";

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing , setIsDrawing] = useState(false);

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

  const startDrawing = (e) => {
    contextRef.current.beginPath();
    contextRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    setIsDrawing(true)
  };

  const draw = (e) => {
    if (!isDrawing) return;
    contextRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false)
  };

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
