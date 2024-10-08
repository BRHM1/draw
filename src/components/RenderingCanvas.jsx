import { useRef, useLayoutEffect } from "react";
import rough from "roughjs/bundled/rough.esm";
import { useStore } from "../store";

const RenderingCanvas = ({ panOffset }) => {
  const renderingCanvasRef = useRef(null);
  const renderingContextRef = useRef(null);
  const shapes = new Set(["rectangle", "ellipse", "line", "circle"]);
  const elements = useStore((state) => state.elements);
  const zoom = useStore((state) => state.zoom);
  const setCenterScalingOffset = useStore((state) => state.setCenterScalingOffset);

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

    const scaledWidth = rect.width * zoom;
    const scaledHeight = rect.height * zoom;

    const scaleOffsetX = (scaledWidth - rect.width) / 2;
    const scaleOffsetY = (scaledHeight - rect.height) / 2;
    setCenterScalingOffset({ x: scaleOffsetX, y: scaleOffsetY });
    console.log(zoom)
    renderingCanvasContext.save();
    renderingCanvasContext.scale(1 / zoom, 1 / zoom);
    renderingCanvasContext.translate(panOffset.x + scaleOffsetX, panOffset.y + scaleOffsetY);

    const roughCanvas = rough.canvas(renderingCanvas);

    renderingCanvasContext.clearRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    elements.forEach((element) => {
      if (!element?.type) return;
      shapes.has(element.type)
        ? element.draw(roughCanvas)
        : element.draw(renderingContextRef.current, renderingCanvasRef);
    });
    renderingCanvasContext.restore();
    renderingContextRef.current = renderingCanvasContext;
    console.log(elements);
  }, [elements, panOffset.x, panOffset.y, zoom]);

  return (
    <canvas
      ref={renderingCanvasRef}
      className="row-start-1 col-start-1 min-w-full min-h-full overflow-hidden"
    ></canvas>
  );
};

export default RenderingCanvas;
