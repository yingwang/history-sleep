# 历史睡前故事

在线版：https://yingwang.github.io/history-sleep/

一个手机优先的网页版睡前故事播放器，内容方向是低刺激历史主题：夜游、古人日常、人物陪伴和博物馆闭馆后的安静导览。故事正文不写在组件里，统一放在 `src/stories.js`，之后可以接入生成好的 TTS 音频，也可以先用浏览器内置朗读做预览。

第一批主题已经建好结构：

- 中国历史：长安雨夜、汴梁夜市散后、苏州园林夏夜、紫禁城雪夜、敦煌驿站、江南书房。
- 欧洲历史：佛罗伦萨画室、威尼斯商船码头、巴黎旧书店、维也纳冬夜、卢浮宫闭馆后、阿尔萨斯木筋屋雨夜。

每个主题都有两个版本位：

- `short`：5 分钟短版，适合马上睡。
- `long`：20 分钟长版，适合完整睡前音频。

目前已放入「长安雨夜」20 分钟长版。其他故事先保留占位，等正文生成后直接补进对应版本。

## 本地预览

```bash
cd history-sleep
npm run dev
```

打开 `http://localhost:4173`。

页面支持：

- 主题横向滑动选择。
- 5 分钟 / 20 分钟版本切换。
- 旁白选择：`zh-CN-XiaoxiaoNeural`、`zh-CN-YunxiNeural`、`zh-CN-XiaoyiNeural`。
- 背景音选择：雨声、壁炉、夜风、翻书声、无背景音。
- 背景音量和旁白音量分开调。
- 定时关闭：不定时、10 分钟、20 分钟、30 分钟。
- 如果本地已有 edge-tts 生成的 mp3，会优先播放 mp3；如果没有，会退回浏览器内置中文朗读，方便快速预览。

## 生成音频

先安装 edge-tts：

```bash
python3 -m pip install edge-tts
```

查看当前可生成的音频：

```bash
npm run list
```

生成已有正文的默认音频：

```bash
npm run generate:audio
```

只生成某一个故事：

```bash
node scripts/generate-audio.mjs --story changan-rain-night --duration long
```

生成某个 voice：

```bash
node scripts/generate-audio.mjs --story changan-rain-night --duration long --voice zh-CN-XiaoxiaoNeural
```

生成后的文件会放在 `audio/` 目录，例如：

```text
audio/changan-rain-night-long-zh-CN-XiaoxiaoNeural.mp3
```

`audio/` 里的 mp3 会随静态站点一起提交，GitHub Pages 或其他静态托管可以直接读取。以后如果音频数量变大，再把它们迁到对象存储，并把播放器路径改成 CDN。

## GitHub Pages

在线地址：https://yingwang.github.io/history-sleep/

仓库已经包含 GitHub Pages workflow。推送到 `main` 后，Actions 会把 `index.html`、`manifest.webmanifest`、`icon.svg`、`src/` 和 `audio/` 打包部署成静态站点。

## 内容怎么填

在 `src/stories.js` 里找到对应主题：

```js
{
  id: "changan-rain-night",
  title: "长安雨夜",
  versions: {
    short: { voice: "xiaoxiao", text: [] },
    long: { voice: "xiaoxiao", text: ["第一段", "第二段"] }
  }
}
```

把正文按段落填进 `text` 数组即可。方括号提示可以保留在页面正文中，例如 `[雨声轻轻落下]`、`[停顿三秒]`；生成 edge-tts 音频时，这些提示会从朗读文本里去掉。背景音由网页播放器单独生成和控制，不需要写进旁白音频。

## 推荐 TTS 参数

默认参数已经写在 `src/stories.js`：

- `zh-CN-XiaoxiaoNeural`：`rate=-25%`，`volume=-8%`，`pitch=-2Hz`。
- `zh-CN-YunxiNeural`：`rate=-28%`，`volume=-8%`，`pitch=-4Hz`。
- `zh-CN-XiaoyiNeural`：`rate=-25%`，`volume=-8%`，`pitch=-1Hz`。

睡前故事的关键不是把声音做得很戏剧化，而是让语速稳定、音量略低、情绪不要起伏太大。背景音建议从 8% 到 12% 之间试，雨声可以稍高一点，翻书声和壁炉声要更低。
