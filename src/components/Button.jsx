import { useStore } from "../store";

const Button = ({ label }) => {
    const Undo = useStore((state) => state.Undo);
    const Redo = useStore((state) => state.Redo);
    const elements = useStore((state) => state.elements);
    const RedoStack = useStore((state) => state.RedoStack);
  return (
    <button 
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded select-none disabled:opacity-50 disabled:hover:bg-blue-500"
    onClick={() => label === "Undo" ? Undo() : Redo()}
    disabled={label === "Undo" ? elements.length === 0 : RedoStack.length === 0}
    >
      {label}
    </button>
  );
};

export default Button;
