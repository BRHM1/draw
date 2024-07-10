import { useState } from 'react'

const Select = (contextRef, elements, started, updateStarted) => {
    // const [isMoving , setIsMoving] = useState(false)
    console.log("from select", elements)
    const elementFormula = {
        rectangle: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            return (x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.min(y1, y2)) ? element : null
        },
        line: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const area = 0.5 * Math.abs((x1 * y2) + (x * y1) + (x2 * y) - (x2 * y1) - (x1 * y) - (x * y2));
            return area < 1 ? element : null
        },
        circle: (x, y, element) => {
            const { x1, y1, x2, y2 } = element
            const circleCenter = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 }
            const a = circleCenter.x - x
            const b = circleCenter.y - y
            const c = Math.sqrt(a * a + b * b)
            return c <= Math.abs(x2 - x1) / 2 ? element : null
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
            return elementFormula[element?.roughElement?.shape](x, y, element)
        }
        return null
    }

    const moveMouseDown = (e) => {
        const { clientX, clientY } = e
        // get the element 
        const element = getElementAtPos(clientX, clientY, elements)
        if (element) updateStarted()
        console.log("from selection", element)
    }
    const moveMouseMove = (e) => {
        if (!started) return
    }
    const moveMouseUp = () => {
        updateStarted()
    }
    return { moveMouseDown, moveMouseMove, moveMouseUp }
}

export default Select