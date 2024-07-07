import { RxEraser } from "react-icons/rx";
import { twMerge } from "tailwind-merge";
const Toolbar = (props) => {
  // const classes = twMerge("flex justify-center items-center", props.className)
  const buttons = [
    {
      name: "draw",
      icon: <RxEraser />,
      onClick: () => console.log("draw"),
    },
    {
      name: "erase",
      icon: <RxEraser />,
      onClick: () => console.log("erase"),
    },
  ];

  return (
    <div 
      className={twMerge("w-96 h-10 bg-blue-50 z-10 flex justify-center content-center gap-4 rounded-md mt-3", props.className)}
    >
      {buttons.map((button , index) => (
        <button 
        key={index} 
        onClick={button.onClick}
        className="w-10 h-10 bg-blue-400"
        >
          {button.icon}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
