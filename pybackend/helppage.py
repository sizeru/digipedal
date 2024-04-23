import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json

# Use a service account
cred = credentials.Certificate('digipedal-76f51-firebase-adminsdk-de95y-cb73d73347.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def add_document(collection_name, document_data):
    try:
        doc_ref = db.collection(collection_name).document()
        doc_ref.set(document_data)
        print("Document has been added successfully.")
    except Exception as e:
        print("An error occurred:", e)

def get_documents(collection_name):
    pedals = {}
    try:
        docs = db.collection(collection_name).stream()
        for doc in docs:
            pedals[doc.id] = doc.to_dict()
            print(f'{doc.id} => {doc.to_dict()}')
    except Exception as e:
        print("An error occurred:", e)
    return pedals
        
def upload_to_new_collection(pedals, new_collection_name):
    db = firestore.client()
    try:
        for pedal_id, pedal_data in pedals.items():
            doc_ref = db.collection(new_collection_name).document(pedal_id)
            doc_ref.set(pedal_data)
            print(f"Document {pedal_id} written to {new_collection_name}.")
    except Exception as e:
        print("An error occurred while uploading:", e)

if __name__ == '__main__':
    # Example usage:
    collection_name = 'pedals'  # Name of the collection
    # document_data = {
    #     'first_name': 'John',
    #     'last_name': 'Doe',
    #     'age': 29,
    #     'active': True
    # }
    # add_document(collection_name, document_data)
    #p = get_documents(collection_name)
    #with open('pedals.json', 'w') as file:
    #    json.dump(p, file)

    # with open('pedals.json', 'r') as file:
    #     p_read = json.load(file)
    # # print(p)
    # upload_to_new_collection(p_read, 'pedals2')
    # add_documents(collection_name)