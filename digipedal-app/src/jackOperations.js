export const deleteJACKPedals = async (board_idx) => {
    const response = await fetch(`http://localhost:3444/board?board_index=${board_idx}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok == 200) return 1;
    else {
        console.log("Server error on JACK DELETE board");
        return 0;
    }
}

export const getActiveJACKBoard = async () => {
    const response = await fetch(`http://localhost:3444/boards/active`);
    if (response.ok == 200) {
        return response.json().board_index;
    }
    else console.log("Server error on JACK Active Board GET");
}

export const putActiveJACKBoard = async (board_idx) => {
    const response = await fetch(`http://localhost:3444/boards/active`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({board_index: board_idx})
    });
}

export const addJACKPedal = async (board_idx, pedal_idx, pedal_uri, audio_in, audio_out, tarball) => {
    const response = await fetch(`http://localhost:3444/board/pedal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({board_index: board_idx, pedal_index: pedal_idx, pedal_uri: pedal_uri, audio_in:audio_in, audio_out:audio_out, tarball: tarball})
    });
    if (response.ok == 200) console.log("Pedal added successfully");
    else console.log("Server error on JACK POST pedal");
}

export const changeJACKPedal = async (board_idx, pedal_idx, param_vals) => {
    const response = await fetch(`http://localhost:3444/board/pedal`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({board_index: board_idx, pedal_index: pedal_idx, param_vals: param_vals})
    });
    if (response.ok == 200) console.log("Pedal updated successfully");
    else console.log("Server error on JACK PUT pedal");
}

export const deleteJACKPedalfromBoard = async (board_idx, pedal_idx) => {
    const response = await fetch(`http://localhost:3444/board/pedal?board_index=${board_idx}&pedal_index=${pedal_idx}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    if (response.ok == 200) console.log("Pedal deleted successfully");
    else console.log("Server error on JACK DELETE pedal");
}

export const getJACKPedal = async (pedal_uri) => {
    const response = await fetch(`http://localhost:3444/pedal?pedal_uri=${pedal_uri}`);
    if (response.ok == 200) return response.ok;
    else {
        console.log("Server error on JACK GET pedal");
        return 404;
    }
}