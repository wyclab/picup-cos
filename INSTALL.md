# COS 图床插件 · 安装说明

这是一个 DeepSeek Harness 的 Web UI 插件包，面向当前 Harness 0.2.x。安装后会在左侧栏增加「COS 图床」入口。

如果你拿到的是 `.tgz` 文件本身，直接安装该文件即可；下面按「zip 中包含 tgz」的下载方式说明。

## 包内文件

- `picup-cos-1.0.0.tgz`：可安装的插件包
- `INSTALL.md`：本说明
- `SHA256SUMS.txt`：安装包校验值

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

- **SecretId / SecretKey**：腾讯云访问密钥
- **Bucket**：例如 `example-1250000000`
- **Region**：例如 `ap-guangzhou`
- **自定义域名**：例如 `https://img.example.com`
- **路径前缀**：默认 `images`
- **公开读取**：桶是公有读时开启；私有读时关闭，预览走本机代理

点「保存并测试」，通过后即可拖拽上传。

## 说明

- 配置保存在用户目录的 `.picup/config.json`，权限 `0600`，不会写进项目或插件包。
- 上传、列表、删除都由本机 Host 调用 COS，**不需要配置 Bucket CORS**。
- 单文件上限 50 MB，不限制图片格式。
- 私有读桶复制出的仍是自定义域名链接；直接对外打开需要该域名本身可访问。
- 建议使用只授权目标 Bucket 的子账号密钥，而不是主账号永久密钥。
- COS 签名按[官方 XML API 签名算法](https://cloud.tencent.com/document/product/436/7778)实现。
