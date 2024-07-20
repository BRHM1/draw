import { useState } from "react";

import rough from "roughjs/bundled/rough.esm"

// element = {type: "shape" , x1: x, y1: y, x2: x, y2: y, roughElement: {shape: "rectangle", options: {roughness: 2, fill: "black"}}}
const Shape = (elements, setElements, type, action) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const generator = rough.generator();
    const TYPES = {
        Rectangle: (x1, y1, x2, y2) => generator.rectangle(x1, y1, x2 - x1, y2 - y1, { roughness: 2, fill: "black", }),
        Line: (x1, y1, x2, y2) => generator.line(x1, y1, x2, y2),
        Circle: (x1, y1, x2, y2) => generator.circle(x1 , y1 , Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) * 2),
        Ellipse: (x1, y1, x2, y2) => generator.ellipse((x1 + x2) / 2, (y1 + y2) /2, Math.abs(x2 - x1), Math.abs(y2 - y1)),
    }

    const createElement = (x1, y1, x2, y2) => {
        const roughElement = TYPES[type](x1, y1, x2, y2)
        return { type: action, x1, y1, x2, y2, roughElement };
    };
    const onMouseDown = (e) => {
        setIsDrawing(true);
        const { clientX, clientY } = e;
        const element = createElement(clientX, clientY, clientX, clientY)
        setElements((prevElements) => [...prevElements, element]);
    };

    const onMouseMove = (e) => {
        if (!isDrawing) return;
        const { clientX, clientY } = e;
        const index = elements.length - 1;
        const { x1, y1 } = elements[index]?? 1;

        const updatedElement = createElement(x1, y1, clientX, clientY)
        const elementsCopy = [...elements];
        elementsCopy[index] = updatedElement;
        setElements(elementsCopy);
    };

    const onMouseUp = () => {
        setIsDrawing(false);
        let { type, x1, y1, x2, y2, roughElement } = elements[elements.length - 1]
        elements[elements.length - 1] = { type, x1: Math.min(x1, x2), y1: Math.min(y1, y2), x2: Math.max(x1, x2), y2: Math.max(y1, y2), roughElement }
    };
    return { onMouseDown, onMouseMove, onMouseUp }
}

export default Shape