import { create } from 'zustand'
import { produce } from 'immer'

export const useStore = create((set) => ({
    elements: [],
    addElement: (element) => set((state) => ({ elements: [...state.elements, element] })),
    removeLastElement: () => set((state) => ({ elements: state.elements.slice(0, -1) })),
    replaceLastElement: (element) => set((state) => ({ elements: [...state.elements.slice(0, -1), element] })),
    setElements: (elements) => set({ elements }),
    clearElements: () => set({ elements: [] }),
}))