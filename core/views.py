from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from .models import TimeSheet, TimeEntry
from datetime import datetime, timedelta
import json

def timesheet_view(request):
    return render(request, "core/base.html")

@csrf_exempt
def save_time_entry(request):
    if request.method == "POST":
        data = json.loads(request.body)
        date_str = data.get("date")
        entry_type = data.get("entry_type")
        timestamp_str = data.get("timestamp")

        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        day_name = date_obj.strftime('%A')
        timestamp = datetime.strptime(f"{date_str} {timestamp_str}", "%Y-%m-%d %H:%M:%S")

        timesheet, created = TimeSheet.objects.get_or_create(
            date=date_obj,
            defaults={"day": day_name}
        )

        # Create new time entry
        TimeEntry.objects.create(
            timesheet=timesheet,
            timestamp=timestamp,
            entry_type=entry_type
        )

        # Calculate total duration
        entries = TimeEntry.objects.filter(timesheet=timesheet).order_by('timestamp')
        total_seconds = 0
        last_in = None

        for entry in entries:
            if entry.entry_type == 'IN':
                last_in = entry.timestamp
            elif entry.entry_type == 'OUT' and last_in:
                duration = entry.timestamp - last_in
                total_seconds += duration.total_seconds()
                last_in = None

        hours = int(total_seconds // 3600)
        minutes = int((total_seconds % 3600) // 60)
        seconds = int(total_seconds % 60)
        timesheet.total_duration = f"{hours}h {minutes}m {seconds}s"
        timesheet.save()

        return JsonResponse({
            "message": "Time entry saved successfully!",
            "total_duration": timesheet.total_duration
        })

    return JsonResponse({"error": "Invalid request"}, status=400)

def get_time_entries(request):
    date = request.GET.get('date')
    if date:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        timesheet = TimeSheet.objects.filter(date=date_obj).first()
        
        if timesheet:
            entries = TimeEntry.objects.filter(timesheet=timesheet).order_by('timestamp')
            entry_data = [{
                'timestamp': entry.timestamp.strftime('%H:%M:%S'),
                'entry_type': entry.entry_type
            } for entry in entries]
            
            return JsonResponse({
                'date': date,
                'day': timesheet.day,
                'total_duration': timesheet.total_duration or "0h 0m 0s",
                'entries': entry_data
            })
    
    return JsonResponse({
        'date': date,
        'entries': [],
        'total_duration': "0h 0m 0s"
    })
