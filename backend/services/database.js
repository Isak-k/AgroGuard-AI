import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file paths
const DB_DIR = path.join(__dirname, '../data');
const DB_FILES = {
  diseases: path.join(DB_DIR, 'diseases.json'),
  diseaseCategories: path.join(DB_DIR, 'disease-categories.json'),
  chemicals: path.join(DB_DIR, 'chemicals.json'),
  markets: path.join(DB_DIR, 'markets.json'),
  pendingDiseases: path.join(DB_DIR, 'pending-diseases.json'),
  comments: path.join(DB_DIR, 'comments.json'),
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DB_DIR);
  } catch {
    await fs.mkdir(DB_DIR, { recursive: true });
  }
}

// Initialize database files with empty arrays if they don't exist
async function initializeDB() {
  await ensureDataDir();
  
  for (const [collection, filePath] of Object.entries(DB_FILES)) {
    try {
      await fs.access(filePath);
    } catch {
      // File doesn't exist, create with empty array
      await fs.writeFile(filePath, JSON.stringify([], null, 2));
      console.log(`📁 Initialized ${collection}.json`);
    }
  }
}

// Generic database operations
class Database {
  constructor(collection) {
    this.collection = collection;
    this.filePath = DB_FILES[collection];
    if (!this.filePath) {
      throw new Error(`Unknown collection: ${collection}`);
    }
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.collection}:`, error);
      return [];
    }
  }

  async write(data) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${this.collection}:`, error);
      return false;
    }
  }

  async getAll() {
    return await this.read();
  }

  async getById(id) {
    const data = await this.read();
    return data.find(item => item.id === id) || null;
  }

  async create(item) {
    const data = await this.read();
    const newItem = {
      id: this.generateId(),
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.push(newItem);
    const success = await this.write(data);
    return success ? newItem.id : null;
  }

  async update(id, updates) {
    const data = await this.read();
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return false;

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return await this.write(data);
  }

  async delete(id) {
    const data = await this.read();
    const filteredData = data.filter(item => item.id !== id);
    if (filteredData.length === data.length) return false; // Item not found
    return await this.write(filteredData);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Initialize database on module load
await initializeDB();

// Export database instances
export const diseaseDB = new Database('diseases');
export const diseaseCategoryDB = new Database('diseaseCategories');
export const chemicalDB = new Database('chemicals');
export const marketDB = new Database('markets');
export const pendingDiseaseDB = new Database('pendingDiseases');
export const commentDB = new Database('comments');

// Export the Database class for custom instances
export { Database };