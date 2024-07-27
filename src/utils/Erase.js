import { useStore } from '../store'
const Erase = () => {
    const elements = useStore((state) => state.elements);
    const setElements = useStore((state) => state.setElements);

    const startErasing = (e) => {
        setElements([...elements, {type: "erase" , x: e.pageX, y: e.pageY, width: 20 , height: 20}])
    }
    const Erasing = (e) => {
        if(!e.buttons) return 
        setElements([...elements, {type: "erase" ,x: e.pageX, y: e.pageY, width: 20 , height: 20}])
    }
    const stopErasing = () => {}
    return { startErasing, Erasing, stopErasing }
}

export default Erase