import flet as ft
from flet import (
    Column, Container, ElevatedButton, Row, Text, 
    colors, icons, Icon, alignment, padding, TextField
)
import bcrypt

class LoginPage:
    def __init__(self, page, on_login, db):
        self.page = page
        self.on_login = on_login
        self.db = db
        self.email_field = TextField(label="Correo", width=300)
        self.password_field = TextField(label="Contraseña", password=True, width=300)
        self.error_text = Text("", color=colors.RED)
        self.register_mode = False
        self.name_field = TextField(label="Nombre", width=300)
    
    def build(self):
        fields = [
            Text("Registrarse" if self.register_mode else "Iniciar sesión", size=30, weight="bold", color=colors.WHITE),
        ]
        if self.register_mode:
            fields.append(self.name_field)
        fields.extend([
            self.email_field,
            self.password_field,
            ElevatedButton("Registrar" if self.register_mode else "Entrar", on_click=self.handle_action),
            Row([
                ElevatedButton(
                    "¿Ya tienes cuenta? Inicia sesión" if self.register_mode else "¿No tienes cuenta? Regístrate",
                    on_click=self.toggle_mode,
                    bgcolor=colors.TRANSPARENT,
                    color=colors.BLUE,
                )
            ]),
            self.error_text,
        ])
        return Container(
            content=Column(
                fields,
                alignment="center",
                horizontal_alignment="center",
            ),
            bgcolor=colors.BLACK,
            alignment=alignment.center,
            expand=True,
        )
    
    def toggle_mode(self, e):
        self.register_mode = not self.register_mode
        self.error_text.value = ""
        self.page.controls.clear()
        self.page.add(self.build())
        self.page.update()

    def handle_action(self, e):
        email = self.email_field.value.strip()
        password = self.password_field.value.strip()
        if self.register_mode:
            name = self.name_field.value.strip()
            if not name or not email or not password:
                self.error_text.value = "Completa todos los campos"
                self.page.update()
                return
            if self.db.get_user_by_email(email):
                self.error_text.value = "El correo ya está registrado"
                self.page.update()
                return
            hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
            user_id = self.db.create_user({
                "name": name,
                "email": email,
                "password": hashed,
            })
            user = self.db.get_user_by_email(email)
            self.on_login(user)
        else:
            user = self.db.get_user_by_email(email)
            if user and bcrypt.checkpw(password.encode(), user["password"]):
                self.on_login(user)
            else:
                self.error_text.value = "Correo o contraseña incorrectos"
                self.page.update()