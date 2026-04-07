# LearnQuest Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete REST API backend for LearnQuest — a children's learning motivation platform with star points, virtual pets, achievements, and a reward shop.

**Architecture:** Express.js REST API with MongoDB (Mongoose ODM). JWT-based auth with family ID login and PIN-protected parent mode. All star balance changes tracked via append-only transaction ledger. Achievement detection runs automatically after each learning record submission.

**Tech Stack:** Node.js, Express.js, MongoDB/Mongoose, JWT (jsonwebtoken), bcryptjs, Jest + Supertest (testing), dotenv

**Spec:** `docs/superpowers/specs/2026-04-07-learnquest-design.md`

---

## File Structure

```
server/
├── package.json
├── jest.config.js
├── src/
│   ├── app.js                    # Express app setup (middleware, routes, error handler)
│   ├── server.js                 # HTTP server entry point (listens on port)
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── pets.js               # Pet type definitions (base stats, evolution thresholds)
│   │   └── achievements.js       # Achievement definitions (conditions, rewards)
│   ├── models/
│   │   ├── Family.js
│   │   ├── Subject.js
│   │   ├── Record.js
│   │   ├── Pet.js
│   │   ├── StarTransaction.js
│   │   ├── Achievement.js
│   │   ├── FamilyAchievement.js
│   │   ├── Reward.js
│   │   └── Redemption.js
│   ├── middleware/
│   │   ├── auth.js               # JWT verification (family-level)
│   │   └── parent.js             # PIN-based parent permission check
│   ├── routes/
│   │   ├── family.js
│   │   ├── subjects.js
│   │   ├── records.js
│   │   ├── pets.js
│   │   ├── achievements.js
│   │   ├── rewards.js
│   │   ├── redemptions.js
│   │   └── stats.js
│   ├── services/
│   │   ├── starService.js        # Star balance queries and transaction creation
│   │   ├── achievementService.js # Achievement condition checking and unlocking
│   │   └── petService.js         # Pet feeding, leveling, mood updates
│   └── helpers/
│       └── response.js           # Unified API response format helpers
├── tests/
│   ├── setup.js                  # MongoDB Memory Server setup/teardown
│   ├── helpers.js                # Test utilities (create family, get auth token, etc.)
│   ├── family.test.js
│   ├── subjects.test.js
│   ├── records.test.js
│   ├── pets.test.js
│   ├── achievements.test.js
│   ├── rewards.test.js
│   ├── redemptions.test.js
│   └── stats.test.js
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `server/package.json`
- Create: `server/jest.config.js`
- Create: `server/src/app.js`
- Create: `server/src/server.js`
- Create: `server/src/config/db.js`
- Create: `server/src/helpers/response.js`
- Create: `server/tests/setup.js`
- Create: `server/.env.example`

- [ ] **Step 1: Initialize server package and install dependencies**

```bash
cd server
npm init -y
npm install express mongoose jsonwebtoken bcryptjs dotenv cors
npm install -D jest supertest mongodb-memory-server @types/jest
```

Update `server/package.json` scripts:
```json
{
  "name": "learnquest-server",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js",
    "test": "jest --forceExit --detectOpenHandles",
    "test:coverage": "jest --forceExit --detectOpenHandles --coverage"
  }
}
```

- [ ] **Step 2: Create .env.example**

```
MONGODB_URI=mongodb://localhost:27017/learnquest
JWT_SECRET=your-secret-key-change-in-production
PORT=3001
```

- [ ] **Step 3: Create database connection**

`server/src/config/db.js`:
```js
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
```

- [ ] **Step 4: Create response helpers**

`server/src/helpers/response.js`:
```js
const success = (data) => ({
  success: true,
  data,
  error: null,
});

const error = (code, message) => ({
  success: false,
  data: null,
  error: { code, message },
});

module.exports = { success, error };
```

- [ ] **Step 5: Create Express app**

`server/src/app.js`:
```js
const express = require('express');
const cors = require('cors');

const familyRoutes = require('./routes/family');
const subjectRoutes = require('./routes/subjects');
const recordRoutes = require('./routes/records');
const petRoutes = require('./routes/pets');
const achievementRoutes = require('./routes/achievements');
const rewardRoutes = require('./routes/rewards');
const redemptionRoutes = require('./routes/redemptions');
const statRoutes = require('./routes/stats');
const { error } = require('./helpers/response');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/family', familyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/stats', statRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json(error('SERVER_ERROR', 'Internal server error'));
});

module.exports = app;
```

**Note:** Route files don't exist yet. Create placeholder empty routers in Task 1 so the app can load. Each subsequent task will fill in the real routes.

Create placeholder routers for all route files (`server/src/routes/family.js`, `subjects.js`, `records.js`, `pets.js`, `achievements.js`, `rewards.js`, `redemptions.js`, `stats.js`):
```js
const router = require('express').Router();
module.exports = router;
```

- [ ] **Step 6: Create server entry point**

`server/src/server.js`:
```js
require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

- [ ] **Step 7: Create test setup with MongoDB Memory Server**

`server/jest.config.js`:
```js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterSetup: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
};
```

`server/tests/setup.js`:
```js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

- [ ] **Step 8: Create test helpers**

`server/tests/helpers.js`:
```js
const request = require('supertest');
const app = require('../src/app');

const createFamily = async (name = 'Test Family', pin = '1234') => {
  const res = await request(app)
    .post('/api/family/register')
    .send({ name, pin });
  return res.body.data;
};

const loginFamily = async (familyId) => {
  const res = await request(app)
    .post('/api/family/login')
    .send({ familyId });
  return res.body.data.token;
};

const getParentToken = async (token, pin = '1234') => {
  const res = await request(app)
    .post('/api/family/verify-pin')
    .set('Authorization', `Bearer ${token}`)
    .send({ pin });
  return res.body.data.token;
};

const authedRequest = (method, path, token) => {
  return request(app)[method](path).set('Authorization', `Bearer ${token}`);
};

