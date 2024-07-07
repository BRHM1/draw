import { useState } from "react";

const Draw = ({contextRef}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const startDrawing = (e) => {
    contextRef?.current?.beginPath();
    contextRef?.current?.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    setIsDrawing(true)
  };

  const draw = (e) => {
    if (!isDrawing) return;
    contextRef?.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    contextRef?.current.stroke();
  };

  const stopDrawing = () => {
    contextRef?.current.closePath();
    setIsDrawing(false)
  };
  return {startDrawing , draw , stopDrawing};
};

export default Draw;
