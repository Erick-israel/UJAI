import flet as ft
import asyncio
from flet import Page, colors, Container, Column, Text, Row, NavigationRail, NavigationRailDestination
from flet import alignment, padding
from flet import icons
from database import Database
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from pages.folders_page import FoldersPage
from pages.starred_page import StarredPage
from pages.trash_page import TrashPage
from pages.profile_page import ProfilePage

class FileManagerApp:
    def __init__(self):
        self.db = Database()
        self.current_user = None
        self.current_view = "dashboard"
    
    def initialize_app(self, page: Page):
        self.page = page
        self.page.title = "Gestor de Archivos"
        self.page.theme_mode = ft.ThemeMode.DARK
        self.page.bgcolor = colors.BLACK
        self.page.padding = 0
        self.page.update()
        
        # Iniciar con la página de login
        self.show_login_view()
    
    def show_login_view(self):
        self.current_view = "login"
        self.page.controls.clear()
        
        login_page = LoginPage(self.page, self.handle_login, self.db)
        self.page.add(login_page.build())
        self.page.update()
    
    def handle_login(self, user):
        self.current_user = user
        
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
                            content=Text("Bienvenido", size=40, weight="bold", color=colors.WHITE),
                            alignment=alignment.center,
                            margin=padding.only(top=100, bottom=50),
                        ),
                        Container(
                            content=Text("Cargando...", color=colors.WHITE),
                            alignment=alignment.center,
                        ),
                    ],
                    alignment="center",
                    horizontal_alignment="center",
                ),
                bgcolor=colors.BLACK,
                alignment=alignment.center,
                expand=True,
            )
        )
        self.page.update()
        
        # Simular carga y luego mostrar dashboard
        self.page.run_task(self._wait_and_show_dashboard)
    
    async def _wait_and_show_dashboard(self):
        await asyncio.sleep(2)  # Espera 2 segundos
        self.show_main_layout()
    
    def show_main_layout(self):
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
        if self.current_view == "dashboard":
            content = DashboardPage(self.page, self.db, self.current_user).build()
        elif self.current_view == "folders":
            content = FoldersPage(self.page, self.db, self.current_user).build()
        elif self.current_view == "starred":
            content = StarredPage(self.page, self.db, self.current_user).build()
        elif self.current_view == "trash":
            content = TrashPage(self.page, self.db, self.current_user).build()
        else:
            content = Text("Vista no encontrada", color=colors.RED)
        self.page.add(self.build_layout(content))
        self.page.update()
    
    def build_layout(self, content):
        nav_rail = NavigationRail(
            selected_index=self.get_nav_index(),
            label_type="all",
            min_width=100,
            min_extended_width=200,
            destinations=[
                NavigationRailDestination(icon=icons.DASHBOARD, label="Dashboard"),
                NavigationRailDestination(icon=icons.FOLDER, label="Folders"),
                NavigationRailDestination(icon=icons.STAR, label="Starred"),
                NavigationRailDestination(icon=icons.DELETE, label="Trash"),
            ],
            on_change=self.handle_nav_change,
            bgcolor=colors.BLACK87,
        )
        return Row(
            [
                nav_rail,
                Container(
                    content=content,
                    expand=True,
                    bgcolor=colors.BLACK,
                    alignment=alignment.top_left,
                ),
            ],
            expand=True,
        )
    
    def handle_nav_change(self, e):
        index = e.control.selected_index
        if index == 0:
            self.current_view = "dashboard"
        elif index == 1:
            self.current_view = "folders"
        elif index == 2:
            self.current_view = "starred"
        elif index == 3:
            self.current_view = "trash"
        self.update_main_view()
    
    def get_nav_index(self):
        return {
            "dashboard": 0,
            "folders": 1,
            "starred": 2,
            "trash": 3,
        }.get(self.current_view, 0)

def main(page: Page):
    app = FileManagerApp()
    app.initialize_app(page)

if __name__ == "__main__":
    ft.app(target=main, view=ft.WEB_BROWSER)