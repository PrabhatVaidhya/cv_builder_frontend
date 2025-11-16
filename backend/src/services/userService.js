const mongoose = require('mongoose');
const User = require('../models/User');
const GeneratedCV = require('../models/GeneratedCV');

// In-memory user store as fallback
const inMemoryUsers = new Map();
const inMemoryGeneratedCVs = [];

async function createUser({ fullName, email, passwordHash }) {
  if (mongoose.connection.readyState !== 1) {
    if (inMemoryUsers.has(email)) throw new Error('User already exists');
    inMemoryUsers.set(email, { fullName, email, passwordHash, profileCompleted: false, createdAt: new Date() });
    return inMemoryUsers.get(email);
  }

  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');
  const user = new User({ fullName, email, passwordHash });
  await user.save();
  return user.toObject();
}

async function findUserByEmail(email) {
  if (mongoose.connection.readyState !== 1) {
    return inMemoryUsers.get(email) || null;
  }
  const user = await User.findOne({ email });
  return user ? user.toObject() : null;
}

async function updateUserProfile(email, profileData) {
  if (mongoose.connection.readyState !== 1) {
    const user = inMemoryUsers.get(email);
    if (!user) throw new Error('User not found');
    
    // Merge arrays instead of replacing
    if (profileData.education && user.education) {
      profileData.education = [...user.education, ...profileData.education];
    }
    if (profileData.experience && user.experience) {
      profileData.experience = [...user.experience, ...profileData.experience];
    }
    if (profileData.projects && user.projects) {
      profileData.projects = [...user.projects, ...profileData.projects];
    }
    if (profileData.certifications && user.certifications) {
      profileData.certifications = [...user.certifications, ...profileData.certifications];
    }
    if (profileData.awards && user.awards) {
      profileData.awards = [...user.awards, ...profileData.awards];
    }
    
    const updated = { ...user, ...profileData, profileCompleted: true };
    inMemoryUsers.set(email, updated);
    return updated;
  }

  // Get existing user first to merge arrays
  const existingUser = await User.findOne({ email });
  if (!existingUser) throw new Error('User not found');
  
  // Merge arrays
  if (profileData.education && existingUser.education.length > 0) {
    profileData.education = [...existingUser.education, ...profileData.education];
  }
  if (profileData.experience && existingUser.experience.length > 0) {
    profileData.experience = [...existingUser.experience, ...profileData.experience];
  }
  if (profileData.projects && existingUser.projects.length > 0) {
    profileData.projects = [...existingUser.projects, ...profileData.projects];
  }
  if (profileData.certifications && existingUser.certifications.length > 0) {
    profileData.certifications = [...existingUser.certifications, ...profileData.certifications];
  }
  if (profileData.awards && existingUser.awards.length > 0) {
    profileData.awards = [...existingUser.awards, ...profileData.awards];
  }

  const user = await User.findOneAndUpdate(
    { email },
    { ...profileData, profileCompleted: true },
    { new: true }
  );
  if (!user) throw new Error('User not found');
  return user.toObject();
}

async function saveGeneratedCV(email, cvData) {
  if (mongoose.connection.readyState !== 1) {
    const cv = {
      id: Date.now().toString(),
      userEmail: email,
      ...cvData,
      createdAt: new Date()
    };
    inMemoryGeneratedCVs.push(cv);
    return cv;
  }

  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  
  const generatedCV = new GeneratedCV({
    userId: user._id,
    userEmail: email,
    ...cvData
  });
  await generatedCV.save();
  return generatedCV.toObject();
}

async function getGeneratedCVs(email) {
  if (mongoose.connection.readyState !== 1) {
    return inMemoryGeneratedCVs.filter(cv => cv.userEmail === email);
  }

  const cvs = await GeneratedCV.find({ userEmail: email }).sort({ createdAt: -1 });
  return cvs.map(cv => cv.toObject());
}

async function getGeneratedCVById(cvId) {
  if (mongoose.connection.readyState !== 1) {
    return inMemoryGeneratedCVs.find(cv => cv.id === cvId) || null;
  }

  try {
    const cv = await GeneratedCV.findById(cvId);
    return cv ? cv.toObject() : null;
  } catch (err) {
    console.error('Error finding CV by ID:', cvId, err.message);
    return null;
  }
}

async function deleteGeneratedCV(cvId) {
  if (mongoose.connection.readyState !== 1) {
    const index = inMemoryGeneratedCVs.findIndex(cv => cv.id === cvId);
    if (index > -1) {
      inMemoryGeneratedCVs.splice(index, 1);
      return true;
    }
    return false;
  }

  const result = await GeneratedCV.findByIdAndDelete(cvId);
  return !!result;
}

module.exports = {
  createUser,
  findUserByEmail,
  updateUserProfile,
  saveGeneratedCV,
  getGeneratedCVs,
  getGeneratedCVById,
  deleteGeneratedCV
};
