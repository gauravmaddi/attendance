from django.db import models

class TimeEntrys(models.Model):
    date = models.DateField()
    day = models.CharField(max_length=10)
    in_time = models.TimeField(null=True, blank=True)
    out_time = models.TimeField(null=True, blank=True)
    duration = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.date} - {self.day}"
