class CVModel {
  constructor(data) {
    this.personalInfo = {
      fullName: data.personalInfo?.fullName || '',
      email: data.personalInfo?.email || '',
      phone: data.personalInfo?.phone || '',
      address: data.personalInfo?.address || '',
      linkedin: data.personalInfo?.linkedin || '',
      website: data.personalInfo?.website || ''
    };
    
    this.summary = data.summary || '';
    this.education = data.education || [];
    this.experience = data.experience || [];
    this.skills = data.skills || { technical: '', soft: '', languages: '' };
    this.projects = data.projects || [];
    this.certifications = data.certifications || '';
  }

  validate() {
    const errors = [];

    if (!this.personalInfo.fullName) {
      errors.push('Full name is required');
    }

    if (!this.personalInfo.email) {
      errors.push('Email is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      personalInfo: this.personalInfo,
      summary: this.summary,
      education: this.education,
      experience: this.experience,
      skills: this.skills,
      projects: this.projects,
      certifications: this.certifications
    };
  }
}

module.exports = CVModel;
