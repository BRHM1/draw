import { useState, useRef } from "react";
import { PiDotsNineBold, PiEmptyLight } from "react-icons/pi";
import { IoCopy } from "react-icons/io5";
import rough from "roughjs/bundled/rough.esm";

const SelectionOptionsToolbar = ({ editSelectedElements, Duplicate }) => {
  const handleOptions = (values) => {
    editSelectedElements(values);
  };
  return (
    <div className="bg-blue-50 w-44 h-[54%] shadow-md p-5 rounded-md absolute left-0 top-16 ml-3 font-poppins flex-col items-center justify-center z-20">
      {/* sliders for stroke width and path width */}
      <Slider
        handleOptions={handleOptions}
        min={0}
        max={100}
        property="Border Width"
        defaultValue={50}
        ratio={100}
      />
      <Slider
        handleOptions={handleOptions}
        min={0}
        max={100}
        property="Stroke Width"
        defaultValue={50}
        ratio={100}
      />
      <StrokeOptions handleOptions={handleOptions} />
      <BackgroundOptions handleOptions={handleOptions} />
      <FillOptions handleOptions={handleOptions} />
      <hr className="mt-5 mb-2 border border-t-1 border-slate-400" />
      <Actions handleOptions={handleOptions} Duplicate={Duplicate} />
    </div>
  );
};

