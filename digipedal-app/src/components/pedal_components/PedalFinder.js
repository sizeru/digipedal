import AmpPedal from './AmpPedal'
import ReverbPedal from './ReverbPedal'
import SaturatorPedal from './SaturatorPedal'
import VintageDelayPedal from './VintageDelayPedal';

function findPedal(name){
    // setting up to return the correct class 
    switch(name){
        case "myAmp":
            return AmpPedal;
        case "Calf Reverb":
            return ReverbPedal;
        case "Calf Saturator":
            return SaturatorPedal;
        case "Calf Vintage Delay":
            return VintageDelayPedal;
        default:
    }
    // oh no we didnt find it1
    // console.error("findPedal error: what is a " + name);
    // returning something so it can at least load if there is an error
    return ()=> (<></>)
}

export {findPedal};