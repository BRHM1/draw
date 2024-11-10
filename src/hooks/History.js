import { deleteData, swapObjValues } from "../utils/utils"
import { addData } from "../utils/utils"
class History {
    constructor() {
        this.history = []
        this.elements = new Map() // {element_id: element}
        this.undo_idx = -1
        this.redo_idx = -1
    }

    push(action) {
        // while pushing a new action, remove all the actions that were undone
        if (this.redo_idx > -1) {
            this.history = this.history.slice(0, this.redo_idx)
        }
        for (let shape of action.shapes) {
            this.elements.set(shape.id, shape)
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
        if (this.history.length === 0) return
        let removedAction = this.history.pop()
        for (let shape of removedAction.shapes) {
            this.elements.delete(shape.id)
        }
        this.undo_idx--
    }

    setElements(elements) {
        this.elements = elements
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
        async function removeDataFromDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
            }
        }
        removeDataFromDB.bind(this)();
    }

    redo() {
        this.shapes.forEach(shape => shape.hidden = false)
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await addData(shape)
            }
        }
        pushDataToDB.bind(this)();
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
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                await addData(shape)
            }
        }
        pushDataToDB.bind(this)();
    }

    redo() {
        this.shapes.forEach(shape => shape.Move(this.dx, this.dy, this.generator))
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                await addData(shape)
            }
        }
        pushDataToDB.bind(this)();
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
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await addData(shape)
            }
        }
        pushDataToDB.bind(this)();
    }

    redo() {
        this.shapes.forEach(shape => shape.hidden = true)
        async function removeDataFromDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
            }
        }
        removeDataFromDB.bind(this)();
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
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                await addData(shape)
            }
        }
        pushDataToDB.bind(this)();
    }

    redo() {
        for (let i = 0; i < this.shapes.length; i++) {
            for (let key in this.lastState[i]) {
                let temp = this.shapes[i][key]
                this.shapes[i][key] = this.lastState[i][key]
                this.lastState[i][key] = temp
            }
        }
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                await addData(shape)
            }
        }
        pushDataToDB.bind(this)();
    }
}



export { History, DrawAction, MoveAction, RemoveAction, ResizingAction }
