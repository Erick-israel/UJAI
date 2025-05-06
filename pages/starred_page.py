import flet as ft
from flet import (
    Column, Container, Row, Text, TextField, 
    colors, icons, Icon, alignment, padding, IconButton
)

class StarredPage:
    def __init__(self, page, db, user):
        self.page = page
        self.db = db
        self.user = user
    
    def build(self):
        starred_files = self.db.get_starred_files(self.user["_id"])
        return Column([
            Text("Archivos favoritos:", weight="bold", color=colors.WHITE),
            Column([
                Text(f.filename, color=colors.WHITE) for f in starred_files
            ])
        ], spacing=20)
    
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
                                icon=icons.STAR,
                                icon_color=colors.YELLOW,
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