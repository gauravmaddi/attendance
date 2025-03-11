from django.urls import path
from .views import timesheet_view, save_time_entry, get_time_entries

urlpatterns = [
    path("", timesheet_view, name="timesheet"),
    path("save-time-entry/", save_time_entry, name="save-time-entry"),
    path("get-time-entries/", get_time_entries, name="get-time-entries"),
]
