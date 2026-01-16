from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fpdf import FPDF
import os
# import openai  # Uncomment if using real AI

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class ResumeRequest(BaseModel):
    fullName: str
    email: str
    phone: str
    summary: str
    skills: str
    experience: list
    education: list

class AIRequest(BaseModel):
    raw_text: str

# --- AI ENDPOINT ---
@app.post("/api/optimize-summary")
async def optimize_summary(request: AIRequest):
    """
    Simulates AI optimization. 
    To make this real:
    1. Uncomment 'import openai'
    2. Set openai.api_key = "YOUR_KEY"
    3. Call openai.ChatCompletion.create()
    """
    # MOCK RESPONSE (Delete this to use real AI)
    optimized_text = f"Results-oriented professional with expertise in {request.raw_text[:20]}... [AI Optimized Version]"
    return {"optimized_text": optimized_text}

# --- PDF GENERATION ENDPOINT ---
@app.post("/api/generate-pdf")
async def generate_pdf(data: ResumeRequest):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_font("Arial", "B", 24)
    pdf.cell(0, 10, data.fullName, ln=True, align="C")
    
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 5, f"{data.email} | {data.phone}", ln=True, align="C")
    pdf.ln(10)

    # Summary
    if data.summary:
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 8, "Professional Summary", ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        pdf.set_font("Arial", "", 11)
        pdf.multi_cell(0, 5, data.summary)
        pdf.ln(5)

    # Experience
    if data.experience:
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 8, "Experience", ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        for job in data.experience:
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 6, f"{job['role']} at {job['company']}", ln=True)
            pdf.set_font("Arial", "", 11)
            pdf.multi_cell(0, 5, job['description'])
            pdf.ln(3)
        pdf.ln(2)

    # Skills
    if data.skills:
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 8, "Skills", ln=True)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        pdf.set_font("Arial", "", 11)
        pdf.multi_cell(0, 5, data.skills)

    # 1. Save locally first (temporary)
    filename = "resume.pdf"
    pdf.output(filename)
    
    # 2. Return the file to the browser
    return FileResponse(
        path=filename, 
        filename="My_Resume.pdf", 
        media_type='application/pdf'
    )
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)