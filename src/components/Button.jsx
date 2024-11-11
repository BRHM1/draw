import { useStore } from "../store";

const Button = ({ label, history, clearGizmoOnOperation, socket, roomID }) => {
  const elements = useStore((state) => state.elements);
  const setRerender = useStore((state) => state.setRerender);

  const undo = () => {
    history.undo(socket, roomID);
    clearGizmoOnOperation();
    setRerender(state => !state);
  };
  const redo = () => {
    history.redo(socket, roomID);
    clearGizmoOnOperation();
    setRerender(state => !state);
  };
  return (
    <button
      className="bg-blue-500 w-20 font-nova hover:bg-blue-700 text-white font-bold py-2 px-4 rounded select-none disabled:opacity-50 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
      onClick={() => (label === "Undo" ? undo() : redo())}
      // disabled={label === "Undo" ? elements.length === 0 : RedoStack.length === 0}
    >
      {label}
    </button>
  );
};

export default Button;
