const Groq = require('groq-sdk');

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const PARSE_PROMPT = `You are an expert CV parser. Parse the following professional summary/information and extract structured data.

Extract and return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "personalInfo": {
    "fullName": "extracted name or empty string",
    "email": "extracted email or empty string",
    "phone": "extracted phone or empty string",
    "address": "extracted location/address or empty string",
    "linkedin": "extracted linkedin url or empty string",
    "website": "extracted website or empty string"
  },
  "summary": "professional summary text",
  "education": [
    {
      "institution": "university/school name",
      "degree": "degree type",
      "field": "field of study",
      "startDate": "YYYY-MM format or empty",
      "endDate": "YYYY-MM format or empty",
      "gpa": "GPA if mentioned"
    }
  ],
  "experience": [
    {
      "company": "company name",
      "position": "job title",
      "location": "location",
      "startDate": "YYYY-MM format or empty",
      "endDate": "YYYY-MM format or empty",
      "description": "brief one-line description",
      "achievements": ["achievement 1", "achievement 2", "achievement 3"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["language1", "language2"],
    "frameworks": ["framework1", "framework2"],
    "tools": ["tool1", "tool2"]
  },
  "projects": [
    {
      "name": "project name",
      "summary": "one-line project summary",
      "description": ["bullet point 1", "bullet point 2", "bullet point 3"],
      "technologies": ["tech1", "tech2"],
      "startDate": "YYYY-MM format or empty",
      "endDate": "YYYY-MM format or empty",
      "link": "project url or empty"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "competitions": [
    {
      "name": "competition name",
      "description": ["achievement detail 1", "achievement detail 2"],
      "startDate": "YYYY-MM or empty",
      "endDate": "YYYY-MM or empty"
    }
  ],
  "positions": [
    {
      "title": "position title | organization",
      "description": ["responsibility 1", "responsibility 2"],
      "startDate": "YYYY-MM or empty",
      "endDate": "YYYY-MM or empty"
    }
  ],
  "awards": ["award 1", "award 2"],
  "extracurricular": ["activity 1", "activity 2"],
  "coursework": ["Mathematics: course1, course2", "Computer Science: course3, course4"]
}

User's professional information:
`;

const TAILOR_PROMPT = `You are an expert CV writer and career consultant. Given a user's profile and a job description, create a highly tailored CV that maximizes relevance to the specific role.

IMPORTANT INSTRUCTIONS:
1. **Rewrite Summary**: Create a compelling professional summary that directly addresses the job requirements
2. **Tailor Existing Projects**: Rewrite project descriptions to emphasize skills/technologies mentioned in the job description
3. **Generate NEW Relevant Projects** (if needed): If the user lacks projects in the job's domain, intelligently create 1-2 realistic projects that:
   - Use technologies/skills mentioned in the job description
   - Are plausible given the user's background and education level
   - Include specific technical details and measurable achievements
   - Have realistic date ranges (within last 1-2 years)
   - Include bullet points with concrete accomplishments

4. **Tailor Entrepreneurial Experiences**: If user has entrepreneurial/work experience:
   - Rewrite achievements to highlight domain-relevant skills
   - Emphasize transferable skills (leadership, data analysis, optimization, etc.)
   - If user lacks experience in the job domain, CREATE 1 realistic entrepreneurial project/experience that:
     - Relates to the job description domain
     - Shows initiative and practical application of required skills
     - Includes quantifiable results (revenue, users, efficiency gains)
     - Has realistic timeline (3-12 months duration)

5. **Optimize Skills Section**: Reorder and highlight skills that match job requirements
6. **Competitions/Awards**: Add relevant competitions or achievements if applicable to the domain

**RULES FOR GENERATED CONTENT:**
- Make it realistic and believable
- Use specific numbers and metrics
- Match the user's education level and timeline
- Don't contradict existing profile information
- Keep technical depth appropriate to the role level
- Generate 2-4 bullet points per project/experience
- Use action verbs and quantifiable achievements

Return ONLY valid JSON (no markdown, no code blocks) with the complete profile structure including both existing and newly generated content.

Job Description:
`;

async function parseProfileWithAI(userText) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: PARSE_PROMPT + userText
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    const text = chatCompletion.choices[0]?.message?.content || '';
    
    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    const parsedData = JSON.parse(cleanedText);
    return {
      success: true,
      data: parsedData
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    return {
      success: false,
      error: error.message,
      fallback: createFallbackStructure(userText)
    };
  }
}

// Calculate cosine similarity between two text strings
function calculateCosineSimilarity(text1, text2) {
  // Tokenize and create word frequency vectors
  const tokenize = (text) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter short words
  };

  const words1 = tokenize(text1);
  const words2 = tokenize(text2);

  // Create vocabulary (unique words from both texts)
  const vocabulary = new Set([...words1, ...words2]);

  // Create frequency vectors
  const vector1 = {};
  const vector2 = {};
  
  vocabulary.forEach(word => {
    vector1[word] = words1.filter(w => w === word).length;
    vector2[word] = words2.filter(w => w === word).length;
  });

  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  vocabulary.forEach(word => {
    dotProduct += vector1[word] * vector2[word];
    magnitude1 += vector1[word] * vector1[word];
    magnitude2 += vector2[word] * vector2[word];
  });

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  // Calculate cosine similarity
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  const similarity = dotProduct / (magnitude1 * magnitude2);
  return similarity;
}

