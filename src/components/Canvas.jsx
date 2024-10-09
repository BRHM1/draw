import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import { twMerge } from "tailwind-merge";
import { useStore } from "../store";

import { RemoveAction, DrawAction, MoveAction } from "../hooks/History";
import {
  Circle,
  Ellipse,
  Line,
  Path,
  Rectangle,
  Text,
} from "../hooks/elementModule";
import Gizmo from "../utils/Gizmo";

import { getElementAtPos, getElementsInsideSelectionBox } from "../utils/utils";
import OptionsToolbar from "./OptionsToolbar";
import PenOptionsToolbar from "./PenOptionsToolbar";
import RenderingCanvas from "./RenderingCanvas";
import Toolbar from "./Toolbar";
import ViewportControl from "./ViewportControl";

const Canvas = ({ history }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const roughCanvasRef = useRef(null);
  const textRef = useRef(null);
  const shapeRef = useRef(null);
  const [cordinates, setCordinates] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [buttonDown, setButtonDown] = useState(false);
  let selectionBox = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const selectedElements = useRef([]);
  const initCoords = useRef({ x: 0, y: 0 });
  const lastdx = useRef(0);
  const lastdy = useRef(0);
  const startedActionAfterSelection = useRef(false);
  const isSelectedElementRemoved = useRef(true);
  const setRerender = useStore((state) => state.setRerender);


  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [prevAccumulativeSumX, setPrevAccumulativeSumX] = useState(0);
  const [prevAccumulativeSumY, setPrevAccumulativeSumY] = useState(0);
  const panInitCoords = useRef({ x: 0, y: 0 });
  const lastPanOffset = useRef({ x: 0, y: 0 });

  const zoom = useStore((state) => state.zoom);
  const setZoom = useStore((state) => state.setZoom);

  const distance = useRef({ x: 0, y: 0 });

  const removeLastElement = useStore((state) => state.removeLastElement);
  const removeElementById = useStore((state) => state.removeElementById);
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

  const cursorShapes = {
    draw: "cursor-crosshair",
    shape: "cursor-crosshair",
    text: "cursor-text",
    select: "cursor-grabbing",
    erase: "cursor-pointer",
    pan: "cursor-grab",
  };

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
        let zoom = useStore.getState().zoom;
        let centerScaleOffset = useStore.getState().centerScalingOffset;
        let x = e.clientX * zoom - panOffset.x - centerScaleOffset.x;
        let y = e.clientY * zoom - panOffset.y - centerScaleOffset.y;
        switch (type) {
          case "select":
            // 1- get the element at the position of the mouse
            const selectedElement = getElementAtPos(x, y, elements);
            // 2- check if the mouse is inside a selectedBox or not
            const isClickInsideSelectionRectangle =
              e.clientX >
                Math.min(selectionBox.current.x1, selectionBox.current.x2) &&
              e.clientX <
                Math.max(selectionBox.current.x1, selectionBox.current.x2) &&
              e.clientY >
                Math.min(selectionBox.current.y1, selectionBox.current.y2) &&
              e.clientY <
                Math.max(selectionBox.current.y1, selectionBox.current.y2);

            // 3- check if the mouse inside a selectedBox then start an action and return
            if (isClickInsideSelectionRectangle) {
              initCoords.current = {
                x: x,
                y: y,
              };
              startedActionAfterSelection.current = true;
              return;
            }

            // 4- if the mouse isn't inside a selectedBox then clear the selected Elements
            selectedElements.current.length = 0;
            // 5- if the mouse is inside an element then add it to the selected elements and draw a gizmo around it
            if (selectedElement) {
              selectedElements.current.push(selectedElement);
              initCoords.current = {
                x: x,
                y: y,
              };
              const { x1, y1, width, height } = selectedElement;
              startedActionAfterSelection.current = true;
              const gizmo = new Gizmo(
                (x1 + panOffset.x + centerScaleOffset.x) / zoom,
                (y1 + panOffset.y + centerScaleOffset.y) / zoom,
                (x1 + width + panOffset.x + centerScaleOffset.x) / zoom,
                (y1 + height + panOffset.y + centerScaleOffset.y) / zoom,
                "transparent"
              );
              gizmo.draw(contextRef);
            } else {
              // 6- in this point the mouse is not inside elements or selectionBox so we start drawing a selectionBox
              selectionBox.current = {
                ...selectionBox.current,
                x1: e.clientX,
                y1: e.clientY,
              };
            }
            break;
          case "text":
            shapeRef.current = new Text(
              x,
              y,
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

            textRef.current.style.width = `${window.innerWidth - e.clientX}px`;
            textRef.current.style.height = `${
              window.innerHeight - e.clientY
            }px`;
            textRef.current.style.fontSize = `${24 / zoom}px`;
            reFocus();
            break;
          case "Rectangle":
            shapeRef.current = new Rectangle(
              x,
              y,
              0,
              0,
              options,
              generator.rectangle(x, y, 0, 0, options),
              0
            );
            break;
          case "Circle":
            shapeRef.current = new Circle(
              x,
              y,
              0,
              options,
              generator.circle(x, y, 0, options),
              x,
              y,
              0
            );
            break;
          case "Ellipse":
            shapeRef.current = new Ellipse(
              x,
              y,
              0,
              0,
              options,
              generator.ellipse(x, y, 0, 0, options),
              0
            );
            break;
          case "Line":
            shapeRef.current = new Line(
              x,
              y,
              x,
              y,
              options,
              generator.line(x, y, x, y, options),
              0
            );
            break;
          case "draw":
            let penColor = useStore.getState().penColor;
            shapeRef.current = new Path(
              x,
              y,
              x,
              y,
              new Path2D(),
              penOptions,
              penColor,
              0,
              0,
              [
                {
                  x: x,
                  y: y,
                  pressure: 1,
                },
              ],
              "fill",
              0
            );
            break;
          case "pan":
            panInitCoords.current = { x: e.clientX, y: e.clientY };
            break;
        }
      },
      [type, options, penOptions]
    ),
    Move = useCallback(
      (e) => {
        if (e.buttons !== 1) return;
        let zoom = useStore.getState().zoom;
        let centerScaleOffset = useStore.getState().centerScalingOffset;
        let x = e.clientX * zoom - panOffset.x - centerScaleOffset.x;
        let y = e.clientY * zoom - panOffset.y - centerScaleOffset.y;
        switch (type) {
          case "draw":
            shapeRef.current.updateDimensions(x, y, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Rectangle":
            shapeRef.current.updateDimensions(x, y, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Circle":
            shapeRef.current.updateDimensions(x, y, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Ellipse":
            shapeRef.current.updateDimensions(x, y, generator);
            setIsDrawing(!isDrawing);
            break;
          case "Line":
            shapeRef.current.updateDimensions(x, y, generator);
            setIsDrawing(!isDrawing);
            break;
          case "erase":
            const selectedElement = getElementAtPos(x, y, elements);
            if (selectedElement === null) return;
            if (selectedElement && selectedElement.hidden === false) {
              selectedElement.hidden = true;
              const action = new RemoveAction([selectedElement], generator);
              history.push(action);
            }
            removeElementById(selectedElement.id);
            break;
          case "select":
            // 1- if we've started an action then we should remove the selected Elements from the rendering canvas then after the action
            // we should add them again
            if (
              startedActionAfterSelection.current &&
              isSelectedElementRemoved.current
            ) {
              isSelectedElementRemoved.current = false;
              selectedElements.current.forEach((element) => {
                removeElementById(element.id);
                setRerender((prev) => !prev);
                // to save the last position of the element before moving it to be able to make undo for selection cases
              });
            }
            // 2- if we have selected elements then we should move them
            if (selectedElements.current.length > 0) {
              const dx = x - initCoords.current.x;
              const dy = y - initCoords.current.y;
              contextRef.current.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
              );
              contextRef.current.save();
              contextRef.current.scale(1 / zoom, 1 / zoom);
              contextRef.current.translate(
                panOffset.x + centerScaleOffset.x,
                panOffset.y + centerScaleOffset.y
              );
              selectedElements.current.forEach((element) => {
                element.hidden = true;
                switch (element.type) {
                  case "rectangle":
                    element.Move(
                      dx - lastdx.current,
                      dy - lastdy.current,
                      generator
                    );
                    // the problem is the element have the dimensions based on the zoom and panOffset
                    // and the canvas drawing them as they are not based on the zoom and panOffset
                    // in other words the drawing of the element is not in save and restore context so it's drawn based on the original context
                    // solution is to move the drawing functionality to the layoutEffect
                    element.draw(roughCanvasRef.current);
                    break;
                  case "ellipse":
                    element.Move(
                      dx - lastdx.current,
                      dy - lastdy.current,
                      generator
                    );
                    element.draw(roughCanvasRef.current);
                    break;
                  case "line":
                    element.Move(
                      dx - lastdx.current,
                      dy - lastdy.current,
                      generator
                    );
                    element.draw(roughCanvasRef.current);
                    break;
                  case "circle":
                    element.Move(
                      dx - lastdx.current,
                      dy - lastdy.current,
                      generator
                    );
                    element.draw(roughCanvasRef.current);
                    break;
                  case "path":
                    element.Move(dx - lastdx.current, dy - lastdy.current);
                    element.draw(contextRef.current);
                    break;
                  case "text":
                    element.Move(dx - lastdx.current, dy - lastdy.current);
                    element.draw(contextRef.current, canvasRef);
                    break;
                }
              });
              contextRef.current.restore();
              lastdx.current = dx;
              lastdy.current = dy;
              distance.current = { x: lastdx.current, y: lastdy.current }
            } else {
              // 3- if we don't have selected elements then we should draw the selectionBox
              selectionBox.current = {
                ...selectionBox.current,
                x2: e.clientX,
                y2: e.clientY,
              };
              // draw the selection rectangle
              const gizmo = new Gizmo(
                selectionBox.current.x1,
                selectionBox.current.y1,
                selectionBox.current.x2,
                selectionBox.current.y2
              );
              contextRef.current.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
              );
              gizmo.draw(contextRef);
            }
          case "pan":
            // get the moved distance and add that distance to the panOffset
            // calculating distance so it doesn't matter to the zoom
            shapeRef.current = null;
            const dx = e.clientX - panInitCoords.current.x;
            const dy = e.clientY - panInitCoords.current.y;
            if (type !== "pan") return;
            setPanOffset({
              x: lastPanOffset.current.x + dx - prevAccumulativeSumX,
              y: lastPanOffset.current.y + dy - prevAccumulativeSumY,
            });
            setPrevAccumulativeSumX(dx);
            setPrevAccumulativeSumY(dy);
            break;
        }
      },
      [type, isDrawing]
    ),
    Up = () => {
      // if(shapeRef.current.type === "text") return 1 &&  console.log("true from up")
      const centerScaleOffset = useStore.getState().centerScalingOffset;
      if (type === "pan") {
        lastPanOffset.current = { x: panOffset.x, y: panOffset.y };
        setPrevAccumulativeSumX(0);
        setPrevAccumulativeSumY(0);
        return;
      }
      contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
      lastdx.current = 0;
      lastdy.current = 0;
      if (type === "select") {
        // 1- after the action is done we should add the selected elements again to the rendering canvas
        if (startedActionAfterSelection.current) {
          selectionBox.current = {
            x1: panOffset.x * zoom,
            y1: panOffset.y * zoom,
            x2: panOffset.x * zoom,
            y2: panOffset.y * zoom,
          };
          selectedElements.current.forEach((element) => {
            element.hidden = false
            if (distance.current.x || distance.current.y) addElement(element);
          });
          const action = new MoveAction(
            [...selectedElements.current],
            distance.current.x,
            distance.current.y,
            generator
          );
          if(distance.current.x || distance.current.y) history.push(action);

          selectedElements.current.length = 0;
          startedActionAfterSelection.current = false;
          isSelectedElementRemoved.current = true;
          contextRef.current.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
          );
        }

        let modifiedSelectionBox = {
          x1:
            selectionBox.current.x1 * zoom - panOffset.x - centerScaleOffset.x,
          y1:
            selectionBox.current.y1 * zoom - panOffset.y - centerScaleOffset.y,
          x2:
            selectionBox.current.x2 * zoom - panOffset.x - centerScaleOffset.x,
          y2:
            selectionBox.current.y2 * zoom - panOffset.y - centerScaleOffset.y,
        };
        // 2- if there is no action is started so we get elements inside selectionBox and draw the gizmo around them
        selectedElements.current.push(
          ...getElementsInsideSelectionBox(modifiedSelectionBox, elements)
        );
        // 3- if there are selected elements then draw a gizmo around them
        selectedElements.current.forEach((element) => {
          const { x1, y1, width, height } = element;
          const gizmo = new Gizmo(
            (x1 + panOffset.x + centerScaleOffset.x) / zoom,
            (y1 + panOffset.y + centerScaleOffset.y) / zoom,
            (x1 + width + panOffset.x + centerScaleOffset.x) / zoom,
            (y1 + height + panOffset.y + centerScaleOffset.y) / zoom,
            "transparent"
          );
          gizmo.draw(contextRef);
        });
      }
      setButtonDown(false);
      if (!["erase", "pan", "select"].includes(type)) {
        addElement(shapeRef.current);
        const action = new DrawAction([shapeRef.current], generator);
        history.push(action);
      }
    };

  const KeyDown = () => {
    setTimeout(() => {
      contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
      shapeRef.current.updateText(textRef.current.value);
      setIsDrawing(!isDrawing);
      // shapeRef.current.draw(contextRef.current, canvasRef);
    }, 0);
  };

  const onWheel = (e) => {
    // get the direction and limit the zoom to 0.1 - 2
    const direction = Math.sign(e.deltaY);
    const step = 0.1;
    let newZoom = zoom + direction * step;
    setZoom(newZoom);
  };

  const onBlur = () => {
    if (elements[elements.length - 1]?.text === "") {
      history.pop()
      removeLastElement();
    }
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const dpr = window.devicePixelRatio;
    const rect = canvas.getBoundingClientRect();
    const centerScaleOffset = useStore.getState().centerScalingOffset;

    // Set the "actual" size of the canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale the context to ensure correct drawing operations
    context.scale(dpr, dpr);

    // Set the "drawn" size of the canvas
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    context.save();
    context.scale(1 / zoom, 1 / zoom);
    context.translate(
      panOffset.x + centerScaleOffset.x,
      panOffset.y + centerScaleOffset.y
    );

    const roughCanvas = rough.canvas(canvas);
    roughCanvasRef.current = roughCanvas;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (shapeRef.current && buttonDown && shapes.has(shapeRef.current.type)) {
      shapeRef.current.draw(roughCanvas);
    }

    if (shapeRef.current && buttonDown && !shapes.has(shapeRef.current.type)) {
      shapeRef.current.draw(context, canvasRef);
    }

    if (shapeRef.current && type === "text") {
      shapeRef.current.draw(context, textRef);
    }

    context.restore();
    contextRef.current = context;
  }, [isDrawing, panOffset.x, panOffset.y, zoom]);

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
          cursorShapes[action]
        )}
        ref={canvasRef}
        onMouseDown={Down}
        onMouseMove={Move}
        onMouseUp={Up}
        onWheel={onWheel}
        // onMouseLeave={Up}
        // onMouseEnter={Move}
      />
      <RenderingCanvas panOffset={panOffset} history={history.history} />
      {action === "shape" && <OptionsToolbar />}
      {action === "draw" && <PenOptionsToolbar />}
      <ViewportControl zoom={zoom} history={history} />
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
