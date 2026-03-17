import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings


# =============================================================================
# ENUM для типов заметок (раздел 7 - Заметки игрока и мастера)
# =============================================================================
class NoteType(models.TextChoices):
    PERSONAL = 'personal', 'Личная заметка'
    NPC = 'npc', 'NPC'
    QUEST = 'quest', 'Квест'


# =============================================================================
# STATUS для сессий (раздел 7 - Планировщик сессий)
# =============================================================================
class SessionStatus(models.TextChoices):
    SCHEDULED = 'scheduled', 'Запланирована'
    COMPLETED = 'completed', 'Завершена'
    CANCELLED = 'cancelled', 'Отменена'


# =============================================================================
# STATUS для доступности на сессии
# =============================================================================
class AvailabilityStatus(models.TextChoices):
    YES = 'yes', 'Присутствую'
    NO = 'no', 'Не присутствую'
    MAYBE = 'maybe', 'Возможно'


# =============================================================================
# РОЛИ в кампании (раздел 7 - Разграничение прав доступа)
# =============================================================================
class CampaignRole(models.TextChoices):
    MASTER = 'master', 'Мастер'
    PLAYER = 'player', 'Игрок'


# =============================================================================
# МОДЕЛЬ 1: Пользователи (кастомная модель вместо стандартной)
# =============================================================================
class User(AbstractUser):
    """
    Расширенная модель пользователя
    SQL: users table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(max_length=100, unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Переопределяем поля для устранения конфликта related_name
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='core_user_groups',
        blank=True,
        help_text='Группы, к которым принадлежит пользователь.',
        verbose_name='группы'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='core_user_permissions',
        blank=True,
        help_text='Индивидуальные права пользователя.',
        verbose_name='права пользователя'
    )

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.email})"

    def get_campaigns_as_master(self):
        """Возвращает кампании, где пользователь является Мастером"""
        return self.mastered_campaigns.all()

    def get_campaigns_as_player(self):
        """Возвращает кампании, где пользователь является Игроком"""
        return self.campaign_memberships.filter(role=CampaignRole.PLAYER).values_list('campaign', flat=True)
    
    
# =============================================================================
# МОДЕЛЬ 2: Кампании/Партии (раздел 7 - Создание партии)
# =============================================================================
class Campaign(models.Model):
    """
    Игровая кампания (партия)
    SQL: campaigns table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, null=False)
    description = models.TextField(blank=True, null=True)
    invite_code = models.CharField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    master = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Используем ссылку на кастомную модель
        on_delete=models.CASCADE, 
        related_name='mastered_campaigns',
        limit_choices_to={'is_active': True}
    )

    class Meta:
        db_table = 'campaigns'
        ordering = ['-created_at']
        permissions = [
            ("can_edit_campaign", "Может редактировать кампанию"),
            ("can_delete_campaign", "Может удалить кампанию"),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Автогенерация invite_code при создании
        if not self.invite_code:
            self.invite_code = uuid.uuid4().hex[:12]
        super().save(*args, **kwargs)

    def is_master(self, user):
        """Проверяет, является ли пользователь мастером этой кампании"""
        return self.master == user

    def is_member(self, user):
        """Проверяет, является ли пользователь участником кампании"""
        return self.members.filter(user=user).exists()

    def get_member_role(self, user):
        """Возвращает роль пользователя в кампании"""
        try:
            member = self.members.get(user=user)
            return member.role
        except CampaignMember.DoesNotExist:
            return None

    def can_user_edit(self, user):
        """Проверяет права на редактирование кампании"""
        return self.is_master(user)


# =============================================================================
# МОДЕЛЬ 3: Участники кампании (раздел 7 - Управление участниками)
# =============================================================================
class CampaignMember(models.Model):
    """
    Связь пользователей и кампаний (многие-ко-многим с ролью)
    SQL: campaign_members table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaign_memberships')
    role = models.CharField(max_length=50, choices=CampaignRole.choices, default=CampaignRole.PLAYER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campaign_members'
        unique_together = ['campaign', 'user']  # Уникальный индекс из SQL
        ordering = ['joined_at']
        permissions = [
            ("can_change_member_role", "Может изменять роль участника"),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.campaign.name} as {self.role}"

    def is_master(self):
        """Проверяет, является ли участник мастером"""
        return self.role == CampaignRole.MASTER


# =============================================================================
# МОДЕЛЬ 4: Персонажи (раздел 7 - Лист персонажа)
# =============================================================================
class Character(models.Model):
    """
    Лист персонажа игрока
    SQL: characters table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='characters')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='characters')
    name = models.CharField(max_length=255, null=False)
    race = models.CharField(max_length=100, blank=True, null=True)
    class_name = models.CharField(max_length=100, blank=True, null=True, db_column='class')
    level = models.IntegerField(default=1)
    experience_points = models.IntegerField(default=0, blank=True, null=True)  # Добавлено для Version 1.1
    stats = models.JSONField(default=dict, blank=True)  # {str: int, ...}
    inventory = models.JSONField(default=list, blank=True)  # [{item: ...}, ...]
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'characters'
        unique_together = ['campaign', 'user']  # Уникальный индекс из SQL
        ordering = ['name']
        permissions = [
            ("can_edit_character", "Может редактировать персонажа"),
        ]

    def __str__(self):
        return f"{self.name} (Lvl {self.level})"

    def get_modifier(self, stat_name):
        """
        Расчёт модификатора характеристики по формуле D&D 5e
        Формула: (Значение - 10) // 2
        Раздел 7: Автоматический расчёт модификаторов
        """
        stat_value = self.stats.get(stat_name, 10)
        return (stat_value - 10) // 2

    def get_all_modifiers(self):
        """Возвращает словарь всех модификаторов"""
        modifiers = {}
        default_stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
        for stat in default_stats:
            modifiers[stat] = self.get_modifier(stat)
        return modifiers

    def get_skill_bonus(self, skill_name, associated_stat):
        """
        Расчёт бонуса навыка (модификатор характеристики + бонус мастерства)
        Бонус мастерства = 2 + (level - 1) // 4
        """
        stat_modifier = self.get_modifier(associated_stat)
        proficiency_bonus = 2 + (self.level - 1) // 4
        # Здесь можно добавить проверку владения навыком из JSON
        return stat_modifier + proficiency_bonus

    def can_user_edit(self, user):
        """Проверяет, может ли пользователь редактировать этого персонажа"""
        # Только владелец персонажа или мастер кампании могут редактировать
        return self.user == user or self.campaign.is_master(user)


