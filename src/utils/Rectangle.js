import rough from "roughjs/bundled/rough.esm"
import { useState } from "react";
const Rectangle = (elements ,setElements) => {
    const [isDrawing , setIsDrawing] = useState(false)
    const generator = rough.generator();

    const createElement = (x1, y1, x2, y2) => {
        const roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1, {
            fill: "black",
        });
        return { x1, y1, x2, y2, roughElement };
    };
    const onMouseDown = (e) => {
        setIsDrawing(true);
        const { clientX, clientY } = e;
        const element = createElement(clientX, clientY, clientX, clientY);
        setElements((prevElements) => [...prevElements, element]);
      };
    
      const onMouseMove = (e) => {
        if (!isDrawing) return;
        const { clientX, clientY } = e;
        const index = elements.length - 1;
        const { x1, y1 } = elements[index];
        const updatedElement = createElement(x1, y1, clientX, clientY);
        console.log(updatedElement)
        const elementsCopy = [...elements];
        elementsCopy[index] = updatedElement;
        setElements(elementsCopy);
      };
    
      const onMouseUp = () => {
        setIsDrawing(false);
      };
    return {onMouseDown , onMouseMove, onMouseUp}
}

export default Rectangle