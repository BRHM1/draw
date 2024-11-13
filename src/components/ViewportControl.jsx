import Button from "./Button";
import { useStore } from "../store";

const ViewportControl = ({
  zoom,
  history,
  clearGizmoOnOperation,
  socket,
  roomID,
  textRef,
}) => {
  const setZoom = useStore((state) => state.setZoom);
  const setRerender = useStore((state) => state.setRerender);
  const undo = () => {
    history.undo(socket, roomID);
    clearGizmoOnOperation();
    setRerender((state) => !state);
  };
  const redo = () => {
    history.redo(socket, roomID);
    clearGizmoOnOperation();
    setRerender((state) => !state);
  };
  return (
    <div className="flex-col justify-center items-center gap-2 mb-2 ml-2 z-50 absolute bottom-0 left-2">
      <div className="flex gap-1">
        <Button label="Undo" callbackFn={undo} hotKey="z" />
        <Button label="Redo" callbackFn={redo} hotKey="y" />
      </div>
      <div className="flex items-center mt-1 justify-center">
        <button
          className="w-10 h-8 flex items-center justify-center bg-blue-50 shadow-lg hover:bg-[#bfdbfe] rounded-e-none border-r-2 border-r-white text-black font-bold py-2 px-4 rounded select-none disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
          onClick={() => {
            clearGizmoOnOperation();
            setZoom(zoom + 0.1);
          }}
        >
          -
        </button>
        <button
          className="w-20 h-8 flex items-center justify-center shadow-lg bg-blue-50 hover:bg-[#bfdbfe] text-black  py-2 px-4 select-none disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
          onClick={() => {
            clearGizmoOnOperation();
            setZoom(1);
          }}
        >
          {zoom === 1 && <span>100 %</span>}
          {zoom === 0.9 && <span>110 %</span>}
          {zoom === 1.1 && <span>90 %</span>}

          {zoom !== 1 && zoom !== 0.9 && zoom !== 1.1 && (
            <span>{`${210 - Math.floor(zoom * 100)} %`}</span>
          )}
        </button>
        <button
          className="w-10 h-8 flex items-center justify-center bg-blue-50 hover:bg-[#bfdbfe] text-black border-l-2 border-l-white font-bold py-2 px-4 shadow-lg rounded rounded-s-none select-none disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
          onClick={() => {
            clearGizmoOnOperation();
            setZoom(zoom - 0.1);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ViewportControl;
