# from django.db import models

# class TimeEntrys(models.Model):
#     date = models.DateField()
#     day = models.CharField(max_length=10)
#     in_time = models.TimeField(null=True, blank=True)
#     out_time = models.TimeField(null=True, blank=True)
#     duration = models.CharField(max_length=20, null=True, blank=True)

#     def __str__(self):
#         return f"{self.date} - {self.day}"


from django.db import models

class TimeSheet(models.Model):
    date = models.DateField(unique=True)
    day = models.CharField(max_length=10)
    total_duration = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.date} - {self.day}"

class TimeEntry(models.Model):
    timesheet = models.ForeignKey(TimeSheet, related_name='entries', on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    entry_type = models.CharField(max_length=10, choices=[('IN', 'Clock In'), ('OUT', 'Clock Out')])
    
    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.timesheet.date} - {self.entry_type} at {self.timestamp.strftime('%H:%M:%S')}"
