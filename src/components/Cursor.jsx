import { PiCursorLight } from "react-icons/pi";
import { useEffect, useRef, useState } from "react";

const Cursor = ({ socket, roomID, name , id}) => {
  const cursorRef = useRef(null);
  const [cursorCoords, setCursorCoords] = useState({ x: 0, y: 0 });

  const recieveCursorHandler = (data, senderID) => {
    if (!cursorRef.current || senderID !== id) return;
    setCursorCoords(data);
  };

  useEffect(() => {
    socket.on("receive-cursor", recieveCursorHandler);
    return () => {
      socket.off("receive-cursor", recieveCursorHandler);
    };
  }, [socket, cursorCoords, roomID]);

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
      <div className="w-fit h-fit font-nova outline-none bg-transparent  shadow-[9px_9px_13px_2px_rgba(28,_1,_193,_0.09)] p-[3px] rounded-md relative top-1 left-5 border-t-2 border-l-2 border-blue-300">
        {name}
      </div>
    </div>
  );
};

export default Cursor;