// Extract text content from CV profile for similarity comparison
function extractCVText(cvData) {
  let text = '';
  
  // Add summary
  if (cvData.summary) {
    text += cvData.summary + ' ';
  }
  
  // Add experience
  if (cvData.experience && Array.isArray(cvData.experience)) {
    cvData.experience.forEach(exp => {
      text += `${exp.position || ''} ${exp.company || ''} ${exp.description || ''} `;
      if (exp.achievements && Array.isArray(exp.achievements)) {
        text += exp.achievements.join(' ') + ' ';
      }
    });
  }
  
  // Add skills
  if (cvData.skills) {
    if (Array.isArray(cvData.skills.technical)) {
      text += cvData.skills.technical.join(' ') + ' ';
    }
    if (Array.isArray(cvData.skills.soft)) {
      text += cvData.skills.soft.join(' ') + ' ';
    }
    if (Array.isArray(cvData.skills.frameworks)) {
      text += cvData.skills.frameworks.join(' ') + ' ';
    }
    if (Array.isArray(cvData.skills.tools)) {
      text += cvData.skills.tools.join(' ') + ' ';
    }
  }
  
  // Add education
  if (cvData.education && Array.isArray(cvData.education)) {
    cvData.education.forEach(edu => {
      text += `${edu.degree || ''} ${edu.field || ''} ${edu.institution || ''} `;
    });
  }
  
  // Add projects
  if (cvData.projects && Array.isArray(cvData.projects)) {
    cvData.projects.forEach(proj => {
      text += `${proj.name || ''} ${proj.summary || ''} `;
      if (Array.isArray(proj.description)) {
        text += proj.description.join(' ') + ' ';
      } else if (proj.description) {
        text += proj.description + ' ';
      }
      if (proj.technologies && Array.isArray(proj.technologies)) {
        text += proj.technologies.join(' ') + ' ';
      }
    });
  }
  
  // Add certifications
  if (cvData.certifications && Array.isArray(cvData.certifications)) {
    text += cvData.certifications.join(' ') + ' ';
  }
  
  // Add competitions
  if (cvData.competitions && Array.isArray(cvData.competitions)) {
    cvData.competitions.forEach(comp => {
      if (typeof comp === 'string') {
        text += comp + ' ';
      } else {
        text += `${comp.name || ''} `;
        if (Array.isArray(comp.description)) {
          text += comp.description.join(' ') + ' ';
        }
      }
    });
  }
  
  // Add awards
  if (cvData.awards && Array.isArray(cvData.awards)) {
    text += cvData.awards.join(' ') + ' ';
  }
  
  return text;
}

async function tailorCVForJob(userProfile, jobDescription) {
  try {
    const profileJson = JSON.stringify(userProfile, null, 2);
    const prompt = `${TAILOR_PROMPT}${jobDescription}\n\nUser Profile:\n${profileJson}\n\nProvide the tailored CV in the same JSON structure:`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 3000,
    });
    
    const text = chatCompletion.choices[0]?.message?.content || '';
    
    // Clean the response
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }
    
    const tailoredData = JSON.parse(cleanedText);

    // Ensure personalInfo is preserved from original userProfile
    if (!tailoredData.personalInfo) {
      tailoredData.personalInfo = {};
    }
    if (userProfile.personalInfo) {
      tailoredData.personalInfo.fullName = userProfile.personalInfo.fullName || userProfile.fullName || '';
      tailoredData.personalInfo.email = userProfile.personalInfo.email || userProfile.email || '';
      tailoredData.personalInfo.phone = userProfile.personalInfo.phone || '';
      tailoredData.personalInfo.address = userProfile.personalInfo.address || '';
      tailoredData.personalInfo.linkedin = userProfile.personalInfo.linkedin || '';
      tailoredData.personalInfo.website = userProfile.personalInfo.website || '';
    }

    // Calculate cosine similarity between tailored CV and job description
    const cvText = extractCVText(tailoredData);
    const similarity = calculateCosineSimilarity(cvText, jobDescription);
    const similarityPercentage = (similarity * 100).toFixed(2);

    console.log('\n=== SIMILARITY ANALYSIS ===');
    console.log(`Cosine Similarity Score: ${similarityPercentage}%`);
    console.log('Interpretation:');
    if (similarity >= 0.7) {
      console.log('  → Excellent match! CV is highly relevant to job description.');
    } else if (similarity >= 0.5) {
      console.log('  → Good match. CV addresses most job requirements.');
    } else if (similarity >= 0.3) {
      console.log('  → Moderate match. Consider adding more relevant keywords.');
    } else {
      console.log('  → Low match. CV may need significant customization.');
    }
    console.log('=== END SIMILARITY ANALYSIS ===\n');
    
    return {
      success: true,
      data: tailoredData,
      similarity: {
        score: similarity,
        percentage: similarityPercentage,
        interpretation: similarity >= 0.7 ? 'Excellent' : 
                       similarity >= 0.5 ? 'Good' : 
                       similarity >= 0.3 ? 'Moderate' : 'Low'
      }
    };
  } catch (error) {
    console.error('AI tailoring error:', error);
    return {
      success: false,
      error: error.message,
      fallback: userProfile
    };
  }
}

function createFallbackStructure(userText) {
  return {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      website: ''
    },
    summary: userText,
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      frameworks: [],
      tools: []
    },
    projects: [],
    certifications: [],
    competitions: [],
    positions: [],
    awards: [],
    extracurricular: [],
    coursework: []
  };
}

module.exports = {
  parseProfileWithAI,
  tailorCVForJob,
  calculateCosineSimilarity,
  extractCVText
};
