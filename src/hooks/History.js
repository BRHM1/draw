import { swapObjValues } from "../utils/utils"
class History {
    constructor() {
        this.history = []
        this.undo_idx = -1
        this.redo_idx = -1
    }

    push(action) {
        // while pushing a new action, remove all the actions that were undone
        if (this.redo_idx > -1) {
            this.history = this.history.slice(0, this.redo_idx)
        }
        this.history.push(action)
        this.undo_idx = this.history.length - 1
        this.redo_idx = -1
    }

    undo() {
        if (this.undo_idx < 0) return; // Check if there are any actions to undo
        const action = this.history[this.undo_idx]
        action.undo()
        this.redo_idx = this.undo_idx
        this.undo_idx--
    }

    redo() {
        if (this.redo_idx > this.history.length - 1) return; // Check if there are any actions to redo
        const action = this.history[this.redo_idx]
        action.redo()
        this.undo_idx = this.redo_idx
        this.redo_idx++
    }

    pop() {
        this.history.pop()
        this.undo_idx--
    }

}

class Action {
    constructor() {
        this.lastState = null
    }

    undo() {
        throw new Error("Undo method not implemented")
    }

    redo() {
        throw new Error("Redo method not implemented")
    }
}


class DrawAction extends Action {
    constructor(shapes, generator) {
        super()
        this.shapes = shapes
        this.generator = generator
        this.type = "draw"
    }

    undo() {
        this.shapes.forEach(shape => shape.hidden = true)
    }

    redo() {
        this.shapes.forEach(shape => shape.hidden = false)
    }
}


class MoveAction extends Action {
    constructor(shapes, dx, dy, generator) {
        super()
        this.shapes = shapes
        this.dx = dx
        this.dy = dy
        this.generator = generator
        this.type = "event"
    }

    undo() {
        this.shapes.forEach(shape => shape.Move(-this.dx, -this.dy, this.generator))
    }

    redo() {
        this.shapes.forEach(shape => shape.Move(this.dx, this.dy, this.generator))
    }
}

class RemoveAction extends Action {
    constructor(shapes, generator) {
        super()
        this.shapes = shapes
        this.generator = generator
        this.type = "remove"
    }

    undo() {
        this.shapes.forEach(shape => shape.hidden = false)
    }

    redo() {
        this.shapes.forEach(shape => shape.hidden = true)
    }
}

class ResizingAction extends Action {
    constructor(shapes, lastState, generator) {
        super()
        this.shapes = shapes
        this.lastState = lastState
        this.generator = generator
        this.type = "resizing"
    }

    undo() {
        for (let i = 0; i < this.shapes.length; i++) {
            for (let key in this.lastState[i]) {
                let temp = this.shapes[i][key]
                this.shapes[i][key] = this.lastState[i][key]
                this.lastState[i][key] = temp
            }
        }
    }

    redo() {
        for (let i = 0; i < this.shapes.length; i++) {
            for (let key in this.lastState[i]) {
                let temp = this.shapes[i][key]
                this.shapes[i][key] = this.lastState[i][key]
                this.lastState[i][key] = temp
            }
        }
    }
}



export { History, DrawAction, MoveAction, RemoveAction, ResizingAction }
