import { useState } from "react";
import svg from "../assets/ellipse-outline-shape-variant-svgrepo-com.svg";
import { RxEraser } from "react-icons/rx";
import { LuPen } from "react-icons/lu";
import { FaRegCircle, FaMinus, FaRegSquareFull } from "react-icons/fa6";
import { TbOvalVertical } from "react-icons/tb";
import { PiCursorClickBold, PiTextT } from "react-icons/pi";
import { FaRegHand } from "react-icons/fa6";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

import { useStore } from "../store";

const Toolbar = (props) => {
  const setAction = useStore((state) => state.setAction);
  const selectedType = useStore((state) => state.type);
  const setType = useStore((state) => state.setType);
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
      icon: (
        <div className="500 flex items-center justify-center">
          <svg width="40" height="40" className="scale-90">
            <ellipse
              cx="20"
              cy="20"
              rx="10"
              ry="7"
              fill="none"
              stroke="black"
              strokeWidth={"1.7px"}
            />
            Sorry, inline SVG isn't supported by your browser.
          </svg>
        </div>
      ),
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
    <motion.div
      className={twMerge(
        "min-w-[17rem] w-[70%] max-w-[30rem] h-10 bg-blue-50 shadow-lg z-20 flex items-center justify-center rounded-md mt-3 gap-1",
        props.className
      )}
      initial={{ opacity: 0, y: -100, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      transition={{ duration: 0.5 }}
    >
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => {
            setAction(button.name);
            setType(button.type);
            props.clearGizmoOnOperation();
          }}
          className={twMerge(
            `w-8 h-8 grid place-content-center justify-self-center rounded-md flex-auto max-[340px]:text-sm`,
            selectedType === button.type
              ? "bg-blue-200"
              : "bg-blue-50 hover:bg-blue-100",
          )}
        >
          {button.icon}
        </button>
      ))}
    </motion.div>
  );
};

export default Toolbar;
