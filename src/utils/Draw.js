import { useState } from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";
import  Gizmo  from "./Gizmo";

const Draw = (elements, setElements, context) => {
  const [points, setPoints] = useState([]);
  const [idx, setIdx] = useState()
  const startDrawing = (e) => {
    setIdx(elements.length)
    setPoints([[e.pageX, e.pageY, e.pressure]]);
  };

  const stroke = getStroke(points);
  const path = getSvgPathFromStroke(stroke);
  const myPath = new Path2D(path);
  const draw = (e) => {
    if (e.buttons !== 1) return;
    const newPoint = [e.pageX, e.pageY, e.pressure];
    const wantedElements = elements.slice(0, idx)
    setElements([...wantedElements, myPath])
    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  const stopDrawing = () => {
    setPoints([]);
  };
  return { startDrawing, draw, stopDrawing };
};

export default Draw;
