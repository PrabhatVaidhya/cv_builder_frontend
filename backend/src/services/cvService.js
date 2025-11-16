const PDFDocument = require('pdfkit');

const generatePDF = async (cvData) => {
  return new Promise((resolve, reject) => {
    try {
      // Ultra-compact margins (0.4in ≈ 28.8pt)
      const doc = new PDFDocument({ 
        margin: 29, 
        size: 'A4',
        bufferPages: true,
        autoFirstPage: true
      });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Your LaTeX color scheme
      const colors = {
        header: '#000000',
        sectionTitle: '#000000',
        text: '#000000',
        link: '#0066CC',
        dateGray: '#666666'
      };

      const pageWidth = 595.28;
      const margin = 29;

      // Helper functions - Ultra-compact like 8pt LaTeX
      const addHeader = () => {
        // Get full name from personalInfo or fallback to root level
        const fullName = cvData.personalInfo?.fullName || cvData.fullName || 'Professional CV';
        
        // Name - 14pt Bold Centered (compact version of \large)
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor(colors.header)
           .text(fullName.toUpperCase(), { align: 'center' });
        doc.moveDown(0.05);

        // Contact line - 7pt
        doc.fontSize(7).font('Helvetica').fillColor(colors.text);
        const contactParts = [];
        const personalInfo = cvData.personalInfo || {};
        if (personalInfo.email) contactParts.push(personalInfo.email);
        if (personalInfo.phone) contactParts.push(personalInfo.phone);
        if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
        if (personalInfo.website) contactParts.push(personalInfo.website);
        
        if (contactParts.length > 0) {
          doc.fillColor(colors.link)
             .text(contactParts.join(' | '), { align: 'center', underline: false });
        }

        doc.fillColor(colors.text);
        doc.moveDown(0.05);
        
        // Degree line - 7pt
        if (cvData.education && cvData.education[0]) {
          const edu = cvData.education[0];
          const degreeText = `${edu.degree || 'B.Tech.'} in ${edu.field || edu.institution || ''}`;
          doc.fontSize(7)
             .font('Helvetica')
             .text(degreeText.toUpperCase(), { align: 'center' });
        }
        
        doc.moveDown(0.1);
      };

      const addSection = (title) => {
        // Section header - 8pt Bold with underline (like LaTeX \titlerule)
        const y = doc.y;
        doc.fontSize(8)
           .font('Helvetica-Bold')
           .fillColor(colors.sectionTitle)
           .text(title.toUpperCase(), { align: 'left' });
        
        // Underline
        doc.strokeColor('#000000')
           .lineWidth(0.5)
           .moveTo(margin, doc.y + 1)
           .lineTo(pageWidth - margin, doc.y + 1)
           .stroke();
        
        doc.moveDown(0.1);
        doc.fillColor(colors.text);
      };

      const formatDate = (dateString) => {
        if (!dateString || dateString === '') return 'Present';
        try {
          const date = new Date(dateString + '-01');
          const month = date.toLocaleString('en-US', { month: 'short' });
          const year = date.getFullYear().toString().slice(2); // YY format
          return `${month}'${year}`;
        } catch {
          return dateString;
        }
      };

      const addDateRange = (startDate, endDate, yPosition) => {
        const dateText = `[${formatDate(startDate)} - ${formatDate(endDate)}]`;
        doc.fontSize(7)
           .font('Helvetica-Oblique')
           .fillColor(colors.dateGray)
           .text(dateText, pageWidth - margin - 100, yPosition, { width: 100, align: 'right' });
        doc.fillColor(colors.text);
      };

      const addSubsection = (title, dateStart, dateEnd) => {
        const startY = doc.y;
        doc.fontSize(7)
           .font('Helvetica-Bold')
           .fillColor(colors.text)
           .text(title, margin, doc.y, { align: 'left', continued: false });
        
        if (dateStart || dateEnd) {
          addDateRange(dateStart, dateEnd, startY);
        }
      };

      const addBullet = (text) => {
        doc.fontSize(6.5)
           .font('Helvetica')
           .fillColor(colors.text)
           .text('• ' + text, margin, doc.y, { indent: 0, paragraphGap: 0, lineGap: 0, align: 'left' });
      };

      // Start building PDF
      addHeader();

      // 1. EDUCATION Section (Table format like LaTeX)
      if (cvData.education && cvData.education.length > 0) {
        addSection('EDUCATION');
        
        cvData.education.forEach((edu) => {
          if (edu.institution) {
            const degreeText = `${edu.degree || ''}${edu.field ? ` in ${edu.field}` : ''}`;
            const gpaText = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
            
            doc.fontSize(7)
               .font('Helvetica')
               .fillColor(colors.text)
               .text(`${degreeText} - ${edu.institution}${gpaText}`, margin, doc.y, { align: 'left' });
            doc.moveDown(0.05);
          }
        });
        doc.moveDown(0.15);
      }

      // 2. PROJECTS Section
      if (cvData.projects && cvData.projects.length > 0) {
        addSection('PROJECTS');
        
        cvData.projects.forEach((project) => {
          if (project.name) {
            // Project title with date
            addSubsection(project.name, project.startDate, project.endDate);
            
            // One-line description in italic if available
            if (project.summary || project.shortDesc) {
              doc.fontSize(6.5)
                 .font('Helvetica-Oblique')
                 .text(project.summary || project.shortDesc, margin, doc.y, { align: 'left' });
            }
            
            // Bullet points for description/achievements
            const descriptions = Array.isArray(project.description) 
              ? project.description 
              : (project.description ? project.description.split('\n').filter(d => d.trim()) : []);
            
            descriptions.forEach(desc => addBullet(desc.trim()));
            
            doc.moveDown(0.1);
          }
        });
        doc.moveDown(0.15);
      }

      // 3. COMPETITION/CONFERENCE Section
      if (cvData.competitions || cvData.conference) {
        addSection('COMPETITION/CONFERENCE');
        const items = cvData.competitions || cvData.conference || [];
        const itemList = Array.isArray(items) ? items : [items];
        
        itemList.forEach((item) => {
          if (typeof item === 'string') {
            addBullet(item);
          } else if (item.name || item.title) {
            addSubsection(item.name || item.title, item.startDate, item.endDate);
            if (item.description) {
              const descriptions = Array.isArray(item.description) ? item.description : [item.description];
              descriptions.forEach(desc => addBullet(desc));
            }
          }
          doc.moveDown(0.05);
        });
        doc.moveDown(0.15);
      }

      // 4. ENTREPRENEURIAL EXPERIENCES Section
      if (cvData.experience && cvData.experience.length > 0) {
        addSection('ENTREPRENEURIAL EXPERIENCES');
        
        cvData.experience.forEach((exp) => {
          if (exp.company || exp.position) {
            const title = `${exp.position || ''} | ${exp.company || ''}`.replace('| ', '').replace(' |', '');
            addSubsection(title, exp.startDate, exp.endDate);
            
            // Achievements as bullets
            const achievements = exp.achievements && exp.achievements.length > 0 
              ? exp.achievements 
              : (exp.description ? [exp.description] : []);
            
            achievements.forEach(ach => addBullet(ach.trim()));
            doc.moveDown(0.1);
          }
        });
        doc.moveDown(0.15);
      }

      // 5. SKILLS AND EXPERTISE Section
      if (cvData.skills) {
        addSection('SKILLS AND EXPERTISE');
        
        // Programming Languages
        if (cvData.skills.technical) {
          const techSkills = Array.isArray(cvData.skills.technical) 
            ? cvData.skills.technical.join(', ') 
            : cvData.skills.technical;
          doc.fontSize(7)
             .font('Helvetica-Bold')
             .text('Programming Languages: ', margin, doc.y, { continued: true })
             .font('Helvetica')
             .text(techSkills, { align: 'left' });
          doc.moveDown(0.05);
        }
        
        // Libraries & Frameworks
        if (cvData.skills.frameworks || cvData.skills.libraries) {
          const frameworks = cvData.skills.frameworks || cvData.skills.libraries;
          const frameworkText = Array.isArray(frameworks) ? frameworks.join(', ') : frameworks;
          doc.fontSize(7)
             .font('Helvetica-Bold')
             .text('Libraries & Frameworks: ', margin, doc.y, { continued: true })
             .font('Helvetica')
             .text(frameworkText, { align: 'left' });
          doc.moveDown(0.05);
        }
        
        // Software & Tools
        if (cvData.skills.tools || cvData.skills.software) {
          const tools = cvData.skills.tools || cvData.skills.software;
          const toolText = Array.isArray(tools) ? tools.join(', ') : tools;
          doc.fontSize(7)
             .font('Helvetica-Bold')
             .text('Software & Tools: ', margin, doc.y, { continued: true })
             .font('Helvetica')
             .text(toolText, { align: 'left' });
        }
        
        doc.moveDown(0.15);
      }

      // 6. COURSEWORK INFORMATION Section
      if (cvData.coursework) {
        addSection('COURSEWORK INFORMATION');
        
        if (Array.isArray(cvData.coursework)) {
          cvData.coursework.forEach(course => {
            doc.fontSize(7).font('Helvetica').text(course);
            doc.moveDown(0.1);
          });
        } else {
          doc.fontSize(7).font('Helvetica').text(cvData.coursework, margin, doc.y, { align: 'left' });
        }
        
        doc.moveDown(0.15);
      }

      // 7. CERTIFICATIONS Section
      if (cvData.certifications && cvData.certifications.length > 0) {
        addSection('CERTIFICATIONS');
        const certs = Array.isArray(cvData.certifications) ? cvData.certifications : [cvData.certifications];
        certs.forEach(cert => addBullet(cert));
        doc.moveDown(0.15);
      }

      // 8. POSITIONS OF RESPONSIBILITY Section
      if (cvData.positions || cvData.responsibilities) {
        addSection('POSITIONS OF RESPONSIBILITY');
        const positions = cvData.positions || cvData.responsibilities || [];
        const posList = Array.isArray(positions) ? positions : [positions];
        
        posList.forEach((pos) => {
          if (typeof pos === 'string') {
            addBullet(pos);
          } else if (pos.title || pos.name) {
            addSubsection(pos.title || pos.name, pos.startDate, pos.endDate);
            if (pos.description || pos.achievements) {
              const items = Array.isArray(pos.achievements) ? pos.achievements : [pos.description];
              items.forEach(item => addBullet(item));
            }
          }
          doc.moveDown(0.05);
        });
        doc.moveDown(0.15);
      }

      // 9. AWARDS AND ACHIEVEMENTS Section
      if (cvData.awards || cvData.achievements) {
        addSection('AWARDS AND ACHIEVEMENTS');
        const awards = cvData.awards || cvData.achievements || [];
        const awardList = Array.isArray(awards) ? awards : [awards];
        awardList.forEach(award => {
          const text = typeof award === 'string' ? award : (award.title || award.name || award.description);
          if (text) addBullet(text);
        });
        doc.moveDown(0.15);
      }

      // 10. EXTRA CURRICULAR ACTIVITIES Section
      if (cvData.extracurricular || cvData.activities) {
        addSection('EXTRA CURRICULAR ACTIVITIES');
        const activities = cvData.extracurricular || cvData.activities || [];
        const activityList = Array.isArray(activities) ? activities : [activities];
        activityList.forEach(activity => {
          const text = typeof activity === 'string' ? activity : (activity.title || activity.description);
          if (text) addBullet(text);
        });
      }

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePDF
};
