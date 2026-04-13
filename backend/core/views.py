from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import (
    Campaign, CampaignMember, Character, Note, 
    Session, SessionAvailability, SessionLog, LogComment
)
from .serializers import (
    UserRegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer,
    CampaignSerializer, CampaignMemberSerializer, CharacterSerializer,
    NoteSerializer, SessionSerializer, SessionAvailabilitySerializer,
    SessionLogSerializer, LogCommentSerializer
)

User = get_user_model()


# Аутентификация
class RegisterView(viewsets.ViewSet):
    """Регистрация нового пользователя"""
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer
    
    def create(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Пользователь успешно зарегистрирован',
                'user_id': str(user.id)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Вход пользователя"""
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """Просмотр и редактирование профиля пользователя"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Пользователь видит только себя
        return User.objects.filter(id=self.request.user.id)


# Кампании
class CampaignViewSet(viewsets.ModelViewSet):
    """CRUD для кампаний"""
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Пользователь видит кампании, где он участник или мастер
        user = self.request.user
        return Campaign.objects.filter(
            members__user=user
        ).distinct()
    
    def perform_create(self, serializer):
        # Автоматически устанавливаем текущего пользователя как мастера
        serializer.save(master_id=self.request.user.id)


class CampaignMemberViewSet(viewsets.ModelViewSet):
    """Управление участниками кампании"""
    serializer_class = CampaignMemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        campaign_id = self.request.query_params.get('campaign_id')
        if campaign_id:
            return CampaignMember.objects.filter(campaign_id=campaign_id)
        return CampaignMember.objects.none()
    
    def perform_create(self, serializer):
        # Только мастер может добавлять участников
        campaign = Campaign.objects.get(id=self.request.data.get('campaign_id'))
        if campaign.master != self.request.user:
            raise permissions.PermissionDenied("Только мастер может добавлять участников")
        serializer.save()


# Персонажи
class CharacterViewSet(viewsets.ModelViewSet):
    """CRUD для персонажей"""
    serializer_class = CharacterSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        campaign_id = self.request.query_params.get('campaign_id')
        if campaign_id:
            return Character.objects.filter(campaign_id=campaign_id, user=user)
        return Character.objects.filter(user=user)
    
    def perform_create(self, serializer):
        # Проверка: пользователь может создать персонажа только в кампании, где он участник
        campaign_id = self.request.data.get('campaign_id')
        campaign = Campaign.objects.get(id=campaign_id)
        if not campaign.members.filter(user=self.request.user).exists():
            raise permissions.PermissionDenied("Вы не участник этой кампании")
        serializer.save(user_id=self.request.user.id)


# Заметки
class NoteViewSet(viewsets.ModelViewSet):
    """CRUD для заметок (квесты, NPC, личные заметки)"""
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        campaign_id = self.request.query_params.get('campaign_id')
        note_type = self.request.query_params.get('type')
        
        queryset = Note.objects.all()
        
        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)
        
        # Мастер видит всё, игрок только публичные заметки
        if not queryset.filter(campaign__master=user).exists():
            # Проверка для каждой кампании отдельно
            filtered = []
            for note in queryset:
                if note.campaign.master == user or note.is_public:
                    filtered.append(note.id)
            queryset = queryset.filter(id__in=filtered)
        
        if note_type:
            queryset = queryset.filter(type=note_type)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user.id)


# Сессии
class SessionViewSet(viewsets.ModelViewSet):
    """CRUD для сессий"""
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        campaign_id = self.request.query_params.get('campaign_id')
        if campaign_id:
            return Session.objects.filter(campaign_id=campaign_id)
        return Session.objects.none()
    
    def perform_create(self, serializer):
        # Только мастер может создавать сессии
        campaign = Campaign.objects.get(id=self.request.data.get('campaign_id'))
        if campaign.master != self.request.user:
            raise permissions.PermissionDenied("Только мастер может создавать сессии")
        serializer.save()


class SessionAvailabilityViewSet(viewsets.ModelViewSet):
    """Отметка доступности на сессии"""
    serializer_class = SessionAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if session_id:
            return SessionAvailability.objects.filter(session_id=session_id)
        return SessionAvailability.objects.none()
    
    def perform_create(self, serializer):
        # Пользователь может отметить только свою доступность
        serializer.save(user_id=self.request.user.id)


# Журнал сессий
class SessionLogViewSet(viewsets.ModelViewSet):
    """CRUD для записей журнала сессий"""
    serializer_class = SessionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        campaign_id = self.request.query_params.get('campaign_id')
        if campaign_id:
            return SessionLog.objects.filter(campaign_id=campaign_id)
        return SessionLog.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user.id)


class LogCommentViewSet(viewsets.ModelViewSet):
    """CRUD для комментариев к журналу"""
    serializer_class = LogCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        log_id = self.request.query_params.get('log_id')
        if log_id:
            return LogComment.objects.filter(log_id=log_id)
        return LogComment.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(author_id=self.request.user.id)