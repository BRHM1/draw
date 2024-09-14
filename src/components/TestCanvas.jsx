import React, { useEffect, useRef, useState } from "react";

function TestC() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const handleMouseDown = (event) => {
    const { offsetX, offsetY } = event;
    setCurrentPath([{ x: offsetX, y: offsetY }]);
  };

  const handleMouseMove = (event) => {
    const { offsetX, offsetY } = event;
    const newPath = [...currentPath, { x: offsetX, y: offsetY }];
    setCurrentPath(newPath);
  };

  const handleMouseUp = () => {
    setElements((prev) => [...prev, { path: currentPath }]);
    setCurrentPath([]);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    elements.forEach(({ path }) => {
      ctx.beginPath();
      path.forEach(({ x, y }) => {
        ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };

  }, [elements, currentPath]);

  return <canvas ref={canvasRef} width={500} height={300} />;
}

export default TestC;
