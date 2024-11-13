import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import { SquareArrowOutUpRight, Github, Trash2  } from "lucide-react";
import rough from "roughjs/bundled/rough.esm";
import { twMerge } from "tailwind-merge";
import { useStore } from "../store";
import { io } from "socket.io-client";
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
  generateID,
  hydrate,
  deleteData,
  clearData,
} from "../utils/utils";
import OptionsToolbar from "./OptionsToolbar";
import PenOptionsToolbar from "./PenOptionsToolbar";
import RenderingCanvas from "./RenderingCanvas";
import Toolbar from "./Toolbar";
import ViewportControl from "./ViewportControl";
import SelectionOptionsToolbar from "./SelectionOptionsToolbar";
import Modal from "./Modal";
import Cursor from "./Cursor";
import ClearModal from "./ClearModal";

const socket = io("http://localhost:3000");

const Canvas = ({ history }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const [roomID, setRoomID] = useState(urlParams.get("roomID"));
  const [users, setUsers] = useState([]); // {id: , name: , cursor: {x: , y: }}
  const [username, setUsername] = useState("");

  // this contains the id's of the shapes that are currently being modified by OTHERS
  const lockedShapes = useRef(new Set());

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const roughCanvasRef = useRef(null);
  const textRef = useRef(null);
  const shapeRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [buttonDown, setButtonDown] = useState(false);
  const selectedElements = useRef([]);
  const initCoords = useRef({ x: 0, y: 0 });
  const lastdx = useRef(0);
  const lastdy = useRef(0);
  const isSelectedElementRemoved = useRef(true);
  const setRerender = useStore((state) => state.setRerender);
  const capturedText = useRef(null);

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
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const lastResizeState = useRef([]);

  const generator = rough.generator();
  const shapes = new Set(["rectangle", "ellipse", "line", "circle"]);

  const cursorShapes = {
    draw: "cursor-crosshair",
    shape: "cursor-crosshair",
    text: "cursor-text",
    select: "cursor-grabbing",
    erase: "cursor-pointer",
    pan: "cursor-grab",
  };

  useEffect(() => {
    if (!roomID) return;
    socket.emit("join-room", roomID, username);

    const sendCursorPosition = (e) => {
      if (!roomID || !socket) return;
      let zoom = useStore.getState().zoom;
      let centerScaleOffset = useStore.getState().centerScalingOffset;

      socket.emit(
        "send-cursor",
        roomID,
        {
          x: e.clientX * zoom - panOffset.x - centerScaleOffset.x,
          y: e.clientY * zoom - panOffset.y - centerScaleOffset.y,
        },
        socket.id
      );
    };

    const onReceiveDraw = (data) => {
      if (data === null) return;
      const element = hydrate(data);
      addElement(element);
      history.addElement(element);
    };
    const setUsersInRoom = (users) => {
      setUsers(users);
    };

    const updateLockedShapes = (id, lock) => {
      if (lock) {
        lockedShapes.current.add(id);
      } else {
        // this one don't unlock shapes
        lockedShapes.current.delete(id);
      }
    };

    const handleDelete = (id) => {
      history.removeElement(id);
      setRerender((prev) => !prev);
    };

    // LISTENERs
    socket.on("update-locked-elements", updateLockedShapes);
    socket.on("all-users", setUsersInRoom);
    socket.on("receive-draw", onReceiveDraw);
    socket.on("handle-delete", handleDelete);
    window.addEventListener("mousemove", sendCursorPosition);

    // REMOVE OLD LISTENERs
    return () => {
      socket.off("receive-draw", onReceiveDraw);
      socket.off("all-users", setUsersInRoom);
      socket.off("update-locked-elements", updateLockedShapes);
      window.removeEventListener("mousemove", sendCursorPosition);
    };
  }, [roomID, socket, username]);

  // BACKSPACE DELETE
  useEffect(() => {
    const handleDelete = (e) => {
      if (e.key !== "Backspace" || selectedElements.current.length === 0)
        return;
      selectedElements.current.forEach((element) => {
        if (element.hidden === false) {
          element.hidden = true;
          async function removeDataFromDB() {
            await deleteData(element.id);
          }
          removeDataFromDB();
          if (roomID) {
            element.hidden = true;
            socket.emit("delete-element", roomID, element.id);
          }
        }
        removeElementById(element.id);
      });
      gizmoRef.current = null;
      // clear the drawing canvas
      contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
      // make an action to be able to undo it
      const action = new RemoveAction([...selectedElements.current], generator);
      history.push(action);
      selectedElements.current = [];

      setRerender((prev) => !prev);
    };
    window.addEventListener("keydown", handleDelete);
    return () => {
      window.removeEventListener("keydown", handleDelete);
    };
  }, [selectedElements, roomID, history, generator]);

  
  const handleShare = () => {
    setIsOpen(true);
    const id = generateID();
    if (!roomID) setRoomID(id);
  };

  const handleEndSession = () => {
    setRoomID("");
    urlParams.delete("roomID");
  };

  const reFocus = () => {
    if (textRef.current !== null) textRef.current.value = "";
    setTimeout(() => {
      textRef?.current?.focus();
    }, 0);
  };

  const editSelectedElements = (modifiedValues) => {
    let key = Object.entries(modifiedValues)[0][0];
    let value = Object.entries(modifiedValues)[0][1];
    selectedElements.current.forEach((element) => {
      let type = element.type;
      switch (key) {
        case "Border Width":
          if (!shapes.has(type)) return;
          element.options = { ...element.options, strokeWidth: value * 20 };
          element.roughElement.options = {
            ...element.roughElement.options,
            strokeWidth: value * 20,
          };
          break;
        case "Stroke Width":
          if (shapes.has(type)) return;
          element.options = { ...element.options, size: value * 25 };
          break;
        case "strokeColor":
          if (!shapes.has(type)) return;
          element.options = { ...element.options, stroke: value };
          element.roughElement.options = {
            ...element.roughElement.options,
            stroke: value,
          };
          break;
        case "fill":
          if (!shapes.has(type)) {
            type === "path"
              ? (element.color = value)
              : (element.options.fill = value);
          } else {
            element.options = { ...element.options, fill: value };
            element.roughElement.options = {
              ...element.roughElement.options,
              fill: value,
            };
          }
          break;
        case "fillStyle":
          if (!shapes.has(type)) return;
          element.options = { ...element.options, fillStyle: value };
          // you have to create a new rough element because the old one has fillPath in sets so you need to change it
          let newRoughOptions;
          switch (type) {
            case "rectangle":
              newRoughOptions = generator.rectangle(
                element.x1,
                element.y1,
                element.width,
                element.height,
                element.options
              );
              break;
            case "ellipse":
              newRoughOptions = generator.ellipse(
                element.centerX,
                element.centerY,
                element.width,
                element.height,
                element.options
              );
              break;
            case "line":
              newRoughOptions = generator.line(
                element.x1,
                element.y1,
                element.x2,
                element.y2,
                element.options
              );
              break;
            case "circle":
              newRoughOptions = generator.circle(
                element.centerX,
                element.centerY,
                element.width,
                element.options
              );
              break;
            default:
              break;
          }
          element.roughElement = newRoughOptions;
          break;
        default:
          break;
      }
    });
    async function addDataToDB() {
      selectedElements.current.forEach(async (element) => {
        await deleteData(element.id);
        await addData(element);
        socket.emit("send-draw", roomID, element);
      });
    }
    addDataToDB();
    setRerender((prev) => !prev);
  };

  const Duplicate = (generator) => {
    let newElements = [];
    selectedElements.current.forEach((element) => {
      let newElement = element.Duplicate(generator);
      newElements.push(newElement);
      addElement(newElement);
    });
    let action = new DrawAction(newElements, generator);
    history.push(action);
    async function addDataToDB() {
      newElements.forEach(async (element) => {
        await addData(element);
      });
    }
    addDataToDB();
    if (roomID) {
      for (let element of newElements) {
        socket.emit("send-draw", roomID, element);
      }
    }

    // switch the selectedElements and gizmo to the new elements
    selectedElements.current = newElements;
    selectedElements.current.forEach((element) => element.Lock(socket, roomID));
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const containerGizmoCoords = getMinMaxCoordinates(selectedElements.current);
    gizmoRef.current = new Gizmo(
      containerGizmoCoords.minX,
      containerGizmoCoords.minY,
      containerGizmoCoords.maxX - containerGizmoCoords.minX,
      containerGizmoCoords.maxY - containerGizmoCoords.minY,
      "transparent",
      true
    );
    const zoom = useStore.getState().zoom;
    const centerScaleOffset = useStore.getState().centerScalingOffset;
    contextRef.current.save();
    contextRef.current.scale(1 / zoom, 1 / zoom);
    contextRef.current.translate(
      panOffset.x + centerScaleOffset.x,
      panOffset.y + centerScaleOffset.y
    );
    gizmoRef.current.draw(contextRef);
    contextRef.current.restore();
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
            const elements = [...history.elements.values()];
            const selectedElement = getElementAtPos(x, y, elements);
            resizingPoint.current = gizmoRef.current?.isMouseResizing(x, y);
            lastResizeState.current = [];

            if (
              selectedElement &&
              lockedShapes.current.has(selectedElement.id)
            ) {
              console.log("This element is locked by another user");
              break;
            }

            if (gizmoRef.current?.isMouseResizing(x, y)) {
              // SELECTION SYSTEM: check if the mouse inside a resizing point then start an action and return
              initCoords.current = {
                x: x,
                y: y,
              };
              isResizing.current = true;
              isDragging.current = false;
              selectedElements.current.forEach((element) => {
                lastResizeState.current.push(element.saveLastState());
              });
              return;
            } else if (gizmoRef.current?.isMouseOver(x, y)) {
              // SELECTION SYSTEM: check if the mouse inside the gizmo then start an action and return
              initCoords.current = {
                x: x,
                y: y,
              };
              isDragging.current = true;
              isResizing.current = false;
              return;
            } else if (selectedElement) {
              // SELECTION SYSTEM: check if the mouse inside an element then start an action
              selectedElements.current.forEach((element) =>
                element.Unlock(socket, roomID)
              );
              selectedElements.current = [];
              selectedElements.current.push(selectedElement);
              selectedElement.Lock(socket, roomID);
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
              selectedElements.current.forEach((element) =>
                element.Unlock(socket, roomID)
              );
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
              1,
              1,
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
        let gitMouseDir = () => {
          let right = e.clientX - lastMousePosition.current.x > 0;
          let down = e.clientY - lastMousePosition.current.y > 0;
          let left = e.clientX - lastMousePosition.current.x < 0;
          let up = e.clientY - lastMousePosition.current.y < 0;
          lastMousePosition.current = { x: e.clientX, y: e.clientY };
          // right up, left down, left up, right down --> those are the directions

          return { right, down, left, up, lastMousePosition };
        };

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
            const elements = [...history.elements.values()];
            const selectedElement = getElementAtPos(x, y, elements);
            if (selectedElement === null) return;
            if (selectedElement && selectedElement.hidden === false) {
              selectedElement.hidden = true;
              async function removeDataFromDB() {
                await deleteData(selectedElement.id);
              }
              removeDataFromDB();
              if (roomID) {
                selectedElement.hidden = true;
                socket.emit("delete-element", roomID, selectedElement.id);
              }
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
                    gitMouseDir(),
                    gizmoRef.current
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
              if (!gizmoRef.current) return;
              gizmoRef.current.updateCoordinates(x, y);
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
            lastResizeState.current,
            generator
          );

          if (
            (distance.current.x || distance.current.y) &&
            isDragging.current
          ) {
            history.push(move);
            selectedElements.current.forEach(async (element) => {
              await deleteData(element.id);
              await addData(element);
              if (roomID) socket.emit("send-draw", roomID, element);
            });
          }
          if (
            (distance.current.x || distance.current.y) &&
            isResizing.current
          ) {
            history.push(resize);
            selectedElements.current.forEach(async (element) => {
              await deleteData(element.id);
              await addData(element);
              if (roomID) socket.emit("send-draw", roomID, element);
            });
          }
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
          selectedElements.current.forEach((element) => {
            element.Refine();
          });
          lastResizeState.current = [];
          distance.current = { x: 0, y: 0 };
        } else {
          // SELECTION SYSTEM: if the actions are not active it means a selectionBox is drawn so we should get the elements inside it
          // getting the elements inside selection region
          let modifiedSelectionBox = {
            x1: gizmoRef.current?.x1,
            y1: gizmoRef.current?.y1,
            x2: gizmoRef.current?.x1 + gizmoRef.current?.width,
            y2: gizmoRef.current?.y1 + gizmoRef.current?.height,
          };
          const elements = [...history.elements.values()];
          // 2- if there is no action is started so we get elements inside selectionBox and draw the gizmo around them
          // selectedElements.current.push(
          //   ...getElementsInsideSelectionBox(modifiedSelectionBox, elements)
          // );

          for (let element of getElementsInsideSelectionBox(
            modifiedSelectionBox,
            elements
          )) {
            if (!lockedShapes.current.has(element.id)) {
              selectedElements.current.push(element);
              element.Lock(socket, roomID);
            }
          }
          // selectedElements.current.forEach
          if (selectedElements.current.length === 0) {
            gizmoRef.current = null;
          }
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
        // sending the draw data to the server
        if (roomID) {
          socket.emit("send-draw", roomID, shapeRef.current);
        }
        // adding the new element to the history
        const action = new DrawAction([shapeRef.current], generator);
        history.push(action);
      }
    };

  const KeyDown = () => {
    setTimeout(() => {
      contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
      shapeRef.current.updateText(textRef.current.value);
      capturedText.current = shapeRef.current;
      setIsDrawing(!isDrawing);
      // shapeRef.current.draw(contextRef.current, canvasRef);
      setRerender((prev) => !prev);
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
    setRerender((prev) => !prev);
    async function addDataToDB() {
      await deleteData(capturedText.current.id);
      await addData(capturedText.current);
    }
    addDataToDB();
    if (roomID) {
      socket.emit("send-draw", roomID, capturedText.current);
    }
  };

  const clearGizmoOnOperation = () => {
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    gizmoRef.current = null;
    selectedElements.current.forEach((element) =>
      element.Unlock(socket, roomID)
    );
    selectedElements.current = [];
  };

  const onCloseModal = (name) => {
    setIsOpen(false);
    setUsername(name);
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    history.clear();
    // delete elements from browser DB
    async function clearDataFromDB() {
      await clearData();
    }
    clearDataFromDB();
    setRerender((prev) => !prev);
  }

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

    context.restore();
    contextRef.current = context;
  }, [isDrawing, panOffset.x, panOffset.y, zoom]);

  return (
    <div className="w-full h-screen grid">
      <button
        className="absolute top-4 right-10 w-10 h-10 shadow-xl text-[18px] font-poppins bg-blue-500 text-white rounded-md z-20"
        onClick={handleShare}
        title="Share board"
      >
        <SquareArrowOutUpRight className="mx-auto" />
      </button>
      {isOpen && (
        <Modal
          open={isOpen}
          roomID={roomID}
          handleEndSession={handleEndSession}
          onClose={onCloseModal}
        />
      )}

      <button
        className="absolute top-4 right-24 shadow-xl w-10 h-10 text-[18px] font-poppins bg-blue-500 text-white rounded-md z-20"
        onClick={() => setIsClearOpen(true)}
        title="Clear board"
      >
        <Trash2 className="mx-auto" />
      </button>
      {isClearOpen && (
        <ClearModal
          open={isClearOpen}
          onClose={() => setIsClearOpen(false)}
          clearCanvas={clearCanvas}
        />
      )}

      <Toolbar
        className={"row-start-1 col-start-1 justify-self-center left-1/4 z-20"}
        contextRef={contextRef}
        clearGizmoOnOperation={clearGizmoOnOperation}
      />

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
        onBlurCapture={onBlur}
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
      <RenderingCanvas
        panOffset={panOffset}
        history={history}
        textAreaRef={textRef}
      />
      {action === "shape" && <OptionsToolbar />}
      {action === "draw" && <PenOptionsToolbar />}
      {selectedElements.current.length > 0 && (
        <SelectionOptionsToolbar
          editSelectedElements={editSelectedElements}
          Duplicate={Duplicate}
        />
      )}
      <ViewportControl
        zoom={zoom}
        history={history}
        clearGizmoOnOperation={clearGizmoOnOperation}
        socket={socket}
        roomID={roomID}
        textRef={textRef}
      />
      <button
        className="absolute bottom-5 right-5 z-[10002] bg-blue-50 rounded-2xl p-1 shadow-2xl"
        onClick={() => window.open("https://github.com/BRHM1/draw", "_blank")}
      >
        <Github />
      </button>
      {roomID &&
        Object.entries(users).map(
          (user) =>
            user[0] !== socket.id && (
              <Cursor
                key={user[0]}
                id={user[0]}
                socket={socket}
                roomID={roomID}
                name={user[1]}
              />
            )
        )}
    </div>
  );
};

const CanvasElement = React.forwardRef((props, ref) => (
  <canvas ref={ref} {...props} />
));

export default Canvas;
