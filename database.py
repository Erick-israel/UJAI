import pymongo
from datetime import datetime
import os
from dotenv import load_dotenv
import gridfs
from bson import ObjectId

# Cargar variables de entorno
load_dotenv()

# Conexión a MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://username:password@cluster.mongodb.net/filemanager")

class Database:
    def __init__(self):
        self.client = pymongo.MongoClient(MONGO_URI)
        self.db = self.client["filemanager"]
        self.users_collection = self.db["users"]
        self.files_collection = self.db["files"]
        self.folders_collection = self.db["folders"]
        self.fs = gridfs.GridFS(self.db)
    
    def create_user(self, user_data):
        user_data["created_at"] = datetime.now()
        user_data["updated_at"] = datetime.now()
        result = self.users_collection.insert_one(user_data)
        return result.inserted_id
    
    def get_user(self, user_id):
        return self.users_collection.find_one({"_id": user_id})
    
    def get_user_by_email(self, email):
        return self.users_collection.find_one({"email": email})
    
    def update_user(self, user_id, update_data):
        update_data["updated_at"] = datetime.now()
        self.users_collection.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
    
    def create_folder(self, folder_data):
        folder_data["created_at"] = datetime.now()
        folder_data["updated_at"] = datetime.now()
        result = self.folders_collection.insert_one(folder_data)
        return result.inserted_id
    
    def get_folders_by_user(self, user_id):
        return list(self.folders_collection.find({"user_id": user_id, "deleted": False}))
    
    def get_starred_folders(self, user_id):
        return list(self.folders_collection.find({"user_id": user_id, "starred": True, "deleted": False}))
    
    def create_file(self, file_data):
        file_data["created_at"] = datetime.now()
        file_data["updated_at"] = datetime.now()
        result = self.files_collection.insert_one(file_data)
        return result.inserted_id
    
    def get_files_by_user(self, user_id, include_deleted=False):
        query = {"user_id": user_id}
        if not include_deleted:
            query["deleted"] = False
        return list(self.fs.find(query))
    
    def get_files_by_folder(self, folder_id):
        return list(self.files_collection.find({"folder_id": folder_id, "deleted": False}))
    
    def get_starred_files(self, user_id):
        return list(self.files_collection.find({"user_id": user_id, "starred": True, "deleted": False}))
    
    def get_trash(self, user_id):
        return list(self.fs.find({"user_id": user_id, "deleted": True}))
    
    def star_item(self, item_id, collection_name, starred=True):
        collection = self.db[collection_name]
        collection.update_one(
            {"_id": item_id},
            {"$set": {"starred": starred, "updated_at": datetime.now()}}
        )
    
    def delete_item(self, item_id, collection_name, permanent=False):
        collection = self.db[collection_name]
        if permanent:
            collection.delete_one({"_id": item_id})
        else:
            collection.update_one(
                {"_id": item_id},
                {"$set": {"deleted": True, "deleted_at": datetime.now(), "updated_at": datetime.now()}}
            )
    
    def restore_item(self, item_id, collection_name):
        collection = self.db[collection_name]
        collection.update_one(
            {"_id": item_id},
            {"$set": {"deleted": False, "deleted_at": None, "updated_at": datetime.now()}}
        )

    def upload_file(self, file_path, file_name, user_id, size):
        with open(file_path, "rb") as f:
            file_id = self.fs.put(
                f,
                filename=file_name,
                user_id=user_id,
                size=size,
                starred=False,
                deleted=False,
                upload_date=datetime.now()
            )
        return file_id

    def delete_file(self, file_id, permanent=False):
        if permanent:
            self.fs.delete(ObjectId(file_id))
        else:
            self.db.fs.files.update_one({"_id": ObjectId(file_id)}, {"$set": {"deleted": True}})

    def mark_starred(self, file_id, starred=True):
        self.db.fs.files.update_one({"_id": ObjectId(file_id)}, {"$set": {"starred": starred}})

    def restore_file(self, file_id):
        self.db.fs.files.update_one({"_id": ObjectId(file_id)}, {"$set": {"deleted": False}})

    def rename_file(self, file_id, new_name):
        self.db.fs.files.update_one({"_id": ObjectId(file_id)}, {"$set": {"filename": new_name}})

    def download_file(self, file_id, dest_path):
        grid_out = self.fs.get(ObjectId(file_id))
        with open(dest_path, "wb") as f:
            f.write(grid_out.read())