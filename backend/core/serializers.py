from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Campaign, CampaignMember, Character, 
    Note, Session, SessionAvailability, SessionLog, LogComment
)


# Аутентификация
class UserRegisterSerializer(serializers.ModelSerializer):
    """Сериализатор регистрации пользователя"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'avatar_url']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        # Извлекаем пароли и avatar_url перед созданием пользователя
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')
        avatar_url = validated_data.pop('avatar_url', None)
        
        # Создаём пользователя
        user = User.objects.create_user(password=password, **validated_data)
        
        # Устанавливаем avatar_url если задан
        if avatar_url:
            user.avatar_url = avatar_url
            user.save()
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Кастомный сериализатор токена с дополнительными данными"""
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'avatar_url': self.user.avatar_url,
            'role': self.user.role,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор пользователя"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar_url', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']


# Кампании
class CampaignMemberSerializer(serializers.ModelSerializer):
    """Сериализатор участника кампании"""
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = CampaignMember
        fields = ['id', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        if user_id:
            validated_data['user'] = User.objects.get(id=user_id)
        return super().create(validated_data)


class CampaignSerializer(serializers.ModelSerializer):
    """Сериализатор кампании"""
    members = CampaignMemberSerializer(many=True, read_only=True)
    master = UserSerializer(read_only=True)
    master_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Campaign
        fields = ['id', 'name', 'description', 'invite_code', 'master', 'master_id', 'members', 'created_at']
        read_only_fields = ['id', 'invite_code', 'created_at', 'master']

    def create(self, validated_data):
        master_id = validated_data.pop('master_id')
        validated_data['master'] = User.objects.get(id=master_id)
        campaign = Campaign.objects.create(**validated_data)
        # Добавляем мастера как участника
        CampaignMember.objects.create(campaign=campaign, user=campaign.master, role='master')
        return campaign


# Персонажи
class CharacterSerializer(serializers.ModelSerializer):
    """Сериализатор персонажа с авторасчётом модификаторов"""
    modifiers = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True, required=False)
    campaign_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Character
        fields = [
            'id', 'campaign', 'campaign_id', 'user', 'user_id', 'name', 'race', 
            'class_name', 'level', 'stats', 'inventory', 'modifiers', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'campaign', 'created_at', 'updated_at', 'modifiers']

    def get_modifiers(self, obj):
        """Расчёт модификаторов характеристик (D&D 5e: (stat - 10) // 2)"""
        modifiers = {}
        default_stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
        for stat in default_stats:
            stat_value = obj.stats.get(stat, 10)
            modifiers[stat] = (stat_value - 10) // 2
        return modifiers

    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        campaign_id = validated_data.pop('campaign_id', None)
        if not user_id:
            raise serializers.ValidationError({'user_id': ['Это поле обязательно.']})
        if not campaign_id:
            raise serializers.ValidationError({'campaign_id': ['Это поле обязательно.']})
        validated_data['user'] = User.objects.get(id=user_id)
        validated_data['campaign'] = Campaign.objects.get(id=campaign_id)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Для редактирования позволяем не передавать user_id/campaign_id.
        user_id = validated_data.pop('user_id', None)
        campaign_id = validated_data.pop('campaign_id', None)
        if user_id:
            instance.user = User.objects.get(id=user_id)
        if campaign_id:
            instance.campaign = Campaign.objects.get(id=campaign_id)
        return super().update(instance, validated_data)


# Заметки
class NoteSerializer(serializers.ModelSerializer):
    """Сериализатор заметок (квесты, NPC, личные заметки)"""
    author = UserSerializer(read_only=True)
    author_id = serializers.UUIDField(write_only=True, required=False)
    campaign_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Note
        fields = [
            'id', 'campaign', 'campaign_id', 'author', 'author_id', 'type', 
            'title', 'content', 'is_public', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'campaign', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        author_id = validated_data.pop('author_id', None)
        campaign_id = validated_data.pop('campaign_id')
        if not author_id and self.context.get('request'):
            author_id = self.context['request'].user.id
        if not author_id:
            raise serializers.ValidationError({'author_id': ['Это поле обязательно.']})
        validated_data['author'] = User.objects.get(id=author_id)
        validated_data['campaign'] = Campaign.objects.get(id=campaign_id)
        return super().create(validated_data)


# Сессии
class SessionAvailabilitySerializer(serializers.ModelSerializer):
    """Сериализатор доступности на сессии"""
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = SessionAvailability
        fields = ['session', 'user', 'user_id', 'status']

    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        if user_id:
            validated_data['user'] = User.objects.get(id=user_id)
        return super().create(validated_data)


class SessionSerializer(serializers.ModelSerializer):
    """Сериализатор сессии"""
    availabilities = SessionAvailabilitySerializer(many=True, read_only=True)
    campaign_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'campaign', 'campaign_id', 'title', 'description', 'start_time',
            'duration_minutes', 'status', 'availabilities', 'created_at'
        ]
        read_only_fields = ['id', 'campaign', 'availabilities', 'created_at']

    def create(self, validated_data):
        campaign_id = validated_data.pop('campaign_id')
        validated_data['campaign'] = Campaign.objects.get(id=campaign_id)
        return super().create(validated_data)


# Журнал сессий
class LogCommentSerializer(serializers.ModelSerializer):
    """Сериализатор комментариев к журналу"""
    author = UserSerializer(read_only=True)
    author_id = serializers.UUIDField(write_only=True)
    log_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = LogComment
        fields = ['id', 'log', 'log_id', 'author', 'author_id', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']

    def create(self, validated_data):
        author_id = validated_data.pop('author_id')
        log_id = validated_data.pop('log_id')
        validated_data['author'] = User.objects.get(id=author_id)
        validated_data['log'] = SessionLog.objects.get(id=log_id)
        return super().create(validated_data)


class SessionLogSerializer(serializers.ModelSerializer):
    """Сериализатор журнала сессий"""
    author = UserSerializer(read_only=True)
    author_id = serializers.UUIDField(write_only=True)
    campaign_id = serializers.UUIDField(write_only=True)
    comments = LogCommentSerializer(many=True, read_only=True)

    class Meta:
        model = SessionLog
        fields = [
            'id', 'session', 'campaign', 'campaign_id', 'author', 'author_id', 
            'title', 'content', 'image_urls', 'comments', 'created_at'
        ]
        read_only_fields = ['id', 'author', 'created_at']

    def create(self, validated_data):
        author_id = validated_data.pop('author_id')
        campaign_id = validated_data.pop('campaign_id')
        validated_data['author'] = User.objects.get(id=author_id)
        validated_data['campaign'] = Campaign.objects.get(id=campaign_id)
        return super().create(validated_data)