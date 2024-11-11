import { useRef, useLayoutEffect, useState, useEffect } from "react";
import rough from "roughjs/bundled/rough.esm";
import { useStore } from "../store";
import { getData, hydrate } from "../utils/utils";

const RenderingCanvas = ({ panOffset, history, textAreaRef }) => {
  const renderingCanvasRef = useRef(null);
  const renderingContextRef = useRef(null);
  const [hasMounted, setHasMounted] = useState(false);
  const shapes = new Set(["rectangle", "ellipse", "line", "circle"]);

  const elements = useStore((state) => state.elements);

  const zoom = useStore((state) => state.zoom);
  const setCenterScalingOffset = useStore(
    (state) => state.setCenterScalingOffset
  );

  const rerender = useStore((state) => state.rerender);

  useLayoutEffect(() => {
    async function fetchData() {
      const data = await getData();
      let hydrated = data.map((element) => hydrate(element));
      // convert the hydrated elements to a map and set it in the history.elements
      let elementMap = new Map();
      hydrated.forEach((element) => {
        elementMap.set(element.id, element);
      });
      history.setElements(elementMap);
      setHasMounted(true);
    }
    fetchData();
  }, []);
  
  useLayoutEffect(() => {
    if (!hasMounted) return;
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

    history.elements.values().forEach((element) => {
      if (element.hidden) return;
      shapes.has(element.type)
        ? element.draw(roughCanvas)
        : element.draw(renderingCanvasContext, textAreaRef);
    });

    renderingCanvasContext.restore();
    renderingContextRef.current = renderingCanvasContext;
  }, [elements, panOffset.x, panOffset.y, zoom, rerender, hasMounted]);

  return (
    <canvas
      ref={renderingCanvasRef}
      className="row-start-1 col-start-1 min-w-full min-h-full overflow-hidden"
    ></canvas>
  );
};

export default RenderingCanvas;
