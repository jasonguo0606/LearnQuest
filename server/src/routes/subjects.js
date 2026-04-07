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
      { returnDocument: 'after' }
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
