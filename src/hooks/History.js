import { deleteData } from "../utils/utils"
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

    undo(socket, roomID) {
        if (this.undo_idx < 0) return; // Check if there are any actions to undo
        const action = this.history[this.undo_idx]
        if(!action) return
        action.undo(socket, roomID)
        this.redo_idx = this.undo_idx
        this.undo_idx--
    }

    redo(socket, roomID) {
        if (this.redo_idx > this.history.length - 1) return; // Check if there are any actions to redo
        const action = this.history[this.redo_idx]
        if(!action) return
        action.redo(socket, roomID)
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

    addElement(element) {
        this.elements.set(element.id, element)
    }

    removeElement(id) {
        this.elements.delete(id)
    }

    clear() {
        this.history = []
        this.elements = new Map()
        this.undo_idx = -1
        this.redo_idx = -1
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

    undo(socket, roomID) {
        this.shapes.forEach(shape => shape.hidden = true)
        async function removeDataFromDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                if(socket && roomID) socket.emit('delete-element', roomID, shape.id)
            }
        }
        removeDataFromDB.bind(this)();
    }

    redo(socket, roomID) {
        this.shapes.forEach(shape => shape.hidden = false)
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await addData(shape)
                if(socket && roomID) socket.emit('send-draw', roomID, shape)
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

    undo(socket, roomID) {
        this.shapes.forEach(shape => shape.Move(-this.dx, -this.dy, this.generator))
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                await addData(shape)
                if(socket && roomID) socket.emit('send-draw', roomID, shape)
            }
        }
        pushDataToDB.bind(this)();
    }

    redo(socket, roomID) {
        this.shapes.forEach(shape => shape.Move(this.dx, this.dy, this.generator))
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                await addData(shape)
                if(socket && roomID) socket.emit('send-draw', roomID, shape)
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

    undo(socket, roomID) {
        this.shapes.forEach(shape => shape.hidden = false)
        async function pushDataToDB() {
            for (let shape of this.shapes) {
                await addData(shape)
                if(socket && roomID) socket.emit('send-draw', roomID, shape)
            }
        }
        pushDataToDB.bind(this)();
    }

    redo(socket, roomID) {
        this.shapes.forEach(shape => shape.hidden = true)
        async function removeDataFromDB() {
            for (let shape of this.shapes) {
                await deleteData(shape.id)
                if(socket && roomID) socket.emit('delete-element', roomID, shape.id)
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

    undo(socket, roomID) {
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
                if(socket && roomID) socket.emit('send-draw', roomID, shape)
            }
        }
        pushDataToDB.bind(this)();
    }

    redo(socket, roomID) {
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
                if(socket && roomID) socket.emit('send-draw', roomID, shape)
            }
        }
        pushDataToDB.bind(this)();
    }
}



export { History, DrawAction, MoveAction, RemoveAction, ResizingAction }
