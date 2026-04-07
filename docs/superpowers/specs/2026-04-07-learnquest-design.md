# LearnQuest - 儿童学习激励平台设计文档

## 概述

LearnQuest 是一个面向 8-10 岁儿童的学习激励网页应用。家长手动记录孩子的多科目学习成绩，孩子通过完成学习任务获得星星（积分），用于养育虚拟宠物和兑换实际奖励。

**核心目标**：通过游戏化机制（宠物养成 + 成就系统 + 奖励商城）激励孩子保持学习动力。

## 技术架构

### 技术栈

| 层 | 技术 |
|---|------|
| 前端 | React + Vite |
| 后端 | Express.js (REST API) |
| 数据库 | MongoDB (Atlas 免费层) |
| 测试 | Jest + Supertest (后端), Vitest + React Testing Library (前端), Playwright (E2E) |

### 部署方案

- 前端：Vercel 或 Netlify
- 后端：Railway 或 Render
- 数据库：MongoDB Atlas（免费层，512MB 存储）

## 用户角色

### 孩子模式（默认界面）

- 查看今日任务完成情况
- 照顾宠物（喂食、互动）
- 查看星星余额和兑换奖励
- 查看成就墙
- 浏览宠物商店

### 家长模式（PIN 码保护）

通过右上角设置图标 + 4 位 PIN 码切换进入。

- 记录学习成绩（选科目 → 选任务类型 → 确认 → 自动发放星星）
- 管理科目和任务模板
- 设置奖励商城（定义奖励名称、所需星星数）
- 确认兑换券
- 查看学习统计面板

### 认证方式

不使用传统登录系统。采用家庭 ID + PIN 的简单方案：
- 注册时生成唯一家庭 ID
- 家长设置 4 位 PIN 码
- 孩子无需输入任何凭据即可使用默认界面
- 家长操作通过 PIN 验证

## 功能模块

### 1. 科目与成绩记录

**科目管理**：
- 预设常见科目：数学、语文、英语
- 家长可自定义添加/删除科目
- 每个科目有名称和图标

**任务模板**：
- 每个科目下可定义多个任务模板
- 模板包含：任务名称、对应积分
- 示例：
  - 数学：课本习题全对 (10星), 考试90分以上 (20星)
  - 语文：听写满分 (10星), 背诵课文 (5星)
  - 英语：单词背诵完成 (5星), 阅读理解全对 (8星)

**记录流程**：
1. 家长进入家长模式
2. 选择科目
3. 选择任务模板（或手动输入）
4. 确认提交
5. 系统自动发放对应星星

每条记录带时间戳，支持按日期查看历史。

### 2. 积分系统（星星）

**获取方式**：
- 家长记录学习成绩时自动发放
- 连续打卡奖励（连续 7 天有记录 → 额外 bonus）

**消耗方式**：
- 喂养宠物（宠物需定期喂食星星以成长）
- 兑换实际奖励
- 解锁新宠物

**余额计算**：
- 使用 StarTransaction 流水表记录所有星星变动
- 当前余额 = SUM(StarTransaction.amount WHERE familyId = ?)
- 每次星星变动（获得/消耗）都写入流水记录，保证可审计和数据一致性

### 3. 宠物系统

**初始选择**：
- 注册完成后进入宠物选择界面
- 展示 3 只初始宠物（如：小猫、小狗、小兔）
- 每只有名字、简介和简单 CSS/SVG 动画
- 孩子选择一只作为主宠物并取名

**宠物属性**：
- 等级：1-20 级
- 经验值：喂食获得，满足升级条件后升级
- 心情：开心 / 普通 / 饿了
- 外观：随等级变化（如等级 5 戴帽子，等级 10 长翅膀）

**成长机制**：
- 用星星喂食宠物 → 获得经验值 → 达到阈值升级
- 升级带来外观变化
- 连续 3 天未喂食 → 心情变为"饿了"（显示难过表情，不会死亡）

**宠物解锁**：
- 初始未选的 2 只宠物：出现在商店中，价格较低
- 额外宠物：商店中展示，标注解锁所需星星数
- 隐藏宠物：不显示在商店中，通过特殊成就解锁后惊喜出现

**宠物切换**：
- 拥有多只宠物后可切换"当前陪伴宠物"
- 主界面始终显示当前活跃宠物

**视觉风格**：
- 初期使用 CSS/SVG 简单卡通风格
- 宠物图片通过配置文件管理，后续可替换为 AI 生成图片

### 4. 成就系统

**成就分类**：

| 类别 | 示例 | 条件 |
|------|------|------|
| 学习类 | 数学小达人 | 数学全对累计 10 次 |
| 学习类 | 全科之星 | 一周内每科都有记录 |
| 坚持类 | 连续 7 天 | 连续 7 天有学习记录 |
| 坚持类 | 连续 30 天 | 连续 30 天有学习记录 |
| 坚持类 | 连续 100 天 | 连续 100 天有学习记录 |
| 宠物类 | 宠物达到 10 级 | 任一宠物达到 10 级 |
| 宠物类 | 宠物收藏家 | 拥有 3 只宠物 |

