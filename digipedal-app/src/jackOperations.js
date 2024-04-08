
export const getJACKPedal = async (pedal_uri) => {
    const response = await fetch(`http://localhost:3444/pedals?pedal_uri=${pedal_uri}`);
    if (response.ok == 200) console.log("Pedal exists in JACK with uri" + pedal_uri);
    else if (response.ok == 404) console.log("Pedal doesn't exist in JACK with uri" + pedal_uri)
    else console.log("Server error on JACK Pedal GET");
    return response.ok == 200 ? 1 : 0;
}

export const updateJACKPedal = async (board_id, pedal_idx, param_vals) => {
    const response = await fetch(`http://localhost:3444/parameter?board_id=${board_id}&?pedal_index=${pedal_idx}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(param_vals)
    }); 
    if (response.ok == 200) console.log("Pedal updated successfully");
    else console.log("Server Error on JACK PUT");
    return response.ok;
}

export const deleteJACKPedal = async (board_id, pedal_idx) => {
    const response = await fetch(`http://localhost:3444/pedals/${board_id}/${pedal_idx}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok == 200) console.log("Pedal deleted successfully");
    else console.log("Server error on JACK DELETE pedal");
}

export const postJACKPedal = async (board_id, pedal_idx, pedal_uri) => {
}

export const getJACKBoard = async () => {
    const response = await fetch(`http://localhost:3444/boards/current`);
    if (response.ok == 200) console.log("Current Board exists in JACK" + pedal_uri);
    else if (response.ok == 404) console.log("Current Board doesn't exist in JACK with uri" + pedal_uri)
    else console.log("Server error on JACK Board GET");
    return response.ok == 200 ? 1 : 0;
}

export const putJACKBoard = async () => {
}