# LearnQuest 部署文档

## 环境要求

### 系统环境
- **Node.js**: v25.9.0 或更高版本
- **npm**: v10.9.2 或更高版本
- **MongoDB**: 8.0.20 或更高版本

### 操作系统
- macOS / Linux / Windows 均可

---

## 后端依赖 (server/)

### 核心依赖
```json
{
  "express": "^4.21.2",
  "mongoose": "^8.13.2",
  "dotenvx": "^1.38.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^3.0.2",
  "cors": "^2.8.5",
  "express-rate-limit": "^7.5.0"
}
```

### 开发依赖
```json
{
  "vitest": "^3.1.2",
  "@types/express": "^5.0.1",
  "@types/node": "^22.14.1",
  "supertest": "^7.1.0"
}
```

---

## 前端依赖 (client/)

### 核心依赖
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.3",
  "@tanstack/react-query": "^5.71.1",
  "axios": "^1.8.4",
  "tailwindcss": "^3.4.19"
}
```

### 开发依赖
```json
{
  "vite": "^6.4.2",
  "@vitejs/plugin-react": "^4.4.1",
  "vitest": "^3.1.2",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
  "jsdom": "^26.1.0"
}
```

---

## 部署步骤

### 1. 安装 MongoDB

**macOS (Homebrew)**:
```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb/brew/mongodb-community@8.0
```

**Ubuntu/Debian**:
```bash
# 参考: https://www.mongodb.com/docs/manual/installation/
```

**Windows**:
```bash
# 下载安装包: https://www.mongodb.com/try/download/community
```

### 2. 克隆项目

```bash
git clone https://github.com/jasonguo0606/LearnQuest.git
cd LearnQuest
```

### 3. 配置后端环境

```bash
cd server
npm install

# 创建 .env 文件
cp .env.example .env

# 编辑 .env，至少配置以下项：
# MONGODB_URI=mongodb://localhost:27017/learnquest
# JWT_SECRET=your-secret-key-change-in-production
# PORT=3001
# ALLOWED_ORIGIN=http://localhost:5173
```

### 4. 配置前端环境

```bash
cd ../client
npm install
```

### 5. 启动服务

**开发环境**:
```bash
# 终端1 - 后端
cd server
npm start

# 终端2 - 前端
cd client
npm run dev
```

**生产环境**:
```bash
# 构建
cd client
npm run build

# 后端启动
cd ../server
npm start

# 使用静态服务器托管前端 (可选 npx serve)
npx serve client/dist -p 5173
```

---

## 测试

### 后端测试
```bash
cd server
npm test
```

### 前端测试
```bash
cd client
npm test
```

---

## 访问地址

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3001/api

---

## 故障排查

### 前端空白页
检查浏览器控制台是否有错误，常见问题：
1. `process is not defined` - vite.config.js 已配置 polyfill
2. 后端未启动 - API 请求会失败
3. MongoDB 未启动 - 后端无法连接数据库

### 后端连接失败
```bash
# 检查 MongoDB 是否运行
brew services list | grep mongodb

# 或
pgrep -x mongod
```

### 端口被占用
```bash
# 查看 5173 端口
lsof -i :5173

# 查看 3001 端口  
lsof -i :3001
```

---

## 生产部署建议

### 使用 MongoDB Atlas
1. 创建 MongoDB Atlas 免费集群
2. 获取连接字符串
3. 更新 server/.env 中的 MONGODB_URI

### 前端托管
- Vercel: `npx vercel`
- Netlify: 连接 GitHub 仓库
- 静态服务器: 使用 nginx 托管 client/dist

### 后端托管
- Railway: 连接 GitHub 仓库
- Fly.io: `fly launch`
- 自己的服务器: 使用 PM2 管理进程