module.exports = { createFamily, loginFamily, getParentToken, authedRequest };
```

- [ ] **Step 9: Verify setup compiles**

Run: `cd server && node -e "require('./src/app')"`
Expected: No errors (app loads successfully)

- [ ] **Step 10: Commit**

```bash
git add server/
git commit -m "feat: scaffold server project with Express, test setup, and response helpers"
```

---

### Task 2: Family Model & Auth APIs

**Files:**
- Create: `server/src/models/Family.js`
- Create: `server/src/middleware/auth.js`
- Create: `server/src/middleware/parent.js`
- Modify: `server/src/routes/family.js`
- Create: `server/tests/family.test.js`

- [ ] **Step 1: Write failing tests for family registration, login, and PIN verification**

`server/tests/family.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Family API', () => {
  describe('POST /api/family/register', () => {
    it('should register a new family and return familyId', async () => {
      const res = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.familyId).toBeDefined();
      expect(res.body.data.name).toBe('Guo Family');
    });

    it('should reject registration without name', async () => {
      const res = await request(app)
        .post('/api/family/register')
        .send({ pin: '1234' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with non-4-digit pin', async () => {
      const res = await request(app)
        .post('/api/family/register')
        .send({ name: 'Test', pin: '12' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/family/login', () => {
    it('should login with familyId and return JWT', async () => {
      const regRes = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      const familyId = regRes.body.data.familyId;

      const res = await request(app)
        .post('/api/family/login')
        .send({ familyId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with invalid familyId', async () => {
      const res = await request(app)
        .post('/api/family/login')
        .send({ familyId: 'nonexistent' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/family/verify-pin', () => {
    it('should return parent token with correct pin', async () => {
      const regRes = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      const loginRes = await request(app)
        .post('/api/family/login')
        .send({ familyId: regRes.body.data.familyId });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/family/verify-pin')
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '1234' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject incorrect pin', async () => {
      const regRes = await request(app)
        .post('/api/family/register')
        .send({ name: 'Guo Family', pin: '1234' });

      const loginRes = await request(app)
        .post('/api/family/login')
        .send({ familyId: regRes.body.data.familyId });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/family/verify-pin')
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '9999' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx jest tests/family.test.js --verbose`
Expected: All 6 tests FAIL

- [ ] **Step 3: Create Family model**

`server/src/models/Family.js`:
```js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const familySchema = new mongoose.Schema({
  familyId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
  },
  initialPetChosen: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

familySchema.pre('save', async function (next) {
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  if (this.isNew && !this.familyId) {
    this.familyId = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

familySchema.methods.comparePin = function (candidatePin) {
  return bcrypt.compare(candidatePin, this.pin);
};

module.exports = mongoose.model('Family', familySchema);
```

- [ ] **Step 4: Create auth middleware**

`server/src/middleware/auth.js`:
```js
const jwt = require('jsonwebtoken');
const { error } = require('../helpers/response');

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(error('NO_TOKEN', 'Authentication required'));
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.familyId = decoded.familyId;
    req.isParent = decoded.isParent || false;
    next();
  } catch {
    return res.status(401).json(error('INVALID_TOKEN', 'Invalid or expired token'));
  }
};

module.exports = auth;
```

- [ ] **Step 5: Create parent middleware**

`server/src/middleware/parent.js`:
```js
const { error } = require('../helpers/response');

const parent = (req, res, next) => {
  if (!req.isParent) {
    return res.status(403).json(error('NOT_PARENT', 'Parent permission required'));
  }
  next();
};

module.exports = parent;
```

- [ ] **Step 6: Implement family routes**

`server/src/routes/family.js`:
```js
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Family = require('../models/Family');
const auth = require('../middleware/auth');
const { success, error } = require('../helpers/response');

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

router.post('/register', async (req, res) => {
  try {
    const { name, pin } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Family name is required'));
    }
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(400).json(error('INVALID_PIN', 'PIN must be exactly 4 digits'));
    }

    const family = new Family({ name: name.trim(), pin });
    await family.save();

    res.status(201).json(success({
      familyId: family.familyId,
      name: family.name,
    }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Registration failed'));
  }
});

router.post('/login', async (req, res) => {
  try {
    const { familyId } = req.body;

    if (!familyId) {
      return res.status(400).json(error('INVALID_INPUT', 'Family ID is required'));
    }

    const family = await Family.findOne({ familyId });
    if (!family) {
      return res.status(404).json(error('NOT_FOUND', 'Family not found'));
    }

    const token = jwt.sign(
      { familyId: family._id.toString(), isParent: false },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json(success({ token, name: family.name, initialPetChosen: family.initialPetChosen }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Login failed'));
  }
});

router.post('/verify-pin', auth, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json(error('INVALID_INPUT', 'PIN is required'));
    }

    const family = await Family.findById(req.familyId);
    if (!family) {
      return res.status(404).json(error('NOT_FOUND', 'Family not found'));
    }

    const isMatch = await family.comparePin(pin);
    if (!isMatch) {
      return res.status(401).json(error('WRONG_PIN', 'Incorrect PIN'));
    }

    const token = jwt.sign(
      { familyId: family._id.toString(), isParent: true },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json(success({ token }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'PIN verification failed'));
  }
});

module.exports = router;
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd server && npx jest tests/family.test.js --verbose`
Expected: All 6 tests PASS

- [ ] **Step 8: Commit**

```bash
git add server/
git commit -m "feat: add Family model and auth APIs (register, login, verify-pin)"
```

---

### Task 3: Subject Model & CRUD APIs

**Files:**
- Create: `server/src/models/Subject.js`
- Modify: `server/src/routes/subjects.js`
- Create: `server/tests/subjects.test.js`

- [ ] **Step 1: Write failing tests for subject CRUD**

`server/tests/subjects.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Subject API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('GET /api/subjects', () => {
    it('should return default subjects for new family', async () => {
      const res = await authedRequest('get', '/api/subjects', token);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      const names = res.body.data.map((s) => s.name);
      expect(names).toContain('数学');
      expect(names).toContain('语文');
      expect(names).toContain('英语');
    });
  });

  describe('POST /api/subjects', () => {
    it('should create a new subject (parent only)', async () => {
      const res = await authedRequest('post', '/api/subjects', parentToken)
        .send({ name: '科学', icon: '🔬', taskTemplates: [{ name: '实验报告', points: 10 }] });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('科学');
      expect(res.body.data.taskTemplates).toHaveLength(1);
    });

    it('should reject non-parent user', async () => {
      const res = await authedRequest('post', '/api/subjects', token)
        .send({ name: '科学', icon: '🔬' });

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/subjects/:id', () => {
    it('should update a subject', async () => {
      const createRes = await authedRequest('post', '/api/subjects', parentToken)
        .send({ name: '科学', icon: '🔬' });

      const id = createRes.body.data._id;

      const res = await authedRequest('put', `/api/subjects/${id}`, parentToken)
        .send({ name: '自然科学', taskTemplates: [{ name: '观察日记', points: 5 }] });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('自然科学');
      expect(res.body.data.taskTemplates).toHaveLength(1);
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    it('should delete a non-default subject', async () => {
      const createRes = await authedRequest('post', '/api/subjects', parentToken)
        .send({ name: '科学', icon: '🔬' });

      const id = createRes.body.data._id;

      const res = await authedRequest('delete', `/api/subjects/${id}`, parentToken);

      expect(res.status).toBe(200);

      const listRes = await authedRequest('get', '/api/subjects', token);
      const names = listRes.body.data.map((s) => s.name);
      expect(names).not.toContain('科学');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx jest tests/subjects.test.js --verbose`
Expected: All 5 tests FAIL

- [ ] **Step 3: Create Subject model**

`server/src/models/Subject.js`:
```js
const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, required: true, min: 1 },
});

const subjectSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: '',
  },
  taskTemplates: [taskTemplateSchema],
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

subjectSchema.index({ familyId: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
```

- [ ] **Step 4: Implement subject routes**

`server/src/routes/subjects.js`:
```js
const router = require('express').Router();
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const parent = require('../middleware/parent');
const { success, error } = require('../helpers/response');

const DEFAULT_SUBJECTS = [
  {
    name: '数学', icon: '📐',
    taskTemplates: [
      { name: '课本习题全对', points: 10 },
      { name: '考试90分以上', points: 20 },
    ],
  },
  {
    name: '语文', icon: '📖',
    taskTemplates: [
      { name: '听写满分', points: 10 },
      { name: '背诵课文', points: 5 },
    ],
  },
  {
    name: '英语', icon: '🔤',
    taskTemplates: [
      { name: '单词背诵完成', points: 5 },
      { name: '阅读理解全对', points: 8 },
    ],
  },
];

const ensureDefaults = async (familyId) => {
  const count = await Subject.countDocuments({ familyId });
  if (count === 0) {
    const subjects = DEFAULT_SUBJECTS.map((s) => ({
      ...s,
      familyId,
      isDefault: true,
    }));
    await Subject.insertMany(subjects);
  }
};

router.get('/', auth, async (req, res) => {
  try {
    await ensureDefaults(req.familyId);
    const subjects = await Subject.find({ familyId: req.familyId }).sort('name');
    res.json(success(subjects));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch subjects'));
  }
});

router.post('/', auth, parent, async (req, res) => {
  try {
    const { name, icon, taskTemplates } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Subject name is required'));
    }

    const subject = new Subject({
      familyId: req.familyId,
      name: name.trim(),
      icon: icon || '',
      taskTemplates: taskTemplates || [],
    });
    await subject.save();

    res.status(201).json(success(subject));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to create subject'));
  }
});

router.put('/:id', auth, parent, async (req, res) => {
  try {
    const { name, icon, taskTemplates } = req.body;

    const subject = await Subject.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!subject) {
      return res.status(404).json(error('NOT_FOUND', 'Subject not found'));
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (icon !== undefined) updates.icon = icon;
    if (taskTemplates !== undefined) updates.taskTemplates = taskTemplates;

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.json(success(updated));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to update subject'));
  }
});

router.delete('/:id', auth, parent, async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!subject) {
      return res.status(404).json(error('NOT_FOUND', 'Subject not found'));
    }

    await Subject.findByIdAndDelete(req.params.id);
    res.json(success({ deleted: true }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to delete subject'));
  }
});

module.exports = router;
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && npx jest tests/subjects.test.js --verbose`
Expected: All 5 tests PASS

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: add Subject model with CRUD and default subjects"
```

---

### Task 4: Star Transaction System & Learning Records

**Files:**
- Create: `server/src/models/StarTransaction.js`
- Create: `server/src/models/Record.js`
- Create: `server/src/services/starService.js`
- Modify: `server/src/routes/records.js`
- Modify: `server/src/routes/stats.js` (balance endpoint)
- Create: `server/tests/records.test.js`

- [ ] **Step 1: Write failing tests for records and star balance**

`server/tests/records.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Records & Stars API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('POST /api/records', () => {
    it('should create a record and award stars (parent only)', async () => {
      // Get a subject first
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      const res = await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: '课本习题全对', points: 10 });

      expect(res.status).toBe(201);
      expect(res.body.data.record.points).toBe(10);
      expect(res.body.data.record.taskName).toBe('课本习题全对');
    });

    it('should reject non-parent user', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      const res = await authedRequest('post', '/api/records', token)
        .send({ subjectId, taskName: 'Test', points: 5 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/stars/balance', () => {
    it('should return 0 for new family', async () => {
      const res = await authedRequest('get', '/api/stars/balance', token);

      expect(res.status).toBe(200);
      expect(res.body.data.balance).toBe(0);
    });

    it('should reflect stars earned from records', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 1', points: 10 });

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 2', points: 5 });

      const res = await authedRequest('get', '/api/stars/balance', token);
      expect(res.body.data.balance).toBe(15);
    });
  });

  describe('GET /api/records', () => {
    it('should return records filtered by date range', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 1', points: 10 });

      const today = new Date().toISOString().split('T')[0];
      const res = await authedRequest('get', `/api/records?startDate=${today}&endDate=${today}`, token);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/records/calendar', () => {
    it('should return calendar data for a month', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Task 1', points: 10 });

      const month = new Date().toISOString().slice(0, 7); // YYYY-MM
      const res = await authedRequest('get', `/api/records/calendar?month=${month}`, token);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      // calendar data is object with date keys and point sums
      const dates = Object.keys(res.body.data);
      expect(dates.length).toBeGreaterThanOrEqual(1);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx jest tests/records.test.js --verbose`
Expected: All 6 tests FAIL

- [ ] **Step 3: Create StarTransaction model**

`server/src/models/StarTransaction.js`:
```js
const mongoose = require('mongoose');

const starTransactionSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['earn', 'feed', 'redeem', 'unlock'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StarTransaction', starTransactionSchema);
```

- [ ] **Step 4: Create Record model**

`server/src/models/Record.js`:
```js
const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    required: true,
    min: 1,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

recordSchema.index({ familyId: 1, date: 1 });

module.exports = mongoose.model('Record', recordSchema);
```

- [ ] **Step 5: Create star service**

`server/src/services/starService.js`:
```js
const StarTransaction = require('../models/StarTransaction');

const getBalance = async (familyId) => {
  const result = await StarTransaction.aggregate([
    { $match: { familyId } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

const addTransaction = async ({ familyId, type, amount, referenceId, description }) => {
  const tx = new StarTransaction({ familyId, type, amount, referenceId, description });
  await tx.save();
  return tx;
};

const hasEnoughStars = async (familyId, cost) => {
  const balance = await getBalance(familyId);
  return balance >= cost;
};

module.exports = { getBalance, addTransaction, hasEnoughStars };
```

- [ ] **Step 6: Implement record routes**

`server/src/routes/records.js`:
```js
const router = require('express').Router();
const mongoose = require('mongoose');
const Record = require('../models/Record');
const auth = require('../middleware/auth');
const parent = require('../middleware/parent');
const { addTransaction } = require('../services/starService');
const { success, error } = require('../helpers/response');

router.post('/', auth, parent, async (req, res) => {
  try {
    const { subjectId, taskName, points, note, date } = req.body;

    if (!subjectId || !taskName || !points) {
      return res.status(400).json(error('INVALID_INPUT', 'subjectId, taskName, and points are required'));
    }
    if (points < 1) {
      return res.status(400).json(error('INVALID_INPUT', 'Points must be at least 1'));
    }

    const record = new Record({
      familyId: req.familyId,
      subjectId,
      taskName,
      points,
      note: note || '',
      date: date || new Date(),
    });
    await record.save();

    await addTransaction({
      familyId: new mongoose.Types.ObjectId(req.familyId),
      type: 'earn',
      amount: points,
      referenceId: record._id,
      description: `${taskName} +${points}`,
    });

    // Achievement check placeholder — filled in Task 6
    const newAchievements = [];

    res.status(201).json(success({ record, newAchievements }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to create record'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { familyId: req.familyId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const records = await Record.find(query).sort({ date: -1 }).populate('subjectId', 'name icon');
    res.json(success(records));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch records'));
  }
});

router.get('/calendar', auth, async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json(error('INVALID_INPUT', 'month parameter required (YYYY-MM)'));
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const records = await Record.aggregate([
      {
        $match: {
          familyId: new mongoose.Types.ObjectId(req.familyId),
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalPoints: { $sum: '$points' },
          count: { $sum: 1 },
        },
      },
    ]);

    const calendar = {};
    for (const r of records) {
      calendar[r._id] = { totalPoints: r.totalPoints, count: r.count };
    }

    res.json(success(calendar));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch calendar data'));
  }
});

module.exports = router;
```

- [ ] **Step 7: Add star balance endpoint to stats routes**

`server/src/routes/stats.js`:
```js
const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { getBalance } = require('../services/starService');
const Record = require('../models/Record');
const { success, error } = require('../helpers/response');

router.get('/stars/balance', auth, async (req, res) => {
  try {
    const balance = await getBalance(new mongoose.Types.ObjectId(req.familyId));
    res.json(success({ balance }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch balance'));
  }
});

module.exports = router;
```

Update `server/src/app.js` to mount stats at `/api` (not `/api/stats`) so `/api/stars/balance` works:

Change the stats mount line in app.js from:
```js
app.use('/api/stats', statRoutes);
```
to:
```js
app.use('/api', statRoutes);
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `cd server && npx jest tests/records.test.js --verbose`
Expected: All 6 tests PASS

- [ ] **Step 9: Commit**

```bash
git add server/
git commit -m "feat: add learning records, star transactions, and balance endpoint"
```

---

### Task 5: Pet System

**Files:**
- Create: `server/src/models/Pet.js`
- Create: `server/src/config/pets.js`
- Create: `server/src/services/petService.js`
- Modify: `server/src/routes/pets.js`
- Create: `server/tests/pets.test.js`

- [ ] **Step 1: Write failing tests for pet system**

`server/tests/pets.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Pet API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('GET /api/pets', () => {
    it('should return available pet types for new family', async () => {
      const res = await authedRequest('get', '/api/pets', token);

      expect(res.status).toBe(200);
      expect(res.body.data.owned).toHaveLength(0);
      expect(res.body.data.available.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/pets/choose', () => {
    it('should let child choose initial pet', async () => {
      const res = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('cat');
      expect(res.body.data.name).toBe('小花');
      expect(res.body.data.level).toBe(1);
      expect(res.body.data.isActive).toBe(true);
    });

    it('should reject choosing twice', async () => {
      await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      const res = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'dog', name: '小黑' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/pets/:id/feed', () => {
    it('should feed pet, deduct stars, and gain exp', async () => {
      // Earn some stars first
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;
      await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Test', points: 20 });

      // Choose pet
      const petRes = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      const petId = petRes.body.data._id;

      // Feed pet (costs 5 stars by default)
      const res = await authedRequest('post', `/api/pets/${petId}/feed`, token);

      expect(res.status).toBe(200);
      expect(res.body.data.pet.exp).toBeGreaterThan(0);

      // Balance should decrease
      const balanceRes = await authedRequest('get', '/api/stars/balance', token);
      expect(balanceRes.body.data.balance).toBe(15); // 20 - 5
    });

    it('should reject feeding with insufficient stars', async () => {
      const petRes = await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      const petId = petRes.body.data._id;

      const res = await authedRequest('post', `/api/pets/${petId}/feed`, token);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_STARS');
    });
  });

  describe('PUT /api/pets/:id/active', () => {
    it('should switch active pet', async () => {
      // Choose first pet
      await authedRequest('post', '/api/pets/choose', token)
        .send({ type: 'cat', name: '小花' });

      // Earn stars and unlock second pet
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;
      for (let i = 0; i < 5; i++) {
        await authedRequest('post', '/api/records', parentToken)
          .send({ subjectId, taskName: 'Task', points: 20 });
      }

      // Unlock second pet
      const unlockRes = await authedRequest('post', '/api/pets/unlock', token)
        .send({ type: 'dog', name: '小黑' });

      const dogId = unlockRes.body.data._id;

      // Switch to dog
      const res = await authedRequest('put', `/api/pets/${dogId}/active`, token);

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(true);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx jest tests/pets.test.js --verbose`
Expected: All 5 tests FAIL

- [ ] **Step 3: Create pet config**

`server/src/config/pets.js`:
```js
// Pet type definitions
// unlockCost: 0 = initial selection, > 0 = purchasable in shop
// levelThresholds[i] = exp needed to reach level i+2

const PET_TYPES = {
  cat: {
    name: '小猫咪',
    description: '温柔可爱的小猫咪',
    unlockCost: 0, // initial choice
  },
  dog: {
    name: '小狗狗',
    description: '活泼忠诚的小狗狗',
    unlockCost: 0, // initial choice
  },
  rabbit: {
    name: '小兔子',
    description: '蹦蹦跳跳的小兔子',
    unlockCost: 0, // initial choice
  },
  dragon: {
    name: '小火龙',
    description: '神秘的小火龙',
    unlockCost: 50,
  },
  unicorn: {
    name: '独角兽',
    description: '闪闪发光的独角兽',
    unlockCost: 100,
  },
};

const FEED_COST = 5; // stars per feed
const FEED_EXP = 10; // exp per feed

// exp needed to reach each level (index = level - 1)
// Level 1 = 0 exp, Level 2 = 30 exp, etc.
const LEVEL_THRESHOLDS = [
  0, 30, 70, 120, 180, 250, 340, 450, 580, 730,
  900, 1100, 1330, 1600, 1900, 2250, 2650, 3100, 3600, 4200,
];

const MAX_LEVEL = LEVEL_THRESHOLDS.length;

const getLevelForExp = (exp) => {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (exp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

const HUNGRY_AFTER_DAYS = 3;

module.exports = {
  PET_TYPES,
  FEED_COST,
  FEED_EXP,
  LEVEL_THRESHOLDS,
  MAX_LEVEL,
  getLevelForExp,
  HUNGRY_AFTER_DAYS,
};
```

- [ ] **Step 4: Create Pet model**

`server/src/models/Pet.js`:
```js
const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: Number,
    default: 1,
  },
  exp: {
    type: Number,
    default: 0,
  },
  mood: {
    type: String,
    enum: ['happy', 'normal', 'hungry'],
    default: 'happy',
  },
  lastFedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  unlockedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Pet', petSchema);
```

- [ ] **Step 5: Create pet service**

`server/src/services/petService.js`:
```js
const Pet = require('../models/Pet');
const { getLevelForExp, FEED_COST, FEED_EXP, HUNGRY_AFTER_DAYS } = require('../config/pets');

const feedPet = async (pet) => {
  const newExp = pet.exp + FEED_EXP;
  const newLevel = getLevelForExp(newExp);

  const updated = await Pet.findByIdAndUpdate(
    pet._id,
    {
      $set: {
        exp: newExp,
        level: newLevel,
        mood: 'happy',
        lastFedAt: new Date(),
      },
    },
    { new: true }
  );

  return { pet: updated, leveledUp: newLevel > pet.level };
};

const updateMoods = async (familyId) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - HUNGRY_AFTER_DAYS);

  await Pet.updateMany(
    { familyId, lastFedAt: { $lt: cutoff }, mood: { $ne: 'hungry' } },
    { $set: { mood: 'hungry' } }
  );
};

module.exports = { feedPet, updateMoods, FEED_COST };
```

- [ ] **Step 6: Implement pet routes**

`server/src/routes/pets.js`:
```js
const router = require('express').Router();
const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const Family = require('../models/Family');
const auth = require('../middleware/auth');
const { PET_TYPES, FEED_COST } = require('../config/pets');
const { feedPet, updateMoods } = require('../services/petService');
const { addTransaction, hasEnoughStars } = require('../services/starService');
const { success, error } = require('../helpers/response');

router.get('/', auth, async (req, res) => {
  try {
    await updateMoods(req.familyId);
    const owned = await Pet.find({ familyId: req.familyId });
    const ownedTypes = owned.map((p) => p.type);

    const available = Object.entries(PET_TYPES).map(([type, config]) => ({
      type,
      ...config,
      owned: ownedTypes.includes(type),
    }));

    res.json(success({ owned, available }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch pets'));
  }
});

router.post('/choose', auth, async (req, res) => {
  try {
    const { type, name } = req.body;

    const family = await Family.findById(req.familyId);
    if (family.initialPetChosen) {
      return res.status(400).json(error('ALREADY_CHOSEN', 'Initial pet already chosen'));
    }

    const petConfig = PET_TYPES[type];
    if (!petConfig || petConfig.unlockCost > 0) {
      return res.status(400).json(error('INVALID_PET', 'Invalid initial pet type'));
    }

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Pet name is required'));
    }

    const pet = new Pet({
      familyId: req.familyId,
      type,
      name: name.trim(),
      isActive: true,
    });
    await pet.save();

    await Family.findByIdAndUpdate(req.familyId, { $set: { initialPetChosen: true } });

    res.status(201).json(success(pet));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to choose pet'));
  }
});

router.post('/:id/feed', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!pet) {
      return res.status(404).json(error('NOT_FOUND', 'Pet not found'));
    }

    const familyObjId = new mongoose.Types.ObjectId(req.familyId);
    const enough = await hasEnoughStars(familyObjId, FEED_COST);
    if (!enough) {
      return res.status(400).json(error('INSUFFICIENT_STARS', 'Not enough stars to feed pet'));
    }

    await addTransaction({
      familyId: familyObjId,
      type: 'feed',
      amount: -FEED_COST,
      referenceId: pet._id,
      description: `Feed ${pet.name} -${FEED_COST}`,
    });

    const result = await feedPet(pet);

    res.json(success(result));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to feed pet'));
  }
});

router.post('/unlock', auth, async (req, res) => {
  try {
    const { type, name } = req.body;

    const petConfig = PET_TYPES[type];
    if (!petConfig) {
      return res.status(400).json(error('INVALID_PET', 'Unknown pet type'));
    }

    const existing = await Pet.findOne({ familyId: req.familyId, type });
    if (existing) {
      return res.status(400).json(error('ALREADY_OWNED', 'Pet already owned'));
    }

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Pet name is required'));
    }

    if (petConfig.unlockCost > 0) {
      const familyObjId = new mongoose.Types.ObjectId(req.familyId);
      const enough = await hasEnoughStars(familyObjId, petConfig.unlockCost);
      if (!enough) {
        return res.status(400).json(error('INSUFFICIENT_STARS', 'Not enough stars to unlock pet'));
      }

      await addTransaction({
        familyId: familyObjId,
        type: 'unlock',
        amount: -petConfig.unlockCost,
        referenceId: null,
        description: `Unlock ${petConfig.name} -${petConfig.unlockCost}`,
      });
    }

    const pet = new Pet({
      familyId: req.familyId,
      type,
      name: name.trim(),
      isActive: false,
    });
    await pet.save();

    res.status(201).json(success(pet));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to unlock pet'));
  }
});

router.put('/:id/active', auth, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!pet) {
      return res.status(404).json(error('NOT_FOUND', 'Pet not found'));
    }

    // Deactivate all pets for this family, then activate the selected one
    await Pet.updateMany({ familyId: req.familyId }, { $set: { isActive: false } });
    const updated = await Pet.findByIdAndUpdate(
      pet._id,
      { $set: { isActive: true } },
      { new: true }
    );

    res.json(success(updated));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to switch pet'));
  }
});

module.exports = router;
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd server && npx jest tests/pets.test.js --verbose`
Expected: All 5 tests PASS

- [ ] **Step 8: Commit**

```bash
git add server/
git commit -m "feat: add pet system with choose, feed, unlock, and switch"
```

---

### Task 6: Achievement System

**Files:**
- Create: `server/src/models/Achievement.js`
- Create: `server/src/models/FamilyAchievement.js`
- Create: `server/src/config/achievements.js`
- Create: `server/src/services/achievementService.js`
- Modify: `server/src/routes/achievements.js`
- Modify: `server/src/routes/records.js` (wire up achievement check)
- Create: `server/tests/achievements.test.js`

- [ ] **Step 1: Write failing tests for achievements**

`server/tests/achievements.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
const Achievement = require('../src/models/Achievement');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

const seedAchievements = async () => {
  await Achievement.insertMany([
    {
      type: 'persistence',
      title: '连续7天',
      description: '连续7天有学习记录',
      icon: '🔥',
      condition: { type: 'streak', target: 7 },
      isHidden: false,
    },
    {
      type: 'learning',
      title: '初次记录',
      description: '完成第一条学习记录',
      icon: '⭐',
      condition: { type: 'count', target: 1 },
      isHidden: false,
    },
    {
      type: 'learning',
      title: '学习达人',
      description: '累计完成10条学习记录',
      icon: '🏆',
      condition: { type: 'count', target: 10 },
      isHidden: false,
    },
    {
      type: 'pet',
      title: '宠物收藏家',
      description: '拥有3只宠物',
      icon: '🐾',
      condition: { type: 'pet_count', target: 3 },
      isHidden: true,
    },
  ]);
};

describe('Achievement API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
    await seedAchievements();
  });

  describe('GET /api/achievements', () => {
    it('should return achievements with progress', async () => {
      const res = await authedRequest('get', '/api/achievements', token);

      expect(res.status).toBe(200);
      // Should see non-hidden achievements + hidden ones show as ???
      expect(res.body.data.length).toBe(4);

      const first = res.body.data.find((a) => a.title === '初次记录');
      expect(first.isUnlocked).toBe(false);
      expect(first.progress).toBe(0);
    });
  });

  describe('Achievement auto-detection', () => {
    it('should unlock "初次记录" after first record', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      const res = await authedRequest('post', '/api/records', parentToken)
        .send({ subjectId, taskName: 'Test', points: 10 });

      expect(res.body.data.newAchievements).toBeDefined();
      expect(res.body.data.newAchievements.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.newAchievements[0].title).toBe('初次记录');

      // Verify achievement is now unlocked
      const achRes = await authedRequest('get', '/api/achievements', token);
      const first = achRes.body.data.find((a) => a.title === '初次记录');
      expect(first.isUnlocked).toBe(true);
    });

    it('should track progress for "学习达人"', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      // Add 3 records
      for (let i = 0; i < 3; i++) {
        await authedRequest('post', '/api/records', parentToken)
          .send({ subjectId, taskName: `Task ${i}`, points: 5 });
      }

      const achRes = await authedRequest('get', '/api/achievements', token);
      const learner = achRes.body.data.find((a) => a.title === '学习达人');
      expect(learner.progress).toBe(3);
      expect(learner.isUnlocked).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx jest tests/achievements.test.js --verbose`
Expected: All 4 tests FAIL

- [ ] **Step 3: Create Achievement and FamilyAchievement models**

`server/src/models/Achievement.js`:
```js
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['learning', 'persistence', 'pet'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  condition: {
    type: {
      type: String,
      enum: ['count', 'streak', 'pet_level', 'pet_count', 'all_subjects'],
      required: true,
    },
    subjectFilter: String,
    target: {
      type: Number,
      required: true,
    },
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  unlocksPetType: String,
});

module.exports = mongoose.model('Achievement', achievementSchema);
```

`server/src/models/FamilyAchievement.js`:
```js
const mongoose = require('mongoose');

const familyAchievementSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
  },
  isUnlocked: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  unlockedAt: Date,
});

familyAchievementSchema.index({ familyId: 1, achievementId: 1 }, { unique: true });

module.exports = mongoose.model('FamilyAchievement', familyAchievementSchema);
```

- [ ] **Step 4: Create achievement config with seed data**

`server/src/config/achievements.js`:
```js
// Default achievements to seed into the database
const DEFAULT_ACHIEVEMENTS = [
  {
    type: 'learning',
    title: '初次记录',
    description: '完成第一条学习记录',
    icon: '⭐',
    condition: { type: 'count', target: 1 },
    isHidden: false,
  },
  {
    type: 'learning',
    title: '学习达人',
    description: '累计完成10条学习记录',
    icon: '🏆',
    condition: { type: 'count', target: 10 },
    isHidden: false,
  },
  {
    type: 'learning',
    title: '数学小达人',
    description: '数学全对累计10次',
    icon: '📐',
    condition: { type: 'count', subjectFilter: '数学', target: 10 },
    isHidden: false,
  },
  {
    type: 'persistence',
    title: '连续7天',
    description: '连续7天有学习记录',
    icon: '🔥',
    condition: { type: 'streak', target: 7 },
    isHidden: false,
  },
  {
    type: 'persistence',
    title: '连续30天',
    description: '连续30天有学习记录',
    icon: '💪',
    condition: { type: 'streak', target: 30 },
    isHidden: false,
  },
  {
    type: 'persistence',
    title: '连续100天',
    description: '连续100天有学习记录',
    icon: '👑',
    condition: { type: 'streak', target: 100 },
    isHidden: true,
  },
  {
    type: 'pet',
    title: '宠物达到10级',
    description: '任一宠物达到10级',
    icon: '🐉',
    condition: { type: 'pet_level', target: 10 },
    isHidden: false,
  },
  {
    type: 'pet',
    title: '宠物收藏家',
    description: '拥有3只宠物',
    icon: '🐾',
    condition: { type: 'pet_count', target: 3 },
    isHidden: true,
  },
  {
    type: 'learning',
    title: '全科之星',
    description: '一周内每科都有记录',
    icon: '🌟',
    condition: { type: 'all_subjects', target: 1 },
    isHidden: false,
  },
];

module.exports = { DEFAULT_ACHIEVEMENTS };
```

- [ ] **Step 5: Create achievement service**

`server/src/services/achievementService.js`:
```js
const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const FamilyAchievement = require('../models/FamilyAchievement');
const Record = require('../models/Record');
const Pet = require('../models/Pet');
const Subject = require('../models/Subject');

const checkAchievements = async (familyId) => {
  const familyObjId = new mongoose.Types.ObjectId(familyId);
  const achievements = await Achievement.find({});
  const newlyUnlocked = [];

  for (const achievement of achievements) {
    let fa = await FamilyAchievement.findOne({
      familyId: familyObjId,
      achievementId: achievement._id,
    });

    if (fa && fa.isUnlocked) continue;

    const progress = await calculateProgress(familyObjId, achievement);

    if (!fa) {
      fa = new FamilyAchievement({
        familyId: familyObjId,
        achievementId: achievement._id,
        progress,
        isUnlocked: false,
      });
    } else {
      fa.progress = progress;
    }

    if (progress >= achievement.condition.target) {
      fa.isUnlocked = true;
      fa.unlockedAt = new Date();
      newlyUnlocked.push({
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        unlocksPetType: achievement.unlocksPetType || null,
      });
    }

    await fa.save();
  }

  return newlyUnlocked;
};

const calculateProgress = async (familyId, achievement) => {
  const { type, subjectFilter, target } = achievement.condition;

  switch (type) {
    case 'count': {
      const query = { familyId };
      if (subjectFilter) {
        const subject = await Subject.findOne({ familyId, name: subjectFilter });
        if (!subject) return 0;
        query.subjectId = subject._id;
      }
      return Record.countDocuments(query);
    }

    case 'streak': {
      return calculateStreak(familyId);
    }

    case 'pet_level': {
      const topPet = await Pet.findOne({ familyId }).sort({ level: -1 });
      return topPet ? topPet.level : 0;
    }

    case 'pet_count': {
      return Pet.countDocuments({ familyId });
    }

    case 'all_subjects': {
      return await checkAllSubjectsThisWeek(familyId) ? 1 : 0;
    }

    default:
      return 0;
  }
};

const calculateStreak = async (familyId) => {
  const records = await Record.aggregate([
    { $match: { familyId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  if (records.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = records.map((r) => r._id);

  for (let i = 0; i < dates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];

    if (dates.includes(expectedStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const checkAllSubjectsThisWeek = async (familyId) => {
  const subjects = await Subject.find({ familyId });
  if (subjects.length === 0) return false;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const subjectIds = subjects.map((s) => s._id);
  const coveredSubjects = await Record.distinct('subjectId', {
    familyId,
    date: { $gte: weekAgo },
    subjectId: { $in: subjectIds },
  });

  return coveredSubjects.length >= subjectIds.length;
};

const getAchievementsWithProgress = async (familyId) => {
  const familyObjId = new mongoose.Types.ObjectId(familyId);
  const achievements = await Achievement.find({});
  const familyAchievements = await FamilyAchievement.find({ familyId: familyObjId });
  const faMap = new Map(familyAchievements.map((fa) => [fa.achievementId.toString(), fa]));

  return achievements.map((a) => {
    const fa = faMap.get(a._id.toString());
    return {
      _id: a._id,
      type: a.type,
      title: a.isHidden && (!fa || !fa.isUnlocked) ? '???' : a.title,
      description: a.isHidden && (!fa || !fa.isUnlocked) ? '隐藏成就' : a.description,
      icon: a.isHidden && (!fa || !fa.isUnlocked) ? '❓' : a.icon,
      isHidden: a.isHidden,
      isUnlocked: fa ? fa.isUnlocked : false,
      progress: fa ? fa.progress : 0,
      target: a.condition.target,
      unlockedAt: fa ? fa.unlockedAt : null,
    };
  });
};

module.exports = { checkAchievements, getAchievementsWithProgress };
```

- [ ] **Step 6: Implement achievement routes**

`server/src/routes/achievements.js`:
```js
const router = require('express').Router();
const auth = require('../middleware/auth');
const { getAchievementsWithProgress } = require('../services/achievementService');
const { success, error } = require('../helpers/response');

router.get('/', auth, async (req, res) => {
  try {
    const achievements = await getAchievementsWithProgress(req.familyId);
    res.json(success(achievements));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch achievements'));
  }
});

module.exports = router;
```

- [ ] **Step 7: Wire achievement check into records route**

In `server/src/routes/records.js`, replace the placeholder line:
```js
// Achievement check placeholder — filled in Task 6
const newAchievements = [];
```

With:
```js
const { checkAchievements } = require('../services/achievementService');
// (add this require at the top of the file)
```

And in the POST handler, replace `const newAchievements = [];` with:
```js
const newAchievements = await checkAchievements(req.familyId);
```

Add the require at the top of `server/src/routes/records.js`:
```js
const { checkAchievements } = require('../services/achievementService');
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `cd server && npx jest tests/achievements.test.js --verbose`
Expected: All 4 tests PASS

- [ ] **Step 9: Commit**

```bash
git add server/
git commit -m "feat: add achievement system with auto-detection on record creation"
```

---

### Task 7: Reward & Redemption System

**Files:**
- Create: `server/src/models/Reward.js`
- Create: `server/src/models/Redemption.js`
- Modify: `server/src/routes/rewards.js`
- Modify: `server/src/routes/redemptions.js`
- Create: `server/tests/rewards.test.js`
- Create: `server/tests/redemptions.test.js`

- [ ] **Step 1: Write failing tests for rewards CRUD**

`server/tests/rewards.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Reward API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('POST /api/rewards', () => {
    it('should create a reward (parent only)', async () => {
      const res = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30, icon: '🎬' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('看电影');
      expect(res.body.data.cost).toBe(30);
    });

    it('should reject non-parent', async () => {
      const res = await authedRequest('post', '/api/rewards', token)
        .send({ name: '看电影', cost: 30 });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/rewards', () => {
    it('should return rewards list', async () => {
      await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30, icon: '🎬' });

      await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '买玩具', cost: 50, icon: '🧸' });

      const res = await authedRequest('get', '/api/rewards', token);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe('PUT /api/rewards/:id', () => {
    it('should update a reward', async () => {
      const createRes = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30 });

      const id = createRes.body.data._id;

      const res = await authedRequest('put', `/api/rewards/${id}`, parentToken)
        .send({ name: '看电影(IMAX)', cost: 50 });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('看电影(IMAX)');
      expect(res.body.data.cost).toBe(50);
    });
  });

  describe('DELETE /api/rewards/:id', () => {
    it('should delete a reward', async () => {
      const createRes = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: '看电影', cost: 30 });

      const id = createRes.body.data._id;

      const res = await authedRequest('delete', `/api/rewards/${id}`, parentToken);
      expect(res.status).toBe(200);
    });
  });
});
```

- [ ] **Step 2: Write failing tests for redemptions**

`server/tests/redemptions.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Redemption API', () => {
  let token, parentToken, rewardId;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);

    // Create reward
    const rewardRes = await authedRequest('post', '/api/rewards', parentToken)
      .send({ name: '看电影', cost: 20, icon: '🎬' });
    rewardId = rewardRes.body.data._id;

    // Earn stars
    const subjectsRes = await authedRequest('get', '/api/subjects', token);
    const subjectId = subjectsRes.body.data[0]._id;
    await authedRequest('post', '/api/records', parentToken)
      .send({ subjectId, taskName: 'Task', points: 30 });
  });

  describe('POST /api/redemptions', () => {
    it('should redeem reward and deduct stars', async () => {
      const res = await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.cost).toBe(20);

      // Check balance
      const balanceRes = await authedRequest('get', '/api/stars/balance', token);
      expect(balanceRes.body.data.balance).toBe(10); // 30 - 20
    });

    it('should reject redemption with insufficient stars', async () => {
      // Create expensive reward
      const expensiveRes = await authedRequest('post', '/api/rewards', parentToken)
        .send({ name: 'PS5', cost: 1000 });

      const res = await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId: expensiveRes.body.data._id });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INSUFFICIENT_STARS');
    });
  });

  describe('GET /api/redemptions?status=pending', () => {
    it('should return pending redemptions', async () => {
      await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId });

      const res = await authedRequest('get', '/api/redemptions?status=pending', parentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('pending');
    });
  });

  describe('PUT /api/redemptions/:id/confirm', () => {
    it('should confirm a pending redemption (parent only)', async () => {
      const redeemRes = await authedRequest('post', '/api/redemptions', token)
        .send({ rewardId });

      const redemptionId = redeemRes.body.data._id;

      const res = await authedRequest('put', `/api/redemptions/${redemptionId}/confirm`, parentToken);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('confirmed');
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd server && npx jest tests/rewards.test.js tests/redemptions.test.js --verbose`
Expected: All 8 tests FAIL

- [ ] **Step 4: Create Reward and Redemption models**

`server/src/models/Reward.js`:
```js
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: '',
  },
  cost: {
    type: Number,
    required: true,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Reward', rewardSchema);
```

`server/src/models/Redemption.js`:
```js
const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true,
    index: true,
  },
  rewardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true,
  },
  rewardName: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: Date,
});

module.exports = mongoose.model('Redemption', redemptionSchema);
```

- [ ] **Step 5: Implement reward routes**

`server/src/routes/rewards.js`:
```js
const router = require('express').Router();
const Reward = require('../models/Reward');
const auth = require('../middleware/auth');
const parent = require('../middleware/parent');
const { success, error } = require('../helpers/response');

router.get('/', auth, async (req, res) => {
  try {
    const rewards = await Reward.find({ familyId: req.familyId, isActive: true });
    res.json(success(rewards));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch rewards'));
  }
});

router.post('/', auth, parent, async (req, res) => {
  try {
    const { name, cost, icon } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json(error('INVALID_INPUT', 'Reward name is required'));
    }
    if (!cost || cost < 1) {
      return res.status(400).json(error('INVALID_INPUT', 'Cost must be at least 1'));
    }

    const reward = new Reward({
      familyId: req.familyId,
      name: name.trim(),
      cost,
      icon: icon || '',
    });
    await reward.save();

    res.status(201).json(success(reward));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to create reward'));
  }
});

router.put('/:id', auth, parent, async (req, res) => {
  try {
    const { name, cost, icon, isActive } = req.body;

    const reward = await Reward.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!reward) {
      return res.status(404).json(error('NOT_FOUND', 'Reward not found'));
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (cost !== undefined) updates.cost = cost;
    if (icon !== undefined) updates.icon = icon;
    if (isActive !== undefined) updates.isActive = isActive;

    const updated = await Reward.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    res.json(success(updated));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to update reward'));
  }
});

router.delete('/:id', auth, parent, async (req, res) => {
  try {
    const reward = await Reward.findOne({ _id: req.params.id, familyId: req.familyId });
    if (!reward) {
      return res.status(404).json(error('NOT_FOUND', 'Reward not found'));
    }

    await Reward.findByIdAndDelete(req.params.id);
    res.json(success({ deleted: true }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to delete reward'));
  }
});

module.exports = router;
```

- [ ] **Step 6: Implement redemption routes**

`server/src/routes/redemptions.js`:
```js
const router = require('express').Router();
const mongoose = require('mongoose');
const Redemption = require('../models/Redemption');
const Reward = require('../models/Reward');
const auth = require('../middleware/auth');
const parent = require('../middleware/parent');
const { addTransaction, hasEnoughStars } = require('../services/starService');
const { success, error } = require('../helpers/response');

router.post('/', auth, async (req, res) => {
  try {
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json(error('INVALID_INPUT', 'rewardId is required'));
    }

    const reward = await Reward.findOne({ _id: rewardId, familyId: req.familyId, isActive: true });
    if (!reward) {
      return res.status(404).json(error('NOT_FOUND', 'Reward not found'));
    }

    const familyObjId = new mongoose.Types.ObjectId(req.familyId);
    const enough = await hasEnoughStars(familyObjId, reward.cost);
    if (!enough) {
      return res.status(400).json(error('INSUFFICIENT_STARS', '星星不够哦，再努力一下吧！'));
    }

    const redemption = new Redemption({
      familyId: req.familyId,
      rewardId: reward._id,
      rewardName: reward.name,
      cost: reward.cost,
    });
    await redemption.save();

    await addTransaction({
      familyId: familyObjId,
      type: 'redeem',
      amount: -reward.cost,
      referenceId: redemption._id,
      description: `Redeem ${reward.name} -${reward.cost}`,
    });

    res.status(201).json(success(redemption));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to redeem reward'));
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const query = { familyId: req.familyId };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const redemptions = await Redemption.find(query).sort({ createdAt: -1 });
    res.json(success(redemptions));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch redemptions'));
  }
});

router.put('/:id/confirm', auth, parent, async (req, res) => {
  try {
    const redemption = await Redemption.findOne({
      _id: req.params.id,
      familyId: req.familyId,
      status: 'pending',
    });

    if (!redemption) {
      return res.status(404).json(error('NOT_FOUND', 'Pending redemption not found'));
    }

    const updated = await Redemption.findByIdAndUpdate(
      redemption._id,
      { $set: { status: 'confirmed', confirmedAt: new Date() } },
      { new: true }
    );

    res.json(success(updated));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to confirm redemption'));
  }
});

module.exports = router;
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `cd server && npx jest tests/rewards.test.js tests/redemptions.test.js --verbose`
Expected: All 8 tests PASS

- [ ] **Step 8: Commit**

```bash
git add server/
git commit -m "feat: add reward CRUD and redemption system with star deduction"
```

---

### Task 8: Stats API

**Files:**
- Modify: `server/src/routes/stats.js`
- Create: `server/tests/stats.test.js`

- [ ] **Step 1: Write failing tests for stats**

`server/tests/stats.test.js`:
```js
const request = require('supertest');
const app = require('../src/app');
const { createFamily, loginFamily, getParentToken, authedRequest } = require('./helpers');
require('./setup');

describe('Stats API', () => {
  let token, parentToken;

  beforeEach(async () => {
    const family = await createFamily();
    token = await loginFamily(family.familyId);
    parentToken = await getParentToken(token);
  });

  describe('GET /api/stats', () => {
    it('should return stats for family with records', async () => {
      const subjectsRes = await authedRequest('get', '/api/subjects', token);
      const subjectId = subjectsRes.body.data[0]._id;

      for (let i = 0; i < 3; i++) {
        await authedRequest('post', '/api/records', parentToken)
          .send({ subjectId, taskName: `Task ${i}`, points: 10 });
      }

      const res = await authedRequest('get', '/api/stats', token);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRecords).toBe(3);
      expect(res.body.data.totalStarsEarned).toBe(30);
      expect(res.body.data.subjectBreakdown).toBeDefined();
      expect(res.body.data.subjectBreakdown.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty stats for new family', async () => {
      const res = await authedRequest('get', '/api/stats', token);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRecords).toBe(0);
      expect(res.body.data.totalStarsEarned).toBe(0);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx jest tests/stats.test.js --verbose`
Expected: All 2 tests FAIL

- [ ] **Step 3: Implement full stats route**

Add to `server/src/routes/stats.js` (keep existing balance endpoint, add stats):

```js
const router = require('express').Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { getBalance } = require('../services/starService');
const Record = require('../models/Record');
const StarTransaction = require('../models/StarTransaction');
const { success, error } = require('../helpers/response');

router.get('/stars/balance', auth, async (req, res) => {
  try {
    const balance = await getBalance(new mongoose.Types.ObjectId(req.familyId));
    res.json(success({ balance }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch balance'));
  }
});

router.get('/stats', auth, async (req, res) => {
  try {
    const familyObjId = new mongoose.Types.ObjectId(req.familyId);

    const totalRecords = await Record.countDocuments({ familyId: req.familyId });

    const earnedResult = await StarTransaction.aggregate([
      { $match: { familyId: familyObjId, type: 'earn' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalStarsEarned = earnedResult.length > 0 ? earnedResult[0].total : 0;

    const subjectBreakdown = await Record.aggregate([
      { $match: { familyId: familyObjId } },
      {
        $group: {
          _id: '$subjectId',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $project: {
          subjectName: '$subject.name',
          subjectIcon: '$subject.icon',
          count: 1,
          totalPoints: 1,
        },
      },
    ]);

    res.json(success({
      totalRecords,
      totalStarsEarned,
      subjectBreakdown,
    }));
  } catch (err) {
    res.status(500).json(error('SERVER_ERROR', 'Failed to fetch stats'));
  }
});

module.exports = router;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx jest tests/stats.test.js --verbose`
Expected: All 2 tests PASS

- [ ] **Step 5: Run full test suite**

Run: `cd server && npx jest --verbose`
Expected: All tests PASS across all test files

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: add stats API with subject breakdown and total stars earned"
```

---

### Task 9: Achievement Seeding & Final Integration

**Files:**
- Create: `server/src/scripts/seedAchievements.js`
- Modify: `server/src/app.js` (add auto-seed on startup for dev)

- [ ] **Step 1: Create seed script**

`server/src/scripts/seedAchievements.js`:
```js
const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
const { DEFAULT_ACHIEVEMENTS } = require('../config/achievements');

const seedAchievements = async () => {
  const count = await Achievement.countDocuments();
  if (count > 0) return;

  await Achievement.insertMany(DEFAULT_ACHIEVEMENTS);
  console.log(`Seeded ${DEFAULT_ACHIEVEMENTS.length} achievements`);
};

module.exports = seedAchievements;
```

- [ ] **Step 2: Wire seed into server startup**

In `server/src/server.js`, update to:
```js
require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const seedAchievements = require('./scripts/seedAchievements');

const PORT = process.env.PORT || 3001;

connectDB().then(async () => {
  await seedAchievements();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

- [ ] **Step 3: Run full test suite to ensure nothing broke**

Run: `cd server && npx jest --verbose --coverage`
Expected: All tests PASS, coverage 80%+

- [ ] **Step 4: Commit**

```bash
git add server/
git commit -m "feat: add achievement seeding on server startup"
```

---

## Summary

| Task | What it builds | Tests |
|------|---------------|-------|
| 1 | Project scaffolding, Express app, test infra | Setup only |
| 2 | Family model, register/login/PIN auth | 6 tests |
| 3 | Subject CRUD with defaults | 5 tests |
| 4 | Learning records + star transactions + balance | 6 tests |
| 5 | Pet choose/feed/unlock/switch | 5 tests |
| 6 | Achievement detection + progress tracking | 4 tests |
| 7 | Reward CRUD + redemption flow | 8 tests |
| 8 | Stats API | 2 tests |
| 9 | Achievement seeding + integration | Full suite |

**Total: 9 tasks, ~36 tests, complete backend API**

After this plan, a separate frontend plan will cover the React/Vite client.
