window.__ModuleLoader__.load({
  id: '@local/picup-cos',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } = React

    const ROUTE = '/api/picup'
    const MAX_UPLOAD = 50 * 1024 * 1024

    const ZH = {
      panelTitle: 'COS 图床',
      panelSubtitle: '上传、浏览和管理腾讯云 COS 图片',
      upload: '上传图片',
      refresh: '刷新',
      settings: '设置',
      close: '关闭',
      cancel: '取消',
      delete: '删除',
      retry: '重试',
      loading: '加载中…',
      statusUnconfigured: '未配置',
      statusConfigured: '已配置',
      statusConnected: '已连接',
      statusError: '连接失败',
      dropTitle: '拖拽图片到这里，或点击选择',
      dropHint: '支持任意图片格式 · 单张最大 50 MB · 上传后返回自定义域名链接',
      uploading: '正在上传',
      uploadDone: '上传完成',
      uploadFailed: '上传失败',
      needConfig: '请先配置腾讯云 COS',
      configTitle: '腾讯云 COS 设置',
      configIntro: '填写存储桶信息后即可上传。密钥只保存在本机，不会发送到第三方服务。',
      configIncomplete: '请填写 SecretId、SecretKey、Bucket 和 Region',
      secretId: 'SecretId',
      secretKey: 'SecretKey',
      secretSaved: '已保存，留空则不修改',
      bucket: '存储桶 Bucket',
      bucketHint: '例如 example-1250000000',
      region: '地域 Region',
      regionHint: '例如 ap-guangzhou',
      domain: '自定义域名',
      domainHint: '例如 https://img.example.com（留空则使用 COS 默认域名）',
      prefix: '路径前缀',
      prefixHint: '例如 images（留空则放在根目录）',
      publicRead: '公开读取',
      publicReadHint: '关闭后图片通过本机代理预览，复制出的链接仍为自定义域名',
      saveTest: '保存并测试',
      testing: '测试中…',
      saved: '配置已保存，连接正常',
      configNote: '配置文件',
      search: '搜索图片…',
      countSuffix: '张图片',
      selected: '已选',
      deleteSelected: '删除所选',
      deleteTitle: '删除图片',
      deleteConfirm: '确定删除吗？此操作不可恢复。',
      deleting: '删除中…',
      deleted: '已删除',
      deleteFailed: '删除失败',
      copyLink: '复制链接',
      copied: '链接已复制',
      copyFailed: '复制失败',
      openOriginal: '打开原图',
      emptyTitle: '还没有图片',
      emptyHint: '上传第一张图片，开始使用你的图床。',
      noResults: '没有匹配的图片',
      loadMore: '加载更多',
      listFailed: '读取图片列表失败',
      networkError: '网络请求失败',
      setupCta: '配置腾讯云 COS',
      sizeLimit: '文件超过 50 MB',
      imageBroken: '图片无法预览',
      objectPath: '对象路径',
      uploadTime: '上传时间',
      fileSize: '大小',
      select: '选择',
      deselect: '取消选择',
      uploadProgress: '上传进度',
      emptyDrop: '拖拽图片到上方区域开始上传',
    }

    const EN = {
      panelTitle: 'COS Image Host',
      panelSubtitle: 'Upload, browse, and manage images in Tencent COS',
      upload: 'Upload',
      refresh: 'Refresh',
      settings: 'Settings',
      close: 'Close',
      cancel: 'Cancel',
      delete: 'Delete',
      retry: 'Retry',
      loading: 'Loading…',
      statusUnconfigured: 'Not configured',
      statusConfigured: 'Configured',
      statusConnected: 'Connected',
      statusError: 'Connection failed',
      dropTitle: 'Drop images here, or click to choose',
      dropHint: 'Any image format · up to 50 MB each · returns your custom-domain link',
      uploading: 'Uploading',
      uploadDone: 'Uploaded',
      uploadFailed: 'Upload failed',
      needConfig: 'Configure Tencent COS first',
      configTitle: 'Tencent COS settings',
      configIntro: 'Fill in the bucket details to start uploading. Credentials stay on this machine.',
      configIncomplete: 'SecretId, SecretKey, Bucket, and Region are required',
      secretId: 'SecretId',
      secretKey: 'SecretKey',
      secretSaved: 'Saved; leave blank to keep it',
      bucket: 'Bucket',
      bucketHint: 'For example, example-1250000000',
      region: 'Region',
      regionHint: 'For example, ap-guangzhou',
      domain: 'Custom domain',
      domainHint: 'For example, https://img.example.com (blank uses the COS endpoint)',
      prefix: 'Path prefix',
      prefixHint: 'For example, images (blank stores at the root)',
      publicRead: 'Public read',
      publicReadHint: 'When off, previews go through this local host; copied links still use the custom domain',
      saveTest: 'Save and test',
      testing: 'Testing…',
      saved: 'Saved; connection is healthy',
      configNote: 'Config file',
      search: 'Search images…',
      countSuffix: 'images',
      selected: 'Selected',
      deleteSelected: 'Delete selected',
      deleteTitle: 'Delete image',
      deleteConfirm: 'Delete this? This cannot be undone.',
      deleting: 'Deleting…',
      deleted: 'Deleted',
      deleteFailed: 'Delete failed',
      copyLink: 'Copy link',
      copied: 'Link copied',
      copyFailed: 'Copy failed',
      openOriginal: 'Open original',
      emptyTitle: 'No images yet',
      emptyHint: 'Upload your first image to start using your image host.',
      noResults: 'No matching images',
      loadMore: 'Load more',
      listFailed: 'Could not load the image list',
      networkError: 'Network request failed',
      setupCta: 'Configure Tencent COS',
      sizeLimit: 'File is larger than 50 MB',
      imageBroken: 'Preview unavailable',
      objectPath: 'Object path',
      uploadTime: 'Uploaded',
      fileSize: 'Size',
      select: 'Select',
      deselect: 'Deselect',
      uploadProgress: 'Upload progress',
      emptyDrop: 'Drop images above to start uploading',
    }

    const CSS = `
.picup-page,.picup-page *,.picup-modal,.picup-modal *,.picup-toast{box-sizing:border-box}
.picup-page{height:100%;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit}
.picup-inner{width:100%;max-width:1180px;margin:0 auto;padding:28px 32px 64px}
.picup-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:22px}
.picup-title-wrap{display:flex;align-items:center;gap:12px;min-width:0}
.picup-logo{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;flex:0 0 auto;color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent);border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,transparent)}
.picup-title-row{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.picup-title-row h1{margin:0;font-size:21px;line-height:1.2;font-weight:650;letter-spacing:-.01em}
.picup-subtitle{margin-top:4px;font-size:12.5px;line-height:1.4;color:var(--dsw-alias-label-secondary)}
.picup-head-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.picup-status{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-1);font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.picup-dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);flex:0 0 auto}
.picup-status.ok .picup-dot{background:var(--dsw-alias-state-success-primary)}
.picup-status.err .picup-dot{background:var(--dsw-alias-state-error-primary)}
.picup-status.warn .picup-dot{background:var(--dsw-alias-state-warn-primary)}
.picup-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1;cursor:pointer;white-space:nowrap;transition:background .15s,border-color .15s,opacity .15s}
.picup-btn:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.picup-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.picup-btn:disabled{opacity:.45;cursor:default}
.picup-btn.primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base)}
.picup-btn.primary:hover:not(:disabled){background:var(--dsw-alias-brand-primary);opacity:.9}
.picup-btn.danger{color:var(--dsw-alias-state-error-primary)}
.picup-btn.danger:hover:not(:disabled){border-color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 8%,var(--dsw-alias-bg-layer-1))}
.picup-iconbtn{width:30px;height:30px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);display:grid;place-items:center;cursor:pointer}
.picup-iconbtn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.picup-banner{display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:16px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 35%,var(--dsw-alias-border-l1));border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 7%,var(--dsw-alias-bg-layer-1));font-size:12.5px}
.picup-banner-icon{color:var(--dsw-alias-state-error-primary);flex:0 0 auto}
.picup-banner-text{flex:1;min-width:160px;display:flex;flex-direction:column;gap:2px}
.picup-banner-text strong{font-weight:600}
.picup-banner-text span{color:var(--dsw-alias-label-secondary);word-break:break-word}
.picup-settings{border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);padding:18px 20px;margin-bottom:18px}
.picup-settings-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.picup-settings-title{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600}
.picup-settings-intro{margin-top:5px;font-size:12.5px;line-height:1.5;color:var(--dsw-alias-label-secondary)}
.picup-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}
.picup-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.picup-field.full{grid-column:1/-1}
.picup-field-label{font-size:12px;font-weight:550;color:var(--dsw-alias-label-secondary)}
.picup-field input{width:100%;height:34px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;outline:none;transition:border-color .15s,box-shadow .15s}
.picup-field input::placeholder{color:color-mix(in srgb,var(--dsw-alias-label-secondary) 68%,transparent)}
.picup-field input:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent)}
.picup-field-hint{display:block;font-size:11.5px;line-height:1.35;color:var(--dsw-alias-label-secondary)}
.picup-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0 0}
.picup-switch-copy{display:flex;flex-direction:column;gap:3px;min-width:0}
.picup-switch-copy strong{font-size:12.5px;font-weight:550}
.picup-switch{width:36px;height:20px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);padding:2px;cursor:pointer;flex:0 0 auto;transition:background .15s,border-color .15s}
.picup-switch span{display:block;width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-secondary);transition:transform .15s,background .15s}
.picup-switch.on{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.picup-switch.on span{background:var(--dsw-alias-bg-base);transform:translateX(16px)}
.picup-form-actions{grid-column:1/-1;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}
.picup-config-note{font-size:11.5px;color:var(--dsw-alias-label-secondary);word-break:break-all;margin-top:10px}
.picup-config-note code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.picup-drop{position:relative;display:flex;align-items:center;gap:14px;padding:17px 20px;border:1.5px dashed var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-layer-1);cursor:pointer;transition:border-color .15s,background .15s}
.picup-drop:hover,.picup-drop.drag{border-color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 6%,var(--dsw-alias-bg-layer-1))}
.picup-drop-icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;flex:0 0 auto;color:var(--dsw-alias-brand-primary);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 11%,transparent)}
.picup-drop-text{flex:1;min-width:0}
.picup-drop-title{font-size:13.5px;font-weight:600}
.picup-drop-hint{margin-top:4px;font-size:12px;line-height:1.4;color:var(--dsw-alias-label-secondary)}
.picup-drop-cta{flex:0 0 auto}
.picup-uploads{display:flex;flex-direction:column;gap:7px;margin-top:11px}
.picup-upload{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);font-size:12px}
.picup-upload-name{flex:0 1 220px;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.picup-upload-track{flex:1;height:4px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;min-width:50px}
.picup-upload-track i{display:block;height:100%;background:var(--dsw-alias-brand-primary);transition:width .2s}
.picup-upload-state{flex:0 0 auto;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:4px}
.picup-upload.done .picup-upload-state{color:var(--dsw-alias-state-success-primary)}
.picup-upload.error .picup-upload-state{color:var(--dsw-alias-state-error-primary)}
.picup-upload.error .picup-upload-track i{background:var(--dsw-alias-state-error-primary)}
.picup-toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:22px 0 13px}
.picup-search{position:relative;flex:0 1 290px;min-width:170px}
.picup-search svg{position:absolute;left:10px;top:9px;color:var(--dsw-alias-label-secondary);pointer-events:none}
.picup-search input{width:100%;height:33px;padding:0 10px 0 32px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;outline:none}
.picup-search input:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent)}
.picup-count,.picup-selected{font-size:12px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.picup-selected{color:var(--dsw-alias-label-primary);font-weight:550}
.picup-spacer{flex:1}
.picup-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(172px,1fr));gap:14px}
.picup-card{position:relative;min-width:0;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;overflow:hidden;background:var(--dsw-alias-bg-layer-1);cursor:zoom-in;transition:border-color .15s,transform .15s}
.picup-card:hover{border-color:var(--dsw-alias-border-l2);transform:translateY(-1px)}
.picup-card:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.picup-card.selected{border-color:var(--dsw-alias-brand-primary)}
.picup-thumb{position:relative;aspect-ratio:1.28;display:grid;place-items:center;overflow:hidden;background:var(--dsw-alias-bg-layer-2)}
.picup-thumb img{width:100%;height:100%;object-fit:cover;display:block}
.picup-broken{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:11px;padding:10px;text-align:center}
.picup-card-body{padding:9px 11px 10px}
.picup-name{font-size:12.5px;font-weight:550;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.picup-meta{display:flex;justify-content:space-between;gap:8px;margin-top:4px;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.picup-check{position:absolute;top:8px;left:8px;width:20px;height:20px;padding:0;border-radius:6px;border:1.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 82%,transparent);color:var(--dsw-alias-bg-base);display:grid;place-items:center;cursor:pointer;opacity:0;transition:opacity .15s,background .15s,border-color .15s;backdrop-filter:blur(5px)}
.picup-card:hover .picup-check,.picup-card.selected .picup-check,.picup-check:focus-visible{opacity:1}
.picup-card.selected .picup-check{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.picup-card-actions{position:absolute;top:8px;right:8px;display:flex;gap:5px;opacity:0;transition:opacity .15s}
.picup-card:hover .picup-card-actions,.picup-card.selected .picup-card-actions{opacity:1}
.picup-mini{width:27px;height:27px;padding:0;border-radius:7px;border:1px solid color-mix(in srgb,var(--dsw-alias-border-l2) 72%,transparent);background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 86%,transparent);color:var(--dsw-alias-label-primary);display:grid;place-items:center;cursor:pointer;backdrop-filter:blur(6px)}
.picup-mini:hover{background:var(--dsw-alias-bg-overlay)}
.picup-mini.danger{color:var(--dsw-alias-state-error-primary)}
.picup-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;min-height:230px;padding:40px 20px;text-align:center;border:1px dashed var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary)}
.picup-empty-icon{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);margin-bottom:3px}
.picup-empty strong{font-size:13.5px;font-weight:600;color:var(--dsw-alias-label-primary)}
.picup-empty span{font-size:12px;line-height:1.5}
.picup-skeleton{pointer-events:none}
.picup-sk-thumb{aspect-ratio:1.28;background:linear-gradient(90deg,var(--dsw-alias-bg-layer-2),color-mix(in srgb,var(--dsw-alias-bg-layer-2) 55%,var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-layer-2));background-size:200% 100%;animation:picup-shimmer 1.3s linear infinite}
.picup-sk-line{height:11px;margin:10px 11px;border-radius:5px;background:var(--dsw-alias-bg-layer-2)}
@keyframes picup-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.picup-more{display:flex;justify-content:center;margin-top:20px}
.picup-modal{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:24px;background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 72%,transparent);backdrop-filter:blur(8px)}
.picup-dialog{width:min(760px,100%);max-height:88vh;overflow:auto;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:16px}
.picup-confirm{width:min(430px,100%)}
.picup-dialog-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.picup-dialog-title{flex:1;min-width:0;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.picup-preview-body{display:grid;place-items:center;min-height:180px;max-height:56vh;padding:12px;background:var(--dsw-alias-bg-base);overflow:hidden}
.picup-preview-body img{display:block;max-width:100%;max-height:53vh;object-fit:contain;border-radius:6px}
.picup-preview-broken{display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px;color:var(--dsw-alias-label-secondary);font-size:12px}
.picup-dialog-body{padding:16px 18px 18px}
.picup-urlrow{display:flex;align-items:center;gap:8px}
.picup-urlrow input{flex:1;min-width:0;height:34px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;outline:none}
.picup-urlrow input:focus{border-color:var(--dsw-alias-brand-primary)}
.picup-kv{display:grid;grid-template-columns:78px 1fr;gap:6px 10px;margin-top:14px;font-size:12px}
.picup-kv span:nth-child(odd){color:var(--dsw-alias-label-secondary)}
.picup-kv span:nth-child(even){word-break:break-all;color:var(--dsw-alias-label-primary)}
.picup-dialog-actions{display:flex;align-items:center;gap:8px;margin-top:18px;flex-wrap:wrap}
.picup-confirm-body{padding:20px 20px 18px;font-size:13px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.picup-confirm-body strong{display:block;margin-bottom:5px;font-size:13.5px;color:var(--dsw-alias-label-primary)}
.picup-confirm-names{margin-top:10px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-base);font-size:12px;color:var(--dsw-alias-label-primary);word-break:break-all}
.picup-confirm-actions{display:flex;justify-content:flex-end;gap:8px;padding:0 20px 20px}
.picup-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:90;display:flex;align-items:center;gap:8px;max-width:min(560px,calc(100vw - 32px));padding:9px 14px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:12.5px;animation:picup-toast-in .18s ease-out}
.picup-toast svg{flex:0 0 auto;color:var(--dsw-alias-state-success-primary)}
.picup-toast.error svg{color:var(--dsw-alias-state-error-primary)}
@keyframes picup-toast-in{from{opacity:0;transform:translate(-50%,6px)}to{opacity:1;transform:translate(-50%,0)}}
@media (max-width:720px){.picup-inner{padding:20px 16px 52px}.picup-head{align-items:center}.picup-head-actions{width:100%}.picup-btn{flex:1}.picup-form{grid-template-columns:1fr}.picup-field.full{grid-column:auto}.picup-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}.picup-drop-cta{display:none}.picup-check,.picup-card-actions{opacity:1}}
`

    const ICONS = {
      upload: [
        ['path', { d: 'M12 15V4' }],
        ['path', { d: 'm7.5 8.5 4.5-4.5 4.5 4.5' }],
        ['path', { d: 'M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' }],
      ],
      refresh: [
        ['path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }],
        ['path', { d: 'M20 5v6h-6' }],
      ],
      settings: [
        ['path', { d: 'M4 7h9M17 7h3M4 17h3M11 17h9' }],
        ['circle', { cx: 15, cy: 7, r: 2 }],
        ['circle', { cx: 9, cy: 17, r: 2 }],
      ],
      search: [
        ['circle', { cx: 11, cy: 11, r: 6.5 }],
        ['path', { d: 'm16 16 4.5 4.5' }],
      ],
      copy: [
        ['rect', { x: 9, y: 9, width: 11, height: 11, rx: 2 }],
        ['path', { d: 'M5 15V6a2 2 0 0 1 2-2h9' }],
      ],
      trash: [
        ['path', { d: 'M4 7h16' }],
        ['path', { d: 'M10 11v6M14 11v6' }],
        ['path', { d: 'M6 7l1 13h10l1-13' }],
        ['path', { d: 'M9 7V4h6v3' }],
      ],
      image: [
        ['rect', { x: 3, y: 4, width: 18, height: 16, rx: 2 }],
        ['circle', { cx: 8.5, cy: 9.5, r: 1.5 }],
        ['path', { d: 'm4 18 5-5 4 4 3-3 4 4' }],
      ],
      check: [['path', { d: 'm5 12 4.5 4.5L19 7' }]],
      plus: [['path', { d: 'M12 5v14M5 12h14' }]],
      x: [['path', { d: 'M6 6l12 12M18 6 6 18' }]],
      external: [
        ['path', { d: 'M14 4h6v6' }],
        ['path', { d: 'M20 4 11 13' }],
        ['path', { d: 'M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5' }],
      ],
      alert: [
        ['path', { d: 'M12 3 2.8 19h18.4L12 3Z' }],
        ['path', { d: 'M12 9v4M12 17h.01' }],
      ],
      cloud: [
        ['path', { d: 'M7 18a4.5 4.5 0 0 1-.7-8.95A6.5 6.5 0 0 1 19 10.5a4 4 0 0 1-.5 7.5H7Z' }],
        ['path', { d: 'M12 15V9m0 0-3 3m3-3 3 3' }],
      ],
    }

    function Icon({ name, size = 16, className }) {
      const shapes = ICONS[name] || []
      return h(
        'svg',
        {
          className,
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        shapes.map(([tag, props], index) => h(tag, { key: index, ...props })),
      )
    }

    function Btn({ children, icon, variant, ...rest }) {
      return h(
        'button',
        { type: 'button', className: `picup-btn${variant ? ` ${variant}` : ''}`, ...rest },
        icon ? h(Icon, { name: icon, size: 15 }) : null,
        h('span', null, children),
      )
    }

    function MiniBtn({ icon, label, onClick, danger }) {
      return h(
        'button',
        {
          type: 'button',
          className: `picup-mini${danger ? ' danger' : ''}`,
          title: label,
          'aria-label': label,
          onClick: (event) => {
            event.stopPropagation()
            onClick()
          },
        },
        h(Icon, { name: icon, size: 14 }),
      )
    }

    function formatBytes(value) {
      const size = Number(value) || 0
      if (size < 1024) return `${size} B`
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`
      return `${(size / 1024 / 1024).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`
    }

    function formatTime(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${date.getFullYear()}/${month}/${day}`
    }

    function sortItems(list) {
      return [...list].sort((a, b) => {
        const left = a.lastModified ? new Date(a.lastModified).getTime() : 0
        const right = b.lastModified ? new Date(b.lastModified).getTime() : 0
        return right - left || String(a.name).localeCompare(String(b.name))
      })
    }

    function text(value) {
      return typeof value === 'string' ? value : ''
    }

    async function api(path, options = {}) {
      const response = await fetch(`${ROUTE}${path}`, { cache: 'no-store', ...options })
      const raw = await response.text()
      let data = null
      if (raw) {
        try {
          data = JSON.parse(raw)
        } catch {
          data = { error: raw }
        }
      }
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`)
      return data
    }

    function uploadFile(file, onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${ROUTE}/upload`)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
        xhr.setRequestHeader('X-Picup-Name', encodeURIComponent(file.name || 'image'))
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
        }
        xhr.onload = () => {
          let data = null
          try {
            data = JSON.parse(xhr.responseText)
          } catch {
            data = null
          }
          if (xhr.status >= 200 && xhr.status < 300 && data?.item) {
            resolve(data.item)
            return
          }
          reject(new Error(data?.error || `HTTP ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error('network'))
        xhr.onabort = () => reject(new Error('aborted'))
        xhr.send(file)
      })
    }

    async function copyText(value) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
        return
      }
      const area = document.createElement('textarea')
      area.value = value
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      if (!ok) throw new Error('copy failed')
    }

    function emptyForm() {
      return {
        secretId: '',
        secretKey: '',
        bucket: '',
        region: 'ap-guangzhou',
        domain: '',
        prefix: 'images',
        publicRead: true,
      }
    }

    function formFromConfig(config) {
      return {
        secretId: config?.secretId || '',
        secretKey: '',
        bucket: config?.bucket || '',
        region: config?.region || 'ap-guangzhou',
        domain: config?.domain || '',
        prefix: config?.prefix || '',
        publicRead: config?.publicRead !== false,
      }
    }

    function StatusPill({ status }) {
      return h(
        'span',
        { className: `picup-status${status.cls ? ` ${status.cls}` : ''}` },
        h('i', { className: 'picup-dot' }),
        status.label,
      )
    }

    function Field({ label, hint, full, children }) {
      return h(
        'label',
        { className: `picup-field${full ? ' full' : ''}` },
        h('span', { className: 'picup-field-label' }, label),
        children,
        hint ? h('span', { className: 'picup-field-hint' }, hint) : null,
      )
    }

    function SettingsPanel({ t, form, setForm, config, busy, onSave, onClose }) {
      const update = (patch) => setForm({ ...form, ...patch })
      return h(
        'section',
        { className: 'picup-settings', 'aria-label': t('configTitle') },
        h(
          'div',
          { className: 'picup-settings-head' },
          h(
            'div',
            null,
            h('div', { className: 'picup-settings-title' }, h(Icon, { name: 'settings', size: 16 }), t('configTitle')),
            h('div', { className: 'picup-settings-intro' }, t('configIntro')),
          ),
          h(
            'button',
            { type: 'button', className: 'picup-iconbtn', onClick: onClose, 'aria-label': t('close') },
            h(Icon, { name: 'x', size: 17 }),
          ),
        ),
        h(
          'div',
          { className: 'picup-form' },
          h(
            Field,
            { label: t('secretId') },
            h('input', {
              value: form.secretId,
              onChange: (event) => update({ secretId: event.target.value }),
              placeholder: 'AKID...',
              autoComplete: 'off',
              spellCheck: false,
            }),
          ),
          h(
            Field,
            { label: t('secretKey'), hint: config?.hasSecretKey ? t('secretSaved') : '' },
            h('input', {
              type: 'password',
              value: form.secretKey,
              onChange: (event) => update({ secretKey: event.target.value }),
              placeholder: config?.hasSecretKey ? t('secretSaved') : '',
              autoComplete: 'new-password',
              spellCheck: false,
            }),
          ),
          h(
            Field,
            { label: t('bucket'), hint: t('bucketHint') },
            h('input', {
              value: form.bucket,
              onChange: (event) => update({ bucket: event.target.value }),
              placeholder: 'example-1250000000',
              autoComplete: 'off',
              spellCheck: false,
            }),
          ),
          h(
            Field,
            { label: t('region'), hint: t('regionHint') },
            h('input', {
              value: form.region,
              onChange: (event) => update({ region: event.target.value }),
              placeholder: 'ap-guangzhou',
              autoComplete: 'off',
              spellCheck: false,
            }),
          ),
          h(
            Field,
            { label: t('domain'), hint: t('domainHint'), full: true },
            h('input', {
              value: form.domain,
              onChange: (event) => update({ domain: event.target.value }),
              placeholder: 'https://img.example.com',
              autoComplete: 'off',
              spellCheck: false,
            }),
          ),
          h(
            Field,
            { label: t('prefix'), hint: t('prefixHint') },
            h('input', {
              value: form.prefix,
              onChange: (event) => update({ prefix: event.target.value }),
              placeholder: 'images',
              autoComplete: 'off',
              spellCheck: false,
            }),
          ),
          h(
            'div',
            { className: 'picup-field' },
            h(
              'div',
              { className: 'picup-switch-row' },
              h(
                'div',
                { className: 'picup-switch-copy' },
                h('strong', null, t('publicRead')),
                h('span', { className: 'picup-field-hint' }, t('publicReadHint')),
              ),
              h(
                'button',
                {
                  type: 'button',
                  role: 'switch',
                  'aria-checked': form.publicRead,
                  className: `picup-switch${form.publicRead ? ' on' : ''}`,
                  onClick: () => update({ publicRead: !form.publicRead }),
                  title: t('publicRead'),
                },
                h('span', null),
              ),
            ),
          ),
          h(
            'div',
            { className: 'picup-form-actions' },
            h(
              Btn,
              { variant: 'primary', onClick: onSave, disabled: busy === 'save' },
              busy === 'save' ? t('testing') : t('saveTest'),
            ),
            h(Btn, { onClick: onClose }, t('close')),
          ),
        ),
        config?.configPath
          ? h(
              'div',
              { className: 'picup-config-note' },
              `${t('configNote')}: `,
              h('code', null, config.configPath),
            )
          : null,
      )
    }

    function UploadRow({ t, upload }) {
      const state =
        upload.status === 'done'
          ? h(React.Fragment, null, h(Icon, { name: 'check', size: 13 }), t('uploadDone'))
          : upload.status === 'error'
            ? h(React.Fragment, null, h(Icon, { name: 'alert', size: 13 }), upload.error || t('uploadFailed'))
            : h(React.Fragment, null, `${upload.progress}%`)
      return h(
        'div',
        { className: `picup-upload ${upload.status}` },
        h(Icon, { name: 'image', size: 14 }),
        h('span', { className: 'picup-upload-name', title: upload.name }, upload.name),
        h('span', { className: 'picup-upload-track' }, h('i', { style: { width: `${upload.progress}%` } })),
        h('span', { className: 'picup-upload-state' }, state),
      )
    }

    function Card({ t, item, selected, onToggle, onOpen, onCopy, onDelete }) {
      const [broken, setBroken] = useState(0)
      const source = broken === 0 ? item.preview : item.proxy
      return h(
        'div',
        {
          className: `picup-card${selected ? ' selected' : ''}`,
          role: 'button',
          tabIndex: 0,
          onClick: () => onOpen(item),
          onKeyDown: (event) => {
            if (event.target !== event.currentTarget) return
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onOpen(item)
            }
          },
        },
        h(
          'div',
          { className: 'picup-thumb' },
          broken < 2
            ? h('img', {
                src: source,
                alt: item.name,
                loading: 'lazy',
                decoding: 'async',
                onError: () => setBroken((value) => value + 1),
              })
            : h(
                'div',
                { className: 'picup-broken' },
                h(Icon, { name: 'image', size: 22 }),
                h('span', null, t('imageBroken')),
              ),
          h(
            'button',
            {
              type: 'button',
              className: 'picup-check',
              'aria-label': selected ? t('deselect') : t('select'),
              'aria-pressed': selected,
              onClick: (event) => {
                event.stopPropagation()
                onToggle(item.key)
              },
            },
            selected ? h(Icon, { name: 'check', size: 12 }) : null,
          ),
          h(
            'div',
            { className: 'picup-card-actions' },
            h(MiniBtn, { icon: 'copy', label: t('copyLink'), onClick: () => onCopy(item.url) }),
            h(MiniBtn, { icon: 'trash', label: t('delete'), danger: true, onClick: () => onDelete([item]) }),
          ),
        ),
        h(
          'div',
          { className: 'picup-card-body' },
          h('div', { className: 'picup-name', title: item.name }, item.name),
          h(
            'div',
            { className: 'picup-meta' },
            h('span', null, formatBytes(item.size)),
            h('span', null, formatTime(item.lastModified)),
          ),
        ),
      )
    }

    function PreviewModal({ t, item, onClose, onCopy, onDelete }) {
      const [broken, setBroken] = useState(0)
      const source = broken === 0 ? item.preview : item.proxy
      return h(
        'div',
        {
          className: 'picup-modal',
          role: 'presentation',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          { className: 'picup-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': item.name },
          h(
            'div',
            { className: 'picup-dialog-head' },
            h('div', { className: 'picup-dialog-title' }, item.name),
            h(
              'button',
              { type: 'button', className: 'picup-iconbtn', onClick: onClose, 'aria-label': t('close') },
              h(Icon, { name: 'x', size: 18 }),
            ),
          ),
          h(
            'div',
            { className: 'picup-preview-body' },
            broken < 2
              ? h('img', {
                  src: source,
                  alt: item.name,
                  onError: () => setBroken((value) => value + 1),
                })
              : h(
                  'div',
                  { className: 'picup-preview-broken' },
                  h(Icon, { name: 'image', size: 40 }),
                  h('span', null, t('imageBroken')),
                ),
          ),
          h(
            'div',
            { className: 'picup-dialog-body' },
            h(
              'div',
              { className: 'picup-urlrow' },
              h('input', {
                readOnly: true,
                value: item.url,
                onFocus: (event) => event.target.select(),
                onClick: (event) => event.target.select(),
              }),
              h(Btn, { icon: 'copy', onClick: () => onCopy(item.url) }, t('copyLink')),
            ),
            h(
              'div',
              { className: 'picup-kv' },
              h('span', null, t('fileSize')),
              h('span', null, formatBytes(item.size)),
              h('span', null, t('uploadTime')),
              h('span', null, formatTime(item.lastModified) || '—'),
              h('span', null, t('objectPath')),
              h('span', null, item.key),
            ),
            h(
              'div',
              { className: 'picup-dialog-actions' },
              h(
                Btn,
                {
                  icon: 'external',
                  onClick: () => window.open(item.url, '_blank', 'noopener,noreferrer'),
                },
                t('openOriginal'),
              ),
              h('span', { className: 'picup-spacer' }),
              h(Btn, { icon: 'trash', variant: 'danger', onClick: () => onDelete([item]) }, t('delete')),
            ),
          ),
        ),
      )
    }

    function DeleteModal({ t, target, deleting, onCancel, onConfirm }) {
      const names = target.slice(0, 3).map((item) => item.name).join('、')
      return h(
        'div',
        { className: 'picup-modal', role: 'presentation' },
        h(
          'div',
          { className: 'picup-dialog picup-confirm', role: 'dialog', 'aria-modal': 'true' },
          h(
            'div',
            { className: 'picup-dialog-head' },
            h('div', { className: 'picup-dialog-title' }, t('deleteTitle')),
            h(
              'button',
              { type: 'button', className: 'picup-iconbtn', onClick: onCancel, 'aria-label': t('close') },
              h(Icon, { name: 'x', size: 18 }),
            ),
          ),
          h(
            'div',
            { className: 'picup-confirm-body' },
            h('strong', null, t('deleteConfirm')),
            h(
              'div',
              { className: 'picup-confirm-names' },
              `${target.length} · ${names}${target.length > 3 ? '…' : ''}`,
            ),
          ),
          h(
            'div',
            { className: 'picup-confirm-actions' },
            h(Btn, { onClick: onCancel, disabled: deleting }, t('cancel')),
            h(
              Btn,
              { variant: 'danger', icon: 'trash', onClick: onConfirm, disabled: deleting },
              deleting ? t('deleting') : t('delete'),
            ),
          ),
        ),
      )
    }

    function Toast({ notice }) {
      return h(
        'div',
        { className: `picup-toast${notice.type === 'error' ? ' error' : ''}`, role: 'status' },
        h(Icon, { name: notice.type === 'error' ? 'alert' : 'check', size: 15 }),
        h('span', null, notice.msg),
      )
    }

    function PicupPanel({ t, locale }) {
      const subscribe = useCallback((callback) => locale.subscribe(callback), [locale])
      const getSnapshot = useCallback(() => locale.getSnapshot(), [locale])
      useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

      const [config, setConfig] = useState(null)
      const [form, setForm] = useState(emptyForm)
      const [items, setItems] = useState([])
      const [loading, setLoading] = useState(true)
      const [refreshing, setRefreshing] = useState(false)
      const [connected, setConnected] = useState(false)
      const [error, setError] = useState('')
      const [nextMarker, setNextMarker] = useState('')
      const [search, setSearch] = useState('')
      const [selected, setSelected] = useState(() => new Set())
      const [settingsOpen, setSettingsOpen] = useState(false)
      const [busy, setBusy] = useState('')
      const [uploads, setUploads] = useState([])
      const [dragging, setDragging] = useState(false)
      const [preview, setPreview] = useState(null)
      const [pendingDelete, setPendingDelete] = useState(null)
      const [deleting, setDeleting] = useState(false)
      const [notice, setNotice] = useState(null)

      const fileInput = useRef(null)
      const toastTimer = useRef(null)

      const showNotice = useCallback((msg, type = 'ok') => {
        setNotice({ msg, type })
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setNotice(null), 3200)
      }, [])

      const load = useCallback(async (cfg, reset, marker = '') => {
        if (!cfg?.configured) {
          setLoading(false)
          return
        }
        if (reset) setLoading(true)
        else setRefreshing(true)
        if (reset) setSelected(new Set())
        setError('')
        try {
          const suffix = marker ? `&marker=${encodeURIComponent(marker)}` : ''
          const data = await api(`/list?limit=60${suffix}`)
          setItems((previous) => sortItems(reset ? data.items : [...previous, ...data.items]))
          setNextMarker(data.nextMarker || '')
          setConnected(true)
        } catch (cause) {
          setConnected(false)
          setError(cause instanceof Error ? cause.message : String(cause))
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      }, [])

      useEffect(() => {
        let alive = true
        ;(async () => {
          try {
            const cfg = await api('/config')
            if (!alive) return
            setConfig(cfg)
            setForm(formFromConfig(cfg))
            if (!cfg.configured) {
              setSettingsOpen(true)
              setLoading(false)
              return
            }
            await load(cfg, true)
          } catch (cause) {
            if (!alive) return
            setError(cause instanceof Error ? cause.message : String(cause))
            setLoading(false)
          }
        })()
        return () => {
          alive = false
          if (toastTimer.current) clearTimeout(toastTimer.current)
        }
      }, [load])

      useEffect(() => {
        if (!preview && !pendingDelete) return undefined
        const onKey = (event) => {
          if (event.key !== 'Escape') return
          if (pendingDelete) setPendingDelete(null)
          else setPreview(null)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [preview, pendingDelete])

      const refresh = () => {
        if (config?.configured) load(config, true)
        else setSettingsOpen(true)
      }

      const handleFiles = async (fileList) => {
        const files = Array.from(fileList || [])
        if (!files.length) return
        if (!config?.configured) {
          setSettingsOpen(true)
          showNotice(t('needConfig'), 'error')
          return
        }
        for (const file of files) {
          if (file.size > MAX_UPLOAD) {
            showNotice(`${file.name}: ${t('sizeLimit')}`, 'error')
            continue
          }
          const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
          setUploads((previous) => [...previous, { id, name: file.name, progress: 0, status: 'uploading' }])
          try {
            const item = await uploadFile(file, (progress) => {
              setUploads((previous) =>
                previous.map((upload) => (upload.id === id ? { ...upload, progress } : upload)),
              )
            })
            setUploads((previous) =>
              previous.map((upload) =>
                upload.id === id ? { ...upload, progress: 100, status: 'done' } : upload,
              ),
            )
            setItems((previous) => sortItems([item, ...previous]))
            setConnected(true)
            setTimeout(() => {
              setUploads((previous) => previous.filter((upload) => upload.id !== id))
            }, 1600)
          } catch (cause) {
            const message = cause instanceof Error && cause.message !== 'network' ? cause.message : t('networkError')
            setUploads((previous) =>
              previous.map((upload) =>
                upload.id === id ? { ...upload, status: 'error', error: message } : upload,
              ),
            )
            showNotice(`${file.name}: ${message}`, 'error')
          }
        }
      }

      const toggleSelect = (key) => {
        setSelected((previous) => {
          const next = new Set(previous)
          if (next.has(key)) next.delete(key)
          else next.add(key)
          return next
        })
      }

      const openPreview = (item) => {
        setPreview(item)
      }

      const copy = async (value) => {
        try {
          await copyText(value)
          showNotice(t('copied'))
        } catch {
          showNotice(t('copyFailed'), 'error')
        }
      }

      const askDelete = (target) => {
        if (!target.length) return
        setPreview(null)
        setPendingDelete(target)
      }

      const confirmDelete = async () => {
        if (!pendingDelete?.length) return
        setDeleting(true)
        const keys = pendingDelete.map((item) => item.key)
        try {
          const result = await api('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keys }),
          })
          const deleted = new Set(result.deleted || [])
          setItems((previous) => previous.filter((item) => !deleted.has(item.key)))
          setSelected((previous) => {
            const next = new Set(previous)
            deleted.forEach((key) => next.delete(key))
            return next
          })
          setPendingDelete(null)
          if (preview && deleted.has(preview.key)) setPreview(null)
          if (result.failed?.length) {
            showNotice(`${t('deleteFailed')}: ${result.failed[0].error}`, 'error')
          } else {
            showNotice(`${t('deleted')} ${result.deleted.length}`)
          }
        } catch (cause) {
          showNotice(cause instanceof Error ? cause.message : String(cause), 'error')
        } finally {
          setDeleting(false)
        }
      }

      const saveSettings = async () => {
        const payload = { ...form }
        if (
          !payload.secretId.trim() ||
          !payload.bucket.trim() ||
          !payload.region.trim() ||
          (!config?.hasSecretKey && !payload.secretKey.trim())
        ) {
          showNotice(t('configIncomplete'), 'error')
          return
        }
        setBusy('save')
        try {
          const saved = await api('/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          setConfig(saved)
          setForm(formFromConfig(saved))
          const test = await api('/test', { method: 'POST' })
          if (!test.ok) {
            setConnected(false)
            setError(test.error || t('statusError'))
            showNotice(test.error || t('statusError'), 'error')
            return
          }
          setConnected(true)
          setError('')
          setSettingsOpen(false)
          showNotice(t('saved'))
          await load(saved, true)
        } catch (cause) {
          showNotice(cause instanceof Error ? cause.message : String(cause), 'error')
        } finally {
          setBusy('')
        }
      }

      const filtered = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return items
        return items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) || item.key.toLowerCase().includes(query),
        )
      }, [items, search])

      const status = !config
        ? { cls: '', label: t('loading') }
        : !config.configured
          ? { cls: 'warn', label: t('statusUnconfigured') }
          : error
            ? { cls: 'err', label: t('statusError') }
            : connected
              ? { cls: 'ok', label: t('statusConnected') }
              : { cls: '', label: t('statusConfigured') }

      const selectedItems = items.filter((item) => selected.has(item.key))

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h(
          'div',
          { className: 'picup-page' },
          h(
            'div',
            { className: 'picup-inner' },
            h(
              'header',
              { className: 'picup-head' },
              h(
                'div',
                { className: 'picup-title-wrap' },
                h('div', { className: 'picup-logo' }, h(Icon, { name: 'cloud', size: 21 })),
                h(
                  'div',
                  null,
                  h(
                    'div',
                    { className: 'picup-title-row' },
                    h('h1', null, t('panelTitle')),
                    h(StatusPill, { status }),
                  ),
                  h('div', { className: 'picup-subtitle' }, t('panelSubtitle')),
                ),
              ),
              h(
                'div',
                { className: 'picup-head-actions' },
                h(Btn, { icon: 'refresh', onClick: refresh, disabled: loading || refreshing }, t('refresh')),
                h(
                  Btn,
                  { icon: 'settings', onClick: () => setSettingsOpen((value) => !value) },
                  t('settings'),
                ),
                h(
                  Btn,
                  {
                    icon: 'upload',
                    variant: 'primary',
                    onClick: () => fileInput.current?.click(),
                    disabled: !config?.configured,
                  },
                  t('upload'),
                ),
              ),
            ),
            h('input', {
              ref: fileInput,
              type: 'file',
              multiple: true,
              accept: 'image/*,.heic,.heif,.avif,.jxl,.tif,.tiff',
              style: { display: 'none' },
              onChange: (event) => {
                handleFiles(event.target.files)
                event.target.value = ''
              },
            }),
            error
              ? h(
                  'div',
                  { className: 'picup-banner' },
                  h('span', { className: 'picup-banner-icon' }, h(Icon, { name: 'alert', size: 16 })),
                  h(
                    'div',
                    { className: 'picup-banner-text' },
                    h('strong', null, t('statusError')),
                    h('span', null, error),
                  ),
                  h(Btn, { onClick: refresh }, t('retry')),
                  h(Btn, { onClick: () => setSettingsOpen(true) }, t('settings')),
                )
              : null,
            settingsOpen
              ? h(SettingsPanel, {
                  t,
                  form,
                  setForm,
                  config,
                  busy,
                  onSave: saveSettings,
                  onClose: () => setSettingsOpen(false),
                })
              : null,
            config && !config.configured && !settingsOpen
              ? h(
                  'div',
                  { className: 'picup-empty' },
                  h('div', { className: 'picup-empty-icon' }, h(Icon, { name: 'settings', size: 22 })),
                  h('strong', null, t('setupCta')),
                  h('span', null, t('configIntro')),
                  h(Btn, { icon: 'settings', onClick: () => setSettingsOpen(true) }, t('settings')),
                )
              : config?.configured
                ? h(
                  React.Fragment,
                  null,
                  h(
                    'div',
                    {
                      className: `picup-drop${dragging ? ' drag' : ''}`,
                      role: 'button',
                      tabIndex: 0,
                      onClick: () => fileInput.current?.click(),
                      onKeyDown: (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          fileInput.current?.click()
                        }
                      },
                      onDragOver: (event) => {
                        event.preventDefault()
                        setDragging(true)
                      },
                      onDragLeave: () => setDragging(false),
                      onDrop: (event) => {
                        event.preventDefault()
                        setDragging(false)
                        handleFiles(event.dataTransfer.files)
                      },
                    },
                    h('div', { className: 'picup-drop-icon' }, h(Icon, { name: 'upload', size: 21 })),
                    h(
                      'div',
                      { className: 'picup-drop-text' },
                      h('div', { className: 'picup-drop-title' }, t('dropTitle')),
                      h('div', { className: 'picup-drop-hint' }, t('dropHint')),
                    ),
                    h(
                      'div',
                      { className: 'picup-drop-cta' },
                      h(Btn, { icon: 'plus' }, t('upload')),
                    ),
                  ),
                  uploads.length
                    ? h(
                        'div',
                        { className: 'picup-uploads', 'aria-label': t('uploadProgress') },
                        uploads.map((upload) => h(UploadRow, { key: upload.id, t, upload })),
                      )
                    : null,
                  h(
                    'div',
                    { className: 'picup-toolbar' },
                    h(
                      'div',
                      { className: 'picup-search' },
                      h(Icon, { name: 'search', size: 15 }),
                      h('input', {
                        value: search,
                        onChange: (event) => setSearch(event.target.value),
                        placeholder: t('search'),
                      }),
                    ),
                    selected.size
                      ? h(
                          React.Fragment,
                          null,
                          h('span', { className: 'picup-selected' }, `${t('selected')} ${selected.size}`),
                          h(
                            Btn,
                            {
                              icon: 'trash',
                              variant: 'danger',
                              onClick: () => askDelete(selectedItems),
                            },
                            t('deleteSelected'),
                          ),
                          h(Btn, { onClick: () => setSelected(new Set()) }, t('cancel')),
                        )
                      : h('span', { className: 'picup-count' }, `${filtered.length} ${t('countSuffix')}`),
                    h('span', { className: 'picup-spacer' }),
                    refreshing ? h('span', { className: 'picup-count' }, t('loading')) : null,
                  ),
                  loading && !items.length
                    ? h(
                        'div',
                        { className: 'picup-grid', 'aria-busy': 'true' },
                        Array.from({ length: 8 }).map((_, index) =>
                          h(
                            'div',
                            { className: 'picup-card picup-skeleton', key: index },
                            h('div', { className: 'picup-sk-thumb' }),
                            h('div', { className: 'picup-sk-line' }),
                          ),
                        ),
                      )
                    : !items.length
                      ? h(
                          'div',
                          { className: 'picup-empty' },
                          h('div', { className: 'picup-empty-icon' }, h(Icon, { name: 'image', size: 22 })),
                          h('strong', null, t('emptyTitle')),
                          h('span', null, search ? t('noResults') : t('emptyHint')),
                          search
                            ? h(Btn, { onClick: () => setSearch('') }, t('cancel'))
                            : h(
                                Btn,
                                { icon: 'upload', onClick: () => fileInput.current?.click() },
                                t('upload'),
                              ),
                        )
                      : !filtered.length
                        ? h(
                            'div',
                            { className: 'picup-empty' },
                            h('div', { className: 'picup-empty-icon' }, h(Icon, { name: 'search', size: 22 })),
                            h('strong', null, t('noResults')),
                            h('span', null, search),
                            h(Btn, { onClick: () => setSearch('') }, t('cancel')),
                          )
                        : h(
                            'div',
                            { className: 'picup-grid' },
                            filtered.map((item) =>
                              h(Card, {
                                key: item.key,
                                t,
                                item,
                                selected: selected.has(item.key),
                                onToggle: toggleSelect,
                                onOpen: openPreview,
                                onCopy: copy,
                                onDelete: askDelete,
                              }),
                            ),
                          ),
                  nextMarker
                    ? h(
                        'div',
                        { className: 'picup-more' },
                        h(
                          Btn,
                          {
                            onClick: () => load(config, false, nextMarker),
                            disabled: refreshing,
                          },
                          refreshing ? t('loading') : t('loadMore'),
                        ),
                      )
                    : null,
                  )
                : null,
          ),
        ),
        preview
          ? h(PreviewModal, {
              t,
              item: preview,
              onClose: () => setPreview(null),
              onCopy: copy,
              onDelete: askDelete,
            })
          : null,
        pendingDelete
          ? h(DeleteModal, {
              t,
              target: pendingDelete,
              deleting,
              onCancel: () => setPendingDelete(null),
              onConfirm: confirmDelete,
            })
          : null,
        notice ? h(Toast, { notice }) : null,
      )
    }

    const ZH_DICT = ZH
    const EN_DICT = EN

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register('picup', 'zh', ZH_DICT))
        ctx.effect(() => ctx.locale.register('picup', 'en', EN_DICT))
        const t = ctx.locale.bind('picup')
        const locale = ctx.locale

        function Page() {
          return h(PicupPanel, { t, locale })
        }

        function SidebarIcon(props) {
          const size = Number(props?.size) || 18
          return h(
            'svg',
            {
              width: size,
              height: size,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 1.8,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              'aria-hidden': 'true',
              style: { display: 'block' },
            },
            h('path', { d: 'M7 18a4.5 4.5 0 0 1-.7-8.95A6.5 6.5 0 0 1 19 10.5a4 4 0 0 1-.5 7.5H7Z' }),
            h('path', { d: 'M12 15V9m0 0-3 3m3-3 3 3' }),
          )
        }

        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: 'picup' }, Page),
        )
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: 'picup',
              order: 20,
              label: () => t('panelTitle'),
            },
            SidebarIcon,
          ),
        )
      },
    }
  },
})
