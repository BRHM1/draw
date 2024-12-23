import { PiCursorLight } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";

const Cursor = ({ socket, roomID, name, id, panOffset }) => {
  const cursorRef = useRef(null);
  const [cursorCoords, setCursorCoords] = useState({ x: Math.random() * 500, y: Math.random() * 500 });

  const zoom = useStore((state) => state.zoom);
  const centerScalingOffset = useStore((state) => state.centerScalingOffset);

  const recieveCursorHandler = (data, senderID) => {
    if (!cursorRef.current || senderID !== id) return;
    data.x = (data.x + (centerScalingOffset.x - panOffset.x)) / zoom;
    data.y = (data.y + (centerScalingOffset.y - panOffset.y)) / zoom;
    setCursorCoords(data);
  };

  useEffect(() => {
    socket.on("receive-cursor", recieveCursorHandler);
    return () => {
      socket.off("receive-cursor", recieveCursorHandler);
    };
  }, [socket, cursorCoords, roomID, panOffset, zoom, centerScalingOffset]);

  return (
    <div
      style={{
        position: "absolute",
        top: cursorCoords.y + "px",
        left: cursorCoords.x + "px",
      }}
      ref={cursorRef}
    >
      <div className={`relative`}>
        <PiCursorLight className="text-2xl bg-transparent" />
      </div>
      <div className="w-fit h-fit font-poppins outline-none bg-transparent  shadow-[9px_9px_13px_2px_rgba(28,_1,_193,_0.09)] p-[3px] rounded-md relative top-1 left-5 border-t-2 border-l-2 border-blue-300">
        {name}
      </div>
    </div>
  );
};

export default Cursor;
