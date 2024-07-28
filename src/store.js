import { create } from 'zustand';
import { produce } from 'immer';

export const useStore = create((set) => ({
    elements: [],
    RedoStack: [],   // when undo is called, store the last action in undo
    addElement: (element) =>
        set(produce((state) => {
            state.RedoStack = [];  // clear the redo stack
            state.elements.push(element);
        })),
    removeLastElement: () =>
        set(produce((state) => {
            state.elements.pop();
        })),
    replaceLastElement: (element) =>
        set(produce((state) => {
            state.elements[state.elements.length - 1] = element;
        })),
    setElements: (elements) =>
        set(produce((state) => {
            state.elements = elements;
        })),
    clearElements: () =>
        set(produce((state) => {
            state.elements.length = 0;
        })),
    modifyLastElement: (property, value) => {
        set(produce((state) => {
            state.elements[state.elements.length - 1][property] = value;
        }));
    },
    insertElement: (element, index) => {
        set(produce((state) => {
            state.RedoStack.splice(index, 0, element);
            state.elements.splice(index, 0, element);
        }));
    },
    Undo: () => {
        set(produce((state) => {
            if(!state.elements.length) return;
            const lastAction = state.elements.pop();
            const lastElement = state.elements[state.elements.length - 1];
            if(lastElement?.display) {
            // if the last element has moved then show the instance of the last position if the user clicks undo
                state.elements[state.elements.length - 1].display = false
            }
            state.RedoStack.push(lastAction);
        }));
    },
    Redo: () => {
        set(produce((state) => {
            if(!state.RedoStack.length) return;
            if(state.elements[state.elements.length - 1]?.hasOwnProperty('display') && !(state.elements[state.elements.length - 1]?.display)) {
                state.elements[state.elements.length - 1].display = true
            }
            state.elements.push(state.RedoStack.pop());
        }));
    },
}));