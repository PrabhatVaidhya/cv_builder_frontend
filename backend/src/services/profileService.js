const fs = require('fs').promises;
const path = require('path');

const PROFILES_DIR = path.join(__dirname, '../../data/profiles');

// Ensure profiles directory exists
const ensureProfilesDir = async () => {
  try {
    await fs.access(PROFILES_DIR);
  } catch {
    await fs.mkdir(PROFILES_DIR, { recursive: true });
  }
};

// Save user profile
const saveProfile = async (profileData) => {
  await ensureProfilesDir();
  
  const profileId = profileData.id || Date.now().toString();
  const fileName = `${profileId}.json`;
  const filePath = path.join(PROFILES_DIR, fileName);
  
  const profile = {
    id: profileId,
    ...profileData,
    updatedAt: new Date().toISOString()
  };
  
  await fs.writeFile(filePath, JSON.stringify(profile, null, 2));
  return profile;
};

// Get user profile by ID
const getProfile = async (profileId) => {
  const filePath = path.join(PROFILES_DIR, `${profileId}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

// List all profiles
const listProfiles = async () => {
  await ensureProfilesDir();
  
  try {
    const files = await fs.readdir(PROFILES_DIR);
    const profiles = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(PROFILES_DIR, file), 'utf-8');
        profiles.push(JSON.parse(data));
      }
    }
    
    return profiles;
  } catch (error) {
    return [];
  }
};

// Delete profile
const deleteProfile = async (profileId) => {
  const filePath = path.join(PROFILES_DIR, `${profileId}.json`);
  
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  saveProfile,
  getProfile,
  listProfiles,
  deleteProfile
};
