import { useState } from "react";

import { RxEraser } from "react-icons/rx";
import { LuPen } from "react-icons/lu";
import { FaRegCircle, FaMinus, FaRegSquareFull } from "react-icons/fa6";
import { TbOvalVertical } from "react-icons/tb";
import { PiCursorClickBold , PiTextT  } from "react-icons/pi";
import { FaRegHand } from "react-icons/fa6";

import { twMerge } from "tailwind-merge";

import { useStore } from "../store";

const Toolbar = (props) => {
  const setAction = useStore((state) => state.setAction)
  const selectedType = useStore((state) => state.type)
  const setType = useStore((state) => state.setType)
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
      icon: <TbOvalVertical />,
      type: "Ellipse",
    },
    {
      name: "select",
      icon: <PiCursorClickBold />,
      type: "select",
    },
    {
      name: "text",
      icon: <PiTextT />,
      type: "text",
    },
    {
      name: "pan",
      icon: <FaRegHand />,
      type: "pan",
    },
  ];
  return (
    <div
      className={twMerge(
        "min-w-[30rem] h-10 bg-blue-50 z-10 grid place-content-center grid-cols-9 rounded-md mt-3 border border-lime-300 ",
        props.className
      )}
    >
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => {
            setAction(button.name);
            setType(button.type);
          }}
          className={twMerge(
            `w-10 h-8 grid place-content-center justify-self-center rounded-md `,
            selectedType === button.type
              ? "bg-blue-200"
              : "bg-blue-50 hover:bg-blue-100",
            button.type === "Ellipse" ? "text-2xl" : ""
          )}
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
