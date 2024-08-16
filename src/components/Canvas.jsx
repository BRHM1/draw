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

const Canvas = () => {
  const elements = useStore((state) => state.elements);
  const [type, setType] = useState("Rectangle");

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const textRef = useRef(null);

  // this is the logic behind the toolbar connection with the canvas 17 - 46
  const [action, setAction] = useState("draw");

  // 1- call the tool to distruct the MouseDown, MouseMove, MouseUp functions
  const { startDrawing, draw, stopDrawing } = Draw();
  const { startErasing, Erasing, stopErasing } = Erase();
  const { onMouseDown, onMouseMove, onMouseUp } = Shape(type, action);
  let { moveMouseDown, moveMouseMove, moveMouseUp } = Select(contextRef);

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

    elements.forEach((element) => element?.display ? '' : drawElement(element));

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
      <OptionsToolbar />
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
