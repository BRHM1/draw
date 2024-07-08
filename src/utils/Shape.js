import { useState } from "react";

import rough from "roughjs/bundled/rough.esm"


const Shape = (elements, setElements, type) => {
    const [isDrawing, setIsDrawing] = useState(false)
    const generator = rough.generator();
    const TYPES = {
        Rectangle: (x1, y1, x2, y2) => generator.rectangle(x1, y1, x2 - x1, y2 - y1, { fill: "black", }),
        Line: (x1, y1, x2, y2) => generator.line(x1, y1, x2, y2),
        Circle: (x1, y1, diameter) => generator.circle(x1, y1, diameter)
    }
    const createElement = (x1, y1, x2, y2) => {
        const roughElement =
            TYPES[type] === "Circle" ?
                TYPES[type](x1, y1, Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2))) :
                TYPES[type](x1, y1, x2, y2)
        return { x1, y1, x2, y2, roughElement };
    };
    const onMouseDown = (e) => {
        setIsDrawing(true);
        const { clientX, clientY } = e;
        const element = type === "Circle" ?
            createElement(clientX, clientY, 0, 0) :
            createElement(clientX, clientY, clientX, clientY)
        setElements((prevElements) => [...prevElements, element]);
    };

    const onMouseMove = (e) => {
        if (!isDrawing) return;
        const { clientX, clientY } = e;
        const index = elements.length - 1;
        const { x1, y1 } = elements[index];
        // circle update
        const updatedElement =
            type === "Circle" ?
                createElement(x1, y1, Math.sqrt(Math.pow(Math.abs(clientX - x1), 2) + Math.pow(Math.abs(clientY - y1), 2)) * 2) :
                createElement(x1, y1, clientX, clientY)
        console.log(updatedElement)
        const elementsCopy = [...elements];
        elementsCopy[index] = updatedElement;
        setElements(elementsCopy);
    };

    const onMouseUp = () => {
        setIsDrawing(false);
    };
    return { onMouseDown, onMouseMove, onMouseUp }
}

export default Shape