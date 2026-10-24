from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.admin_login, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/wish/edit/<int:wish_id>/', views.edit_wish, name='edit_wish'),
    path('dashboard/wish/delete/<int:wish_id>/', views.delete_wish, name='delete_wish'),
]