import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ktucore_backend.settings')
django.setup()

from core.models import Curriculum, Subject

def seed():
    print("Clearing existing curriculum data...")
    Curriculum.objects.all().delete()

    data = {
        # ─── 2019 SCHEME ───────────────────────────────────────────────
        ('2019', 'CS', 'S1'): [
            ("Linear Algebra and Calculus", 4),
            ("Engineering Physics A", 4),
            ("Engineering Graphics", 3),
            ("Basics of Civil & Mechanical Engineering", 4),
            ("Engineering Physics Lab", 1),
            ("Civil & Mechanical Workshop", 1),
        ],
        ('2019', 'CS', 'S2'): [
            ("Vector Calculus, Differential Equations & Transforms", 4),
            ("Engineering Chemistry", 4),
            ("Computer Programming (Python)", 4),
            ("Basics of Electrical & Electronics Engineering", 4),
            ("Computer Programming Lab", 1),
            ("Electrical & Electronics Workshop", 1),
        ],
        ('2019', 'CS', 'S3'): [
            ("Discrete Computational Structures", 4),
            ("Data Structures", 4),
            ("Logic System Design", 4),
            ("Design and Engineering", 3),
            ("Professional Ethics", 3),
            ("Data Structures Lab", 2),
            ("Logic Design Lab", 2),
        ],
        ('2019', 'CS', 'S4'): [
            ("Graph Theory", 4),
            ("Computer Organisation and Architecture", 4),
            ("Operating Systems", 4),
            ("Object Oriented Design and Programming", 4),
            ("OOP Lab", 2),
            ("Operating Systems Lab", 2),
        ],
        ('2019', 'CS', 'S5'): [
            ("Formal Languages and Automata Theory", 4),
            ("Computer Networks", 4),
            ("System Software", 4),
            ("Microprocessors and Microcontrollers", 3),
            ("Management of Software Systems", 3),
            ("System Software & Microprocessors Lab", 2),
            ("Disaster Management (Online)", 2),
        ],
        ('2019', 'CS', 'S6'): [
            ("Compiler Design", 4),
            ("Algorithm Analysis and Design", 4),
            ("Database Management Systems", 4),
            ("Program Elective I", 3),
            ("Compiler Lab", 2),
            ("Database Management Lab", 2),
        ],
        ('2019', 'CS', 'S7'): [
            ("Distributed Computing", 4),
            ("Program Elective II", 3),
            ("Program Elective III", 3),
            ("Open Elective", 3),
            ("Industrial Seminar", 2),
            ("Project Phase 1", 2),
        ],
        ('2019', 'CS', 'S8'): [
            ("Program Elective IV", 3),
            ("Open Elective II", 3),
            ("Project Phase 2", 6),
            ("Seminar & Industrial Training", 3),
        ],
        # 2019 EC
        ('2019', 'EC', 'S1'): [
            ("Linear Algebra and Calculus", 4),
            ("Engineering Physics B", 4),
            ("Engineering Graphics", 3),
            ("Basics of Civil & Mechanical Engineering", 4),
            ("Engineering Physics Lab", 1),
            ("Civil & Mechanical Workshop", 1),
        ],
        ('2019', 'EC', 'S2'): [
            ("Vector Calculus, Differential Equations & Transforms", 4),
            ("Engineering Chemistry", 4),
            ("Computer Programming (Python)", 4),
            ("Basics of Electrical & Electronics Engineering", 4),
            ("Computer Programming Lab", 1),
            ("Electrical & Electronics Workshop", 1),
        ],
        ('2019', 'EC', 'S3'): [
            ("Linear Algebra and Signals & Systems", 4),
            ("Network Theory", 4),
            ("Electronic Devices", 4),
            ("Logic Circuit Design", 4),
            ("Electronic Devices Lab", 2),
            ("Logic Design Lab", 2),
        ],
        ('2019', 'EC', 'S4'): [
            ("Probability, Random Processes and Statistics", 4),
            ("Analog Circuits", 4),
            ("Computer Organisation and Architecture", 4),
            ("VLSI Circuit Design", 4),
            ("Analog Circuits Lab", 2),
            ("VLSI Lab", 2),
        ],
        ('2019', 'EC', 'S5'): [
            ("Digital Communication", 4),
            ("Electromagnetic Theory", 4),
            ("Linear IC Applications", 4),
            ("Digital Signal Processing", 4),
            ("DSP Lab", 2),
            ("Linear IC Lab", 2),
        ],
        ('2019', 'EC', 'S6'): [
            ("Wireless Communication", 4),
            ("Microprocessors and Microcontrollers", 4),
            ("Program Elective I", 3),
            ("Embedded Systems", 4),
            ("Microprocessors Lab", 2),
            ("Mini Project", 2),
        ],
        ('2019', 'EC', 'S7'): [
            ("Optical and Microwave Communication", 4),
            ("Program Elective II", 3),
            ("Program Elective III", 3),
            ("Open Elective", 3),
            ("Seminar", 2),
            ("Project Phase 1", 2),
        ],
        ('2019', 'EC', 'S8'): [
            ("Elective IV", 3),
            ("Open Elective II", 3),
            ("Project Phase 2", 6),
            ("Seminar & Industrial Training", 3),
        ],

        # ─── 2024 SCHEME ───────────────────────────────────────────────
        ('2024', 'CS', 'S1'): [
            ("Linear Algebra and Calculus", 4),
            ("Engineering Physics", 4),
            ("Basics of Mechanical Engineering", 3),
            ("Professional Communication in English", 3),
            ("Engineering Graphics and CAD", 3),
            ("Engineering Physics Lab", 1),
            ("Workshop Practice", 1),
        ],
        ('2024', 'CS', 'S2'): [
            ("Multivariable Calculus and ODE", 4),
            ("Engineering Chemistry", 4),
            ("Introduction to Computing and Python Programming", 4),
            ("Basics of Electrical Engineering", 3),
            ("Environmental Science", 2),
            ("Python Programming Lab", 1),
            ("Electrical Engineering Lab", 1),
        ],
        ('2024', 'CS', 'S3'): [
            ("Probability and Statistical Methods", 4),
            ("Data Structures and Algorithms", 4),
            ("Computer Organization and Architecture", 4),
            ("Object Oriented Programming with Java", 4),
            ("Data Structures Lab", 2),
            ("OOP Lab", 2),
        ],
        ('2024', 'CS', 'S4'): [
            ("Discrete Mathematics", 4),
            ("Operating Systems", 4),
            ("Database Management Systems", 4),
            ("Design and Analysis of Algorithms", 4),
            ("OS & DBMS Lab", 2),
            ("Mini Project", 2),
        ],
        ('2024', 'CS', 'S5'): [
            ("Theory of Computation", 4),
            ("Computer Networks", 4),
            ("Software Engineering", 3),
            ("Program Elective I", 3),
            ("Open Elective I", 3),
            ("Networks Lab", 2),
            ("Seminar", 1),
        ],
        ('2024', 'CS', 'S6'): [
            ("Compiler Design", 4),
            ("Machine Learning", 4),
            ("Cloud Computing", 3),
            ("Program Elective II", 3),
            ("Open Elective II", 3),
            ("Machine Learning Lab", 2),
            ("Project Phase 1", 2),
        ],
        ('2024', 'CS', 'S7'): [
            ("Program Elective III", 3),
            ("Program Elective IV", 3),
            ("Open Elective III", 3),
            ("Industrial Training Report", 2),
            ("Project Phase 2", 6),
        ],
        ('2024', 'CS', 'S8'): [
            ("Program Elective V", 3),
            ("Open Elective IV", 3),
            ("Project Phase 3", 6),
            ("Comprehensive Viva Voce", 3),
        ],
        # 2024 EC
        ('2024', 'EC', 'S1'): [
            ("Linear Algebra and Calculus", 4),
            ("Engineering Physics", 4),
            ("Basics of Mechanical Engineering", 3),
            ("Professional Communication in English", 3),
            ("Engineering Graphics and CAD", 3),
            ("Engineering Physics Lab", 1),
            ("Workshop Practice", 1),
        ],
        ('2024', 'EC', 'S2'): [
            ("Multivariable Calculus and ODE", 4),
            ("Engineering Chemistry", 4),
            ("Introduction to Computing and Python Programming", 4),
            ("Basics of Electrical Engineering", 3),
            ("Environmental Science", 2),
            ("Python Programming Lab", 1),
            ("Electrical Engineering Lab", 1),
        ],
        ('2024', 'EC', 'S3'): [
            ("Signals and Systems", 4),
            ("Electronic Circuits", 4),
            ("Digital System Design", 4),
            ("Network Analysis", 4),
            ("Electronic Circuits Lab", 2),
            ("Digital Systems Lab", 2),
        ],
        ('2024', 'EC', 'S4'): [
            ("Electromagnetics", 4),
            ("Analog Communication", 4),
            ("VLSI Design", 4),
            ("Program Elective I", 3),
            ("Communication Lab", 2),
            ("VLSI Lab", 2),
        ],
        ('2024', 'EC', 'S5'): [
            ("Digital Communication", 4),
            ("Microprocessors and Embedded Systems", 4),
            ("Digital Signal Processing", 4),
            ("Program Elective II", 3),
            ("Open Elective I", 3),
            ("DSP Lab", 2),
        ],
        ('2024', 'EC', 'S6'): [
            ("Wireless Communication", 4),
            ("Optical Communication", 3),
            ("Program Elective III", 3),
            ("Open Elective II", 3),
            ("Microwave Lab", 2),
            ("Project Phase 1", 2),
        ],
        ('2024', 'EC', 'S7'): [
            ("Program Elective IV", 3),
            ("Open Elective III", 3),
            ("Industrial Training Report", 2),
            ("Project Phase 2", 6),
        ],
        ('2024', 'EC', 'S8'): [
            ("Program Elective V", 3),
            ("Open Elective IV", 3),
            ("Project Phase 3", 6),
            ("Comprehensive Viva Voce", 3),
        ],
        # 2024 AIML
        ('2024', 'AIML', 'S1'): [
            ("Linear Algebra and Calculus", 4),
            ("Engineering Physics", 4),
            ("Basics of Mechanical Engineering", 3),
            ("Professional Communication in English", 3),
            ("Engineering Graphics and CAD", 3),
            ("Engineering Physics Lab", 1),
            ("Workshop Practice", 1),
        ],
        ('2024', 'AIML', 'S2'): [
            ("Multivariable Calculus and ODE", 4),
            ("Engineering Chemistry", 4),
            ("Python for AI", 4),
            ("Basics of Electrical Engineering", 3),
            ("Environmental Science", 2),
            ("Python Lab", 1),
            ("Electrical Lab", 1),
        ],
        ('2024', 'AIML', 'S3'): [
            ("Probability and Statistics", 4),
            ("Data Structures and Algorithms", 4),
            ("Fundamentals of AI", 4),
            ("Database Systems", 4),
            ("DSA Lab", 2),
            ("AI Fundamentals Lab", 2),
        ],
        ('2024', 'AIML', 'S4'): [
            ("Machine Learning", 4),
            ("Computer Vision", 4),
            ("Natural Language Processing", 4),
            ("Deep Learning", 4),
            ("ML Lab", 2),
            ("Mini Project", 2),
        ],
        ('2024', 'AIML', 'S5'): [
            ("Reinforcement Learning", 4),
            ("Big Data Analytics", 4),
            ("AI Ethics and Governance", 3),
            ("Program Elective I", 3),
            ("Open Elective I", 3),
            ("Big Data Lab", 2),
        ],
        ('2024', 'AIML', 'S6'): [
            ("Explainable AI", 3),
            ("Generative AI", 4),
            ("Program Elective II", 3),
            ("Open Elective II", 3),
            ("Generative AI Lab", 2),
            ("Project Phase 1", 2),
        ],
        ('2024', 'AIML', 'S7'): [
            ("Program Elective III", 3),
            ("Open Elective III", 3),
            ("Industrial Training Report", 2),
            ("Project Phase 2", 6),
        ],
        ('2024', 'AIML', 'S8'): [
            ("Program Elective IV", 3),
            ("Open Elective IV", 3),
            ("Project Phase 3", 6),
            ("Comprehensive Viva Voce", 3),
        ],
        # 2024 ME
        ('2024', 'ME', 'S1'): [
            ("Linear Algebra and Calculus", 4),
            ("Engineering Physics", 4),
            ("Basics of Mechanical Engineering", 3),
            ("Professional Communication in English", 3),
            ("Engineering Graphics and CAD", 3),
            ("Engineering Physics Lab", 1),
            ("Workshop Practice", 1),
        ],
        ('2024', 'ME', 'S2'): [
            ("Multivariable Calculus and ODE", 4),
            ("Engineering Chemistry", 4),
            ("Introduction to Computing and Python Programming", 4),
            ("Basics of Electrical Engineering", 3),
            ("Environmental Science", 2),
            ("Python Programming Lab", 1),
            ("Electrical Engineering Lab", 1),
        ],
        ('2024', 'ME', 'S3'): [
            ("Engineering Mechanics", 4),
            ("Thermodynamics", 4),
            ("Material Science", 4),
            ("Fluid Mechanics", 4),
            ("Engineering Mechanics Lab", 2),
            ("Thermodynamics Lab", 2),
        ],
        ('2024', 'ME', 'S4'): [
            ("Solid Mechanics", 4),
            ("Manufacturing Technology", 4),
            ("Machine Tools and Operations", 4),
            ("Heat Transfer", 4),
            ("Manufacturing Lab", 2),
            ("Mini Project", 2),
        ],
        ('2024', 'ME', 'S5'): [
            ("Machine Design", 4),
            ("Dynamics of Machinery", 4),
            ("Metrology and Quality Control", 3),
            ("Program Elective I", 3),
            ("Open Elective I", 3),
            ("Machine Design Lab", 2),
        ],
        ('2024', 'ME', 'S6'): [
            ("Industrial Engineering and Management", 3),
            ("CAD/CAM", 4),
            ("Program Elective II", 3),
            ("Open Elective II", 3),
            ("CAD/CAM Lab", 2),
            ("Project Phase 1", 2),
        ],
        ('2024', 'ME', 'S7'): [
            ("Program Elective III", 3),
            ("Open Elective III", 3),
            ("Industrial Training Report", 2),
            ("Project Phase 2", 6),
        ],
        ('2024', 'ME', 'S8'): [
            ("Program Elective IV", 3),
            ("Open Elective IV", 3),
            ("Project Phase 3", 6),
            ("Comprehensive Viva Voce", 3),
        ],
    }

    count = 0
    for (scheme, dept, semester), subjects in data.items():
        curriculum, _ = Curriculum.objects.get_or_create(scheme=scheme, dept=dept, semester=semester)
        for name, credit in subjects:
            Subject.objects.create(curriculum=curriculum, name=name, credit=credit)
        count += 1
        print(f"  ✓ Seeded {scheme} / {dept} / {semester} ({len(subjects)} subjects)")

    print(f"\n✅ Done! Seeded {count} curriculum entries across all schemes, departments, and semesters.")

if __name__ == '__main__':
    seed()
