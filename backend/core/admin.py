from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Campaign, CampaignMember, Character, 
    Note, Session, SessionAvailability, SessionLog, LogComment, UserStatsDaily
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


@admin.register(UserStatsDaily)
class UserStatsDailyAdmin(admin.ModelAdmin):
    """Статистика пользователей + график в админке."""
    list_display = ('date', 'new_users_count', 'total_users_count', 'masters_count', 'players_count', 'calculated_at')
    readonly_fields = ('date', 'new_users_count', 'total_users_count', 'masters_count', 'players_count', 'calculated_at')
    ordering = ('-date',)
    changelist_template = 'admin/core/userstatsdaily/change_list.html'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        recent_stats = list(UserStatsDaily.objects.order_by('-date')[:90])
        stats = list(reversed(recent_stats))
        labels = [entry.date.strftime('%Y-%m-%d') for entry in stats]
        new_users = [entry.new_users_count for entry in stats]
        total_users = [entry.total_users_count for entry in stats]
        latest_total = total_users[-1] if total_users else 0
        latest_new = new_users[-1] if new_users else 0
        seven_days_new = sum(new_users[-7:]) if new_users else 0
        has_non_zero = any(value > 0 for value in new_users + total_users)
        extra_context = extra_context or {}
        extra_context['chart_labels'] = labels
        extra_context['chart_new_users'] = new_users
        extra_context['chart_total_users'] = total_users
        extra_context['latest_total'] = latest_total
        extra_context['latest_new'] = latest_new
        extra_context['seven_days_new'] = seven_days_new
        extra_context['has_non_zero'] = has_non_zero
        return super().changelist_view(request, extra_context=extra_context)
