# Quiz 后台管理

基于 Vue 2 + Element UI + Express + MySQL 的 Quiz 管理后台，包含 **用户管理** 和 **题目管理** 两个页面。

## 功能

- 用户管理：按用户名查询、添加、编辑、删除、分页
- 题目管理：按题目关键词查询、添加、编辑、删除、分页
- 顶部导航与左侧菜单联动，菜单高亮当前页面
- 前后端分离，开发环境通过 Vue CLI 代理访问后端

## 目录结构

```
src/
├── api/                 # axios 实例和接口封装
├── layout/
│   └── AdminLayout.vue  # 顶部标题 + 左侧菜单 + 内容区
├── router/
│   └── index.js         # /user、/quiz 路由
└── views/
    ├── UserView.vue     # 用户管理
    └── QuizView.vue     # 题目管理
server.js                # Express + MySQL 后端
```

## 运行项目

### 1. 安装依赖

```bash
npm install
```

### 2. 确认 MySQL 已启动

默认连接配置在 `server.js` 中：

```js
host: 'localhost'
user: 'root'
password: 'Lei040925%'
database: 'quiz_db'
```

如果本机配置不同，可以用环境变量覆盖，不需要改代码：

```powershell
$env:DB_PASSWORD="你的数据库密码"
npm run server
```

也支持 `DB_HOST`、`DB_PORT`、`DB_USER`、`DB_NAME`、`PORT`。

首次启动时会自动创建 `quizzes`、`users` 表，并在空表中写入演示数据。

### 3. 启动后端（终端一）

```bash
npm run server
```

看到 `后端服务已启动: http://localhost:3000` 即成功。

### 4. 启动前端（终端二）

```bash
npm run serve
```

打开终端提示的地址（默认 http://localhost:8080），访问：

- 用户管理：http://localhost:8080/#/user
- 题目管理：http://localhost:8080/#/quiz

## 接口

| 方法 | 地址 | 说明 |
| --- | --- | --- |
| GET | `/api/users?keyword=` | 用户列表 |
| POST | `/api/users` | 添加用户 |
| PUT | `/api/users/:id` | 修改用户 |
| DELETE | `/api/users/:id` | 删除用户 |
| GET | `/api/quizzes` | 题目列表 |
| POST | `/api/quizzes` | 添加题目 |
| PUT | `/api/quizzes/:id` | 修改题目 |
| DELETE | `/api/quizzes/:id` | 删除题目 |

用户与题目字段：

- 用户：`username`、`password`、`created_at`
- 题目：`question`、`options`、`answer`

> 说明：这是课程练习项目，用户密码按原页面以明文存储。真实项目应使用 bcrypt 等方式加密，并增加登录鉴权。
