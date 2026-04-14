from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
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
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получить данные текущего пользователя"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def become_master(self, request):
        """Запрос на получение роли мастера"""
        user = request.user
        if user.role == 'master':
            return Response(
                {'message': 'Вы уже являетесь мастером'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.role = 'master'
        user.save()
        
        serializer = self.get_serializer(user)
        return Response(
            {'message': 'Вы получили роль мастера!', 'user': serializer.data},
            status=status.HTTP_200_OK
        )


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
        if self.request.user.role != 'master':
            raise permissions.PermissionDenied("Только мастер может создавать кампании")
        serializer.save(master_id=self.request.user.id)

    @action(detail=False, methods=['get'], url_path='all')
    def all_campaigns(self, request):
        """Список всех кампаний для раздела поиска/обзора."""
        queryset = Campaign.objects.all().order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='join-by-code')
    def join_by_code(self, request):
        """Присоединение к кампании по invite коду."""
        invite_code = (request.data.get('invite_code') or '').strip()
        campaign_id = request.data.get('campaign_id')

        if not invite_code:
            return Response(
                {'detail': 'invite_code обязателен'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            campaign = Campaign.objects.get(invite_code=invite_code)
        except Campaign.DoesNotExist:
            return Response(
                {'detail': 'Кампания с таким кодом не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )

        if campaign_id and str(campaign.id) != str(campaign_id):
            return Response(
                {'detail': 'Код не соответствует выбранной кампании'},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_member = CampaignMember.objects.filter(
            campaign=campaign,
            user=request.user
        ).first()
        if existing_member:
            return Response(
                {'detail': 'Вы уже состоите в этой кампании'},
                status=status.HTTP_200_OK
            )

        if request.user.role == 'master':
            return Response(
                {'detail': 'Другие мастера не могут вступать в чужие кампании'},
                status=status.HTTP_403_FORBIDDEN
            )

        CampaignMember.objects.create(
            campaign=campaign,
            user=request.user,
            role='player'
        )
        return Response(
            {'detail': 'Вы успешно присоединились к кампании'},
            status=status.HTTP_201_CREATED
        )


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
        if Character.objects.filter(campaign_id=campaign_id, user=self.request.user).exists():
            raise ValidationError({"campaign_id": ["В этой кампании у вас уже есть персонаж"]})
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

        # В журнале и API заметок пользователь видит только свои записи.
        queryset = Note.objects.filter(author=user)

        if campaign_id:
            queryset = queryset.filter(campaign_id=campaign_id)

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
        user = self.request.user
        member_queryset = Session.objects.filter(campaign__members__user=user).distinct()
        master_queryset = Session.objects.filter(campaign__master=user)

        # Для list оставляем фильтрацию по выбранной кампании.
        if self.action == 'list':
            campaign_id = self.request.query_params.get('campaign_id')
            if campaign_id:
                return member_queryset.filter(campaign_id=campaign_id)
            return Session.objects.none()

        # Для detail-операций (retrieve/update/destroy) нужен доступ по id.
        return master_queryset
    
    def perform_create(self, serializer):
        # Только мастер может создавать сессии
        campaign = Campaign.objects.get(id=self.request.data.get('campaign_id'))
        if campaign.master != self.request.user:
            raise permissions.PermissionDenied("Только мастер может создавать сессии")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.campaign.master != self.request.user:
            raise permissions.PermissionDenied("Только мастер может удалять сессии")
        instance.delete()


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