import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json

# Use a service account
cred = credentials.Certificate('digipedal-76f51-firebase-adminsdk-de95y-cb73d73347.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def get_backup(collection_name, board_name):
    board = {}
    try:
        board_query = db.collection(collection_name).where('name', '==', board_name).stream()
        board_doc = next(board_query, None)
        if board_doc is None:
            print("No board found with the name", board_name)
            return None
        board_ref = db.collection(collection_name).document(board_doc.id).collection('pedals').stream()
        for doc in board_ref:
            board[doc.id] = doc.to_dict()
            print(f'{doc.id} => {doc.to_dict()}')
    except Exception as e:
        print("An error occurred:", e)
    return board
        
def upload_backup(collection_name, board_name, board):
    try:
        board_query = db.collection(collection_name).where('name', '==', board_name).stream()
        board_doc = next(board_query, None)
        if board_doc is None:
            print("No board found with the name", board_name)
            return None 
        for pedal_id, pedal_data in board.items():
            db.collection(collection_name).document(board_doc.id).collection('pedals').document(pedal_id).set(pedal_data)
    except Exception as e:
        print("An error occurred:", e)


if __name__ == '__main__':
    collection_name = 'boards'  # Name of the collection
    # document_data = {
    #     'first_name': 'John',
    #     'last_name': 'Doe',
    #     'age': 29,
    #     'active': True
    # }
    # add_document(collection_name, document_data)
    # query = db.collection(collection_name).where('board_', '==', '1')
    # boards = {}
    # boards['Backup A'] = get_backup('boards', 'Backup A')
    # boards['Backup B'] = get_backup('boards', 'Backup B')
    # with open('boards.json', 'w') as file:
    #    json.dump(boards, file)

    
    with open('boards.json', 'r') as file:
        board_read = json.load(file)
    print(board_read)
    upload_backup('boards', 'Board of the Rings', board_read['Backup A'])
    upload_backup('boards', 'Pedals of Fury', board_read['Backup B'])
    # upload_to_new_collection(p_read, 'pedals2')
    # add_documents(collection_name)