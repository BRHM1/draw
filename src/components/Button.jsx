import { useStore } from "../store";
import { Undo2, Redo2 } from "lucide-react";
import { useEffect } from "react";
import ShortcutMessage from "./ShortcutMessage";

const Button = ({ label, callbackFn, hotKey, roomID }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === hotKey) {
        e.preventDefault()
        e.target.blur()
        callbackFn();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [roomID]);

  return (
    <div className="flex flex-col items-center justify-center">
      {label === "Undo" && <ShortcutMessage message="Ctrl + Z" className={"relative"}/>}
      {label === "Redo" && <ShortcutMessage message="Ctrl + Y" className={"relative"}/>}
      <button
        className=" w-20 font-poppins bg-blue-50 hover:bg-[#bfdbfe] text-black shadow-lg font-bold py-2 px-4 rounded select-none disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
        onClick={() => callbackFn()}
        // disabled={label === "Undo" ? elements.length === 0 : RedoStack.length === 0}
      >
        {label === "Undo" && <Undo2 className="mx-auto" />}
        {label === "Redo" && <Redo2 className="mx-auto" />}
      </button>
    </div>
  );
};

export default Button;
