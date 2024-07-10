import { useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'
const Select = (elements, setElements) => {
    const [isMoving, setIsMoving] = useState(false)
    const [selectedElement, setSelectedElement] = useState(null)
    const [firstX, setFirstX] = useState(0)
    const [firstY, setFirstY] = useState(0)
    const generator = rough.generator()

    const TYPES = {
        rectangle: (x1, y1, x2, y2) => generator.rectangle(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1), { roughness: 2, fill: "black", }),
        line: (x1, y1, x2, y2) => generator.line(x1, y1, x2, y2),
        circle: (x1, y1, x2, y2) => generator.circle((x1 + x2) / 2, (y1 + y2) /2, Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) * 2),
        ellipse: (x1, y1, x2, y2) => generator.ellipse((x1 + x2) / 2, (y1 + y2) /2, Math.abs(x2 - x1), Math.abs(y2 - y1)),
    }
    const createElement = (x1, y1, x2, y2, type) => {
        const roughElement = TYPES[type](x1, y1, x2, y2)
        return { x1, y1, x2, y2, roughElement };
    };
    // a set of functions to check if the mouse is on the element
    const elementFormula = {
        rectangle: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2) ? element : null
        },
        line: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const a = { x: x1, y: y1 }
            const b = { x: x2, y: y2 }
            const c = { x, y }
            const offset = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
            const a1 = Math.sqrt(Math.pow(c.x - a.x, 2) + Math.pow(c.y - a.y, 2))
            const a2 = Math.sqrt(Math.pow(c.x - b.x, 2) + Math.pow(c.y - b.y, 2))
            return a1 + a2 >= offset - 0.5 && a1 + a2 <= offset + 0.5 ? element : null
        },
        circle: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const center = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
            const distance = Math.hypot(Math.abs(x - center.x), Math.abs(y - center.y))
            return distance <= Math.abs(x2 - x1) * 1.5 ? element : null
        },
        ellipse: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const ellipseCenter = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
            const a = Math.abs(x2 - x1) / 2
            const b = Math.abs(y2 - y1) / 2
            const c = Math.sqrt(Math.pow(x - ellipseCenter.x, 2) / Math.pow(a, 2) + Math.pow(y - ellipseCenter.y, 2) / Math.pow(b, 2))
            return c <= 1 ? element : null
        }
    }

    const getElementAtPos = (x, y, elements) => {
        if (elements?.length === 0) return null
        for (let i = elements?.length - 1; i >= 0; i--) {
            const element = elements[i]
            if (elementFormula[element?.roughElement?.shape](x, y, element)) return i
        }
        return null
    }

    const moveMouseDown = (e) => {
        const { clientX, clientY } = e
        const element = getElementAtPos(clientX, clientY, elements)
        if (element !== null) {
            setIsMoving(true)
            setSelectedElement(prev => element)
            setFirstX(clientX- elements[element].x1)
            setFirstY(clientY- elements[element].y1)
        }
    }
    const moveMouseMove = (e) => {
        if (!isMoving) return
        const { clientX, clientY } = e
        const element = elements[selectedElement]
        const { x1, y1, x2, y2 } = element
        console.log(element)
        const offsetX = clientX - x1
        const offsetY = clientY - y1
        const type = element?.roughElement?.shape
        const updatedElement = createElement(x1 + offsetX - firstX, y1 + offsetY - firstY, x2 + offsetX - firstX, y2 + offsetY - firstY, type)
        const elementsCopy = [...elements]
        elementsCopy[selectedElement] = updatedElement
        setElements(elementsCopy)
    }
    const moveMouseUp = () => {
        setIsMoving()
    }
    return { moveMouseDown, moveMouseMove, moveMouseUp }
}

export default Select