**成就表现**：
- 成就墙以徽章网格展示
- 已达成：高亮显示，带达成日期
- 未达成：灰色显示，带进度信息（如 23/30）
- 隐藏成就：显示问号图标
- 达成时触发庆祝动画

**成就触发**：
- 每次添加学习记录后，后端自动检查所有未达成的成就条件
- 新达成的成就通过 API 响应返回，前端弹出庆祝效果
- 部分成就解锁隐藏宠物

### 5. 奖励商城

**家长配置**：
- 家长自定义奖励列表
- 每项设置：名称、所需星星数、可选图标/图片
- 可启用/禁用单项奖励

**商城展示**：
- 分"宠物"和"奖励"两个标签页
- 宠物标签：展示可购买的宠物，标注价格和解锁状态
- 奖励标签：展示实际奖励列表，标注价格
- 星星不足的项目置灰显示

**兑换流程**：
1. 孩子在商城中选择奖励
2. 确认消耗星星
3. 生成"兑换券"（状态：待确认）
4. 家长在后台查看兑换券列表
5. 家长确认兑换券已使用（状态：已确认）

## 页面结构

### 孩子端（底部 Tab 导航，移动端优先）

| Tab | 页面 | 核心内容 |
|-----|------|----------|
| 首页 | 宠物主界面 | 当前宠物展示（居中）、星星余额、今日完成情况、喂食按钮 |
| 成就 | 成就墙 | 徽章网格、已达成/未达成/隐藏 |
| 商城 | 奖励商城 | 宠物标签 + 奖励标签，兑换功能 |
| 记录 | 学习记录 | 日历热力图、每日明细 |

### 家长端（PIN 码切换后的额外功能）

- 记录成绩页：选科目 → 选任务 → 确认
- 奖励管理页：CRUD 奖励项目
- 兑换确认页：待确认兑换券列表
- 统计面板：各科目趋势图、累计数据

### 导航

- 底部 4 个 Tab 切换主要页面
- 右上角设置图标 → 输入 PIN → 进入家长模式
- 家长模式下顶部显示标识，可随时退出回到孩子模式

## 数据模型

### Family（家庭）

```
{
  _id: ObjectId,
  familyId: String (唯一，用于登录),
  name: String,
  pin: String (哈希存储),
  createdAt: Date,
  initialPetChosen: Boolean
}
```

### Subject（科目）

```
{
  _id: ObjectId,
  familyId: ObjectId,
  name: String,
  icon: String,
  taskTemplates: [{
    _id: ObjectId,
    name: String,
    points: Number
  }],
  isDefault: Boolean,
  createdAt: Date
}
```

### Pet（宠物）

```
{
  _id: ObjectId,
  familyId: ObjectId,
  type: String (cat/dog/rabbit/...),
  name: String (孩子取的名字),
  level: Number (1-20),
  exp: Number,
  mood: String (happy/normal/hungry),
  lastFedAt: Date,
  isActive: Boolean,
  unlockedAt: Date
}
```

### Record（学习记录）

```
{
  _id: ObjectId,
  familyId: ObjectId,
  subjectId: ObjectId,
  taskName: String,
  points: Number,
  date: Date,
  note: String (可选备注),
  createdAt: Date
}
```

### Achievement（成就定义 - 系统级）

```
{
  _id: ObjectId,
  type: String (learning/persistence/pet),
  title: String,
  description: String,
  icon: String,
  condition: {
    type: String (count/streak/pet_level/pet_count/all_subjects),
    subjectFilter: String (可选，特定科目ID或"any"),
    target: Number (目标值，如10次、30天、10级)
  },
  isHidden: Boolean,
  unlocksPetType: String (可选，解锁的宠物类型)
}
```

### FamilyAchievement（家庭成就状态）

```
{
  _id: ObjectId,
  familyId: ObjectId,
  achievementId: ObjectId,
  isUnlocked: Boolean,
  progress: Number,
  unlockedAt: Date
}
```

### Reward（奖励 - 家长配置）

```
{
  _id: ObjectId,
  familyId: ObjectId,
  name: String,
  icon: String,
  cost: Number (所需星星),
  isActive: Boolean,
  createdAt: Date
}
```

### Redemption（兑换记录）

```
{
  _id: ObjectId,
  familyId: ObjectId,
  rewardId: ObjectId,
  rewardName: String (冗余存储，防止奖励删除后丢失),
  cost: Number,
  status: String (pending/confirmed),
  createdAt: Date,
  confirmedAt: Date
}
```

