import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import storage

class Firebase:
    def __init__(self):
        cred = credentials.Certificate('services/certificate.json')
        firebase_admin.initialize_app(cred)
        self.store = firestore.client() 
        # self.bucket = storage.bucket()

    def update_match(self, regional, matchNum, alliance, teamNum, matchData):
        movieRef = self.store.document(f'regional/{regional}/matches/{matchNum}/{alliance}/{teamNum}')
        movieRef.set({"data": matchData}, merge=True)

    def update_team(self, regional, matchNum, teamNum, matchData):
        movieRef = self.store.document(f'regional/{regional}/teams/{teamNum}/matches/{matchNum}')
        movieRef.set({"data": matchData}, merge=True)
