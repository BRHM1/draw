export class Shape {
    constructor(x1, y1, width, height, options, rotation) {
        this.x1 = x1
        this.y1 = y1
        this.width = width
        this.height = height
        this.options = options
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    }

    draw() {
        return null
    }
}


export class Circle extends Shape {
    constructor(x1, y1, radius, options, roughElement, centerX, centerY,rotation ) {
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
    updateDimensions(x2, y2) {
        this.radius = Number(Math.sqrt(Math.pow(this.centerX - x2, 2) + Math.pow(this.centerY - y2, 2)).toFixed(2))
        this.x1 = Number((this.centerX - this.radius).toFixed(2))
        this.y1 = Number((this.centerY - this.radius).toFixed(2))
        this.width = Number((this.radius * 2).toFixed(2))
        this.height = Number((this.radius * 2).toFixed(2))
    }
}

export class Ellipse extends Shape {
    constructor(x1, y1, width, height, options, roughElement, rotation) {
        super(x1, y1, width, height, options, rotation)
        this.roughElement = roughElement
        this.type = "ellipse"
    }
    draw(roughCanvas) {
        roughCanvas.draw(this.roughElement)
    }
    initialX = this.x1
    initialY = this.y1
    updateDimensions(x2, y2) {
        this.x1 = Number((Math.min(this.x1, x2)).toFixed(2))
        this.y1 = Number((Math.max(this.y1, y2)).toFixed(2))
        this.width = Number((Math.abs(this.initialX - x2)).toFixed(2))
        this.height = Number((Math.abs(this.initialY - y2)).toFixed(2))
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
    updateDimensions(x2, y2) {
        this.x1 = Number((Math.min(this.x1, x2)).toFixed(2))
        this.y1 = Number((Math.min(this.y1, y2)).toFixed(2))
        this.x2 = Number((Math.max(this.x1, x2)).toFixed(2))
        this.y2 = Number((Math.max(this.y1, y2)).toFixed(2))
    }
}

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
    initialX = this.x1
    initialY = this.y1
    updateDimensions(x2, y2) {
        this.x1 = Number((Math.min(this.x1, x2)).toFixed(2))
        this.y1 = Number((Math.min(this.y1, y2)).toFixed(2))
        this.width = Number((Math.abs(x2 - this.initialX)).toFixed(2))
        this.height = Number((Math.abs(y2 - this.initialY)).toFixed(2))
    }
}

export class Path extends Shape {
    // in this case x1, y1, x2, y2 are the bounding box of the path
    constructor(x1, y1, x2, y2, path, options, color, fillFlag, fillStyle, points, strokeStyle, rotation) {
        super(x1, y1, x2, y2, options, rotation)
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
        context.fillStyle = this.fillStyle
        context.fill(this.path)
    }
    updateDimensions(x2, y2) {
        this.x1 = Number(Math.min(this.x1, x2).toFixed(2))
        this.y1 = Number(Math.min(this.y1, y2).toFixed(2))
        this.x2 = Number(Math.max(this.x1, x2).toFixed(2))
        this.y2 = Number(Math.max(this.y1, y2).toFixed(2))
    }
}