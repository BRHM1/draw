import create from 'zustand';
import { produce } from 'immer';

export const useStore = create((set) => ({
    elements: [],
    addElement: (element) =>
        set(produce((state) => {
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
    modifyLastElement: (property , value) => {
        set(produce((state) => {
            // if(!state.elements.at(-1)[property]) return
            state.elements[state.elements.length - 1][property] = value;
        }));
    }, 
}));