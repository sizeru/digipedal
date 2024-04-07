import AmpPedal from './AmpPedal'

function findPedal(name){
    let pedal = null;
    // setting up to return the correct class 
    switch(name){
        case "myAmp":
            return AmpPedal;
    }
    // oh no we didnt find it1
    console.error("findPedal error: what is a " + name);
    // returning something so it can at least load if there is an error
    return ()=> (<></>)
}

export {findPedal};