import { useRef, useLayoutEffect } from "react";
import rough from "roughjs/bundled/rough.esm";
import { useStore } from "../store";

const RenderingCanvas = () => {
  const renderingCanvasRef = useRef(null);
  const renderingContextRef = useRef(null);
  const shapes = new Set(["rectangle", "ellipse", "line", "circle"]);
  const elements = useStore((state) => state.elements);

  useLayoutEffect(() => {
    const renderingCanvas = renderingCanvasRef.current;
    const renderingCanvasContext = renderingCanvas.getContext("2d");
    const dpr = window.devicePixelRatio;
    const rect = renderingCanvas.getBoundingClientRect();
    
    renderingCanvas.width = rect.width * dpr;
    renderingCanvas.height = rect.height * dpr;
    
    renderingCanvasContext.scale(dpr, dpr);
    
    renderingCanvas.style.height = `${rect.height}px`;
    renderingCanvas.style.width = `${rect.width}px`;
    
    const roughCanvas = rough.canvas(renderingCanvas);
    
    renderingCanvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    elements.forEach((element) => {
      if(!element?.type) return;
      shapes.has(element.type)
        ? element.draw(roughCanvas)
        : element.draw(renderingContextRef.current);
    });
    renderingContextRef.current = renderingCanvasContext;
    console.log(elements)
  }, [elements]);

  return (
    <canvas
      ref={renderingCanvasRef}
      className="row-start-1 col-start-1 min-w-full min-h-full overflow-hidden"
    ></canvas>
  );
};

export default RenderingCanvas;
