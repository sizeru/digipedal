import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDqjjREo71wR1FrnbbzKb2Q15TfAVUdRq4",
    authDomain: "digipedal-76f51.firebaseapp.com",
    projectId: "digipedal-76f51",
    storageBucket: "digipedal-76f51.appspot.com",
    messagingSenderId: "67345932505",
    appId: "1:67345932505:web:02328c3ee26c2589521ec8",
    measurementId: "G-HDXBSEYM9W"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

// Output: List of pedals with name and image
// Tested, works
export const getPedals = async () => {
  const pedals = collection(db, 'pedals');
  const pedalsDocs = await getDocs(pedals);
  const pedalsList = pedalsDocs.docs.map( (doc, idx) => {
    // console.log(doc.data());
    return {id:doc.data().id, name:doc.data().name}
  });
  return pedalsList;
}

// Input: pedalId (string)
// Output: pedal object with mfr, name, type, parameters list(name, description, default val, max, min)
// Tested, works
export const getPedalById = async (pedalId) => {
    const pedals = doc(db, 'pedals', pedalId);
    const pedalDocs = await getDoc(pedals);
    return pedalDocs.data();
}

// Input: boardId (string)
// Output: new board object with default name
export const createBoard = async (boardId) => {
    const boardRef = doc(db, 'boards', boardId);
    try {
        await setDoc(boardRef, {name: `Board ${boardId}`});
        console.log("Board created successfully!");
        // Add pedals subcollection here
    } catch (error) {
        console.error("Error creating board:", error);
    }
}

export const renameBoard = async (boardId, newName) => {
    const boardRef = doc(db, 'boards', boardId);
    // console.log(boardRef.data());
    console.log("name:", newName);
    try {

        await updateDoc(boardRef, {name: newName});
        console.log("Board renamed successfully!");
    } catch (error) {
        console.error("Error renaming board:", error);
    }
}

// Input: boardId (string)
// Output: none
// Deletes board from list of boards
export const deleteBoard = async (boardId) => {
    const boardRef = doc(db, 'boards', boardId);
    const boardDoc = await getDoc(boardRef);
    console.log(boardId);
    console.log(boardDoc);
    console.log(boardDoc.exists());
    try {
        await deleteDoc(boardRef);
        console.log("Board deleted successfully!");
    } catch (error) {
        console.error("Error deleting board:", error);
    }
}

// Output: List of boards with name and image
// Tested, works
export const getBoards = async () => {
    const boards = collection(db, 'boards');
    const boardsDocs = await getDocs(boards);
    const boardsList = boardsDocs.docs.map( (doc) => {
        return {id:doc.id, name:doc.data().name, image:doc.data().name + '.png'}
    });
    boardsList.sort((a, b) => a.id - b.id);
    return boardsList;
}

export const getHighestBoardId = async () => {
    const boards = collection(db, 'boards');
    const boardsDocs = await getDocs(boards);
    const boardsList = boardsDocs.docs.map( (doc) => {
        return doc.id;
    });
    console.log("Boards List:", boardsList)
    return Math.max(...boardsList);
}

// Input: boardId (string)
// Output: Object with board name and list of pedals
/* Usage Example:
      const boardData = await getBoardById("1");
      console.log(boardData);
      @returns {name: {'My Super Board'}, pedals: Array(1)}
*/
// Tested, works
export const getBoardById = async (boardId) => {
    const boards = doc(db, 'boards', boardId);
    const boardDoc = await getDoc(boards);
    if (boardDoc.exists()) {
        const pedals = collection(db, 'boards', boardId, 'pedals');
        const pedalsDocs = await getDocs(pedals);
        const retObj = {
            "name": boardDoc.data(),
            "pedals": pedalsDocs.docs.map( doc => {
                const data = doc.data();
                console.log(data);
                return {
                    pedal_id: data.pedal_id, 
                    xPercent: data.xPercent,
                    x: data.x, 
                    width: data.width,
                    yPercent: data.yPercent,
                    y: data.y,
                    height: data.height,
                    toggled: data.toggled,
                    param_vals: data.param_vals
            }})
        }
        console.log("return Object: ", retObj);
        return retObj;
    } else {
        console.log("No board found!");
    }
}

// Input: boardId (string), newName (string)
// Output: none
// Updates the name of the board
export const updateBoardName = async (boardId, newName) => {
    const boardRef = doc(db, 'boards', boardId);
    try {
        await setDoc(boardRef, {name: newName});
        console.log("Board name updated successfully!");
    } catch (error) {
        console.error("Error updating board name:", error);
    }
}

// Input: boardId (string), pedalNumber (string), updatedPedalData (object)
// PedalNumber - the order of the pedal on the board (1, 2, ...)
/* Usage Example: 
      const newPedal = {
        id: 3,
        x: 0,
        y: 0,
        toggled: false,
        param_vals: {
          "Amplification": 2
        }
      }
      await editPedal("1", "3", newPedal);
*/

// Tested, works
// Can be used to edit existing or add new pedals
// To add new pedal, set pedalNumber to the next available number
export const postPedalToBoard = async (boardId, pedalNumber, pedalData) => {
    try {
        const pedalRef = doc(db, 'boards', boardId, 'pedals', pedalNumber);

        try {
            // Update the pedal document
            await setDoc(pedalRef, pedalData);
            console.log("Pedal updated successfully!");
        } catch (error) {
            console.error("Error updating pedal:", error);
        }
    }
    catch (error) {
        console.error("Error getting pedal:", error);
    }
}

// Input: boardId (string), pedalNumber (string)
// Output: none
// Removes pedal from board
export const deletePedalFromBoard = async (boardId, pedalNumber) => {
    try {
        const pedalRef = doc(db, 'boards', boardId, 'pedals', pedalNumber);
        
        try {
            await deleteDoc(pedalRef);
            console.log("Pedal removed successfully");
        } catch (error) {
            console.error("Error removing pedal:", error);
        }
    } catch (error) {
        console.error("Error getting pedal:", error);
    }
}

export const deleteAllFromBoard = async (boardId) => {
    const pedals = collection(db, 'boards', boardId, 'pedals');
    const pedalsDocs = await getDocs(pedals);
    pedalsDocs.docs.forEach( async (doc) => {
        await deleteDoc(doc.ref);
    });
    console.log("All pedals removed successfully");
}

export const saveAllToBoard = async (boardId, pedalList) => {
    console.log("saving:", boardId, " : ", pedalList);
    await deleteAllFromBoard(boardId);
    pedalList.forEach( async (pedal, index) => {
        await postPedalToBoard(boardId, index.toString(), pedal);
    });
    console.log("All pedals saved successfully");
}