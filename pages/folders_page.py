import flet as ft
from flet import (
    Column, Container, Row, Text, TextField, 
    colors, icons, Icon, alignment, padding, ElevatedButton, IconButton
)

class FoldersPage:
    def __init__(self, page, db, user, current_folder_id=None):
        self.page = page
        self.db = db
        self.user = user
        self.current_folder_id = current_folder_id
    
    def build(self):
        # Obtener carpetas hijas
        folders = self.db.get_folders_by_user(self.user["_id"], parent_id=self.current_folder_id)
        # Obtener archivos en la carpeta actual
        files = self.db.get_files_by_folder(self.current_folder_id) if self.current_folder_id else []
        # Botón para volver atrás si no estamos en la raíz
        back_button = ElevatedButton("Atrás", on_click=self.go_back) if self.current_folder_id else None

        # Validación: ¿No hay carpetas ni archivos?
        no_folders = not folders
        no_files = not files

        content = []
        if back_button:
            content.append(Row([back_button], spacing=10))

        content.append(Text("Carpetas:", weight="bold", color=colors.WHITE))
        if no_folders:
            content.append(Text("No tienes carpetas en esta ubicación.", color=colors.WHITE54))
        else:
            content.append(Column([
                Row([
                    IconButton(icon=icons.FOLDER, icon_color=colors.BLUE),
                    ElevatedButton(
                        folder["name"],
                        on_click=lambda e, folder_id=folder["_id"]: self.open_folder(folder_id)
                    )
                ])
                for folder in folders
            ]))

        content.append(Text("Archivos:", weight="bold", color=colors.WHITE))
        if no_files:
            content.append(Text("No hay archivos en esta carpeta.", color=colors.WHITE54))
        else:
            content.append(Column([
                Text(f.filename, color=colors.WHITE) for f in files
            ]))

        return Column(content, spacing=20)
    
    def create_folder_card(self):
        return Container(
            content=Icon(icons.FOLDER, size=40, color=colors.BLACK),
            width=70,
            height=70,
            bgcolor=colors.BLUE_100,
            border_radius=10,
            alignment=alignment.center,
        )

    def open_folder(self, folder_id):
        # Recarga la página con la nueva carpeta seleccionada
        self.page.controls.clear()
        self.page.add(FoldersPage(self.page, self.db, self.user, current_folder_id=folder_id).build())
        self.page.update()

    def go_back(self, e):
        # Recarga la página con la carpeta padre (debes guardar el parent_id en cada carpeta)
        parent_id = self.db.get_folder_parent(self.current_folder_id)
        self.page.controls.clear()
        self.page.add(FoldersPage(self.page, self.db, self.user, current_folder_id=parent_id).build())
        self.page.update()