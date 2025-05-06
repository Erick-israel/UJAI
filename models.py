from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

@dataclass
class User:
    name: str
    email: str
    profile_picture: Optional[str] = None
    gender: Optional[str] = None
    birthday: Optional[datetime] = None
    university: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    id: Optional[str] = None

@dataclass
class Folder:
    name: str
    user_id: str
    parent_id: Optional[str] = None
    starred: bool = False
    deleted: bool = False
    deleted_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    id: Optional[str] = None

@dataclass
class File:
    name: str
    user_id: str
    folder_id: Optional[str] = None
    file_type: str = "pdf"
    size: int = 0
    starred: bool = False
    deleted: bool = False
    deleted_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    id: Optional[str] = None