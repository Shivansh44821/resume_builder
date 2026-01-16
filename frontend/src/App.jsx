import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [resumeData, setResumeData] = useState({
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    skills: '',
    experience: [],
    education: []
  });

  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  const handleAddExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { role: '', company: '', description: '' }]
    });
  };

  const handleExpChange = (index, field, value) => {
    const newExp = [...resumeData.experience];
    newExp[index][field] = value;
    setResumeData({ ...resumeData, experience: newExp });
  };

  // --- AI FEATURE ---
  const optimizeSummary = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/optimize-summary', {
        raw_text: resumeData.summary
      });
      setResumeData({ ...resumeData, summary: res.data.optimized_text });
    } catch (error) {
      alert("Backend not running!");
    }
    setAiLoading(false);
  };

  const downloadPDF = async () => {
    try {
      // 1. Request the PDF with 'blob' response type
      const response = await axios.post(
        'http://localhost:8000/api/generate-pdf', 
        resumeData, 
        { responseType: 'blob' } // IMPORTANT: This tells axios it's a file
      );

      // 2. Create a URL for the file blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // 3. Create a temporary link element and click it
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'My_Resume.pdf'); // The filename the user sees
      document.body.appendChild(link);
      link.click();

      // 4. Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Download failed:", error);
      alert("Error downloading PDF");
    }
  };

  return (
    <div className="container">
      {/* LEFT SIDE: EDITOR */}
      <div className="editor">
        <h2>📝 Resume Builder</h2>
        
        <div className="section">
          <h3>Personal Info</h3>
          <input name="fullName" placeholder="Full Name" onChange={handleChange} />
          <input name="email" placeholder="Email" onChange={handleChange} />
          <input name="phone" placeholder="Phone" onChange={handleChange} />
        </div>

        <div className="section">
          <h3>Professional Summary</h3>
          <textarea 
            name="summary" 
            placeholder="Briefly describe yourself..." 
            value={resumeData.summary}
            onChange={handleChange}
          />
          <button 
            className="ai-btn" 
            onClick={optimizeSummary} 
            disabled={!resumeData.summary}
          >
            {aiLoading ? "✨ Optimizing..." : "✨ AI Rewrite"}
          </button>
        </div>

        <div className="section">
          <h3>Skills</h3>
          <input name="skills" placeholder="Python, React, Machine Learning..." onChange={handleChange} />
        </div>

        <div className="section">
          <h3>Experience</h3>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="exp-box">
              <input placeholder="Job Title" onChange={(e) => handleExpChange(index, 'role', e.target.value)} />
              <input placeholder="Company" onChange={(e) => handleExpChange(index, 'company', e.target.value)} />
              <textarea placeholder="Description" onChange={(e) => handleExpChange(index, 'description', e.target.value)} />
            </div>
          ))}
          <button onClick={handleAddExperience}>+ Add Job</button>
        </div>

        <button className="download-btn" onClick={downloadPDF}>⬇ Download PDF</button>
      </div>

      {/* RIGHT SIDE: LIVE PREVIEW */}
      <div className="preview">
        <div className="paper">
          <h1>{resumeData.fullName || "Your Name"}</h1>
          <p className="contact">{resumeData.email} | {resumeData.phone}</p>
          <hr />
          
          {resumeData.summary && (
            <div className="preview-section">
              <h4>SUMMARY</h4>
              <p>{resumeData.summary}</p>
            </div>
          )}

          {resumeData.experience.length > 0 && (
            <div className="preview-section">
              <h4>EXPERIENCE</h4>
              {resumeData.experience.map((exp, i) => (
                <div key={i}>
                  <strong>{exp.role}</strong> at <em>{exp.company}</em>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {resumeData.skills && (
            <div className="preview-section">
              <h4>SKILLS</h4>
              <p>{resumeData.skills}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;