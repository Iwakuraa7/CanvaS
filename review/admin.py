from django.contrib import admin

from .models import User, Drawing

class UserAdmin(admin.ModelAdmin):
    list_display = ['id', 'username']

class DrawingAdmin(admin.ModelAdmin):
    list_display = ['id', 'url', 'user']

admin.site.register(User)
admin.site.register(Drawing, DrawingAdmin)
