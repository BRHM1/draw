import { useState } from "react";
import { useStore } from "../store";
import rough from "roughjs/bundled/rough.esm"

// NOTE: generator.circle(centerX, centerY, diameter, options)
// element = {type: "shape" , x1: x, y1: y, x2: x, y2: y, roughElement: {shape: "rectangle", options: {roughness: 2, fill: "black"}}}
const useShape = () => {
    const elements = useStore((state) => state.elements);
    const addElement = useStore((state) => state.addElement);
    const replaceLastElement = useStore((state) => state.replaceLastElement);

    const options = useStore((state) => state.options);
    const type = useStore((state) => state.type)
    const action = useStore((state) => state.action)

    // console.log("Shape is re-rendering");
    const [isDrawing, setIsDrawing] = useState(false)
    const generator = rough.generator();
    const TYPES = {
        Rectangle: (x1, y1, x2, y2) => generator.rectangle(x1, y1, x2 - x1, y2 - y1, options),
        Line: (x1, y1, x2, y2) => generator.line(x1, y1, x2, y2, options),
        Circle: (x1, y1, x2, y2, diameter) => generator.circle(x1, y1, diameter, options),
        Ellipse: (x1, y1, x2, y2) => generator.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1), Math.abs(y2 - y1), options),
    }


    const createElement = (x1, y1, x2, y2, diameter) => {
        const roughElement = TYPES[type](x1, y1, x2, y2, diameter);
        return { type: action, x1, y1, x2, y2, roughElement, diameter };
    };
    const onMouseDown = (e) => {
        setIsDrawing(true);
        const { clientX, clientY } = e;
        const element = createElement(clientX, clientY, clientX, clientY)
        addElement(element);
    };

    const onMouseMove = (e) => {
        if (!isDrawing) return;
        const { clientX, clientY } = e;
        const index = elements.length - 1;
        const { x1, y1, roughElement } = elements[index] ?? 1;
        const diameter = roughElement.shape === "circle" ? Math.sqrt(Math.abs(clientX - x1) ** 2 + Math.abs(clientY - y1) ** 2) * 2 : 0
        const updatedElement = createElement(x1, y1, clientX, clientY, diameter)
        replaceLastElement(updatedElement);
    };

    const onMouseUp = () => {
        setIsDrawing(false);
        if (elements.length === 0) return;
        let { type, x1, y1, x2, y2, roughElement, diameter } = elements[elements.length - 1]
        const newX1 = roughElement.shape === "circle" ? Math.min(x1, x2) - diameter / 2 : Math.min(x1, x2)
        const newY1 = roughElement.shape === "circle" ? Math.min(y1, y2) - diameter / 2 : Math.min(y1, y2)
        const newX2 = roughElement.shape === "circle" ? Math.min(x1, x2) + diameter / 2 : Math.max(x1, x2)
        const newY2 = roughElement.shape === "circle" ? Math.min(y1, y2) + diameter / 2 : Math.max(y1, y2)
        replaceLastElement({ type, x1: newX1, y1: newY1, x2: newX2, y2: newY2, roughElement })
    };
    return { onMouseDown, onMouseMove, onMouseUp }
}

export default useShape