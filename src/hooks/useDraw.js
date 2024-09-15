import { useState } from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "../utils/utils";
import { useStore } from "../store";

// TODO: change fillFlag, fillStyle, strokeStyle from the penToolbar
// element = {type: "path", points: [[x, y, pressure], ...], path: Path2D, x1: x, y1: y, x2: x, y2: y}
const useDraw = () => {
  const elements = useStore((state) => state.elements);
  const addElement = useStore((state) => state.addElement);
  const replaceLastElement = useStore((state) => state.replaceLastElement);
  const removeLastElement = useStore((state) => state.removeLastElement);

  const penOptions = useStore((state) => state.penOptions);
  const color = useStore((state) => state.penColor);
  // console.log("Draw is re-rendering");
  const [points, setPoints] = useState([]);
  const [xy, setXY] = useState([Infinity, Infinity, 0, 0]);

  const startDrawing = (e) => {
    setPoints([[e.pageX, e.pageY, e.pressure]]);
    addElement({ type: "path", points: [], path: new Path2D(), x1: Infinity, y1: Infinity, x2: 0, y2: 0, color: color, options: penOptions, fillFlag: 1, fillStyle: "black", strokeStyle: "black" });
  };
  const stroke = getStroke(points, penOptions);
  const path = getSvgPathFromStroke(stroke);
  const myPath = new Path2D(path);

  const draw = (e) => {
    if (e.buttons !== 1) return;
    // track minimum and maximum x and y values
    setXY([Math.min(xy[0], e.pageX), Math.min(xy[1], e.pageY), Math.max(xy[2], e.pageX), Math.max(xy[3], e.pageY)])
    const newPoint = [e.pageX, e.pageY, e.pressure];
    setPoints((prevPoints) => [...prevPoints, newPoint]);
    replaceLastElement({ type: "path", points, path: myPath, x1: xy[0], y1: xy[1], x2: xy[2], y2: xy[3], color: color, options: penOptions, fillFlag: 1, fillStyle: "black", strokeStyle: "black" });
  };

  const stopDrawing = () => {
    if (elements.at(-1)?.points?.length === 0) {
      removeLastElement()
    }
    setXY([Infinity, Infinity, 0, 0])
  };
  return { startDrawing, draw, stopDrawing };
};

export default useDraw;
