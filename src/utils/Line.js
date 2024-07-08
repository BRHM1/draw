import {useState} from 'react'
import rough from "roughjs/bundled/rough.esm"
const Line = (elements , setElements) => {
    const [isDrawing , setIsDrawing] = useState(false)
    const generator = rough.generator();

    const createElement = (x1, y1, x2, y2) => {
        const roughElement = generator.line(x1, y1, x2, y2);
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
        const elementsCopy = [...elements];
        elementsCopy[index] = updatedElement;
        setElements(elementsCopy);
      };
    
      const onMouseUp = () => {
        setIsDrawing(false);
      };
    return {onMouseDown , onMouseMove, onMouseUp}
}

export default Line