# =============================================================================
# МОДЕЛЬ 5: Заметки (раздел 7 - Личные заметки, Квесты, NPC)
# =============================================================================
class Note(models.Model):
    """
    Заметки: личные, NPC, квесты
    SQL: notes table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    type = models.CharField(max_length=50, choices=NoteType.choices, null=False)
    title = models.CharField(max_length=255, null=False)
    content = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)  # Видно ли игрокам
    status = models.CharField(max_length=50, blank=True, null=True)  # active, completed, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['type', 'status']),
            models.Index(fields=['campaign', 'is_public']),
        ]
        permissions = [
            ("can_view_private_notes", "Может видеть приватные заметки"),
        ]

    def __str__(self):
        return f"[{self.get_type_display()}] {self.title}"

    def is_visible_to(self, user):
        """
        Проверяет, видна ли заметка пользователю
        Раздел 7: Разграничение прав доступа
        """
        # Мастер видит всё
        if self.campaign.is_master(user):
            return True
        # Игроки видят только публичные заметки
        return self.is_public

    def can_user_edit(self, user):
        """Проверяет права на редактирование заметки"""
        return self.author == user or self.campaign.is_master(user)


# =============================================================================
# МОДЕЛЬ 6: Сессии (раздел 7 - Планировщик сессий)
# =============================================================================
class Session(models.Model):
    """
    Игровая сессия (встреча партии)
    SQL: sessions table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=255, null=False)
    description = models.TextField(blank=True, null=True)
    start_time = models.DateTimeField(null=False)
    duration_minutes = models.IntegerField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=SessionStatus.choices, default=SessionStatus.SCHEDULED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sessions'
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['status', 'start_time']),
        ]
        permissions = [
            ("can_edit_session", "Может редактировать сессию"),
        ]

    def __str__(self):
        return f"{self.title} ({self.start_time})"

    def get_end_time(self):
        """Возвращает время окончания сессии"""
        if self.duration_minutes:
            from datetime import timedelta
            return self.start_time + timedelta(minutes=self.duration_minutes)
        return None

    def is_past(self):
        """Проверяет, прошла ли сессия"""
        return timezone.now() > self.start_time

    def can_user_edit(self, user):
        """Только мастер может редактировать сессию"""
        return self.campaign.is_master(user)


