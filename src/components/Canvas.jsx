import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  SquareArrowOutUpRight,
  Github,
  Trash2,
  Download,
  Upload,
  Users,
} from "lucide-react";
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
  getData,
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
import { motion } from "framer-motion";
import ShortcutMessage from "./ShortcutMessage";

const PROD = "https://drawing-app-backend-le7s.onrender.com"
const socket = io(PROD);

const Canvas = ({ history }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [shareHover, setShareHover] = useState(false);

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

  const options = useStore((state) => state.options);
  const penOptions = useStore((state) => state.penOptions);
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
      history.addElement(element);
      setRerender((prev) => !prev);
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

  const handleDelete = () => {
    if (selectedElements.current.length === 0) return;
    selectedElements.current.forEach((element) => {
      if (element.hidden === false) {
        element.hidden = true;
        async function removeDataFromDB() {
          await deleteData(element.id);
        }
        removeDataFromDB();
        if (roomID) {
          element.hidden = true;
          if (roomID) socket.emit("delete-element", roomID, element.id);
        }
      }
      setRerender((prev) => !prev);
    });
    gizmoRef.current = null;
    // clear the drawing canvas
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // make an action to be able to undo it
    const action = new RemoveAction([...selectedElements.current], generator);
    history.push(action);
    selectedElements.current.length = 0;
    setIsDrawing(!isDrawing);
    setRerender((prev) => !prev);
  };

  // BACKSPACE && DELETE DELETE
  useEffect(() => {
    const handleBackspace = (e) => {
      if (e.key === "Backspace" || e.key === "Delete") handleDelete();
    };
    window.addEventListener("keydown", handleBackspace);
    return () => {
      window.removeEventListener("keydown", handleBackspace);
    };
  }, [selectedElements, roomID, history, generator]);

  const lastType = useRef(type);
  // SPACE PAN
  useEffect(() => {
    // if type !== pan then save the last type
    const handleSpace = (e) => {
      if (e.key === " " && textRef.current !== document.activeElement && shapeRef.current === null && e.buttons !== 1) {
        // check if the type is not pan then change the type to pan
        if (useStore.getState().action !== "pan") {
          lastType.current = useStore.getState().type;
        }
        selectedElements.current.forEach((element) =>
          element.Unlock(socket, roomID)
        );
        selectedElements.current = [];
        gizmoRef.current = null;
        useStore.setState({ type: "pan" });
        // set the cursor to grab
        useStore.setState({ action: "pan" });
      }
    };
    const handleSpaceUp = (e) => {
      if (e.key === " " && textRef.current !== document.activeElement) {
        // if the type is pan then change it back to the last type
        useStore.setState({ type: lastType.current });
        useStore.setState({
          action: shapes.has(lastType.current.toLowerCase())
            ? "shape"
            : lastType.current,
        });
      }
    };
    window.addEventListener("keydown", handleSpace);
    window.addEventListener("keyup", handleSpaceUp);
    return () => {
      window.removeEventListener("keydown", handleSpace);
      window.removeEventListener("keyup", handleSpaceUp);
    };
  }, []);

  const handleShare = () => {
    setIsOpen(true);
    const id = generateID();
    if (!roomID) setRoomID(id);
  };

  const handleEndSession = () => {
    socket.emit("leave-room", roomID);
    urlParams.delete("roomID");
    window.location.search = urlParams;
    setRoomID("");
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
        if (roomID) socket.emit("send-draw", roomID, element);
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
    setRerender((prev) => !prev);
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

  const Save = () => {
    const getElementsFromDB = async () => {
      const  elements = await getData() 
      console.log(elements)
      const data = JSON.stringify(elements);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `canvas-${Date.now()}.json`;
      a.click();
    }
    getElementsFromDB()
  };
  const Load = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file.type !== "application/json") {
      alert("Please upload a valid JSON file.");
      return;
    }
    contextRef.current.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const addToDB = async (element) => {
      await addData(element);
    };
    history.clear();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      history.clear();
      data.forEach((element) => {
        const newElement = hydrate(element);
        history.addElement(newElement);
        addToDB(newElement);
      });
      setRerender((prev) => !prev);
    };
    reader.readAsText(file);
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
            const elements = history.getElements();
            const selectedElement = getElementAtPos(x, y, elements);
            resizingPoint.current = gizmoRef.current?.isMouseResizing(x, y);
            lastResizeState.current = [];

            if (
              selectedElement &&
              lockedShapes.current.has(selectedElement.id)
            ) {
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
            if (
              shapeRef.current?.type === "text" &&
              shapeRef.current.value !== ""
            ) {
              // capturedText
              shapeRef.current = null;
              return;
            }
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
            shapeRef.current?.updateDimensions(x, y, generator);
            setIsDrawing(!isDrawing);
            if (roomID) socket.emit("send-draw", roomID, shapeRef.current);
            break;
          case "Rectangle":
            shapeRef.current?.updateDimensions(x, y, generator);
            if (roomID) socket.emit("send-draw", roomID, shapeRef.current);
            setIsDrawing(!isDrawing);
            break;
          case "Circle":
            shapeRef.current?.updateDimensions(x, y, generator);
            if (roomID) socket.emit("send-draw", roomID, shapeRef.current);
            setIsDrawing(!isDrawing);
            break;
          case "Ellipse":
            shapeRef.current?.updateDimensions(x, y, generator);
            if (roomID) socket.emit("send-draw", roomID, shapeRef.current);
            setIsDrawing(!isDrawing);
            break;
          case "Line":
            shapeRef.current?.updateDimensions(x, y, generator);
            if (roomID) socket.emit("send-draw", roomID, shapeRef.current);
            setIsDrawing(!isDrawing);
            break;
          case "erase":
            const elements = history.getElements();
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
                if (roomID)
                  socket.emit("delete-element", roomID, selectedElement.id);
              }
              const action = new RemoveAction([selectedElement], generator);
              history.push(action);
            }
            setRerender((prev) => !prev);
            break;
          case "select":
            if (
              (isDragging.current || isResizing.current) && // SELECTION SYSTEM: if there is an action started then remove the selected elements
              isSelectedElementRemoved.current
            ) {
              isSelectedElementRemoved.current = false;
              setRerender((prev) => !prev);
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
                  if (roomID) socket.emit("send-draw", roomID, element);
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
                  if (roomID) socket.emit("send-draw", roomID, element);
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
            if (distance.current.x || distance.current.y)
              setRerender((prev) => !prev);
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
          const elements = history.getElements();
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
        if (!shapeRef.current) return;
        // adding the new element to the DB
        async function addDataToDB() {
          await addData(shapeRef.current);
        }
        addDataToDB();
        // sending the draw data to the server

        shapeRef.current.Refine();
        // adding the new element to the history
        const action = new DrawAction([shapeRef.current], generator);
        history.push(action);
        setRerender((prev) => !prev);
      }
      if(shapeRef.current.type !== "text") shapeRef.current = null;
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
    history.clearEmptyTexts();
    setRerender((prev) => !prev);
    async function addDataToDB() {
      if (!capturedText.current) return;
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

    context.restore();
    contextRef.current = context;
  }, [isDrawing, panOffset.x, panOffset.y, zoom]);

  return (
    <div className="w-full h-screen grid">
      {selectedElements.current.length > 0 ? (
        <ShortcutMessage
          message={"To delete selected elements, use Backspace or Delete"}
          className={
            "top-14 left-1/2 transform -translate-x-1/2 pointer-events-none"
          }
        />
      ) : (
        <ShortcutMessage
          className={
            "top-14 left-1/2 transform -translate-x-1/2 pointer-events-none"
          }
          message={"To move canvas, hold spacebar while dragging"}
        />
      )}
      <motion.button
        initial={{ y: -100, opacity: 0.3 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute top-4 left-6 shadow-xl w-8 h-8 rounded-full font-poppins bg-blue-50 text-black border z-20"
        onClick={() => setIsClearOpen(true)}
        title="Clear board"
      >
        <Trash2 className="mx-auto" size={18} />
      </motion.button>

      <motion.button
        initial={{ y: -100, opacity: 0.3 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 left-16 shadow-xl w-8 h-8 rounded-full font-poppins bg-blue-50 text-black border z-20"
        onClick={() => Save()}
        title="Save board"
      >
        <Download className="mx-auto" size={18} />
      </motion.button>

      <motion.button
        initial={{ y: -100, opacity: 0.3 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute appearance-none top-4 left-[6.5rem] shadow-xl w-8 h-8 rounded-full font-poppins bg-blue-50 text-black border z-20 grid place-items-center"
        onClick={() => document.getElementById("file").click()}
        title="Load board"
      >
        <Upload className="mx-auto" size={18} />
        <input
          type="file"
          id="file"
          onChange={Load}
          title="Load board"
          style={{ display: "none", position: "absolute", zIndex: -1 }}
        />
      </motion.button>

      <motion.button
        initial={{ y: -100, opacity: 0.3 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 left-[9rem] shadow-xl w-8 h-8 rounded-full font-poppins bg-blue-50 text-black border z-20 hover:w-28 transition-all"
        onClick={handleShare}
        onMouseEnter={() => setShareHover(true)}
        onMouseLeave={() => setShareHover(false)}
      >
        {!shareHover ? (
          <Users size={18} className="mx-auto" />
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            Go Live!
          </motion.p>
        )}
      </motion.button>

      {isClearOpen && (
        <ClearModal
          open={isClearOpen}
          onClose={() => setIsClearOpen(false)}
          clearCanvas={clearCanvas}
        />
      )}

      {isOpen && (
        <Modal
          open={isOpen}
          roomID={roomID}
          handleEndSession={handleEndSession}
          onClose={onCloseModal}
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
        
        onPointerDown={Down}
        onPointerMove={Move}
        onPointerUp={Up}
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
          onDelete={handleDelete}
        />
      )}
      <ViewportControl
        zoom={zoom}
        history={history}
        clearGizmoOnOperation={clearGizmoOnOperation}
        socket={socket}
        roomID={roomID}
      />
      <motion.button
        initial={{ x: 100, opacity: 0.3 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-5 right-5 z-[10002] bg-blue-50 rounded-2xl p-1 shadow-2xl"
        onClick={() => window.open("https://github.com/BRHM1/draw", "_blank")}
      >
        <Github />
      </motion.button>
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
                panOffset={panOffset}
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
