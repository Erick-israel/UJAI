import flet as ft
from flet import (
    Column, Container, Row, Text, TextField, 
    colors, icons, IconButton, Icon, alignment, padding, ElevatedButton, FilePicker, AlertDialog
)
import os
from bson import ObjectId

class DashboardPage:
    def __init__(self, page, db, user):
        self.page = page
        self.db = db
        self.user = user
        self.file_picker = FilePicker(on_result=self.handle_file_upload)
        self.page.overlay.append(self.file_picker)
        self.dialog = None
        self.rename_field = TextField(label="Nuevo nombre")
        self.folder_name_field = TextField(label="Nombre de la carpeta")
    
    def build(self):
        # Botón para subir archivo
        upload_button = ElevatedButton("Subir archivo", on_click=lambda e: self.file_picker.pick_files())
        # Botón para crear carpeta
        create_folder_button = ElevatedButton("Crear carpeta", on_click=self.show_create_folder_dialog)
        # Archivos recientes
        recent_files = self.db.get_files_by_user(self.user["_id"])
        return Column([
            Row([upload_button, create_folder_button], spacing=10),
            Text("Archivos recientes:", weight="bold", color=colors.WHITE),
            Column([
                Row([
                    Text(f.filename, color=colors.WHITE),
                    IconButton(
                        icon=icons.STAR if getattr(f, "starred", False) else icons.STAR_BORDER,
                        icon_color=colors.YELLOW,
                        on_click=lambda e, file=f: self.toggle_star(file)
                    ),
                ])
                for f in recent_files[:5]  # Solo los 5 más recientes
            ])
        ], spacing=20)
    
    def create_folder_card(self, folder):
        return Container(
            content=Text(folder["name"], color=colors.WHITE),
            width=100,
            height=100,
            bgcolor=colors.BLUE_100,
            border_radius=10,
            alignment=alignment.center,
        )
    
    def create_file_item(self, file):
        return Row([
            IconButton(
                icon=icons.STAR if getattr(file, "starred", False) else icons.STAR_BORDER,
                icon_color=colors.YELLOW,
                on_click=lambda e: self.toggle_star(file)
            ),
            Text(file.filename, color=colors.WHITE, width=250),
            Text(str(getattr(file, "size", "")), color=colors.WHITE, width=60),
            IconButton(
                icon=icons.DOWNLOAD,
                icon_color=colors.BLUE,
                on_click=lambda e: self.download_file(file)
            ),
            IconButton(
                icon=icons.DRIVE_FILE_RENAME_OUTLINE,
                icon_color=colors.BLUE,
                on_click=lambda e: self.show_rename_dialog(file)
            ),
            IconButton(
                icon=icons.DELETE,
                icon_color=colors.RED,
                on_click=lambda e: self.delete_file(file)
            ),
        ], alignment="spaceBetween")

    def create_trash_file_item(self, file):
        return Row([
            Text(file.filename, color=colors.WHITE, width=250),
            Text(str(getattr(file, "size", "")), color=colors.WHITE, width=60),
            IconButton(
                icon=icons.RESTORE_FROM_TRASH,
                icon_color=colors.GREEN,
                on_click=lambda e: self.restore_file(file)
            ),
            IconButton(
                icon=icons.DELETE_FOREVER,
                icon_color=colors.RED,
                on_click=lambda e: self.delete_file(file, permanent=True)
            ),
        ], alignment="spaceBetween")

    def handle_file_upload(self, e):
        for f in e.files:
            self.db.upload_file(f.path, f.name, self.user["_id"], f.size)
        self.refresh()

    def delete_file(self, file, permanent=False):
        self.db.delete_file(file._id, permanent=permanent)
        self.refresh()

    def restore_file(self, file):
        self.db.restore_file(file._id)
        self.refresh()

    def toggle_star(self, file):
        self.db.star_file(file._id, not getattr(file, "starred", False))
        self.refresh()

    def show_rename_dialog(self, file):
        self.rename_field.value = file.filename
        self.dialog = AlertDialog(
            title=Text("Renombrar archivo"),
            content=self.rename_field,
            actions=[
                ElevatedButton("Guardar", on_click=lambda e: self.rename_file(file)),
                ElevatedButton("Cancelar", on_click=lambda e: self.close_dialog())
            ]
        )
        self.page.dialog = self.dialog
        self.page.dialog.open = True
        self.page.update()

    def rename_file(self, file):
        new_name = self.rename_field.value.strip()
        if new_name and new_name != file.filename:
            self.db.rename_file(file._id, new_name)
        self.close_dialog()
        self.refresh()

    def close_dialog(self):
        if self.page.dialog:
            self.page.dialog.open = False
            self.page.update()

    def download_file(self, file):
        # Descarga el archivo a la carpeta de descargas del usuario
        downloads_folder = os.path.expanduser("~/Descargas")
        os.makedirs(downloads_folder, exist_ok=True)
        dest_path = os.path.join(downloads_folder, file.filename)
        self.db.download_file(file._id, dest_path)
        # Puedes mostrar un mensaje de éxito si lo deseas

    def refresh(self):
        self.page.controls.clear()
        self.page.add(self.build())

    def show_create_folder_dialog(self, e):
        self.dialog = AlertDialog(
            title=Text("Crear nueva carpeta"),
            content=self.folder_name_field,
            actions=[
                ElevatedButton("Crear", on_click=self.create_folder),
                ElevatedButton("Cancelar", on_click=lambda e: self.close_dialog())
            ]
        )
        self.page.dialog = self.dialog
        self.page.dialog.open = True
        self.page.update()

    def create_folder(self, e):
        name = self.folder_name_field.value.strip()
        if name:
            self.db.create_folder({
                "name": name,
                "user_id": self.user["_id"],
                "starred": False,
                "deleted": False,
            })
        self.close_dialog()
        self.page.update()