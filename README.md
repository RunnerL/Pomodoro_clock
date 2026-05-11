# 🍅 Pomodoro Clock - 番茄钟工作日志

一款极简风格的 Windows 桌面效率工具，集番茄钟计时器、Markdown 待办列表和日历视图于一体。

## ✨ 功能特性

### 🍅 番茄钟
- 可自定义专注时间（默认 45 分钟）和休息时间（默认 10 分钟）
- 顶部进度条实时显示剩余时间
- 支持自动循环模式：专注 → 休息 → 专注 无限循环
- 计时结束通过系统通知提醒用户

### 📝 今日待办
- 支持 Markdown 格式编辑和实时预览
- 编辑器 / 预览模式一键切换
- 预览模式下可直接点击复选框勾选完成任务
- 自动保存，无需手动 Ctrl+S
- 每日自动创建 `工作日志_YYMMDD.md` 文件
- 支持自定义日志保存路径

### 📅 日历
- 月视图日历，可切换月份
- 点击日期切换查看对应日期的待办日志
- 日历面板支持显示/隐藏，隐藏后窗口可缩小至原 1/3 宽度

### 🌤️ 天气背景
- 五种动态天气背景可选：晴天、阴天、下雨、雷暴、大风
- 支持自动获取真实天气（通过 IP 定位 + Open-Meteo 天气 API）
- 每种天气有独特的背景动画和文字闲时动效

### 🎨 闲时文字动效
- 鼠标离开窗口 10 秒后触发
- 晴天：文字悠闲上下浮沉
- 下雨：文字像雨滴一样滑落
- 雷暴：闪电时文字吓得抖动
- 大风：文字被吹得东倒西歪

### 🔧 其他特性
- 窗口始终置顶（可开关）
- 窗口透明度可调节（仅影响背景，不影响文字）
- 最小化到系统托盘，不占用任务栏
- 跨天未完成待办自动提醒同步

## 🚀 快速开始

### 安装

1. 从 [Releases](../../releases) 页面下载最新版 `PomodoroClock Setup x.x.x.exe`
2. 双击安装，可选择安装目录
3. 安装完成后从开始菜单或桌面快捷方式启动

### 首次使用

1. 启动后自动弹出设置面板
2. 配置 Todo 日志保存路径（必填）
3. 设置专注/休息时长
4. 选择天气背景或开启自动天气获取
5. 开始你的第一个番茄钟！

### 编写待办

支持标准 Markdown 语法：

```markdown
# 今日计划

## 上午
- [x] 已完成的会议
- [ ] Code Review PR #342
- [ ] 回复邮件

## 下午
- [ ] 写周报
- [ ] 学习 Rust 第 6 章

---

用 **粗体** 和 *斜体* 突出重点
```

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + S` | 手动保存待办内容 |

## 🛠️ 开发

### 技术栈

- **前端**：React 18 + TypeScript + Zustand + Vite
- **桌面框架**：Electron 28
- **打包**：electron-builder
- **天气 API**：Open-Meteo（免费，无需 API Key）

### 本地开发

```bash
# 克隆项目
git clone <repo-url>
cd pomodoro-clock

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 项目结构

```
pomodoro-clock/
├── src/
│   ├── main/          # Electron 主进程
│   ├── preload/       # 预加载脚本（IPC 桥接）
│   └── renderer/      # React 渲染进程
│       ├── components/ # UI 组件
│       ├── store/      # Zustand 状态管理
│       ├── weather/    # 天气背景动画
│       ├── services/   # 天气 API 服务
│       └── styles/     # 样式文件
├── public/            # 图标等静态资源
└── release/           # 构建输出
```

## 📄 许可证

MIT License

## 🙏 致谢

- [Open-Meteo](https://open-meteo.com/) — 免费天气 API
- [Lucide](https://lucide.dev/) — 图标库
- [date-fns](https://date-fns.org/) — 日期处理库
- [Zustand](https://zustand-demo.pmnd.rs/) — 状态管理