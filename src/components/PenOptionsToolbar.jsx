import { stringify } from "postcss";
import { useState } from "react";

const PenOptionsToolbar = ({ handlePenOptionsToolbarClick }) => {
  const [options, setOptions] = useState({
    size: 8,
    thinning: 0,
    smoothing: 0.5,
    streamline: 0.5,
    easing: (t) =>
      (t -= 0.5) < 0
        ? (0.02 + 0.01 / t) * Math.sin(50 * t)
        : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1,
    simulatePressure: true,
    last: true,
    start: {
      cap: true,
      taper: 0.7,
      easing: (t) =>
        (t -= 0.5) < 0
          ? (0.02 + 0.01 / t) * Math.sin(50 * t)
          : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1,
    },
    end: {
      cap: true,
      taper: 0,
      easing: (t) => t,
    },
  });

  const sliders = [
    { property: "size", min: 1, max: 100, defaultValue: 8, ratio: 1 },
    { property: "thinning", min: 0, max: 100, defaultValue: 0, ratio: 100 },
    { property: "smoothing", min: 0, max: 100, defaultValue: 0.8, ratio: 100 },
    { property: "streamline", min: 0, max: 100, defaultValue: 0.8, ratio: 100 },
  ];

  const handleOptions = (pair) => {
    let newOptions = { ...options, ...pair };
    setOptions(newOptions);
    handlePenOptionsToolbarClick(newOptions);
  };
  return (
    <div className="bg-blue-200 w-56 h-[70%] p-5 rounded-md absolute left-0 top-16 ml-3 font-nova flex-col items-center justify-center">
      <div className="text-lg font-bold">Pen Options</div>
      {sliders.map((slider) => (
        <Slider
          key={slider.property}
          handleOptions={handleOptions}
          min={slider.min}
          max={slider.max}
          property={slider.property}
          defaultValue={slider.defaultValue}
          ratio={slider.ratio}
        />
      ))}

      <Options
        handleOptions={handleOptions}
        min={0}
        max={100}
        defaultValue={0.5}
        ratio={100}
        label={"Start Options"}
      />
      <Options
        handleOptions={handleOptions}
        min={0}
        max={100}
        defaultValue={0.5}
        ratio={100}
        label={"End Options"}
      />
      
      {/* <div className="flex items-center justify-center">
        <label>Simulate Pressure</label>
        <Toggler handleOptions={handleOptions} />
      </div> */}
      {/* <Slider handleOptions={handleOptions} min={1} max={100} property="size" defaultValue={8} /> */}
    </div>
  );
};

const Slider = ({
  handleOptions,
  min,
  max,
  property,
  defaultValue,
  ratio,
}) => {
  const handleChange = (e) => {
    if (!property) return;
    let obj = {};
    console.log(ratio)
    obj[property] = e.target.value ;
    handleOptions(obj);
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

const Options = ({ handleOptions, min, max, defaultValue, ratio, label }) => {
  return (
    <div className="mt-2">
      <label>{label}</label>
      <div className="flex items-center justify-start gap-8 ml-2">
        <label>Cap</label>
        <Toggler handleOptions={handleOptions} />
      </div>
      <div className="flex items-center justify-start gap-4 ml-2">
        <label>Taper</label>
        <Slider
          handleOptions={handleOptions}
          min={min}
          max={max}
          defaultValue={defaultValue}
          ratio={ratio}
        />
      </div>
    </div>
  );
};

const Toggler = ({handleOptions}) => {
  const [isChecked, setIsChecked] = useState(false);
  
  const handleToggle = () => {
      setIsChecked(last => !last);
      handleOptions({ cap: isChecked });
  };

  return (
    <div>
      <label
        htmlFor="toggle"
        className={`relative inline-block w-8 h-4 bg-gray-300 rounded-full transition-transform duration-1000 ease-in-out transform ${
          isChecked ? "bg-[#3b82f680]" : ""
        }`}
      >
        <input
          type="checkbox"
          name="toggle"
          id="toggle"
          className={`absolute top-0 left-0 w-4 h-4 bg-white rounded-full appearance-none cursor-pointer transition-transform duration-300 ease-in-out transform ${
            isChecked ? " translate-x-4" : ""
          }`}
          checked={isChecked}
          onChange={handleToggle}
        />
        <span
          className={`absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full transition-transform duration-300 ease-in-out transform ${
            isChecked ? "translate-x-4" : ""
          }`}
        ></span>
      </label>
    </div>
  );
};

export default PenOptionsToolbar;
