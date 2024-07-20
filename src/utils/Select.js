import { useState } from 'react'
import rough from 'roughjs/bundled/rough.esm'
import Gizmo from './Gizmo'
import { getStroke } from 'perfect-freehand'
import { getSvgPathFromStroke } from './utils'
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
    }
}

const getElementAtPos = (x, y, elements) => {
    if (elements?.length === 0) return null
    for (let i = elements?.length - 1; i >= 0; i--) {
        const element = elements[i]
        if (elementFormula[element?.roughElement?.shape] && elementFormula[element?.roughElement?.shape](x, y, element)) return i
        if (element?.type === "path") {
            return elementFormula[element?.type](x, y, element) ? i : null
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
    path: (x1, y1, x2, y2, points, deltaX, deltaY) => {
        let adjustedPoints = points.map(([x, y, pressure]) => {
            return [x + deltaX, y + deltaY, pressure];
        });
        const stroke = getStroke(adjustedPoints);
        const path = getSvgPathFromStroke(stroke);
        const myPath = new Path2D(path);
        return myPath;
    }
}
const createElement = (x1, y1, x2, y2, type, points, clientX, clientY) => {
    const roughElement = TYPES[type](x1, y1, x2, y2, points, clientX, clientY)
    return type !== "path" ?
        { type: type, x1, y1, x2, y2, roughElement } :
        { type: type, x1, y1, x2, y2, points, path: roughElement }
};

const Select = (elements, setElements, contextRef) => {
    const [isMoving, setIsMoving] = useState(false)
    const [selectedElement, setSelectedElement] = useState(null)
    const [firstX, setFirstX] = useState(0)
    const [firstY, setFirstY] = useState(0)

    const moveMouseDown = (e) => {
        const { clientX, clientY } = e
        const element = getElementAtPos(clientX, clientY, elements)
        console.log("worked again")
        if (element === null) return
        console.log(elements[element].x1, elements[element].y1, elements[element].x2, elements[element].y2)
        const gizmo = new Gizmo({ minX: elements[element].x1, minY:elements[element].y1, maxX: elements[element].x2, maxY:elements[element].y2 })
        gizmo.draw(contextRef)
        if (element !== null) {
            setIsMoving(true)
            setSelectedElement(prev => element)
            setFirstX(clientX - elements[element].x1)
            setFirstY(clientY - elements[element].y1)
        }
    }
    const moveMouseMove = (e) => {
        onMouseHover(e)
        if (!isMoving) return
        e.target.style.cursor = "move"
        const { clientX, clientY } = e
        const element = elements[selectedElement]
        const { x1, y1, x2, y2, points } = element
        const offsetX = clientX - x1
        const offsetY = clientY - y1
        const type = element?.roughElement?.shape || element?.type
        let updatedElement
        if (type !== "path") updatedElement = createElement(x1 + offsetX - firstX, y1 + offsetY - firstY, x2 + offsetX - firstX, y2 + offsetY - firstY, type)
        if (type === "path") updatedElement = createElement(x1 + offsetX - firstX, y1 + offsetY - firstY, x2 + offsetX - firstX, y2 + offsetY - firstY, type, points, clientX - firstX, clientY - firstY)
        const elementsCopy = [...elements]
        elementsCopy[selectedElement] = updatedElement
        setElements(elementsCopy)
    }
    const moveMouseUp = (e) => {
        setIsMoving(false)
        e.target.style.cursor = "default"
    }

    const onMouseHover = (e) => {
        const { clientX, clientY } = e
        const element = getElementAtPos(clientX, clientY, elements)
        if (element !== null) e.target.style.cursor = "move"
        else e.target.style.cursor = "default"
    }
    return { moveMouseDown, moveMouseMove, moveMouseUp }
}
export default Select