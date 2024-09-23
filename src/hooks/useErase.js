import { useStore } from '../store'
const useErase = () => {
    const elements = useStore((state) => state.elements);
    const setElements = useStore((state) => state.setElements);
    const addToREDO = useStore((state) => state.addToREDO);
   
    const startErasing = (e) => {
    }
    // console.log("Erase is re-rendering");
    const Erasing = (e) => {
        if(!e.buttons) return
        
        
        const selectedElement = getElementAtPos(e.pageX, e.pageY, elements)
        if(selectedElement === null) return
        addToREDO(elements[selectedElement])
        const newElements = elements.filter((_, idx) => idx !== selectedElement)
        setElements(newElements)
    }
    const stopErasing = () => {}
    return { startErasing, Erasing, stopErasing }
}

export default useErase