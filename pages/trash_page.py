import flet as ft
from flet import (
    Column, Container, Row, Text, TextField, 
    colors, icons, Icon, alignment, padding, IconButton
)

class TrashPage:
    def __init__(self, page, db, user):
        self.page = page
        self.db = db
        self.user = user
    
    def build(self):
        # Ejemplo: archivos en la papelera
        trash_files = self.db.get_trash(self.user["_id"])
        return Column([
            Text("Papelera:", weight="bold", color=colors.WHITE),
            Column([
                Text(f.filename, color=colors.WHITE) for f in trash_files
            ])
        ], spacing=20)
    
    def create_file_item(self, filename, size):
        return Container(
            content=Row(
                [
                    Text(filename, size=12, overflow="ellipsis"),
                    Row(
                        [
                            Text(size, size=12, color=colors.WHITE54),
                            IconButton(
                                icon=icons.RESTORE,
                                icon_color=colors.BLUE,
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