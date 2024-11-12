import { useState, useRef } from "react";
import { CgBorderStyleDashed } from "react-icons/cg";
import { PiEmptyLight } from "react-icons/pi";
import { TbLineDotted } from "react-icons/tb";
import { PiDotsNineBold } from "react-icons/pi";
import { TfiLayoutLineSolid } from "react-icons/tfi";
import { useStore } from "../store";

const OptionsToolbar = () => {
  const setFeildInOptions = useStore((state) => state.setFeildInOptions);

  return (
    <div className="bg-blue-50 shadow-lg w-44 h-[58%] p-5 rounded-md absolute left-0 top-16 ml-3 font-nova flex-col items-center justify-center z-20">
      <StrokeOptions handleOptions={setFeildInOptions} />
      <BackgroundOptions handleOptions={setFeildInOptions} />
      <FillOptions handleOptions={setFeildInOptions} />
      <StrokeWidthOptions handleOptions={setFeildInOptions} />
      <StrokeStyleOptions handleOptions={setFeildInOptions} />
      <SloppinessOptions handleOptions={setFeildInOptions} />
      <RandomnessSlider handleOptions={setFeildInOptions} />
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
    handleOptions("stroke", options[optionsId]);
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
    handleOptions("fill", options[optionsId]);
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

// TODO: Add the fill options
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
    if (options[optionsId] === "transparent") {
      handleOptions("fill", "");
    } else {
      handleOptions("fill", "#000000");
      handleOptions("fillStyle", options[optionsId]);
    }
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

const StrokeWidthOptions = ({ handleOptions }) => {
  const [strokeWidth, setStrokeWidth] = useState(1);
  const options = {
    1: 1,
    2: 2,
    3: 4,
  };
  const handleStrokeWidth = (e) => {
    let optionsId = e.target.id;
    setStrokeWidth(options[optionsId]);
    handleOptions("strokeWidth", options[optionsId]);
  };
  return (
    <div className="mt-1">
      <div>Stroke Width</div>
      <div className="flex items-center justify-start gap-2">
        <button
          className={`w-6 h-6 flex items-center justify-center ${
            strokeWidth === 1
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          id="1"
          onClick={handleStrokeWidth}
        >
          <div className="h-[1px] w-4 bg-black"></div>
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center ${
            strokeWidth === 2
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          id="2"
          onClick={handleStrokeWidth}
        >
          <div className="h-[2px] w-4 bg-black"></div>
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center ${
            strokeWidth === 4
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          id="3"
          onClick={handleStrokeWidth}
        >
          <div className="h-[4px] w-4 bg-black"></div>
        </button>
      </div>
    </div>
  );
};

const StrokeStyleOptions = ({ handleOptions }) => {
  const [strokeStyle, setStrokeStyle] = useState("solid");
  const options = {
    1: "solid",
    2: "dotted",
    3: "dashed",
  };
  const map = {
    solid: [1, 0],
    dotted: [1, 2],
    dashed: [4, 4],
  };
  const handleStrokeStyle = (e) => {
    let optionsId = e.target.id;
    setStrokeStyle(options[optionsId]);
    handleOptions("strokeLineDash", map[options[optionsId]]);
  };
  return (
    <div className="mt-1">
      <div>Stroke Style</div>
      <div className="flex items-center justify-start gap-3">
        <button
          className={`w-6 h-6 flex items-center justify-center ${
            strokeStyle === "solid"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleStrokeStyle}
          id="1"
        >
          <TfiLayoutLineSolid className="pointer-events-none" />
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center ${
            strokeStyle === "dotted"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleStrokeStyle}
          id="2"
        >
          <TbLineDotted className="pointer-events-none" />
        </button>
        <button
          className={`w-6 h-6 flex items-center justify-center ${
            strokeStyle === "dashed"
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleStrokeStyle}
          id="3"
        >
          <CgBorderStyleDashed className="pointer-events-none" />
        </button>
      </div>
    </div>
  );
};

const SloppinessOptions = ({ handleOptions }) => {
  const [Sloppiness, setSloppiness] = useState(1);
  const options = {
    1: 1,
    2: 2,
    3: 4,
  };
  const handleSloppiness = (e) => {
    let optionsId = e.target.id;
    setSloppiness(options[optionsId]);
    handleOptions("roughness", options[optionsId]);
  };
  return (
    <div className="mt-1">
      <div>Sloppiness</div>
      <div className="flex items-center justify-start gap-3">
        <button
          className={`w-6 h-6 ${
            Sloppiness === 1
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleSloppiness}
          id="1"
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
              d="M2.5 12.038c1.655-.885 5.9-3.292 8.568-4.354 2.668-1.063.101 2.821 1.32 3.104 1.218.283 5.112-1.814 5.112-1.814"
              strokeWidth="1.25"
            ></path>
          </svg>
        </button>
        <button
          className={`w-6 h-6 ${
            Sloppiness === 2
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleSloppiness}
          id="2"
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
              d="M2.5 12.563c1.655-.886 5.9-3.293 8.568-4.355 2.668-1.062.101 2.822 1.32 3.105 1.218.283 5.112-1.814 5.112-1.814m-13.469 2.23c2.963-1.586 6.13-5.62 7.468-4.998 1.338.623-1.153 4.11-.132 5.595 1.02 1.487 6.133-1.43 6.133-1.43"
              strokeWidth="1.25"
            ></path>
          </svg>
        </button>
        <button
          className={`w-6 h-6 ${
            Sloppiness === 4
              ? "border-2 border-blue-400 rounded-md transition-all"
              : ""
          }`}
          onClick={handleSloppiness}
          id="3"
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
              d="M2.5 11.936c1.737-.879 8.627-5.346 10.42-5.268 1.795.078-.418 5.138.345 5.736.763.598 3.53-1.789 4.235-2.147M2.929 9.788c1.164-.519 5.47-3.28 6.987-3.114 1.519.165 1 3.827 2.121 4.109 1.122.281 3.839-2.016 4.606-2.42"
              strokeWidth="1.25"
            ></path>
          </svg>
        </button>
        {/* FUTURE: Add a number input for the sloppiness */}
        {/* <input type="number" min={1} max={10} className="w-10 h-6"/> */}
      </div>
    </div>
  );
};

const RandomnessSlider = ({ handleOptions }) => {
  const handleRandomness = (e) => {
    handleOptions( "maxRandomnessOffset", Math.floor((e.target.value / 100) * 10));
  };
  return (
    <div className="mt-1">
      <div>Randomness</div>
      <div>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue={0}
          onChange={handleRandomness}
        />
      </div>
    </div>
  );
};

export default OptionsToolbar;
