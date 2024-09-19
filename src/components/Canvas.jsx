import React, {
  useRef,
  useLayoutEffect,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import rough from "roughjs/bundled/rough.esm";
import { useStore } from "../store";

import { Rectangle, Circle, Ellipse, Line, Path } from "../hooks/elementModule";

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
  const options = useStore((state) => state.options);
  const penOptions = useStore((state) => state.penOptions);
  const shapes = new Set(["rectangle", "ellipse", "line", "circle"]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const textRef = useRef(null);
  const shapeRef = useRef(null);
  const [cordinates, setCordinates] = useState({ x: 0, y: 0 });
  const generator = rough.generator();
  const addElement = useStore((state) => state.addElement);
  const removeLastElement = useStore((state) => state.removeLastElement);
  const renderingCanvasRef = useRef(null);
  const renderedElements = useRef([]);
  const [isDrawing, setIsDrawing] = useState(false);
  // const fn = (e) => {
  //   setCordinates({ x: e.clientX, y: e.clientY });
  // };
  // window.addEventListener("mousemove", fn);

  // this is the logic behind the toolbar connection with the canvas 17 - 46
  const action = useStore((state) => state.action);
  const type = useStore((state) => state.type);

  const reFocus = () => {
    if (textRef.current !== null) textRef.current.value = "";
    setTimeout(() => {
      textRef?.current?.focus();
    }, 0);
  };
  const renderingContextRef = useRef(null);

  // ISSUE: Hooks are called each time this component re-renders and this affects the performance
  // CRITICAL TODO: change the way those functions invoked ---------------------------------------------------------------
  // const actionTypes = {
  //   draw: useDraw(),
  //   erase: useErase(),
  //   shape: useShape(),
  //   select: useSelect(contextRef),
  //   text: useText(reFocus, canvasRef),
  // };

  let Down = (e) => {
      // based on the type an object of that type will be created
      switch (type) {
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
            generator.line(e.clientX, e.clientY, e.clientX, e.clientY, options),
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
      }
      addElement(shapeRef.current);
      // const [down, _, __] = Object.values(actionTypes[action]);
      // down(e);
    },
    Move = (e) => {
      // const [_, move, __] = Object.values(actionTypes[action]);
      if (e.buttons !== 1) return;
      shapeRef.current.updateDimensions(e.clientX, e.clientY, generator);
      setIsDrawing(!isDrawing);
      // addElement(shapeRef.current);
      // removeLastElement();

      // move(e);
    },
    Up = (e) => {
      // const [_, __, up] = Object.values(actionTypes[action]);
      // up(e);
      renderedElements.current.push(shapeRef.current);
    };
  // CRITICAL TODO: change the way those functions invoked ---------------------------------------------------------------
    // TRAP: the rendering effect is called each time the component re-renders even there is no change in the elements
 

  // drawing effect
  useLayoutEffect(() => {
    console.log("drawing rendered")
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
  

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const roughCanvas = rough.canvas(canvas);
  //   const lastElement = elements[elements.length - 1];
  //  if(lastElement) shapes.has(lastElement.type)
  //     ? lastElement.draw(roughCanvas)
  //     : lastElement.draw(context);
    shapeRef.current && shapes.has(shapeRef.current.type) && shapeRef.current.draw(roughCanvas);
    shapeRef.current && !shapes.has(shapeRef.current.type) && shapeRef.current.draw(context);
    // Draw the last element on the context and draw the elemenets on the rendering canvas


    console.log("elements are:", elements);
    contextRef.current = context;
    // return () => window.removeEventListener("mousemove", fn);
  }, [isDrawing]);


  useLayoutEffect(() => {
    console.log("rendered rendered rendered rendered rendered rendered")
    const renderingCanvas = renderingCanvasRef.current;
    const renderingCanvasContext = renderingCanvas.getContext("2d");

    const dpr = window.devicePixelRatio;
    const rect = renderingCanvas.getBoundingClientRect();

    renderingCanvas.width = rect.width * dpr;
    renderingCanvas.height = rect.height * dpr;
    
    renderingCanvasContext.scale(dpr, dpr);

    const roughCanvas = rough.canvas(renderingCanvas);
    renderingCanvas.style.height = `${rect.height}px`;
    renderingCanvas.style.width = `${rect.width}px`;
    // renderingCanvas.style.backgroundColor = `transparent`;
    console.log(renderedElements.current)
    renderedElements.current.forEach((element) => {
      shapes.has(element.type)
        ? element.draw(roughCanvas)
        : element.draw(renderingContextRef.current);
    });
    renderingContextRef.current = renderingCanvasContext;
  }, [renderedElements.current.length]);

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
      <canvas ref={renderingCanvasRef} className="row-start-1 col-start-1 min-w-full min-h-full overflow-hidden"></canvas>
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
