import { useRef, useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import { useStore } from "../store";
import { getData } from "../utils/utils";

const RenderingCanvas = ({ panOffset, history }) => {
  const renderingCanvasRef = useRef(null);
  const renderingContextRef = useRef(null);
  
  const shapes = new Set(["rectangle", "ellipse", "line", "circle"]);
  
  const elements = useStore((state) => state.elements);
  
  const zoom = useStore((state) => state.zoom);
  const setCenterScalingOffset = useStore(
    (state) => state.setCenterScalingOffset
  );

  const rerender = useStore((state) => state.rerender);

  const localElements = useRef([]);
  
  useLayoutEffect(() => {
    async function fetchData() {
      const data = await getData();
      localElements.current = data;
    }
    fetchData();
  }, [elements]);

  useLayoutEffect(() => {
    const renderingCanvas = renderingCanvasRef.current;
    const renderingCanvasContext = renderingCanvas.getContext("2d");
    const dpr = window.devicePixelRatio;
    const rect = renderingCanvas.getBoundingClientRect();

    renderingCanvas.width = rect.width * dpr;
    renderingCanvas.height = rect.height * dpr;
  
    renderingCanvasContext.scale(dpr, dpr);
    console.log("localElements", localElements.current);
    renderingCanvas.style.height = `${rect.height}px`;
    renderingCanvas.style.width = `${rect.width}px`;

    const scaledWidth = rect.width * zoom;
    const scaledHeight = rect.height * zoom;

    const scaleOffsetX = (scaledWidth - rect.width) / 2;
    const scaleOffsetY = (scaledHeight - rect.height) / 2;
    setCenterScalingOffset({ x: scaleOffsetX, y: scaleOffsetY });
    renderingCanvasContext.clearRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    renderingCanvasContext.save();
    renderingCanvasContext.scale(1 / zoom, 1 / zoom);
    renderingCanvasContext.translate(
      panOffset.x + scaleOffsetX,
      panOffset.y + scaleOffsetY
    );

    const roughCanvas = rough.canvas(renderingCanvas);

    renderingCanvasContext.clearRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
    history.forEach((element) => {
      if (["event", "remove"].includes(element.type)) return; // skip event actions and only draw shapes
      element.shapes.forEach((shape) => {
        if (shape.hidden) return
        shapes.has(shape.type)
          ? shape.draw(roughCanvas)
          : shape.draw(renderingContextRef.current, renderingCanvasRef);
      });
    });
    renderingCanvasContext.restore();
    renderingContextRef.current = renderingCanvasContext;
    console.log("elements" ,elements);
  }, [elements, panOffset.x, panOffset.y, zoom, rerender]);

  return (
    <canvas
      ref={renderingCanvasRef}
      className="row-start-1 col-start-1 min-w-full min-h-full overflow-hidden"
    ></canvas>
  );
};

export default RenderingCanvas;
