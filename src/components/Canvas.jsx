import { useRef, useLayoutEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import React from "react";

import rough from "roughjs/bundled/rough.esm";

import Draw from "../utils/Draw";
import Erase from "../utils/Erase";
import Shape from "../utils/Shape";
import Select from "../utils/Select";
import Text from "../utils/Text";
import Toolbar from "./Toolbar";

const Canvas = () => {
  const [elements, setElements] = useState([]);
  const [type, setType] = useState("Rectangle");

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const textRef = useRef(null);

  // this is the logic behind the toolbar connection with the canvas 17 - 46
  const [action, setAction] = useState("draw");

  // 1- call the tool to distruct the MouseDown, MouseMove, MouseUp functions
  const { startDrawing, draw, stopDrawing } = Draw(
    elements,
    setElements,
    contextRef
  );
  const { startErasing, Erasing, stopErasing } = Erase(elements, setElements);
  const { onMouseDown, onMouseMove, onMouseUp } = Shape(
    elements,
    setElements,
    type,
    action
  );
  let { moveMouseDown, moveMouseMove, moveMouseUp } = Select(
    elements,
    setElements,
    contextRef,
    action
  );
  const reFocus = () => {
    if(textRef.current !== null) textRef.current.value = "";
    setTimeout( () => {
      textRef?.current?.focus()
    } , 0)
  }
  const { startText, text, stopText } = Text(elements, setElements, reFocus);

  const handleToolbarClick = (selected, shape) => {
    setAction(selected);
    setType(shape);
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

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const roughCanvas = rough.canvas(canvas);
    const drawElement = (element) => {
      switch (element.type) {
        case "path":
          context.stroke(element.path);
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
          context.fillText(element.value, element.x, element.y);
          break;
        default:
          roughCanvas.draw(element.roughElement);
          break;
      }
    };

    elements.forEach((element) => drawElement(element));

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
      {action === "text" && elements[elements.length - 1]?.type === "text" && (
        <textarea
          ref={textRef}
          style={{
            position: "absolute",
            top: `${elements[elements.length - 1]?.y - elements[elements.length - 1]?.height + 4 }px`,
            left: `${elements[elements.length - 1]?.x - 9}px`,
            width: `${elements[elements.length - 1]?.width}px`,
            height: `${elements[elements.length - 1]?.height}px`,
            textIndent: "10px",
            resize: "none",
            // border: "none",
            // outline: "none",
            fontSize: "24px",
            fontFamily: "Arial",
            color: "black",
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
          onKeyDown={text}
          onKeyUp={stopText}
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
        // onMouseMove={Move}
        // onMouseUp={Up}
        // onMouseLeave={Up}
        // onMouseEnter={Move}
      />
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
