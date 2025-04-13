from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from .models import TimeEntrys
from datetime import datetime
import json

def timesheet_view(request):
    return render(request, "core/base.html")

@csrf_exempt
def save_time_entry(request):
    if request.method == "POST":
        data = json.loads(request.body)
        date_str = data.get("date")
        in_time = data.get("in_time")
        out_time = data.get("out_time")
        duration = data.get("duration")

        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        day_name = date_obj.strftime('%A')  # Automatically extract day

        entry, created = TimeEntrys.objects.get_or_create(date=date_obj, defaults={"day": day_name})

        if in_time:
            entry.in_time = datetime.strptime(in_time, "%H:%M:%S").time()
        if out_time:
            entry.out_time = datetime.strptime(out_time, "%H:%M:%S").time()
        if duration:
            entry.duration = duration

        entry.save()
        return JsonResponse({"message": "Time entry saved successfully!"})

    return JsonResponse({"error": "Invalid request"}, status=400)

def get_time_entries(request):
    entries = TimeEntrys.objects.all().values("date", "day", "in_time", "out_time", "duration")
    return JsonResponse(list(entries), safe=False)
