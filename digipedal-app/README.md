## Firebase API Documentation
We have two primary collections: `boards` and `pedals`
`boards` stores the user's individual board data
`pedals` stores the list of pedals that the user can add to their board 
Note: for the calls, the IDs in the API call must be **strings**.
### CRUD for `pedals`
For pedals, there is not much CRUD to do. The pedals are fixed at our current stage, so all the user can do is retrieve the pedals that exist. Perhaps in the future, we can allow the user to upload pedals, and this section can be expanded.
- *Retrieve All*: **GET** (/pedals/)
	- Returns a list of all pedals as `{name, image_path}` objects. The image_path will be the name +  '.svg'
	- Will be used to populate the Pedal Browser
- *Retrieve by ID*: **GET** (/pedals/<pedal_id>)
	- Returns a specific pedal object: `{mfr (manufacturer), name, type, list(parameters)`
	- Parameter: `{name, description, min, max, default} `

### CRUD for `boards` 
-  *Create Board*: **POST** (/boards/<board_id>)
	- Creates a new board with name "New Board <board_id>" and adds to database
- *Retrieve All*: **GET** (/boards)
	- Output: List of all `{board_id, name, image_path}` objects 
- *Retrieve Board*: **GET** (/boards/<board_id>)
	- Output: Board data object: `{name, list(pedals)}`
		- Pedal: `{name, pedal_id, x, y, toggled, param_vals}`, where param_vals is a list of the parameter and it's current value
- *Create/Update Pedal*: **POST** (/boards/<board_id>/pedals/<pedal_num>)
	- Input: `pedalData` (described above)
	- This method will update the `pedal_num` pedal if it exists, else it will create a new 	pedal 
- *Create (Rename Board)*: **POST** (/boards/<board_id>)
    - Input: `newName`
    - This method will rename a board
- *Delete Board*: **DELETE** (/boards/<board_id>)
	- Deletes board with id <board_id> from database
- *Delete Pedal from Board*: **DELETE** (/boards/<board_id>/pedals/<pedal_id>)
	- Deletes pedal with id <pedal_id> from board <board_id>