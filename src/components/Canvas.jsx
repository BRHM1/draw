import React, { useRef, useLayoutEffect, useState, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import rough from "roughjs/bundled/rough.esm";
import { useStore } from "../store";

import useDraw from "../hooks/useDraw";
import useErase from "../hooks/useErase";
import useShape from "../hooks/useShape";
import useSelect from "../hooks/useSelect";
import useText from "../hooks/useText";
import Toolbar from "./Toolbar";
import Button from "./Button";
import OptionsToolbar from "./OptionsToolbar";
import PenOptionsToolbar from "./PenOptionsToolbar";

import { drawElement } from "../utils/utils";

const Canvas = () => {
  const elements = useStore((state) => state.elements);

  const shapes = new Set(["Rectangle", "Ellipse", "Line", "Circle"]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const textRef = useRef(null);

  // this is the logic behind the toolbar connection with the canvas 17 - 46
  const action = useStore((state) => state.action);
  const type = useStore((state) => state.type);

  const reFocus = () => {
    if (textRef.current !== null) textRef.current.value = "";
    setTimeout(() => {
      textRef?.current?.focus();
    }, 0);
  };

  // ISSUE: Hooks are called each time this component re-renders and this affects the performance
  // CRITICAL TODO: change the way those functions invoked ---------------------------------------------------------------
  const actionTypes = {
    draw: useDraw(),
    erase: useErase(),
    shape: useShape(),
    select: useSelect(contextRef),
    text: useText(reFocus, canvasRef),
  };

  let Down = (e) => {
      const [down, _, __] = Object.values(actionTypes[action]);
      down(e);
    },
    Move = (e) => {
      const [_, move, __] = Object.values(actionTypes[action]);
      move(e);
    },
    Up = (e) => {
      const [_, __, up] = Object.values(actionTypes[action]);
      up(e);
    };
  // CRITICAL TODO: change the way those functions invoked ---------------------------------------------------------------

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) =>
      element?.display
        ? ""
        : drawElement(element, context, roughCanvas, canvasRef)
    );

    console.log("elements are:", elements);
    contextRef.current = context;
  }, [elements]);

  return (
    <div className="w-full h-screen grid">
      <Toolbar
        className={"row-start-1 col-start-1 justify-self-center left-1/4"}
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
          onKeyDown={Move}
          onBlur={Up}
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
      {shapes.has(type) && <OptionsToolbar />}
      {type === "draw" && <PenOptionsToolbar />}
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
