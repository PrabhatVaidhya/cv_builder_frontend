const PDFDocument = require('pdfkit');

const generatePDF = async (cvData) => {
  return new Promise((resolve, reject) => {
    try {
      // Ultra-compact 25pt margins (matches IIT style)
      const doc = new PDFDocument({
        margin: 25,
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
        dateGray: '#000000', // Matches IIT style black dates
        sectionBg: '#E5E5E5' // Light grey for section headers
      };

      const pageWidth = 595.28;
      const margin = 25;

      // Helper functions
      const addHeader = () => {
        const fullName = cvData.personalInfo?.fullName || cvData.fullName || 'Professional CV';

        // Name - 15pt Bold Centered
        doc.fontSize(15)
          .font('Helvetica-Bold')
          .fillColor(colors.header)
          .text(fullName.toUpperCase(), { align: 'center' });
        doc.moveDown(0.1);

        // Contact line - 9pt
        doc.fontSize(9).font('Helvetica').fillColor(colors.text);
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
        doc.moveDown(0.1);

        // Degree line - 9pt
        if (cvData.education && cvData.education[0]) {
          const edu = cvData.education[0];
          const degreeText = `${edu.degree || 'B.Tech.'} in ${edu.field || edu.institution || ''}`;
          doc.fontSize(9)
            .font('Helvetica')
            .text(degreeText.toUpperCase(), { align: 'center' });
        }

        doc.moveDown(0.2);
      };

      const addSection = (title) => {
        const y = doc.y;
        doc.moveDown(0.15); // Tiny gap before section

        // Draw the grey background rectangle for section header
        doc.rect(margin, doc.y, pageWidth - margin * 2, 13).fill(colors.sectionBg);

        // Section header text - 10.5pt Bold Centered
        doc.fontSize(10.5)
          .font('Helvetica-Bold')
          .fillColor(colors.sectionTitle)
          .text(title.toUpperCase(), margin, doc.y + 2, { align: 'center', width: pageWidth - margin * 2 });

        // The rectangle and text puts us further down, let's bump the doc.y below the box
        doc.y = doc.y + 2;
        doc.fillColor(colors.text);
      };

      const formatDate = (dateString) => {
        if (!dateString || dateString === '') return 'Present';
        try {
          const date = new Date(dateString + '-01');
          const month = date.toLocaleString('en-US', { month: 'short' });
          const year = date.getFullYear().toString().slice(2);
          return `${month}'${year}`;
        } catch {
          return dateString;
        }
      };

      const addDateRange = (startDate, endDate, yPosition) => {
        const dateText = `[${formatDate(startDate)} - ${formatDate(endDate)}]`;
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(colors.dateGray)
          .text(dateText, pageWidth - margin - 150, yPosition, { width: 150, align: 'right' });
        doc.fillColor(colors.text);
      };

      const addSubsection = (title, dateStart, dateEnd) => {
        const startY = doc.y;
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .fillColor(colors.text)
          .text(title, margin, doc.y, { align: 'left', continued: false });

        if (dateStart || dateEnd) {
          addDateRange(dateStart, dateEnd, startY);
        }
      };

      const addBullet = (text) => {
        doc.fontSize(10)
          .font('Helvetica')
          .fillColor(colors.text)
          .list([text], margin, doc.y, {
            align: 'justify',
            width: pageWidth - margin * 2,
            paragraphGap: 2,
            bulletRadius: 2,
            textIndent: 0
          });
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

            doc.fontSize(10)
              .font('Helvetica')
              .fillColor(colors.text)
              .text(`${degreeText} - ${edu.institution}${gpaText}`, margin, doc.y, { align: 'left', width: pageWidth - margin * 2 });
            doc.moveDown(0.05);
          }
        });
        doc.moveDown(0.05);
      }

      // 2. ENTREPRENEURIAL/WORK EXPERIENCES Section
      if (cvData.experience && cvData.experience.length > 0) {
        addSection('EXPERIENCE');

        cvData.experience.forEach((exp) => {
          if (exp.company || exp.position) {
            const title = `${exp.position || ''} | ${exp.company || ''}`.replace('| ', '').replace(' |', '');
            addSubsection(title, exp.startDate, exp.endDate);

            // Achievements as bullets
            let achievements = [];
            if (exp.achievements && exp.achievements.length > 0) {
              achievements = exp.achievements;
            } else if (exp.description) {
              achievements = Array.isArray(exp.description) ? exp.description : exp.description.split('\n');
            }

            achievements.filter(Boolean).forEach(ach => {
              if (typeof ach === 'string') addBullet(ach.trim());
            });
            doc.moveDown(0.05);
          }
        });
        doc.moveDown(0.05);
      }

      // 3. PROJECTS Section
      if (cvData.projects && cvData.projects.length > 0) {
        addSection('PROJECTS');

        cvData.projects.forEach((project) => {
          if (project.name) {
            // Project title with date
            addSubsection(project.name, project.startDate, project.endDate);

            // One-line description in italic if available
            if (project.summary || project.shortDesc) {
              doc.fontSize(9.5)
                .font('Helvetica-Oblique')
                .text(project.summary || project.shortDesc, margin, doc.y, { align: 'left', width: pageWidth - margin * 2 });
            }

            // Bullet points for description/achievements
            const descriptions = Array.isArray(project.description)
              ? project.description
              : (project.description ? project.description.split('\n') : []);

            descriptions.filter(Boolean).forEach(desc => {
              if (typeof desc === 'string') addBullet(desc.trim());
            });

            doc.moveDown(0.05);
          }
        });
        doc.moveDown(0.05);
      }

      // 4. AWARDS AND ACHIEVEMENTS Section
      const awdData = cvData.awards || cvData.achievements;
      if (awdData && ((Array.isArray(awdData) && awdData.length > 0) || (typeof awdData === 'string' && awdData.trim().length > 0))) {
        addSection('AWARDS AND ACHIEVEMENTS');
        const awards = awdData;
        const awardList = Array.isArray(awards) ? awards : [awards];
        awardList.forEach(award => {
          const text = typeof award === 'string' ? award : (award.title || award.name || award.description);
          if (text) addBullet(text);
        });
        doc.moveDown(0.05);
      }

      // 5. COMPETITION/CONFERENCE Section
      const compData = cvData.competitions || cvData.conference;
      if (compData && ((Array.isArray(compData) && compData.length > 0) || (typeof compData === 'string' && compData.trim().length > 0))) {
        addSection('COMPETITION/CONFERENCE');
        const items = compData;
        const itemList = Array.isArray(items) ? items : [items];

        itemList.forEach((item) => {
          if (typeof item === 'string') {
            addBullet(item);
          } else if (item.name || item.title) {
            addSubsection(item.name || item.title, item.startDate, item.endDate);
            if (item.description) {
              const descs = Array.isArray(item.description) ? item.description : [item.description];
              descs.forEach(d => addBullet(d));
            }
          }
          doc.moveDown(0.05);
        });
        doc.moveDown(0.05);
      }

      // 6. SKILLS AND EXPERTISE Section
      if (cvData.skills) {
        addSection('SKILLS AND EXPERTISE');

        // Programming Languages
        if (cvData.skills.technical) {
          const techSkills = Array.isArray(cvData.skills.technical)
            ? cvData.skills.technical.join(', ')
            : cvData.skills.technical;
          doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('Programming Languages: ', margin, doc.y, { continued: true })
            .font('Helvetica')
            .text(techSkills, { align: 'left', width: pageWidth - margin * 2 });
          doc.moveDown(0.05);
        }

        // Libraries & Frameworks
        if (cvData.skills.frameworks || cvData.skills.libraries) {
          const frameworks = cvData.skills.frameworks || cvData.skills.libraries;
          const frameworkText = Array.isArray(frameworks) ? frameworks.join(', ') : frameworks;
          doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('Libraries & Frameworks: ', margin, doc.y, { continued: true })
            .font('Helvetica')
            .text(frameworkText, { align: 'left', width: pageWidth - margin * 2 });
          doc.moveDown(0.05);
        }

        // Software & Tools
        if (cvData.skills.tools || cvData.skills.software) {
          const tools = cvData.skills.tools || cvData.skills.software;
          const toolText = Array.isArray(tools) ? tools.join(', ') : tools;
          doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('Software & Tools: ', margin, doc.y, { continued: true })
            .font('Helvetica')
            .text(toolText, { align: 'left', width: pageWidth - margin * 2 });
        }

        doc.moveDown(0.05);
      }

      // 7. COURSEWORK INFORMATION Section
      const cw = cvData.coursework;
      if (cw && ((Array.isArray(cw) && cw.length > 0) || (typeof cw === 'string' && cw.trim().length > 0))) {
        addSection('COURSEWORK INFORMATION');

        if (Array.isArray(cvData.coursework)) {
          cvData.coursework.forEach(course => {
            doc.fontSize(10).font('Helvetica').text(course, margin, doc.y, { align: 'left', width: pageWidth - margin * 2 });
            doc.moveDown(0.05);
          });
        } else {
          doc.fontSize(10).font('Helvetica').text(cvData.coursework, margin, doc.y, { align: 'left', width: pageWidth - margin * 2 });
        }

        doc.moveDown(0.05);
      }

      // 8. POSITIONS OF RESPONSIBILITY Section
      const posData = cvData.positions || cvData.responsibilities;
      if (posData && ((Array.isArray(posData) && posData.length > 0) || (typeof posData === 'string' && posData.trim().length > 0))) {
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
          doc.moveDown(0.02);
        });
        doc.moveDown(0.05);
      }

      // 9. EXTRA CURRICULAR ACTIVITIES Section
      const extraData = cvData.extracurricular || cvData.activities;
      if (extraData && ((Array.isArray(extraData) && extraData.length > 0) || (typeof extraData === 'string' && extraData.trim().length > 0))) {
        addSection('EXTRA CURRICULAR ACTIVITIES');
        const activities = cvData.extracurricular || cvData.activities || [];
        const activityList = Array.isArray(activities) ? activities : [activities];
        activityList.forEach(activity => {
          const text = typeof activity === 'string' ? activity : (activity.title || activity.description);
          if (text) addBullet(text);
        });
        doc.moveDown(0.05);
      }

      // 10. CERTIFICATIONS Section
      const certData = cvData.certifications;
      if (certData && ((Array.isArray(certData) && certData.length > 0) || (typeof certData === 'string' && certData.trim().length > 0))) {
        addSection('CERTIFICATIONS');
        const certs = Array.isArray(certData) ? certData : [certData];
        certs.forEach(cert => addBullet(cert));
        doc.moveDown(0.05);
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