const Slider = ({ handleOptions, min, max, property, defaultValue, ratio }) => {
  const handleChange = (e) => {
    handleOptions({ [property]: e.target.value / ratio });
  };

  return (
    <div className="mt-1">
      <div>{property}</div>
      <div>
        <input
          type="range"
          min={min}
          max={max}
          defaultValue={defaultValue}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

const FillOptions = ({ handleOptions }) => {
  const [fillStyle, setFillStyle] = useState("solid");
  const options = {
    1: "hachure",
    2: "cross-hatch",
    3: "solid",
    4: "dots",
    5: "transparent",
  };
  const handleFillStyle = (e) => {
    let optionsId = e.target.id;
    handleOptions({ fillStyle: options[optionsId] });
    setFillStyle(options[optionsId]);
  };
  return (
    <div className="mt-1">
      <div>Fill Style</div>
      <div className="flex items-center justify-start gap-1">
        <button
          type="button"
          title="Hachure (Alt-Click)"
          data-testid="fill-hachure"
          id="1"
          className={`w-6 h-6 ${
            fillStyle === "hachure"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleFillStyle}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 20 20"
            className="pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
              stroke="currentColor"
              strokeWidth="1.25"
            ></path>
            <mask
              id="FillHachureIcon"
              maskUnits="userSpaceOnUse"
              x="2"
              y="2"
              width="16"
              height="16"
              style={{ maskType: "alpha" }}
            >
              <path
                d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.25"
              ></path>
            </mask>
            <g mask="url(#FillHachureIcon)">
              <path
                d="M2.258 15.156 15.156 2.258M7.324 20.222 20.222 7.325m-20.444 5.35L12.675-.222m-8.157 18.34L17.416 5.22"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </g>
          </svg>
        </button>
        <button
          type="button"
          title="Cross-hatch"
          data-testid="fill-cross-hatch"
          id="2"
          className={`w-6 h-6 ${
            fillStyle === "cross-hatch"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleFillStyle}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 20 20"
            className="pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g clipPath="url(#a)">
              <path
                d="M5.879 2.625h8.242a3.254 3.254 0 0 1 3.254 3.254v8.242a3.254 3.254 0 0 1-3.254 3.254H5.88a3.254 3.254 0 0 1-3.254-3.254V5.88a3.254 3.254 0 0 1 3.254-3.254Z"
                stroke="currentColor"
                strokeWidth="1.25"
              ></path>
              <mask
                id="FillCrossHatchIcon"
                maskUnits="userSpaceOnUse"
                x="-1"
                y="-1"
                width="22"
                height="22"
                style={{ maskType: "alpha" }}
              >
                <path
                  d="M2.426 15.044 15.044 2.426M7.383 20 20 7.383M0 12.617 12.617 0m-7.98 17.941L17.256 5.324m-2.211 12.25L2.426 4.956M20 12.617 7.383 0m5.234 20L0 7.383m17.941 7.98L5.324 2.745"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </mask>
              <g mask="url(#FillCrossHatchIcon)">
                <path
                  d="M14.121 2H5.88A3.879 3.879 0 0 0 2 5.879v8.242A3.879 3.879 0 0 0 5.879 18h8.242A3.879 3.879 0 0 0 18 14.121V5.88A3.879 3.879 0 0 0 14.121 2Z"
                  fill="currentColor"
                ></path>
              </g>
            </g>
            <defs>
              <clipPath id="a">
                <path fill="#fff" d="M0 0h20v20H0z"></path>
              </clipPath>
            </defs>
          </svg>
        </button>
        <button
          type="button"
          title="Solid"
          data-testid="fill-solid"
          id="3"
          className={`w-6 h-6 ${
            fillStyle === "solid"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleFillStyle}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            role="img"
            viewBox="0 0 20 20"
            className="pointer-events-none"
            fill="currentColor"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g clipPath="url(#a)">
              <path
                d="M4.91 2.625h10.18a2.284 2.284 0 0 1 2.285 2.284v10.182a2.284 2.284 0 0 1-2.284 2.284H4.909a2.284 2.284 0 0 1-2.284-2.284V4.909a2.284 2.284 0 0 1 2.284-2.284Z"
                stroke="currentColor"
                strokeWidth="1.25"
              ></path>
            </g>
            <defs>
              <clipPath id="a">
                <path fill="#fff" d="M0 0h20v20H0z"></path>
              </clipPath>
            </defs>
          </svg>
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center text-black ${
            fillStyle === "dots"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          id="4"
          onClick={handleFillStyle}
        >
          <PiDotsNineBold className="pointer-events-none w-5 h-5" />
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center text-black ${
            fillStyle === "transparent"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          id="5"
          onClick={handleFillStyle}
        >
          <PiEmptyLight className="pointer-events-none w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const BackgroundOptions = ({ handleOptions }) => {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const inputRef = useRef(null);
  const options = {
    1: "#000000",
    2: "#fde047",
    3: "#ef4444",
    4: inputRef?.current?.value || "#000000",
  };
  const handleColorChange = (e) => {
    let optionsId = e.target.id;
    setBackgroundColor(options[optionsId]);
    e.target.value
      ? handleOptions({ fill: e.target.value })
      : handleOptions({ fill: options[optionsId] });
  };
  return (
    <div className="mt-1">
      <div className="">Fill Color</div>
      <div className="flex items-center justify-start gap-1">
        <button
          onClick={handleColorChange}
          id="1"
          className={`w-6 h-6 bg-black rounded-full ${
            backgroundColor === "#000000" ? "scale-110 transition-all " : ""
          }`}
        ></button>
        <button
          onClick={handleColorChange}
          id="2"
          className={`w-6 h-6 bg-yellow-300 rounded-full ${
            backgroundColor === "#fde047" ? "scale-110 transition-all " : ""
          }`}
        ></button>
        <button
          onClick={handleColorChange}
          id="3"
          className={`w-6 h-6 bg-red-500 rounded-full ${
            backgroundColor === "#ef4444" ? "scale-110 transition-all " : ""
          }`}
        ></button>
        <input
          onChange={handleColorChange}
          id="4"
          type="color"
          className="ml-2 hover:cursor-pointer"
          ref={inputRef}
        />
      </div>
    </div>
  );
};

const StrokeOptions = ({ handleOptions }) => {
  const inputRef = useRef(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const options = {
    1: "#000000",
    2: "#fde047",
    3: "#ef4444",
    4: inputRef?.current?.value || "#000000",
  };
  const handleColorChange = (e) => {
    let optionsId = e.target.id;
    setStrokeColor(options[optionsId]);
    e.target.value
      ? handleOptions({ strokeColor: e.target.value })
      : handleOptions({ strokeColor: options[optionsId] });
  };
  return (
    <div>
      <div className="">Stroke</div>
      <div className="flex items-center justify-start gap-1">
        <button
          onClick={handleColorChange}
          id="1"
          className={`w-6 h-6 bg-black rounded-full ${
            strokeColor === "#000000" ? "scale-110 transition-all " : ""
          }`}
        ></button>
        <button
          onClick={handleColorChange}
          id="2"
          className={`w-6 h-6 bg-yellow-300 rounded-full ${
            strokeColor === "#fde047" ? "scale-110 transition-all" : ""
          }`}
        ></button>
        <button
          onClick={handleColorChange}
          id="3"
          className={`w-6 h-6 bg-red-500 rounded-full ${
            strokeColor === "#ef4444" ? "scale-110 transition-all" : ""
          }`}
        ></button>
        <input
          onChange={handleColorChange}
          id="4"
          type="color"
          className="ml-2 hover:cursor-pointer"
          ref={inputRef}
        />
      </div>
    </div>
  );
};

const Actions = ({ handleOptions, Duplicate }) => {
  const generator = rough.generator();
  return (
    <div>
      <div className="">Actions</div>
      <div className="flex items-center justify-start gap-1">
        <button
          onClick={() => Duplicate(generator)}
          className="w-6 h-6 flex items-center justify-center bg-blue-100 hover:bg-blue-300 transition-all rounded-md shadow-md"
        >
          <IoCopy />
        </button>
      </div>
    </div>
  );
};

export default SelectionOptionsToolbar;
