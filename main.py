import flet as ft
from flet import (
    AppBar, Column, Container, ElevatedButton, IconButton, 
    Page, Row, Text, TextField, Icon, colors, icons, 
    NavigationRail, NavigationRailDestination, Divider,
    GridView, Card, Image, alignment, border_radius, padding
)
import pymongo
import os
from dotenv import load_dotenv
from datetime import datetime

# Cargar variables de entorno
load_dotenv()

# Conexión a MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://username:password@cluster.mongodb.net/filemanager")

class FileManagerApp:
    def __init__(self):
        self.client = pymongo.MongoClient(MONGO_URI)
        self.db = self.client["filemanager"]
        self.users_collection = self.db["users"]
        self.files_collection = self.db["files"]
        self.current_user = None
        self.current_view = "login"
    
    def initialize_app(self, page: Page):
        self.page = page
        self.page.title = "Gestor de Archivos"
        self.page.theme_mode = ft.ThemeMode.DARK
        self.page.bgcolor = colors.BLACK
        self.page.padding = 0
        self.page.window_width = 400
        self.page.window_height = 800
        self.page.update()
        
        # Iniciar con la página de login
        self.show_login_view()
    
    def show_login_view(self):
        self.current_view = "login"
        self.page.controls.clear()
        
        self.page.add(
            Container(
                content=Column(
                    [
                        Container(
                            content=Text("Welcome", size=40, weight="bold", color=colors.WHITE),
                            alignment=alignment.center,
                            margin=padding.only(top=100, bottom=50),
                        ),
                        Container(
                            content=ElevatedButton(
                                content=Row(
                                    [
                                        Icon(icons.GOOGLE),
                                        Text("Sign in with Google", color=colors.BLACK),
                                    ],
                                    alignment="center",
                                ),
                                style=ft.ButtonStyle(
                                    bgcolor=colors.WHITE,
                                    color=colors.BLACK,
                                    padding=15,
                                ),
                                on_click=self.handle_login,
                            ),
                            alignment=alignment.center,
                            margin=10,
                        ),
                    ],
                    alignment="center",
                ),
                width=400,
                height=800,
                bgcolor=colors.BLACK,
            )
        )
        self.page.update()
    
    def handle_login(self, e):
        # Simulación de login (en una app real, implementar OAuth con Google)
        self.current_user = {
            "id": "user123",
            "name": "User name",
            "email": "user@example.com",
        }
        
        # Mostrar pantalla de carga
        self.show_charging_screen()
    
    def show_charging_screen(self):
        self.current_view = "charging"
        self.page.controls.clear()
        
        self.page.add(
            Container(
                content=Column(
                    [
                        Container(
                            content=Text("Welcome", size=40, weight="bold", color=colors.WHITE),
                            alignment=alignment.center,
                            margin=padding.only(top=100, bottom=50),
                        ),
                        Container(
                            content=Text("Cargando...", color=colors.WHITE),
                            alignment=alignment.center,
                        ),
                    ],
                    alignment="center",
                ),
                width=400,
                height=800,
                bgcolor=colors.BLACK,
            )
        )
        self.page.update()
        
        # Simular carga y luego mostrar dashboard
        self.page.window.set_timeout(2000, self.show_dashboard)
    
    def show_dashboard(self):
        self.current_view = "dashboard"
        self.update_main_view()
    
    def show_folders(self):
        self.current_view = "folders"
        self.update_main_view()
    
    def show_starred(self):
        self.current_view = "starred"
        self.update_main_view()
    
    def show_trash(self):
        self.current_view = "trash"
        self.update_main_view()
    
    def show_profile(self):
        self.current_view = "profile"
        self.update_main_view()
    
    def update_main_view(self):
        self.page.controls.clear()
        
        # Barra de navegación lateral
        nav_rail = NavigationRail(
            selected_index=self.get_nav_index(),
            label_type="all",
            min_width=100,
            min_extended_width=200,
            destinations=[
                NavigationRailDestination(
                    icon=icons.DASHBOARD,
                    selected_icon=icons.DASHBOARD,
                    label="Dashboard",
                ),
                NavigationRailDestination(
                    icon=icons.FOLDER,
                    selected_icon=icons.FOLDER,
                    label="Folders",
                ),
                NavigationRailDestination(
                    icon=icons.STAR,
                    selected_icon=icons.STAR,
                    label="Starred",
                ),
                NavigationRailDestination(
                    icon=icons.DELETE,
                    selected_icon=icons.DELETE,
                    label="Trash",
                ),
            ],
            on_change=self.handle_nav_change,
        )
        
        # Barra superior
        app_bar = AppBar(
            title=Text(self.get_title_for_view()),
            bgcolor=colors.BLACK,
            actions=[
                IconButton(icon=icons.SEARCH, icon_color=colors.WHITE),
                IconButton(icon=icons.ACCOUNT_CIRCLE, icon_color=colors.WHITE, on_click=lambda _: self.show_profile()),
            ],
        )
        
        # Contenido principal
        main_content = self.get_content_for_view()
        
        # Estructura principal
        main_container = Container(
            content=Row(
                [
                    nav_rail,
                    Container(
                        content=Column(
                            [
                                app_bar,
                                main_content,
                            ],
                            spacing=0,
                        ),
                        expand=True,
                    ),
                ],
                spacing=0,
                tight=True,
            ),
            width=400,
            height=800,
            bgcolor=colors.BLACK,
        )
        
        self.page.add(main_container)
        self.page.update()
    
    def get_nav_index(self):
        views = ["dashboard", "folders", "starred", "trash"]
        if self.current_view in views:
            return views.index(self.current_view)
        return 0
    
    def handle_nav_change(self, e):
        index = e.control.selected_index
        views = ["dashboard", "folders", "starred", "trash"]
        if index < len(views):
            self.current_view = views[index]
            self.update_main_view()
    
    def get_title_for_view(self):
        titles = {
            "dashboard": "Dashboard",
            "folders": "Folders",
            "starred": "Starred",
            "trash": "Trash",
            "profile": "Profile",
        }
        return titles.get(self.current_view, "Dashboard")
    
    def get_content_for_view(self):
        if self.current_view == "dashboard":
            return self.build_dashboard_view()
        elif self.current_view == "folders":
            return self.build_folders_view()
        elif self.current_view == "starred":
            return self.build_starred_view()
        elif self.current_view == "trash":
            return self.build_trash_view()
        elif self.current_view == "profile":
            return self.build_profile_view()
        else:
            return Container()
    
    def build_dashboard_view(self):
        # Sección de acciones rápidas
        quick_actions = Row(
            [
                self.create_action_card("New Folder", icons.CREATE_NEW_FOLDER, colors.BLUE),
                self.create_action_card("Shared", icons.SHARE, colors.GREEN),
            ],
            alignment="center",
            spacing=20,
        )
        
        # Sección de archivos recientes
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
                ]),
            ],
        )
        
        # Botón de actualizar plan
        upgrade_button = Container(
            content=ElevatedButton(
                "Upgrade your plan now",
                style=ft.ButtonStyle(
                    bgcolor=colors.BLUE,
                    color=colors.WHITE,
                    padding=15,
                ),
                width=300,
            ),
            alignment=alignment.center,
            margin=padding.only(top=20, bottom=20),
        )
        
        # Sección de carpetas
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
                        content=TextField(
                            hint_text="Search...",
                            prefix_icon=icons.SEARCH,
                            bgcolor=colors.BLACK,
                            border_color=colors.WHITE10,
                            border_width=1,
                            border_radius=8,
                            color=colors.WHITE,
                        ),
                        padding=10,
                    ),
                    Container(
                        content=quick_actions,
                        padding=10,
                    ),
                    Container(
                        content=recent_files,
                        padding=10,
                    ),
                    upgrade_button,
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
    
    def build_folders_view(self):
        # Sección de carpetas por año
        folders_2023 = Column(
            [
                Text("2023", weight="bold"),
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
        
        folders_2024 = Column(
            [
                Text("2024", weight="bold"),
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
                        content=TextField(
                            hint_text="Search...",
                            prefix_icon=icons.SEARCH,
                            bgcolor=colors.BLACK,
                            border_color=colors.WHITE10,
                            border_width=1,
                            border_radius=8,
                            color=colors.WHITE,
                        ),
                        padding=10,
                    ),
                    Container(
                        content=folders_2023,
                        padding=10,
                    ),
                    Container(
                        content=folders_2024,
                        padding=10,
                    ),
                ],
                spacing=20,
                scroll="auto",
            ),
            bgcolor=colors.BLACK,
            expand=True,
        )
    
    def build_starred_view(self):
        # Sección de carpetas destacadas
        starred_folders = Column(
            [
                Text("My starred folders", weight="bold"),
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
        
        # Sección de archivos destacados
        starred_files = Column(
            [
                Text("My starred files", weight="bold"),
                Column([
                    self.create_file_item("FILE_ACCESS_NUMBER_01.ARCHIVO.PDF", "2MB", starred=True),
                    self.create_file_item("FILE_ACCESS_NUMBER_02.ARCHIVO.PDF", "2MB", starred=True),
                    self.create_file_item("FILE_ACCESS_NUMBER_03.ARCHIVO.PDF", "2MB", starred=True),
                ]),
            ],
        )
        
        return Container(
            content=Column(
                [
                    Container(
                        content=TextField(
                            hint_text="Search...",
                            prefix_icon=icons.SEARCH,
                            bgcolor=colors.BLACK,
                            border_color=colors.WHITE10,
                            border_width=1,
                            border_radius=8,
                            color=colors.WHITE,
                        ),
                        padding=10,
                    ),
                    Container(
                        content=starred_folders,
                        padding=10,
                    ),
                    Container(
                        content=starred_files,
                        padding=10,
                    ),
                ],
                spacing=20,
                scroll="auto",
            ),
            bgcolor=colors.BLACK,
            expand=True,
        )
    
    def build_trash_view(self):
        # Sección de archivos en papelera
        trash_info = Text("Trash (Files in trash last up to 24 hours)", weight="bold")
        
        trash_files = Column([
            self.create_file_item("FILE_ACCESS_NUMBER_01.ARCHIVO.PDF", "2MB", in_trash=True),
            self.create_file_item("FILE_ACCESS_NUMBER_02.ARCHIVO.PDF", "2MB", in_trash=True),
            self.create_file_item("FILE_ACCESS_NUMBER_03.ARCHIVO.PDF", "2MB", in_trash=True),
        ])
        
        return Container(
            content=Column(
                [
                    Container(
                        content=TextField(
                            hint_text="Search...",
                            prefix_icon=icons.SEARCH,
                            bgcolor=colors.BLACK,
                            border_color=colors.WHITE10,
                            border_width=1,
                            border_radius=8,
                            color=colors.WHITE,
                        ),
                        padding=10,
                    ),
                    Container(
                        content=trash_info,
                        padding=10,
                    ),
                    Container(
                        content=trash_files,
                        padding=10,
                    ),
                ],
                spacing=10,
                scroll="auto",
            ),
            bgcolor=colors.BLACK,
            expand=True,
        )
    
    def build_profile_view(self):
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
                    content=Text("User name", size=20, weight="bold"),
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
    
    def create_action_card(self, title, icon, color):
        return Container(
            content=Column(
                [
                    Container(
                        content=Icon(icon, size=30, color=colors.WHITE),
                        padding=10,
                        bgcolor=color,
                        border_radius=30,
                    ),
                    Text(title, size=12),
                ],
                horizontal_alignment="center",
                spacing=5,
            ),
            padding=10,
            bgcolor=colors.BLACK,
            border=ft.border.all(1, colors.WHITE24),
            border_radius=10,
            width=100,
            height=100,
            alignment=alignment.center,
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
    
    def create_file_item(self, filename, size, starred=False, in_trash=False):
        action_icon = icons.STAR if starred else icons.RESTORE if in_trash else icons.MORE_VERT
        action_color = colors.YELLOW if starred else colors.BLUE if in_trash else colors.WHITE
        
        return Container(
            content=Row(
                [
                    Text(filename, size=12, overflow="ellipsis"),
                    Row(
                        [
                            Text(size, size=12, color=colors.WHITE54),
                            IconButton(
                                icon=action_icon,
                                icon_color=action_color,
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

def main(page: Page):
    app = FileManagerApp()
    app.initialize_app(page)

ft.app(target=main)