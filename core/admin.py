from django.contrib import admin
from .models import TimeSheet, TimeEntry

# Register your models here.

admin.site.register(TimeSheet)
admin.site.register(TimeEntry)