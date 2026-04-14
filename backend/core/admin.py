from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Campaign, CampaignMember, Character, 
    Note, Session, SessionAvailability, SessionLog, LogComment
)


# Пользователи
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Админка для пользователей"""
    list_display = ('username', 'email', 'role', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('username', 'email')
    readonly_fields = ('id', 'created_at')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('id', 'username', 'email', 'avatar_url', 'role')
        }),
        ('Права доступа', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Даты', {
            'fields': ('created_at', 'last_login'),
        }),
    )


# Кампании
@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    """Админка для кампаний"""
    list_display = ('name', 'master', 'invite_code', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at')


# Члены кампании
@admin.register(CampaignMember)
class CampaignMemberAdmin(admin.ModelAdmin):
    """Админка для членов кампании"""
    list_display = ('user', 'campaign', 'role', 'joined_at')
    list_filter = ('role', 'joined_at', 'campaign')
    search_fields = ('user__username', 'campaign__name')
    readonly_fields = ('id', 'joined_at')


# Персонажи
@admin.register(Character)
class CharacterAdmin(admin.ModelAdmin):
    """Админка для персонажей"""
    list_display = ('name', 'user', 'campaign', 'level', 'created_at')
    list_filter = ('level', 'created_at', 'campaign')
    search_fields = ('name', 'user__username')
    readonly_fields = ('id', 'created_at')


# Заметки
@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """Админка для заметок"""
    list_display = ('title', 'author', 'type', 'campaign', 'created_at')
    list_filter = ('type', 'created_at', 'campaign')
    search_fields = ('title', 'content', 'author__username')
    readonly_fields = ('id', 'created_at')


# Сессии
@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    """Админка для сессий"""
    list_display = ('title', 'campaign', 'status', 'start_time')
    list_filter = ('status', 'start_time', 'campaign')
    search_fields = ('title', 'description')
    readonly_fields = ('id', 'created_at')


# Доступность
@admin.register(SessionAvailability)
class SessionAvailabilityAdmin(admin.ModelAdmin):
    """Админка для доступности на сессии"""
    list_display = ('user', 'session', 'status')
    list_filter = ('status', 'session')
    search_fields = ('user__username', 'session__title')
    readonly_fields = ('updated_at',)


# Логи сессий
@admin.register(SessionLog)
class SessionLogAdmin(admin.ModelAdmin):
    """Админка для логов сессий"""
    list_display = ('title', 'session', 'created_at')
    list_filter = ('created_at', 'session')
    search_fields = ('title', 'content')
    readonly_fields = ('id', 'created_at')


# Комментарии логов
@admin.register(LogComment)
class LogCommentAdmin(admin.ModelAdmin):
    """Админка для комментариев логов"""
    list_display = ('author', 'log', 'created_at')
    list_filter = ('created_at', 'log')
    search_fields = ('content', 'author__username')
    readonly_fields = ('id', 'created_at')
