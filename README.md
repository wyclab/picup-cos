# COS 图床

一个装进 **DeepSeek Harness Web UI** 的轻量腾讯云 COS 图床插件。安装后在左侧栏增加「COS 图床」入口，在 Harness 里完成上传、浏览、复制链接和删除。

> 适用于当前 Harness 0.2.x。Host 侧签名 COS 请求，SecretKey 不进入浏览器。

## 功能

- 拖拽 / 多选上传，**不限图片格式**，单张最大 50 MB
- 按 `路径前缀/年/月/文件名-随机后缀.扩展名` 存入 COS
- 上传后返回并支持复制**自定义域名链接**
- 网格浏览、搜索、大图预览、单个 / 批量删除
- 公开读桶直接加载自定义域名图片；私有读桶自动走本机代理预览
- 零第三方依赖，COS 请求由本机 Host 完成，**不需要配置 Bucket CORS**

## 下载

- [picup-cos-1.0.0.tgz](dist/picup-cos-1.0.0.tgz) — 可直接安装的插件包
- [picup-cos-1.0.0.zip](dist/picup-cos-1.0.0.zip) — 含安装包、安装说明和校验值
- [INSTALL.md](INSTALL.md) — 更详细的安装说明

SHA256 校验值见 [dist/SHA256SUMS.txt](dist/SHA256SUMS.txt)。

## 安装

### 方式 A：Harness 插件页

1. 打开 Harness，进入左侧的 **Plugins / 插件** 页面。
2. 在安装入口选择本地包，或粘贴 `picup-cos-1.0.0.tgz` 的绝对路径。
3. 安装完成后刷新页面。左侧栏会出现云朵上传图标「COS 图床」。
4. 如果页面没有出现新入口，重启一次 Harness。

### 方式 B：让 Harness 里的 Agent 安装

把 `.tgz` 放到本机，然后对 Agent 说：

> 用 plugin_manager 安装 `/绝对路径/picup-cos-1.0.0.tgz`

Agent 会调用 `install_bundle`。安装会执行插件代码，需要你在 Harness 中批准。

## 首次配置

点击左侧「COS 图床」图标，填写：

| 字段 | 说明 |
| --- | --- |
| SecretId / SecretKey | 腾讯云访问密钥 |
| Bucket | 例如 `example-1250000000` |
| Region | 例如 `ap-guangzhou` |
| 自定义域名 | 例如 `https://img.example.com`；留空则使用 COS 默认域名 |
| 路径前缀 | 默认 `images` |
| 公开读取 | 桶是公有读时开启；私有读时关闭，预览走本机代理 |

点「保存并测试」，通过后即可拖拽上传。

## 使用

- 拖拽或点击上传区选择图片，支持多选；上传进度会显示在下方。
- 鼠标悬停卡片可复制链接、删除；点击卡片查看大图。
- 搜索框按文件名或对象路径过滤。
- 勾选卡片后可批量删除，删除不可恢复。

## 说明

- 配置保存在用户目录的 `.picup/config.json`，权限 `0600`，不会写进项目或插件包。
- 上传、列表、删除都由本机 Host 调用 COS，**不需要配置 Bucket CORS**。
- 单文件上限 50 MB，不限制图片格式。
- 私有读桶复制出的仍是自定义域名链接；直接对外打开需要该域名本身可访问。
- 建议使用只授权目标 Bucket 的子账号密钥，而不是主账号永久密钥。
- `/api/picup` 只接受来自本机回环地址的请求，并校验同源写请求。
- COS 签名按[官方 XML API 签名算法](https://cloud.tencent.com/document/product/436/7778)实现。

## 开发

```bash
node --check index.js
node --check client.js
node test/smoke.mjs
pnpm pack --pack-destination dist
```

`test/smoke.mjs` 会启动一个模拟 COS 服务，验证上传、列表、预览、删除和请求签名，不需要真实腾讯云密钥。

## 目录

```text
index.js            Host 侧：COS 签名、上传/列表/删除/预览、配置存储
client.js           Web UI：侧栏入口 + 图床页面
cordis.patch.yml    Harness bundle 入口
locale/             插件显示名与描述
icon.svg            插件图标
test/smoke.mjs      本地冒烟测试
dist/               可分发安装包
```
