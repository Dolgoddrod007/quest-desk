from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, UserViewSet,
    CampaignViewSet, CampaignMemberViewSet, CharacterViewSet,
    NoteViewSet, SessionViewSet, SessionAvailabilityViewSet,
    SessionLogViewSet, LogCommentViewSet
)

router = DefaultRouter()

# Аутентификация
router.register(r'auth/register', RegisterView, basename='register')
router.register(r'users', UserViewSet, basename='user')

# Кампании
router.register(r'campaigns', CampaignViewSet, basename='campaign')
router.register(r'campaign-members', CampaignMemberViewSet, basename='campaign-member')

# Персонажи
router.register(r'characters', CharacterViewSet, basename='character')

# Заметки
router.register(r'notes', NoteViewSet, basename='note')

# Сессии
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'session-availability', SessionAvailabilityViewSet, basename='session-availability')

# Журнал
router.register(r'session-logs', SessionLogViewSet, basename='session-log')
router.register(r'log-comments', LogCommentViewSet, basename='log-comment')

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token-refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]