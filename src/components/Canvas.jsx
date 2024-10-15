import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs/bundled/rough.esm";
import { twMerge } from "tailwind-merge";
import { useStore } from "../store";

import {
  RemoveAction,
  DrawAction,
  MoveAction,
  ResizingAction,
} from "../hooks/History";
import {
  Circle,
  Ellipse,
  Line,
  Path,
  Rectangle,
  Text,
} from "../hooks/elementModule";
import Gizmo from "../utils/Gizmo";

import {
  addData,
  getElementAtPos,
  getElementsInsideSelectionBox,
  getMinMaxCoordinates,
} from "../utils/utils";
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
  const selectedElements = useRef([]);
  const initCoords = useRef({ x: 0, y: 0 });
  const lastdx = useRef(0);
  const lastdy = useRef(0);
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

  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const gizmoRef = useRef(null);
  const resizingPoint = useRef(null);

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
            resizingPoint.current = gizmoRef.current?.isMouseResizing(x, y);
            if (gizmoRef.current?.isMouseResizing(x, y)) {
              // SELECTION SYSTEM: check if the mouse inside a resizing point then start an action and return
              initCoords.current = {
                x: x,
                y: y,
              };
              isResizing.current = true;
              isDragging.current = false;
              return;
            } else if (gizmoRef.current?.isMouseOver(x, y)) {
              // SELECTION SYSTEM: check if the mouse inside the gizmo then start an action and return
              initCoords.current = {
                x: x,
                y: y,
              };
              isDragging.current = true;
              isResizing.current = false;
              // console.log("mouseDown: inside gizmo");
              return;
            } else if (selectedElement) {
              // SELECTION SYSTEM: check if the mouse inside an element then start an action
              selectedElements.current = [];
              selectedElements.current.push(selectedElement);
              initCoords.current = {
                x: x,
                y: y,
              };
              isDragging.current = true;
              isResizing.current = false;

              const { x1, y1, width, height } = selectedElement;
              gizmoRef.current = new Gizmo(
                x1,
                y1,
                width,
                height,
                "transparent",
                true
              );
              contextRef.current.save();
              contextRef.current.scale(1 / zoom, 1 / zoom);
              contextRef.current.translate(
                panOffset.x + centerScaleOffset.x,
                panOffset.y + centerScaleOffset.y
              );
              gizmoRef.current.draw(contextRef);
              contextRef.current.restore();
            } else {
              // SELECTION SYSTEM: if the mouse is not inside any element then start a new selection action
              selectedElements.current = [];
              gizmoRef.current = new Gizmo(x, y, x, y, "");
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
              "",
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
            if (
              (isDragging.current || isResizing.current) && // SELECTION SYSTEM: if there is an action started then remove the selected elements
              isSelectedElementRemoved.current
            ) {
              isSelectedElementRemoved.current = false;
              selectedElements.current.forEach((element) => {
                removeElementById(element.id);
                setRerender((prev) => !prev);
                // to save the last position of the element before moving it to be able to make undo for selection cases
              });
            }
            if (selectedElements.current.length > 0) {
              // SELECTION SYSTEM: if there are selected elements then apply the action
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
              if (isDragging.current) {
                // SELECTION SYSTEM: if the action is dragging then move the selected elements
                // hide , move and draw the selected elements
                selectedElements.current.forEach((element) => {
                  element.hidden = true;
                  element.Move(
                    dx - lastdx.current,
                    dy - lastdy.current,
                    generator
                  );
                  shapes.has(element.type)
                    ? element.draw(roughCanvasRef.current)
                    : element.draw(contextRef.current, canvasRef);
                });
                gizmoRef.current.Move(dx - lastdx.current, dy - lastdy.current);
                gizmoRef.current.draw(contextRef);
              } else if (isResizing.current) {
                
                // SELECTION SYSTEM: if the action is resizing then resize the selected elements
                // hide, resize, and draw the selected elements
                selectedElements.current.forEach((element) => {
                  element.hidden = true;
                  element.Resize(
                    dx - lastdx.current,
                    dy - lastdy.current,
                    generator,
                    resizingPoint.current,
                    x,
                    y,
                    initCoords.current
                  );
                  shapes.has(element.type)
                    ? element.draw(roughCanvasRef.current)
                    : element.draw(contextRef.current, canvasRef);
                });
                gizmoRef.current.Resize(
                  dx - lastdx.current,
                  dy - lastdy.current,
                  resizingPoint.current
                );
                gizmoRef.current.draw(contextRef);
              }
              contextRef.current.restore();
              lastdx.current = dx;
              lastdy.current = dy;
              distance.current = { x: lastdx.current, y: lastdy.current };
            } else {
              // SELECTION SYSTEM: if there are no selected elements then draw the selectionBox
              // 3- if we don't have selected elements then we should draw the selectionBox
              gizmoRef.current.updateCoordinates(x, y);
              // console.log("mouseMove: drawing selectionBox");
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
              gizmoRef.current.draw(contextRef);
              contextRef.current.restore();
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
        // ------------------ selection starts ----------------
        // 1- after the action is done we should add the selected elements again to the rendering canvas
        if (isDragging.current || isResizing.current) {
          // SELECTION SYSTEM: if the action is active then it means the action is done so reset the system
          // resetting the selection system conditions
          // gizmoRef.current = null;
          isSelectedElementRemoved.current = true;

          // pushing the elements back to the rendering canvas
          selectedElements.current.forEach((element) => {
            element.hidden = false;
            if (distance.current.x || distance.current.y) addElement(element);
          });

          // adding the action to the history to be able to undo it
          const move = new MoveAction(
            [...selectedElements.current],
            distance.current.x,
            distance.current.y,
            generator
          );

          const resize = new ResizingAction(
            [...selectedElements.current],
            distance.current.x,
            distance.current.y,
            generator
          );
          if ((distance.current.x || distance.current.y) && isDragging.current)
            history.push(move);
          if ((distance.current.x || distance.current.y) && isResizing.current)
            history.push(resize);
          isDragging.current = false;
          isResizing.current = false;
          // selectedElements.current = [];
          contextRef.current.save();
          contextRef.current.scale(1 / zoom, 1 / zoom);
          contextRef.current.translate(
            panOffset.x + centerScaleOffset.x,
            panOffset.y + centerScaleOffset.y
          );
          gizmoRef.current.draw(contextRef);
          contextRef.current.restore();
          // contextRef.current.clearRect(
          //   0,
          //   0,
          //   window.innerWidth,
          //   window.innerHeight
          // );
        } else {
          // SELECTION SYSTEM: if the actions are not active it means a selectionBox is drawn so we should get the elements inside it
          // getting the elements inside selection region
          let modifiedSelectionBox = {
            x1: gizmoRef.current?.x1,
            y1: gizmoRef.current?.y1,
            x2: gizmoRef.current?.x1 + gizmoRef.current?.width,
            y2: gizmoRef.current?.y1 + gizmoRef.current?.height,
          };
          // 2- if there is no action is started so we get elements inside selectionBox and draw the gizmo around them
          selectedElements.current.push(
            ...getElementsInsideSelectionBox(modifiedSelectionBox, elements)
          );

          // 3- if there are selected elements then draw a gizmo around them
          selectedElements.current.forEach((element) => {
            const { x1, y1, width, height } = element;
            const gizmo = new Gizmo(x1, y1, width, height, "transparent");
            contextRef.current.save();
            contextRef.current.scale(1 / zoom, 1 / zoom);
            contextRef.current.translate(
              panOffset.x + centerScaleOffset.x,
              panOffset.y + centerScaleOffset.y
            );
            gizmo.draw(contextRef);
            contextRef.current.restore();
          });

          if (selectedElements.current.length) {
            const containerGizmoCoords = getMinMaxCoordinates(
              selectedElements.current
            );
            gizmoRef.current = new Gizmo(
              containerGizmoCoords.minX,
              containerGizmoCoords.minY,
              containerGizmoCoords.maxX - containerGizmoCoords.minX,
              containerGizmoCoords.maxY - containerGizmoCoords.minY,
              "transparent",
              true
            );
            contextRef.current.save();
            contextRef.current.scale(1 / zoom, 1 / zoom);
            contextRef.current.translate(
              panOffset.x + centerScaleOffset.x,
              panOffset.y + centerScaleOffset.y
            );
            gizmoRef.current.draw(contextRef);
            contextRef.current.restore();
          }
        }
      } // ---------- selection ends -------------
      setButtonDown(false);
      if (!["erase", "pan", "select"].includes(type)) {
        addElement(shapeRef.current);
        shapeRef.current.Refine();
        // adding the new element to the DB
        async function addDataToDB() {
          await addData(shapeRef.current);
        }
        addDataToDB();

        // adding the new element to the history
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
      history.pop();
      removeLastElement();
    }
  };

  const clearGizmoOnOperation = () => {
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    gizmoRef.current = null;
    selectedElements.current = [];
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
      <ViewportControl
        zoom={zoom}
        history={history}
        clearGizmoOnOperation={clearGizmoOnOperation}
      />
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
