import { getSvgPathFromStroke } from "../utils/utils"
import { getStroke } from "perfect-freehand";
import { wrappedLines } from "../utils/utils";
export class Shape {
    constructor(x1, y1, width, height, options, rotation) {
        this.x1 = x1
        this.y1 = y1
        this.width = width
        this.height = height
        this.options = options
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        this.hidden = false
    }

    draw() {
        return null
    }

    updateDimensions() {
        return null
    }

    Move() {
        return null
    }

    Resize() {
        return null
    }

    saveLastState() {
        return null
    }

    Refine() {
        return null
    }
}


export class Circle extends Shape {
    constructor(x1, y1, radius, options, roughElement, centerX, centerY, rotation) {
        super(x1, y1, radius * 2, radius * 2, options, rotation)
        this.roughElement = roughElement
        this.centerX = centerX
        this.centerY = centerY
        this.radius = radius
        this.type = "circle"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }
    // x1 = centerX - radius
    // y1 = centerY - radius
    updateDimensions(x2, y2, generator) {
        this.radius = Math.floor(Math.sqrt((this.centerX - x2) ** 2 + (this.centerY - y2) ** 2))
        this.x1 = (this.centerX - this.radius)
        this.y1 = (this.centerY - this.radius)
        this.width = this.radius * 2
        this.height = this.radius * 2
        this.#updateRoughElement(generator)
    }
    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.centerX += dx
        this.centerY += dy
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.circle(this.centerX, this.centerY, this.radius * 2, this.options)
    }

    setType(type) {
        this.type = type
    }

    Resize(dx, dy, generator, resizingPoint, mouseDir) {
        let { left, right, up, down } = mouseDir
        let radiusDiff = Math.sqrt(dx ** 2 + dy ** 2) / 2
        switch (resizingPoint) {
            case "topLeft":
                this.radius = left || up ? this.radius + radiusDiff : this.radius - radiusDiff
                break
            case "topRight":
                this.radius = right || up ? this.radius + radiusDiff : this.radius - radiusDiff
                break
            case "bottomLeft":
                this.radius = left || down ? this.radius + radiusDiff : this.radius - radiusDiff
                break
            case "bottomRight":
                this.radius = right || down ? this.radius + radiusDiff : this.radius - radiusDiff
                break
            default:
                break
        }
        this.centerY += dy / 2
        this.centerX += dx / 2
        this.x1 = this.centerX - this.radius
        this.y1 = this.centerY - this.radius
        this.width = this.radius * 2
        this.height = this.radius * 2
        this.#updateRoughElement(generator)
    }

    saveLastState() {
        const lastState = new Circle(this.x1, this.y1, this.radius, this.options, this.roughElement, this.centerX, this.centerY, this.rotation)
        lastState.setType("event")
        return lastState
    }
}

export class Ellipse extends Shape {
    constructor(x1, y1, width, height, options, roughElement, rotation, centerX, centerY) {
        super(x1, y1, width, height, options, rotation)
        this.roughElement = roughElement
        this.centerX = this.x1 + this.width / 2
        this.centerY = this.y1 + this.height / 2
        this.type = "ellipse"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }
    updateDimensions(x2, y2, generator) {
        this.centerX = Math.floor(this.x1 + this.width / 2)
        this.centerY = Math.floor(this.y1 + this.height / 2)
        this.width = x2 - this.x1
        this.height = y2 - this.y1
        this.#updateRoughElement(generator)
    }
    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.centerX += dx
        this.centerY += dy
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.ellipse(this.centerX, this.centerY, this.width, this.height, this.options)
    }

    Resize(dx, dy, generator, resizingPoint) {
        switch (resizingPoint) {
            case "topLeft":
                this.x1 += dx
                this.y1 += dy
                this.width -= dx
                this.height -= dy
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            case "topRight":
                this.y1 += dy
                this.width += dx
                this.height -= dy
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            case "bottomLeft":
                this.x1 += dx
                this.width -= dx
                this.height += dy
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            case "bottomRight":
                this.width += dx
                this.height += dy
                this.centerX = this.x1 + this.width / 2
                this.centerY = this.y1 + this.height / 2
                break
            default:
                break
        }
        this.#updateRoughElement(generator)
    }

    Refine() {
        const capture = { x1: this.x1, y1: this.y1, width: this.width, height: this.height }
        this.x1 = Math.min(capture.x1, capture.x1 + capture.width)
        this.y1 = Math.min(capture.y1, capture.y1 + capture.height)
        this.width = Math.abs(capture.width)
        this.height = Math.abs(capture.height)
    }

    saveLastState() {
        return new Ellipse(this.x1, this.y1, this.width, this.height, this.options, this.roughElement, this.rotation, this.centerX, this.centerY)
    }
}

