import flet as ft
from flet import (
    Column, Container, Row, Text, Divider,
    colors, icons, Icon, alignment, padding
)

class ProfilePage:
    def __init__(self, page, db, user):
        self.page = page
        self.db = db
        self.user = user
    
    def build(self):
        # Sección de perfil
        profile_info = Column(
            [
                Container(
                    content=Container(
                        width=100,
                        height=100,
                        border_radius=50,
                        bgcolor=colors.BLUE_GREY,
                        alignment=alignment.center,
                    ),
                    alignment=alignment.center,
                    margin=10,
                ),
                Container(
                    content=Text(self.user.get("name", "User name"), size=20, weight="bold"),
                    alignment=alignment.center,
                ),
                Container(
                    content=Text("Género"),
                    alignment=alignment.center,
                ),
                Container(
                    content=Text("Birthday"),
                    alignment=alignment.center,
                ),
                Container(
                    content=Text("University"),
                    alignment=alignment.center,
                ),
            ],
            alignment="center",
            horizontal_alignment="center",
        )
        
        # Archivos recientes
        recent_files = Column(
            [
                Row(
                    [
                        Text("Recent", weight="bold"),
                        Text("View all", color=colors.BLUE_ACCENT),
                    ],
                    alignment="spaceBetween",
                ),
                Column([
                    self.create_file_item("FILE_ACCESS_NUMBER_01.ARCHIVO.PDF", "2MB"),
                    self.create_file_item("FILE_ACCESS_NUMBER_02.ARCHIVO.PDF", "2MB"),
                    self.create_file_item("FILE_ACCESS_NUMBER_03.ARCHIVO.PDF", "2MB"),
                    self.create_file_item("FILE_ACCESS_NUMBER_04.ARCHIVO.PDF", "2MB"),
                ]),
            ],
        )
        
        # Carpetas
        folders_section = Column(
            [
                Row(
                    [
                        Text("Folders", weight="bold"),
                        Text("View all", color=colors.BLUE_ACCENT),
                    ],
                    alignment="spaceBetween",
                ),
                Row(
                    [
                        self.create_folder_card(),
                        self.create_folder_card(),
                        self.create_folder_card(),
                        self.create_folder_card(),
                        self.create_folder_card(),
                    ],
                    scroll="auto",
                    spacing=10,
                ),
            ],
        )
        
        return Container(
            content=Column(
                [
                    Container(
                        content=profile_info,
                        padding=20,
                    ),
                    Divider(height=1, color=colors.WHITE24),
                    Container(
                        content=recent_files,
                        padding=10,
                    ),
                    Container(
                        content=folders_section,
                        padding=10,
                    ),
                ],
                spacing=10,
                scroll="auto",
            ),
            bgcolor=colors.BLACK,
            expand=True,
        )
    
    def create_folder_card(self):
        return Container(
            content=Icon(icons.FOLDER, size=40, color=colors.BLACK),
            width=70,
            height=70,
            bgcolor=colors.BLUE_100,
            border_radius=10,
            alignment=alignment.center,
        )
    
    def create_file_item(self, filename, size):
        return Container(
            content=Row(
                [
                    Text(filename, size=12, overflow="ellipsis"),
                    Row(
                        [
                            Text(size, size=12, color=colors.WHITE54),
                            IconButton(
                                icon=icons.MORE_VERT,
                                icon_color=colors.WHITE,
                                icon_size=20,
                            ),
                        ],
                    ),
                ],
                alignment="spaceBetween",
            ),
            padding=10,
            bgcolor=colors.BLACK,
            border=ft.border.all(1, colors.WHITE24),
            border_radius=10,
            margin=padding.only(bottom=5),
        )