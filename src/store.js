import { create } from 'zustand';
import { produce } from 'immer';

export const useStore = create((set) => ({
    action: "draw",
    type: "draw",
    options: {
        bowing: 1,
        curveFitting: 0.95,
        curveStepCount: 9,
        curveTightness: 0,
        strokeLineDash: [1, 0], // [length of dash, length of gap]
        dashGap: -1,
        dashOffset: -1,
        disableMultiStroke: true,
        disableMultiStrokeFill: false,
        fill: "black",
        fillShapeRoughnessGain: 0.8,
        fillStyle: "dashed",
        fillWeight: -1,
        hachureAngle: -41,
        hachureGap: -1,
        maxRandomnessOffset: 2,
        preserveVertices: false,
        roughness: -1,
        seed: 0,
        stroke: "#892e89",
        strokeWidth: 1,
        zigzagOffset: -1,
    },
    penOptions: {
        size: 8,
        thinning: 0,
        smoothing: 0.5,
        streamline: 0.5,
        easing: (t) => t,
        simulatePressure: true,
        last: true,
        start: {
            cap: false,
            taper: 0,
            easing: (t) => t,
        },
        end: {
            cap: false,
            taper: 0,
            easing: (t) => t,
        },
    },
    penColor: "#000000",
    zoom: 1,
    elements: [],
    RedoStack: [],   // when undo is called, store the last action in undo
    addElement: (element) =>
        set(produce((state) => {
            state.RedoStack = [];  // clear the redo stack
            state.elements.push(element); // dont change the reference of the elements array
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
    removeElementById: (id) => {
        set(produce((state) => {
            state.elements = state.elements.filter((element) => element.id !== id);
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
            if (!state.elements.length) return;
            const lastAction = state.elements.pop();
            const lastElement = state.elements[state.elements.length - 1];
            if (lastElement?.display) {
                // if the last element has moved then show the instance of the last position if the user clicks undo
                state.elements[state.elements.length - 1].display = false
            }
            state.RedoStack.push(lastAction);
        }));
    },
    Redo: () => {
        set(produce((state) => {
            if (!state.RedoStack.length) return;
            if (state.elements[state.elements.length - 1]?.hasOwnProperty('display') && !(state.elements[state.elements.length - 1]?.display)) {
                state.elements[state.elements.length - 1].display = true
            }
            state.elements.push(state.RedoStack.pop());
        }));
    },

    addToREDO: (element) => {
        set(produce((state) => {
            state.RedoStack.push(element);
        }));
    },
    setAction: (action) =>
        set(produce((state) => {
            state.action = action;
        })),
    setType: (type) =>
        set(produce((state) => {
            state.type = type;
        })),
    setFeildInOptions: (field, value) =>
        set(produce((state) => {
            state.options[field] = value;
        })),
    setFieldInPenOptions: (field, value) =>
        set(produce((state) => {
            state.penOptions[field] = value
        })),
    setPenColor: (color) =>
        set(produce((state) => {
            state.penColor = color;
        })),
    setZoom: (zoom) =>
        set(produce((state) => {
             
            state.zoom = Math.min(2, Math.max(0.1, zoom));
        })),
    
}));