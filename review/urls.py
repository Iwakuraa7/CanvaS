from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login', views.login_view, name='login'),
    path('register', views.register_view, name='register'),
    path('logout', views.logout_view, name='logout'),
    path('userpage', views.user_page, name='user_page'),
    path('edit/<int:drawing_id>', views.edit_drawing, name='edit_drawing'),

    # API routes
    path('save_drawing', views.save_drawing, name='save_drawing'),
    path('get_drawings_<int:user_id>', views.get_drawings, name='get_drawings'),
]