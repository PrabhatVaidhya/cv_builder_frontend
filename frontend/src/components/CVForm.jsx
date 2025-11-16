import { useState } from 'react'
import './CVForm.css'

function CVForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    education: [
      { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
    ],
    experience: [
      { company: '', position: '', location: '', startDate: '', endDate: '', description: '' }
    ],
    skills: {
      technical: '',
      soft: '',
      languages: ''
    },
    projects: [
      { name: '', description: '', technologies: '', link: '' }
    ],
    certifications: ''
  })

  const handlePersonalInfoChange = (e) => {
    setFormData({
      ...formData,
      personalInfo: { ...formData.personalInfo, [e.target.name]: e.target.value }
    })
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSkillsChange = (e) => {
    setFormData({
      ...formData,
      skills: { ...formData.skills, [e.target.name]: e.target.value }
    })
  }

  const handleEducationChange = (index, e) => {
    const newEducation = [...formData.education]
    newEducation[index][e.target.name] = e.target.value
    setFormData({ ...formData, education: newEducation })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]
    })
  }

  const removeEducation = (index) => {
    const newEducation = formData.education.filter((_, i) => i !== index)
    setFormData({ ...formData, education: newEducation })
  }

  const handleExperienceChange = (index, e) => {
    const newExperience = [...formData.experience]
    newExperience[index][e.target.name] = e.target.value
    setFormData({ ...formData, experience: newExperience })
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, { company: '', position: '', location: '', startDate: '', endDate: '', description: '' }]
    })
  }

  const removeExperience = (index) => {
    const newExperience = formData.experience.filter((_, i) => i !== index)
    setFormData({ ...formData, experience: newExperience })
  }

  const handleProjectChange = (index, e) => {
    const newProjects = [...formData.projects]
    newProjects[index][e.target.name] = e.target.value
    setFormData({ ...formData, projects: newProjects })
  }

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { name: '', description: '', technologies: '', link: '' }]
    })
  }

  const removeProject = (index) => {
    const newProjects = formData.projects.filter((_, i) => i !== index)
    setFormData({ ...formData, projects: newProjects })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form className="cv-form" onSubmit={handleSubmit}>
      <h2>Create Your CV</h2>

      <section className="form-section">
        <h3>Personal Information</h3>
        <div className="form-row">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name *"
            value={formData.personalInfo.fullName}
            onChange={handlePersonalInfoChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.personalInfo.email}
            onChange={handlePersonalInfoChange}
            required
          />
        </div>
        <div className="form-row">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.personalInfo.phone}
            onChange={handlePersonalInfoChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.personalInfo.address}
            onChange={handlePersonalInfoChange}
          />
        </div>
        <div className="form-row">
          <input
            type="url"
            name="linkedin"
            placeholder="LinkedIn URL"
            value={formData.personalInfo.linkedin}
            onChange={handlePersonalInfoChange}
          />
          <input
            type="url"
            name="website"
            placeholder="Personal Website"
            value={formData.personalInfo.website}
            onChange={handlePersonalInfoChange}
          />
        </div>
      </section>

      <section className="form-section">
        <h3>Professional Summary</h3>
        <textarea
          name="summary"
          placeholder="Brief professional summary..."
          value={formData.summary}
          onChange={handleChange}
          rows="4"
        />
      </section>

      <section className="form-section">
        <h3>Education</h3>
        {formData.education.map((edu, index) => (
          <div key={index} className="array-item">
            <div className="form-row">
              <input
                type="text"
                name="institution"
                placeholder="Institution *"
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, e)}
                required
              />
              <input
                type="text"
                name="degree"
                placeholder="Degree *"
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, e)}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                name="field"
                placeholder="Field of Study"
                value={edu.field}
                onChange={(e) => handleEducationChange(index, e)}
              />
              <input
                type="text"
                name="gpa"
                placeholder="GPA"
                value={edu.gpa}
                onChange={(e) => handleEducationChange(index, e)}
              />
            </div>
            <div className="form-row">
              <input
                type="month"
                name="startDate"
                placeholder="Start Date"
                value={edu.startDate}
                onChange={(e) => handleEducationChange(index, e)}
              />
              <input
                type="month"
                name="endDate"
                placeholder="End Date"
                value={edu.endDate}
                onChange={(e) => handleEducationChange(index, e)}
              />
            </div>
            {formData.education.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeEducation(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addEducation}>
          + Add Education
        </button>
      </section>

      <section className="form-section">
        <h3>Work Experience</h3>
        {formData.experience.map((exp, index) => (
          <div key={index} className="array-item">
            <div className="form-row">
              <input
                type="text"
                name="company"
                placeholder="Company *"
                value={exp.company}
                onChange={(e) => handleExperienceChange(index, e)}
                required
              />
              <input
                type="text"
                name="position"
                placeholder="Position *"
                value={exp.position}
                onChange={(e) => handleExperienceChange(index, e)}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={exp.location}
                onChange={(e) => handleExperienceChange(index, e)}
              />
            </div>
            <div className="form-row">
              <input
                type="month"
                name="startDate"
                placeholder="Start Date"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, e)}
              />
              <input
                type="month"
                name="endDate"
                placeholder="End Date (leave empty if current)"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, e)}
              />
            </div>
            <textarea
              name="description"
              placeholder="Job description and achievements..."
              value={exp.description}
              onChange={(e) => handleExperienceChange(index, e)}
              rows="3"
            />
            {formData.experience.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeExperience(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addExperience}>
          + Add Experience
        </button>
      </section>

      <section className="form-section">
        <h3>Skills</h3>
        <textarea
          name="technical"
          placeholder="Technical Skills (comma-separated)"
          value={formData.skills.technical}
          onChange={handleSkillsChange}
          rows="2"
        />
        <textarea
          name="soft"
          placeholder="Soft Skills (comma-separated)"
          value={formData.skills.soft}
          onChange={handleSkillsChange}
          rows="2"
        />
        <textarea
          name="languages"
          placeholder="Languages (comma-separated)"
          value={formData.skills.languages}
          onChange={handleSkillsChange}
          rows="2"
        />
      </section>

      <section className="form-section">
        <h3>Projects</h3>
        {formData.projects.map((project, index) => (
          <div key={index} className="array-item">
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={project.name}
              onChange={(e) => handleProjectChange(index, e)}
            />
            <textarea
              name="description"
              placeholder="Project Description"
              value={project.description}
              onChange={(e) => handleProjectChange(index, e)}
              rows="2"
            />
            <div className="form-row">
              <input
                type="text"
                name="technologies"
                placeholder="Technologies Used"
                value={project.technologies}
                onChange={(e) => handleProjectChange(index, e)}
              />
              <input
                type="url"
                name="link"
                placeholder="Project Link"
                value={project.link}
                onChange={(e) => handleProjectChange(index, e)}
              />
            </div>
            {formData.projects.length > 1 && (
              <button type="button" className="remove-btn" onClick={() => removeProject(index)}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" className="add-btn" onClick={addProject}>
          + Add Project
        </button>
      </section>

      <section className="form-section">
        <h3>Certifications</h3>
        <textarea
          name="certifications"
          placeholder="List your certifications (one per line)"
          value={formData.certifications}
          onChange={handleChange}
          rows="3"
        />
      </section>

      <button type="submit" className="submit-btn">Generate CV Preview</button>
    </form>
  )
}

export default CVForm
