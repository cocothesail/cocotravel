# 器物手帖 · 东京与益子

手机优先的静态旅行地图。15个店铺点位、代表作家／选品、营业时间、官方依据和Google地图导航。

## 本地预览

`python3 -m http.server 8766`，访问 http://localhost:8766 。

## Vercel

导入此仓库，Framework Preset选择Other，不设置Build Command，Output Directory保持仓库根目录。所有文件为静态资源，无需环境变量。

## 内容

- `data.js`：店铺与地图数据，源资料核对于2026年10月9日。
- `app.js`：分区切换、点选、缩放和本机选择记忆。
- `vendor/d3.min.js`：D3 7.9.0（ISC），随站点打包。
- 道路底图来自日本国土地理院公开道路中心线数据： https://github.com/gsi-cyberjapan/experimental_rdcl 。
- 地址坐标来自国土地理院地址检索。部分精度为街区，pejite益子使用活动方公开会场地图中心，非精确入口。

代表作家指历史展出或经营记录，不保证到访当天库存。网站不收集个人信息，不包含机票、住宿或账号凭据。
