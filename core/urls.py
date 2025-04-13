from django.urls import path
from . import views

urlpatterns = [
    path('', views.timesheet_view, name='timesheet'),
    path('save-time-entry/', views.save_time_entry, name='save_time_entry'),
    path('get-time-entries/', views.get_time_entries, name='get_time_entries'),
]
