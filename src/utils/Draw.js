import { useState } from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";

// element = {type: "path", points: [[x, y, pressure], ...], path: Path2D, x1: x, y1: y, x2: x, y2: y}
const Draw = (elements, setElements, context) => {
  const [points, setPoints] = useState([]);
  const [xy, setXY] = useState([Infinity , Infinity, 0, 0]);
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
    // track minimum and maximum x and y values
    setXY([Math.min(xy[0], e.pageX), Math.min(xy[1], e.pageY), Math.max(xy[2], e.pageX), Math.max(xy[3], e.pageY)])
    const newPoint = [e.pageX, e.pageY, e.pressure];
    const wantedElements = elements.slice(0, idx)
    setElements([...wantedElements, {type: "path", points, path: myPath, x1: xy[0], y1: xy[1], x2: xy[2], y2: xy[3]}])
    setPoints((prevPoints) => [...prevPoints, newPoint]);
  };

  const stopDrawing = () => {
    const path = elements.at(-1)?.path
    const wantedElements = elements.slice(0, idx)
    setElements([...wantedElements, {type: "path", points, path, x1: Math.min(xy[0] , xy[2]), y1: Math.min(xy[1] , xy[3]), x2: Math.max(xy[0] , xy[2]), y2: Math.max(xy[1] , xy[3])}])
    setXY([Infinity , Infinity, 0, 0])
  };
  return { startDrawing, draw, stopDrawing };
};

export default Draw;