### StarTransaction（星星流水）

```
{
  _id: ObjectId,
  familyId: ObjectId,
  type: String (earn/feed/redeem/unlock),
  amount: Number (正数为获得，负数为消耗),
  referenceId: ObjectId (关联的记录/宠物/兑换ID),
  description: String,
  createdAt: Date
}
```

**积分余额** = SUM(StarTransaction.amount WHERE familyId = ?)

使用流水表替代实时计算，既保证数据一致性，又能高效查询余额。

## API 设计

### 统一响应格式

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

错误时：
```json
{
  "success": false,
  "data": null,
  "error": { "code": "INSUFFICIENT_STARS", "message": "星星不够哦，再努力一下吧！" }
}
```

### 端点列表

**认证**：
- `POST /api/family/register` — 创建家庭（name, pin）→ 返回 familyId
- `POST /api/family/login` — 家庭 ID 登录 → 返回 JWT token
- `POST /api/family/verify-pin` — 验证家长 PIN → 返回家长权限 token

**科目**：
- `GET /api/subjects` — 获取科目列表
- `POST /api/subjects` — 添加科目（家长）
- `PUT /api/subjects/:id` — 编辑科目（家长）
- `DELETE /api/subjects/:id` — 删除科目（家长）

**学习记录**：
- `POST /api/records` — 添加学习记录（家长）→ 自动发放星星 + 检查成就
- `GET /api/records?startDate=&endDate=` — 查询记录（按日期范围）
- `GET /api/records/calendar?month=` — 获取月度日历数据（热力图用）

**宠物**：
- `GET /api/pets` — 获取所有宠物（含解锁状态）
- `POST /api/pets/choose` — 初始选择宠物（type, name）
- `POST /api/pets/:id/feed` — 喂食宠物（消耗星星，增加经验）
- `POST /api/pets/unlock` — 解锁新宠物（消耗星星或成就解锁）
- `PUT /api/pets/:id/active` — 切换当前活跃宠物

**成就**：
- `GET /api/achievements` — 获取成就列表（含进度）

**奖励商城**：
- `GET /api/rewards` — 获取奖励列表
- `POST /api/rewards` — 添加奖励（家长）
- `PUT /api/rewards/:id` — 编辑奖励（家长）
- `DELETE /api/rewards/:id` — 删除奖励（家长）

**兑换**：
- `POST /api/redemptions` — 兑换奖励（孩子）
- `GET /api/redemptions?status=pending` — 获取待确认兑换（家长）
- `PUT /api/redemptions/:id/confirm` — 确认兑换（家长）

**统计**：
- `GET /api/stats` — 学习统计数据（各科目趋势、累计星星等）
- `GET /api/stars/balance` — 当前星星余额

### 中间件

- `authMiddleware` — 验证 JWT token（所有 API）
- `parentMiddleware` — 验证家长权限（家长操作的 API）

### 成就自动检测

每次 `POST /api/records` 后，后端执行成就检测：
1. 查询所有未解锁的成就
2. 逐条检查条件是否满足
3. 新达成的成就更新状态
4. 响应中包含 `newAchievements` 数组，前端据此弹出庆祝动画

## 测试策略

### 单元测试（Jest / Vitest）

- 积分计算逻辑
- 成就条件检测
- 宠物经验值和升级公式
- 心情状态更新逻辑

### 集成测试（Jest + Supertest）

- API 端点完整流程：记录添加 → 星星发放 → 成就检测
- 兑换流程：兑换请求 → 余额扣减 → 兑换券生成 → 确认
- 宠物操作：选择 → 喂食 → 升级 → 切换

### E2E 测试（Playwright）

- 家长记录成绩 → 孩子看到星星增加
- 孩子喂宠物 → 宠物经验增加 → 升级
- 孩子兑换奖励 → 家长确认

### 覆盖率目标

80%+ 代码覆盖率

## 项目结构

```
LearnQuest/
├── client/                  # React 前端
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── Home/        # 首页（宠物主界面）
│   │   │   ├── Achievements/# 成就墙
│   │   │   ├── Shop/        # 奖励商城
│   │   │   ├── Records/     # 学习记录
│   │   │   └── Parent/      # 家长模式页面
│   │   ├── hooks/           # 自定义 hooks
│   │   ├── services/        # API 调用
│   │   ├── context/         # React Context (认证、宠物状态)
│   │   └── assets/          # 宠物 SVG、图标等
│   └── tests/
├── server/                  # Express 后端
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   ├── controllers/     # 请求处理
│   │   ├── models/          # Mongoose 模型
│   │   ├── middleware/      # 认证中间件
│   │   ├── services/        # 业务逻辑（成就检测等）
│   │   └── config/          # 配置（宠物定义、成就定义等）
│   └── tests/
├── docs/
│   └── superpowers/specs/
└── package.json
```
