# KTU-Core
As students under KTU, one of the most profound issues we face is finding reliable resources for coursework and skill development. Therefore, we opt to create a website where students can freely access all the resources, estimate their activity points, cgpa calculation, etc.

## Architecture & Setup
The project is split into two main microservices:
- **Backend (Django)**: RESTful API that handles resources, curriculums, and acts as a gateway proxy for chatbot queries.
- **Chatbot (FastAPI)**: RAG-based AI assistant using Groq and Langchain to help answer student queries.

Please refer to `Guide.md` for full instructions on how to install and run the services simultaneously.
