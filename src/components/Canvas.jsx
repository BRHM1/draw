import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import rough from "roughjs/bundled/rough.esm";
import { twMerge } from "tailwind-merge";
import { useStore } from "../store";

import {
  Circle,
  Ellipse,
  Line,
  Path,
  Rectangle,
  Text,
} from "../hooks/elementModule";
import Gizmo from "../utils/Gizmo";

import Button from "./Button";
import OptionsToolbar from "./OptionsToolbar";
import PenOptionsToolbar from "./PenOptionsToolbar";
import RenderingCanvas from "./RenderingCanvas";
import Toolbar from "./Toolbar";
import { getElementAtPos, getElementsInsideSelectionBox } from "../utils/utils";

const Canvas = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const textRef = useRef(null);
  const shapeRef = useRef(null);
  const [cordinates, setCordinates] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [buttonDown , setButtonDown] = useState(false);
  let selectionRectangle = {x1: 0, y1: 0, x2: 0, y2: 0}
  const selectedElements = []

  const removeLastElement = useStore((state) => state.removeLastElement);
  const removeElementById = useStore((state) => state.removeElementById);
  const addToREDO = useStore((state) => state.addToREDO);
  const options = useStore((state) => state.options);
  const penOptions = useStore((state) => state.penOptions);
  const addElement = useStore((state) => state.addElement);
  const elements = useStore((state) => state.elements);
  const action = useStore((state) => state.action);
  const type = useStore((state) => state.type);

  const generator = rough.generator();
  const shapes = new Set(["rectangle", "ellipse", "line", "circle"]);

  const fn = (e) => {
    setCordinates({ x: e.clientX, y: e.clientY });
  };
  window.addEventListener("mousemove", fn);

  const reFocus = () => {
    if (textRef.current !== null) textRef.current.value = "";
    setTimeout(() => {
      textRef?.current?.focus();
    }, 0);
  };

  let Down = useCallback(
      (e) => {
        setButtonDown(true);
        // based on the type an object of that type will be created
        switch (type) {
          case "select":
            // there are two paths if mouse on element and if mouse is not on element
            // note if the click is inside the last drawn selection rectangle you should return 
            // if the click is outside the last drawn selection rectangle you should clear the selection rectangle and the selected elements
            const selectedElement = getElementAtPos(e.pageX, e.pageY, elements)
            const isClickInsideSelectionRectangle = e.pageX > selectionRectangle.x1 && e.pageX < selectionRectangle.x2 && e.pageY > selectionRectangle.y1 && e.pageY < selectionRectangle.y2
            if(isClickInsideSelectionRectangle) return 
            selectedElements.length = 0
            if(selectedElement){
              selectedElements.push(selectedElement)
            }else {
              selectionRectangle = {x1: e.pageX, y1: e.pageY, x2: e.pageX, y2: e.pageY}
            }
            console.log(selectedElements)
            console.log(selectionRectangle)
            break;
          case "text":
            shapeRef.current = new Text(
              e.clientX,
              e.clientY,
              "",
              { font: "24px Arial", fill: "black" },
              0,
              0,
              0
            );
            // addElement(shapeRef.current);
            textRef.current.style.display = "block";
            textRef.current.style.top = `${e.clientY}px`;
            textRef.current.style.left = `${e.clientX}px`;
            textRef.current.style.width = `${
              window.innerWidth - e.clientX
            }px`;
            textRef.current.style.height = `${
              window.innerHeight - e.clientY
            }px`;
            reFocus();
            break;
          case "Rectangle":
            shapeRef.current = new Rectangle(
              e.clientX,
              e.clientY,
              0,
              0,
              options,
              generator.rectangle(e.clientX, e.clientY, 0, 0, options),
              0
            );
            break;
          case "Circle":
            shapeRef.current = new Circle(
              e.clientX,
              e.clientY,
              0,
              options,
              generator.circle(e.clientX, e.clientY, 0, options),
              e.clientX,
              e.clientY,
              0
            );
            break;
          case "Ellipse":
            shapeRef.current = new Ellipse(
              e.clientX,
              e.clientY,
              0,
              0,
              options,
              generator.ellipse(e.clientX, e.clientY, 0, 0, options),
              0
            );
            break;
          case "Line":
            shapeRef.current = new Line(
              e.clientX,
              e.clientY,
              e.clientX,
              e.clientY,
              options,
              generator.line(
                e.clientX,
                e.clientY,
                e.clientX,
                e.clientY,
                options
              ),
              0
            );
            break;
          case "draw":
            shapeRef.current = new Path(
              e.clientX,
              e.clientY,
              e.clientX,
              e.clientY,
              new Path2D(),
              penOptions,
              "red",
              0,
              0,
              [{ x: e.clientX, y: e.clientY, pressure: 1 }],
              "fill",
              0
            );
            break;
        }
      },
      [type, options, penOptions]
    ),
    Move = useCallback(
      (e) => {
        if (e.buttons !== 1) return;
        switch (type) {
          case "draw":
            shapeRef.current.updateDimensions(e.clientX, e.clientY, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Rectangle":
            shapeRef.current.updateDimensions(e.clientX, e.clientY, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Circle":
            shapeRef.current.updateDimensions(e.clientX, e.clientY, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Ellipse":
            shapeRef.current.updateDimensions(e.clientX, e.clientY, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Line":
            shapeRef.current.updateDimensions(e.clientX, e.clientY, generator);
            setIsDrawing(!isDrawing);
            break;
          case "erase":
            const selectedElement = getElementAtPos(e.pageX, e.pageY, elements);
            if (selectedElement === null) return;
            // addToREDO(elements[selectedElement]);
            removeElementById(selectedElement.id);
            break;
          case "select":
            if(selectedElements.length > 0){
                // start updating the selected elements
            }else {
              selectionRectangle.x2 = e.pageX
              selectionRectangle.y2 = e.pageY
              // draw the selection rectangle
              const gizmo = new Gizmo(selectionRectangle.x1, selectionRectangle.y1, selectionRectangle.x2, selectionRectangle.y2)
              contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
              gizmo.draw(contextRef)
              // get the elements inside the selection rectangle
              console.log(getElementsInsideSelectionBox(selectionRectangle, elements))
              selectedElements.push(...getElementsInsideSelectionBox(selectionRectangle, elements))
            }
        }
      },
      [type, isDrawing]
    ),
    Up = () => {
      // if(shapeRef.current.type === "text") return 1 &&  console.log("true from up") 
      setButtonDown(false);
      contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
      type !== "erase" && type !== "select" && addElement(shapeRef.current);
    }

  const KeyDown = () => {
    setTimeout(() => {
      contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
      shapeRef.current.updateText(textRef.current.value);
      
      shapeRef.current.draw(contextRef.current, canvasRef);
    }, 0);
  };

  const onBlur = () => {
    if(elements[elements.length - 1]?.text === ""){
      removeLastElement();
    }
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    context.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const roughCanvas = rough.canvas(canvas);

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    shapeRef.current && buttonDown &&
      shapes.has(shapeRef.current.type) &&
      shapeRef.current.draw(roughCanvas);
    shapeRef.current && buttonDown &&
      !shapes.has(shapeRef.current.type) &&
      shapeRef.current.draw(context, canvasRef)
    // shapeRef.current && shapeRef.current.type === "text" && shapeRef.current.draw(context, canvasRef)
    console.log("typing writing") 
    contextRef.current = context;
  }, [isDrawing]);

  return (
    <div className="w-full h-screen grid">
      <Toolbar
        className={"row-start-1 col-start-1 justify-self-center left-1/4 z-20"}
        contextRef={contextRef}
      />
      <div className="absolute top-10 left-3">
        {" "}
        x: {cordinates.x} y: {cordinates.y}{" "}
      </div>

        <textarea
          ref={textRef}
          style={{
            position: "absolute",
            display: "none",
            resize: "none",
            border: "none",
            outline: "none",
            fontSize: "24px",
            fontFamily: "Arial",
            lineHeight: "25px",
            backgroundColor: "transparent",
            pointerEvents: "none",
            overflow: "hidden",
            caretColor: "black",
            color: "transparent",
            zIndex: 11,
          }}
          onKeyDown={KeyDown}
          onBlur={onBlur}
        />
      <CanvasElement
        className={twMerge(
          "row-start-1 col-start-1 min-w-full min-h-full overflow-hidden z-10",
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
      <RenderingCanvas />
      {action === "shape" && <OptionsToolbar />}
      {action === "draw" && <PenOptionsToolbar />}
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
