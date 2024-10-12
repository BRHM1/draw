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
        simulatePressure: true,
        last: true,
        start: {
            cap: false,
            taper: 0,
        },
        end: {
            cap: false,
            taper: 0,
        },
    },
    penColor: "#000000",
    zoom: 1,
    centerScalingOffset: { x: 0, y: 0 },
    elements: [],
    rerender: false,
    addElement: (element) =>
        set(produce((state) => {
            state.elements.push(element); // dont change the reference of the elements array
        })),
    removeLastElement: () =>
        set(produce((state) => {
            state.elements.pop();
        })),
    clearElements: () =>
        set(produce((state) => {
            state.elements.length = 0;
        })),
    removeElementById: (id) => {
        set(produce((state) => {
            state.elements = state.elements.filter((element) => element.id !== id);
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
    setCenterScalingOffset: (offset) =>
        set(produce((state) => {
            state.centerScalingOffset = offset;
        })),
    setRerender: (rerender) =>
        set(produce((state) => {
            state.rerender = rerender;
        })),
}));