# =============================================================================
# МОДЕЛЬ 7: Доступность на сессии (раздел 7 - Отметка участия)
# =============================================================================
class SessionAvailability(models.Model):
    """
    Доступность пользователя на сессии
    SQL: session_availability table
    """
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='availabilities')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='session_availabilities')
    status = models.CharField(max_length=20, choices=AvailabilityStatus.choices, default=AvailabilityStatus.MAYBE)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'session_availability'
        unique_together = ['session', 'user']  # PRIMARY KEY (session_id, user_id)
        ordering = ['user']

    def __str__(self):
        return f"{self.user.username} - {self.get_status_display()} for {self.session.title}"

    @classmethod
    def get_availability_for_user(cls, session, user):
        """Возвращает статус доступности пользователя для сессии"""
        try:
            availability = cls.objects.get(session=session, user=user)
            return availability.status
        except cls.DoesNotExist:
            return AvailabilityStatus.MAYBE


# =============================================================================
# МОДЕЛЬ 8: Журнал сессий (раздел 7 - Журнал сессий)
# =============================================================================
class SessionLog(models.Model):
    """
    Запись о прошедшей сессии (лог)
    SQL: session_logs table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(Session, on_delete=models.SET_NULL, null=True, related_name='logs')
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='session_logs')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='session_logs')
    title = models.CharField(max_length=255, null=False)
    content = models.TextField(null=False)
    image_urls = models.JSONField(default=list, blank=True)  # Array of URLs
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'session_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['campaign', '-created_at']),
        ]
        permissions = [
            ("can_edit_log", "Может редактировать запись журнала"),
        ]

    def __str__(self):
        return self.title

    def can_user_edit(self, user):
        """Только автор или мастер могут редактировать запись"""
        return self.author == user or self.campaign.is_master(user)

    def get_comments_count(self):
        """Возвращает количество комментариев"""
        return self.comments.count()


# =============================================================================
# МОДЕЛЬ 9: Комментарии к записям журнала (раздел 7 - Комментирование)
# =============================================================================
class LogComment(models.Model):
    """
    Комментарии к записям журнала
    SQL: log_comments table
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    log = models.ForeignKey(SessionLog, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='log_comments')
    content = models.TextField(null=False)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        db_table = 'log_comments'
        ordering = ['created_at']
        permissions = [
            ("can_delete_comment", "Может удалять комментарии"),
        ]

    def __str__(self):
        return f"Comment by {self.author.username} on {self.log.title}"

    def can_user_edit(self, user):
        """Только автор может редактировать свой комментарий"""
        return self.author == user


# =============================================================================
# HELPER MODEL: Для Version 1.1 - Шаблоны NPC (опционально)
# =============================================================================
class NPCTemplate(models.Model):
    """
    Шаблоны NPC для быстрого создания (Version 1.1)
    Не в основной SQL схеме, но полезно для развития
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    stats = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'npc_templates'
        ordering = ['name']

    def __str__(self):
        return self.name
