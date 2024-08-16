import { useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'
import Gizmo from './Gizmo'
import { getStroke } from 'perfect-freehand'
import { getSvgPathFromStroke } from './utils'
import { useStore } from '../store'
// onMouseDown => get element at position => getElementAtPos => getting the elementFormula and return element index

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
    },
    path: (x, y, element) => {
        const { path } = element
        const ctx = document.createElement("canvas").getContext("2d")
        ctx.beginPath()
        ctx.stroke(path)
        ctx.closePath()
        return ctx.isPointInPath(path, x, y) ? element : null
    },
    text: (x, y, element) => {
        const { x1, y1, x2, y2 } = element
        return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1 - 20, y2) && y <= Math.max(y1 - 20, y2 - 20) ? element : null
    }
}

const getElementAtPos = (x, y, elements) => {
    if (elements?.length === 0) return null
    for (let i = elements?.length - 1; i >= 0; i--) {
        const element = elements[i]
        if (elementFormula[element?.roughElement?.shape] && elementFormula[element?.roughElement?.shape](x, y, element)) return i
        if (element?.type === "path") {
            if (elementFormula[element?.type](x, y, element)) return i
        }
        if (element?.type === "text") {
            if (elementFormula[element?.type](x, y, element)) return i
        }
    }
    return null
}
const generator = rough.generator()
const TYPES = {
    rectangle: (x1, y1, x2, y2) => generator.rectangle(x1, y1, x2 - x1, y2 - y1, { roughness: 2, fill: "black", }),
    line: (x1, y1, x2, y2) => generator.line(x1, y1, x2, y2),
    circle: (x1, y1, x2, y2) => generator.circle(x1, y1, Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2)) * 2),
    ellipse: (x1, y1, x2, y2) => generator.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.abs(x2 - x1), Math.abs(y2 - y1)),
    path: (x1, y1, x2, y2, updatedPoints) => {
        const stroke = getStroke(updatedPoints);
        const path = getSvgPathFromStroke(stroke);
        const myPath = new Path2D(path);
        return myPath;
    },
    text: (x1, y1, x2, y2, value) => {
        return { value, font: '24px Arial', stroke: 'black', strokeWidth: 1 }
    }
}
const createElement = (x1, y1, x2, y2, type, points) => {
    const roughElement = TYPES[type](x1, y1, x2, y2, points)
    switch (type) {
        case "path":
            return { type: type, x1, y1, x2, y2, points, path: roughElement }
        case "text":
            console.log("from createElement", { type: type, x1, y1, x2, y2, ...roughElement })
            return { type: type, x1, y1, x2, y2, ...roughElement }
        default:
            return { type: type, x1, y1, x2, y2, roughElement }
    }
};

const Select = (contextRef) => {
    const [isMoving, setIsMoving] = useState(false)
    const [selectedElement, setSelectedElement] = useState(null)
    const [firstX, setFirstX] = useState(0)
    const [firstY, setFirstY] = useState(0)
    const [lastElement, setLastElement] = useState(null)
    const elements = useStore(state => state.elements)
    const setElements = useStore(state => state.setElements)
    const insertElement = useStore(state => state.insertElement)

    const moveMouseDown = (e) => {
        const { clientX, clientY } = e
        // 1- get the element at the position of the mouse
        const element = getElementAtPos(clientX, clientY, elements)
        if (element === null) return
        setLastElement(elements[element])

        // 2- draw the gizmo around the selected element
        const gizmo = new Gizmo({ minX: elements[element].x1, minY: elements[element].y1, maxX: elements[element].x2, maxY: elements[element].y2 })
        elements[element].type !== "text" && gizmo.draw(contextRef)

        // 3- set the selected element and the first position of the mouse
        setIsMoving(true)
        setSelectedElement(prev => element)
        setFirstX(clientX)
        setFirstY(clientY)
    }

    const moveMouseMove = (e) => {
        onMouseHover(e)
        const { clientX, clientY } = e
        if (!isMoving) return
        e.target.style.cursor = "move"
        const element = elements[selectedElement]
        const { x1, y1, x2, y2, points } = element

        // 4- calculate the offset between the first position of the mouse and the current position
        const offsetX = clientX - firstX
        const offsetY = clientY - firstY
        const type = element?.roughElement?.shape || element?.type
        console.log(type)
        let updatedElement

        switch (type) {
            case "path":
                // 5- update the points of the path element
                const updatedPoints = points.map(point => [point[0] + offsetX, point[1] + offsetY, point[2]])
                // 6- create the updated path element
                updatedElement = createElement(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY, type, updatedPoints)
                break
            case "text":
                // 5- create the updated text element
                updatedElement = createElement(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY, type, element.value)
                break
            default:
                // 6- create the updated element
                updatedElement = createElement(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY, type)
                break
        }
        // 7- update the elements array with the updated element to make the useEffect re-render the canvas
        const elementsCopy = [...elements]
        elementsCopy[selectedElement] = updatedElement
        setElements(elementsCopy)

        // 8- update the first position of the mouse to the current position
        setFirstX(clientX)
        setFirstY(clientY)
    }

    const moveMouseUp = (e) => {
        setIsMoving(false)
        // insertElement({...lastElement, display: "none"}, selectedElement)
        e.target.style.cursor = "default"
    }

    const onMouseHover = (e) => {
        const { clientX, clientY } = e
        // 9- change the cursor style based on the element at the position of the mouse to indicate that the element is draggable
        const element = getElementAtPos(clientX, clientY, elements)
        if (element !== null) e.target.style.cursor = "move"
        else e.target.style.cursor = "default"
    }
    return { moveMouseDown, moveMouseMove, moveMouseUp }
}
export default Select