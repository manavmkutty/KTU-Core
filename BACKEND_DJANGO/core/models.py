from django.db import models

class Curriculum(models.Model):
    scheme = models.CharField(max_length=10)
    dept = models.CharField(max_length=20)
    semester = models.CharField(max_length=10)
    
    class Meta:
        unique_together = ('scheme', 'dept', 'semester')

    def __str__(self):
        return f"{self.scheme} - {self.dept} - {self.semester}"

class Subject(models.Model):
    curriculum = models.ForeignKey(Curriculum, related_name='subjects', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    credit = models.IntegerField()

    def __str__(self):
        return self.name

class Resource(models.Model):
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=[('notes', 'Notes'), ('pyq', 'PYQ'), ('textbook', 'Textbook')])
    size = models.CharField(max_length=50, blank=True, null=True)
    url = models.URLField()
    scheme = models.CharField(max_length=10)
    dept = models.CharField(max_length=20)
    semester = models.CharField(max_length=10)
    subject_name = models.CharField(max_length=200)

    def __str__(self):
        return self.title
