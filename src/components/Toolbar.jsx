import { useState } from "react";

import { RxEraser } from "react-icons/rx";
import { LuPen } from "react-icons/lu";
import { FaRegCircle, FaMinus , FaRegSquareFull } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

const Toolbar = (props) => {
  const [selected, setSelected] = useState("draw");
  const buttons = [
    {
      name: "draw",
      type: "draw",
      icon: <LuPen />,
    },
    {
      name: "erase",
      type: "erase",
      icon: <RxEraser />,
    },
    {
      name: "shape",
      icon: <FaRegSquareFull />,
      type: "Rectangle",
    },
    {
      name: "shape",
      type: "Line",
      icon: <FaMinus />,
    },
    {
      name: "shape",
      icon: <FaRegCircle />,
      type: "Circle",
    },
    {
      name: "shape",
      icon: <FaRegCircle />,
      type: "Ellipse",
    },
  ];
  return (
    <div
      className={twMerge(
        "min-w-96 h-10 bg-blue-50 z-10 grid place-content-center grid-cols-6 rounded-md mt-3 border border-lime-300 ",
        props.className
      )}
    >
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => {
            props.onToolbarClick(button.name , button.type)
            setSelected(button.type)
          }}
          className={
            twMerge(`w-12 h-8 grid place-content-center justify-self-center rounded-md `,
            selected === button.type ? "bg-blue-200" : "bg-blue-50 hover:bg-blue-100")
          }
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