export class Line extends Shape {
    constructor(x1, y1, x2, y2, options, roughElement, rotation) {
        super(x1, y1, x2, y2, options, rotation)
        this.roughElement = roughElement
        this.type = "line"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }
    updateDimensions(x2, y2, generator) {
        this.x2 = x2
        this.y2 = y2
        this.width = x2 - this.x1
        this.height = y2 - this.y1
        this.#updateRoughElement(generator)
    }
    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.x2 += dx
        this.y2 += dy
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.line(this.x1, this.y1, this.x2, this.y2, this.options)
    }

    Resize(dx, dy, generator, resizingPoint) {
        switch (resizingPoint) {
            case "topLeft":
                this.x1 += dx
                this.y1 += dy
                this.width -= dx
                this.height -= dy
                break
            case "topRight":
                this.y1 += dy
                this.x2 += dx
                this.width += dx
                this.height -= dy
                break
            case "bottomLeft":
                this.x1 += dx
                this.y2 += dy
                this.width -= dx
                this.height += dy
                break
            case "bottomRight":
                this.x2 += dx
                this.y2 += dy
                this.width += dx
                this.height += dy
                break
            default:
                break
        }
        this.#updateRoughElement(generator)
    }

    Refine() {
        const capture = { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 }
        this.x1 = Math.min(capture.x1, capture.x2)
        this.y1 = Math.min(capture.y1, capture.y2)
        this.x2 = Math.max(capture.x1, capture.x2)
        this.y2 = Math.max(capture.y1, capture.y2)
    }

    saveLastState() {
        return new Line(this.x1, this.y1, this.x2, this.y2, this.options, this.roughElement, this.rotation)
    }
}

// width and height always positive
export class Rectangle extends Shape {
    // in this case x1, y1, width, height are the coordinates of the rectangle
    constructor(x1, y1, width, height, options, roughElement, rotation) {
        super(x1, y1, width, height, options, rotation)
        this.roughElement = roughElement
        this.type = "rectangle"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }

    updateDimensions(x2, y2, generator) {
        this.width = Number((x2 - this.x1).toFixed(2))
        this.height = Number((y2 - this.y1).toFixed(2))
        this.#updateRoughElement(generator)
    }

    Move(dx, dy, generator) {
        this.x1 += dx
        this.y1 += dy
        this.#updateRoughElement(generator)
    }
    #updateRoughElement(generator) {
        this.roughElement = generator.rectangle(this.x1, this.y1, this.width, this.height, this.options)
    }

    Resize(dx, dy, generator, resizingPoint) {
        switch (resizingPoint) {
            case "topLeft":
                this.x1 += dx
                this.y1 += dy
                this.width -= dx
                this.height -= dy
                break
            case "topRight":
                this.y1 += dy
                this.width += dx
                this.height -= dy
                break
            case "bottomLeft":
                this.x1 += dx
                this.width -= dx
                this.height += dy
                break
            case "bottomRight":
                this.width += dx
                this.height += dy
                break
            default:
                break
        }
        this.#updateRoughElement(generator)
    }

    Refine() {
        const capture = { x1: this.x1, y1: this.y1, width: this.width, height: this.height }
        this.x1 = Math.min(capture.x1, capture.x1 + capture.width)
        this.y1 = Math.min(capture.y1, capture.y1 + capture.height)
        this.width = Math.abs(capture.width)
        this.height = Math.abs(capture.height)
    }

    saveLastState() {
        return new Rectangle(this.x1, this.y1, this.width, this.height, this.options, this.roughElement, this.rotation)
    }
}

// width and height always positive
export class Path extends Shape {
    // in this case x1, y1, x2, y2 are the bounding box of the path
    constructor(x1, y1, x2, y2, path, options, color, fillFlag, fillStyle, points, strokeStyle, rotation) {
        super(x1, y1, x2, y2, options, rotation)
        this.x2 = x2
        this.y2 = y2
        this.path = path
        this.type = "path"
        this.color = color
        this.fillFlag = fillFlag
        this.fillStyle = fillStyle
        this.points = points
        this.strokeStyle = strokeStyle
    }
    draw(context) {
        context.strokeStyle = this.strokeStyle
        context.fillStyle = this.color
        const stroke = getStroke(this.points, this.options)
        const path = getSvgPathFromStroke(stroke);
        context.fill(new Path2D(path))
    }
    updateDimensions(x2, y2) {
        this.x1 = Math.min(this.x1, x2)
        this.y1 = Math.min(this.y1, y2)
        this.x2 = Math.max(this.x2, x2)
        this.y2 = Math.max(this.y2, y2)
        this.width = this.x2 - this.x1
        this.height = this.y2 - this.y1
        this.points.push({ x: x2, y: y2 })
    }

    Resize(dx, dy) {
        this.x2 += dx
        this.y2 += dy
        this.points = this.points.map(({ x, y }) => ({ x: x + dx, y: y + dy }))
    }

    Move(dx, dy) {
        this.x1 += dx
        this.y1 += dy
        this.x2 += dx
        this.y2 += dy
        this.points = this.points.map(({ x, y }) => ({ x: x + dx, y: y + dy }))
    }

}

// width and height are always positive
export class Text extends Shape {
    constructor(x1, y1, text, options, rotation, width, height) {
        super(x1, y1, width, height, options, rotation)
        this.text = text
        this.width = width
        this.height = height
        this.type = "text"
    }
    draw(context, textAreaRef) {
        context.font = this.options.font;
        const { width: maxLineWidth } = textAreaRef.current.getBoundingClientRect()
        const lines = this.text.split("\n");
        const allLines = wrappedLines(lines, maxLineWidth, context)
        this.height = allLines.length * 25
        this.width = allLines.reduce((acc, line) => {
            return Math.max(acc, context.measureText(line).width)
        }, 0)
        allLines.forEach((line, i) => {
            context.fillText(line, this.x1, this.y1 + (i + 1) * 24);
        });
    }
    Move(dx, dy) {
        this.x1 += dx
        this.y1 += dy
    }
    updateText(text) {
        this.text = text
    }

    Resize(dx, dy) {
        this.width += dx
        this.height += dy
    }

    saveLastState() {
        return new Text(this.x1, this.y1, this.text, this.options, this.rotation, this.width, this.height)
    }
}