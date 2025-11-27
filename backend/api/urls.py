from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RecommendationView, FarmViewSet, RegisterView, UserProfileView

router = DefaultRouter()
router.register(r'farms', FarmViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('recommendations/<int:farm_id>/', RecommendationView.as_view(), name='recommendations'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
]
