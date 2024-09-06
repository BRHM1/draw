import React, { useRef, useLayoutEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import rough from "roughjs/bundled/rough.esm";
import { useStore } from "../store";

import Draw from "../utils/Draw";
import Erase from "../utils/Erase";
import Shape from "../utils/Shape";
import Select from "../utils/Select";
import Text from "../utils/Text";
import Toolbar from "./Toolbar";
import Button from "./Button";
import OptionsToolbar from "./OptionsToolbar";
import PenOptionsToolbar from "./PenOptionsToolbar";

const Canvas = () => {
  const elements = useStore((state) => state.elements);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [type, setType] = useState("draw");
  const [penColor, setPenColor] = useState("#000000");
  const [options, setOptions] = useState({
    bowing: -1,
    curveFitting: 0.95,
    curveStepCount: 9,
    curveTightness: 0,
    strokeLineDash: [1, 0], // [length of dash, length of gap]
    dashGap: -1,
    dashOffset: -1,
    disableMultiStroke: true,
    disableMultiStrokeFill: true,
    fill: "black",
    fillShapeRoughnessGain: 0.8,
    fillStyle: "dashed",
    fillWeight: -1,
    hachureAngle: -41,
    hachureGap: -1,
    maxRandomnessOffset: 0,
    preserveVertices: false,
    roughness: -1,
    seed: 0,
    stroke: "#892e89",
    strokeWidth: 1,
    zigzagOffset: -1,
  });
  const [penOptions, setPenOptions] = useState({
    size: 8,
    thinning: 0,
    smoothing: 0.5,
    streamline: 0.5,
    easing: t => t,
    simulatePressure: true,
    last: true,
    start: {
      cap: false,
      taper: 0,
      easing: (t) => t,
    },
    end: {
      cap: false,
      taper: 0,
      easing: (t) => t,
    },
  });
  const shapes = new Set(["Rectangle", "Ellipse", "Line", "Circle"]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const textRef = useRef(null);

  // this is the logic behind the toolbar connection with the canvas 17 - 46
  const [action, setAction] = useState("draw");

  // 1- call the tool to distruct the MouseDown, MouseMove, MouseUp functions
  const { startDrawing, draw, stopDrawing } = Draw(penOptions, penColor);
  const { startErasing, Erasing, stopErasing } = Erase();
  const { onMouseDown, onMouseMove, onMouseUp } = Shape(type, action, options);
  let { moveMouseDown, moveMouseMove, moveMouseUp } = Select(contextRef);

  document.addEventListener('mousemove', (e) => {
    setPositionX(e.clientX);
    setPositionY(e.clientY);
  });

  const reFocus = () => {
    if (textRef.current !== null) textRef.current.value = "";
    setTimeout(() => {
      textRef?.current?.focus();
    }, 0);
  };
  const { startText, text, stopText } = Text(reFocus);

  const handleToolbarClick = (selected, shape) => {
    setAction(selected);
    setType(shape);
  };

  const handleOptionsToolbarClick = (selected) => {
    setOptions(selected);
  };

  const handlePenOptionsToolbarClick = (selected, color) => {
    setPenOptions(selected);
    setPenColor(color);
  };

  // 2- create a key value pair to call the tool functions dynamically
  const actionTypes = {
    draw: [startDrawing, draw, stopDrawing],
    erase: [startErasing, Erasing, stopErasing],
    shape: [onMouseDown, onMouseMove, onMouseUp],
    select: [moveMouseDown, moveMouseMove, moveMouseUp],
    text: [startText, text, stopText],
  };

  let Down = (e) => {
      actionTypes[action][0](e);
    },
    Move = (e) => {
      actionTypes[action][1](e);
    },
    Up = (e) => {
      actionTypes[action][2](e);
    };

  const wrappedLines = (lines, maxLineWidth, ctx) => {
    const wrapped = [];
    for (let i = 0; i < lines.length; i++) {
      const words = lines[i].split(" ");
      let currentLine = words[0];
      for (let j = 1; j < words.length; j++) {
        const word = words[j];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxLineWidth) {
          currentLine += " " + word;
        } else {
          wrapped.push(currentLine);
          currentLine = word;
        }
      }
      wrapped.push(currentLine);
    }
    return wrapped;
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const roughCanvas = rough.canvas(canvas);
    const drawElement = (element) => {
      switch (element?.type) {
        case "path":
          context.strokeStyle = element.stroke;
          context.fillStyle = element.color;
          context.fill(element.path)
          break;
        case "erase":
          context.clearRect(
            element.x,
            element.y,
            element.width,
            element.height
          );
          break;
        case "text":
          context.font = element.font;
          context.strokeStyle = element.stroke;
          context.lineWidth = element.strokeWidth;
          const maxLineWidth = canvasRef.current.width - element.x1;
          const lines = element.value.split("\n");
          wrappedLines(lines, maxLineWidth, context).forEach((line, i) => {
            context.fillText(line, element.x1, element.y1 + i * 25);
          });
          break;
        default:
          element?.roughElement ? roughCanvas.draw(element.roughElement) : null;
          break;
      }
    };

    elements.forEach((element) =>
      element?.display ? "" : drawElement(element)
    );

    console.log("elements are:", elements);
    contextRef.current = context;
  }, [elements]);

  return (
    <div className="w-full h-screen grid">
      <Toolbar
        className={"row-start-1 col-start-1 justify-self-center left-1/4"}
        onToolbarClick={handleToolbarClick}
        contextRef={contextRef}
      />
      <div className="absolute top-0 left-2">
        {`X: ${positionX} Y: ${positionY}`}
      </div>
      {action === "text" && elements[elements.length - 1]?.type === "text" && (
        <textarea
          ref={textRef}
          style={{
            position: "absolute",
            top: `${
              elements[elements.length - 1]?.y1 -
              elements[elements.length - 1]?.height +
              4
            }px`,
            left: `${elements[elements.length - 1]?.x1}px`,
            width: `${
              canvasRef.current.width - elements[elements.length - 1].x1
            }px`,
            height: `${
              canvasRef.current.height - elements[elements.length - 1].y1
            }px`,
            resize: "none",
            border: "none",
            outline: "none",
            fontSize: "24px",
            fontFamily: "Arial",
            lineHeight: "25px",
            backgroundColor: "transparent",
            pointerEvents: "none",
            overflow: "hidden",
            color: "transparent",
            caretColor: "black",
          }}
          onKeyDown={text}
          onBlur={stopText}
        />
      )}
      <CanvasElement
        className={twMerge(
          "row-start-1 col-start-1 min-w-full min-h-full overflow-hidden",
          action === "draw" || action === "shape"
            ? "cursor-crosshair"
            : "cursor-default"
        )}
        ref={canvasRef}
        onMouseDown={Down}
        onMouseMove={Move}
        onMouseUp={Up}
        // onMouseLeave={Up}
        // onMouseEnter={Move}
      />
      {shapes.has(type) && (
        <OptionsToolbar handleOptionsToolbarClick={handleOptionsToolbarClick} />
      )}
      {type === "draw" && (
        <PenOptionsToolbar
          handlePenOptionsToolbarClick={handlePenOptionsToolbarClick}
        />
      )}
      <div className="w-40 flex justify-center items-center gap-2 mb-2 ml-2">
        <Button label="Undo" />
        <Button label="Redo" />
      </div>
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
