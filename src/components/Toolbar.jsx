import { useState } from "react";

import { RxEraser } from "react-icons/rx";
import { LuPen } from "react-icons/lu";
import { FaRegCircle, FaMinus , FaRegSquareFull } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

import Draw from "../utils/Draw";
import Erase from "../utils/Erase";
import Shape from "../utils/Shape";

const Toolbar = (props) => {
  const [selected, setSelected] = useState("draw");
  const buttons = [
    {
      name: "draw",
      icon: <LuPen />,
      onClick: () => setSelected("draw")
    },
    {
      name: "erase",
      icon: <RxEraser />,
      onClick: () => setSelected("erase"),
    },
    {
      name: "Rectangle",
      icon: <FaRegSquareFull />,
      onClick: () => setSelected("Rectangle"),
    },
    {
      name: "Line",
      icon: <FaMinus />,
      onClick: () => setSelected("Line"),
    },
    {
      name: "Circle",
      icon: <FaRegCircle />,
      onClick: () => setSelected("Circle"),
    },
    {
      name: "Ellipse",
      icon: <FaRegCircle />,
      onClick: () => setSelected("Ellipse"),
    },
  ];
  props.onToolbarClick(selected);
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
          onClick={button.onClick}
          className={
            twMerge(`w-12 h-8 grid place-content-center justify-self-center rounded-md `,
            selected === button.name ? "bg-blue-200" : "bg-blue-50 hover:bg-blue-100")
          }
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
