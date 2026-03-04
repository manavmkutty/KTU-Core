# Seed script for Django
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ktucore_backend.settings')
django.setup()

from core.models import Curriculum, Subject

def seed():
    # Clear existing data
    Curriculum.objects.all().delete()
    
    # Add dummy data
    c1, _ = Curriculum.objects.get_or_create(scheme='2019', dept='CS', semester='S1')
    Subject.objects.create(curriculum=c1, name="LINEAR ALGEBRA AND CALCULUS", credit=4)
    Subject.objects.create(curriculum=c1, name="ENGINEERING PHYSICS A", credit=4)
    Subject.objects.create(curriculum=c1, name="ENGINEERING GRAPHICS", credit=3)
    Subject.objects.create(curriculum=c1, name="BASICS OF CIVIL & MECH", credit=4)
    Subject.objects.create(curriculum=c1, name="PHYSICS LAB", credit=1)
    Subject.objects.create(curriculum=c1, name="CIVIL & MECH WORKSHOP", credit=1)

    print("Database seeded successfully with KTU S1 subjects!")

if __name__ == '__main__':
    seed()
