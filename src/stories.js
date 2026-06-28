export const durations = [
  { id: "short", label: "5分钟短版", minutes: 5 },
  { id: "long", label: "20分钟长版", minutes: 20 }
];

export const voices = [
  {
    id: "xiaoxiao",
    name: "晓晓",
    edgeName: "zh-CN-XiaoxiaoNeural",
    description: "默认女声，清楚、稳定，适合大多数睡前故事。",
    tts: { rate: "-25%", volume: "-8%", pitch: "-2Hz" },
    speech: { rate: 0.72, pitch: 0.92, volume: 0.9 }
  },
  {
    id: "yunxi",
    name: "云希",
    edgeName: "zh-CN-YunxiNeural",
    description: "男声，语气更暖，适合低刺激人物陪伴。",
    tts: { rate: "-28%", volume: "-8%", pitch: "-4Hz" },
    speech: { rate: 0.7, pitch: 0.86, volume: 0.9 }
  },
  {
    id: "xiaoyi",
    name: "晓伊",
    edgeName: "zh-CN-XiaoyiNeural",
    description: "更甜一点的女声，适合轻柔日常和园林、书房主题。",
    tts: { rate: "-25%", volume: "-8%", pitch: "-1Hz" },
    speech: { rate: 0.72, pitch: 0.96, volume: 0.9 }
  }
];

export const ambiences = [
  { id: "rain", name: "雨声", description: "细雨和檐下水声，适合夜游和客舍。" },
  { id: "fireplace", name: "壁炉", description: "低频火声和偶尔轻响，适合欧洲室内。" },
  { id: "wind", name: "夜风", description: "很轻的风声，适合庭院、港口和雪夜。" },
  { id: "pages", name: "翻书声", description: "间隔很长的纸页声，适合书房和博物馆。" },
  { id: "none", name: "无背景音", description: "只播放旁白。" }
];

function splitText(text) {
  return text
    .trim()
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function emptyVersions(defaultVoice = "xiaoxiao") {
  return {
    short: { voice: defaultVoice, text: [] },
    long: { voice: defaultVoice, text: [] }
  };
}

export const stories = [
  {
    id: "changan-rain-night",
    title: "长安雨夜",
    region: "中国历史",
    category: "历史夜游",
    defaultAmbient: "rain",
    summary: "雨夜里的长安客舍，坊门合上，街声退远，只留下窗纸、灯火、旧书和檐下细雨。",
    versions: {
      short: { voice: "xiaoxiao", text: [] },
      long: {
        voice: "xiaoxiao",
        text: splitText(`
夜已经深了，长安城的雨还没有停。

白日里宽阔的朱雀大街，此刻只剩下雨水一层一层落在青石上的声音。坊门早已合上，街上没有车马，也没有叫卖，只有檐角的水珠从瓦当边慢慢坠下来，滴在门前的小沟里，发出很轻的一声响，然后顺着浅浅的水痕，流向更暗的巷子深处。

你可以想象自己正坐在一间安静的客舍里。屋子不大，门是木门，窗上糊着微微泛黄的纸，雨气从缝隙里渗进来一点，把窗纸润得柔软。桌上有一盏灯，灯火被纱罩拢着，不亮，也不暗，只照得见一只粗陶茶盏，一卷没有读完的书，还有铺在案角的一方旧帕子。茶已经不烫了，杯沿却还留着一点温意，像白天剩下的一点人间烟火，舍不得这么快散去。

[雨声轻轻落下]

长安的夜，其实比白日更像一座城。白天的时候，它太大，太热闹，太容易让人忘记它本来的轮廓。东西两市开着，胡商的骆驼从街口经过，铜铃一路响过去；酒肆门前有新贴的诗，有少年人仰着脸高声念，也有穿青衫的书生站在檐下，假装只是在避太阳，其实眼睛一直往楼上看。可到了这样的雨夜，所有声音都慢慢退下去，长安便显出一种安稳的、沉默的样子。城墙很高，宫阙在北边，远得像一幅被雨雾浸湿的画，坊里的槐树吸满了水，叶子低垂着，偶尔有一阵风经过，树影便在墙上轻轻晃一下。

你不用赶路，也不用见什么人。明日的事自然要等明日再说。今夜的长安把门关上了，也把许多纷纷扰扰的声音关在外面。客舍的主人已经睡了，后院的马也睡了，厨房里白日烧过的灶还残着一点温热，柴灰安安静静地伏在炉膛里，像被雨声哄住了一样。走廊尽头挂着一盏小灯，灯芯偶尔轻轻一爆，声音很小，像有人在梦里翻了一页书。

[停顿三秒]

窗外的雨并不急。它不是夏日那种忽然倾盆的大雨，也不是秋末带着寒意的冷雨，而是春夜里的细雨，慢慢地、耐心地落着，仿佛整座城都可以被它这样洗上一夜。屋檐下的水线细细长长，落在石阶旁一只旧瓦盆里，瓦盆里积了浅浅一层水，水面被雨点点开，又很快合拢，像一只眼睛闭上，又闭得更深。

你把书卷往旁边推了推。那卷书纸页有些旧，边角被人翻得微微起毛，墨色却还清楚。唐人写字，常常有一种舒展的气象，像长安城里的道路，笔画出去，不急着收回来，先让它走远一点，再从容落下。可是今夜不必读书。书可以留到明天，灯也可以再亮一会儿，雨声已经足够把这间屋子填满。

很远的地方，传来一声更鼓。

那声音隔着雨，隔着巷子，隔着一重又一重屋檐，到了这里，已经变得很柔和。它不像是在催促人睡，也不像是在提醒人夜已深，它只是把夜色轻轻往后推了一点，让人知道，此刻的长安还有人在守夜，还有人在城中慢慢走过。也许是提灯的巡人，也许是披蓑衣的老仆，也许只是某个睡不着的人站在门后，听见雨落在自家院里的芭蕉叶上，忽然想起很久以前的一件小事。

[远处更鼓]

你把手放在桌沿上，木头被岁月磨得很平，有一点细微的凉。雨气让屋里的气味变得清楚起来，有湿木头的味道，有灯油温温的味道，也有茶叶泡开以后淡淡的清苦。被褥已经铺好了，青色的帐子垂在床边，帐角压着一枚小小的铜钩。那并不是什么贵重物件，只是寻常客舍里都会有的东西，可在雨夜的灯下，它也显得安静而妥帖，好像世间所有细碎的安排，都只是为了让人可以在此刻慢慢睡去。

白日里的长安或许很难安静。有人赶考，有人赴宴，有人从关外带来葡萄酒和香料，有人在东市买一匹新马，有人在曲江边折一枝花。可是这一切到了夜里，都像被雨水隔开了。城中那些明亮的门第、热闹的酒楼、华丽的车盖、年轻人的笑声，全都退到很远的地方。你只听得见眼前这一场雨，听得见灯火轻轻摇晃，听得见自己呼吸慢下来。

[停顿三秒]

不知过了多久，雨声似乎更细了一些。窗外的瓦面还在滴水，巷子里却已经没有风了。灯光落在墙上，颜色淡淡的，像一层温水。你靠在榻边，眼前的物件都变得柔和起来，茶盏的影子不再分明，书卷上的字也渐渐融成一片安静的墨色。长安还在外面，城墙还在，街道还在，坊门还在，远处的宫灯或许也还在雨雾里微微亮着，可这一刻，它们都不需要你去看，也不需要你去想。

你只需要听雨。

雨落在檐上，落在树叶上，落在石阶上，也落在很远很远的长街尽头。它从夜色里来，又慢慢回到夜色里去。客舍里的灯火低了一点，灯芯安静地伏着，像也有了倦意。你把手从桌沿收回来，指尖还留着一点木头的凉意，茶盏里最后一缕温气也散了，屋中只剩下细雨、微灯、旧书和一张已经铺好的床。

如果这时有人从很高很远的地方看长安，会看见整座城沉在雨里，像一枚被夜色包住的玉。坊墙整齐，街道宽阔，屋脊连着屋脊，檐角连着檐角，所有白日里奔走的人，都在此刻回到了自己的灯下。有人已经熟睡，有人将睡未睡，有人还在听雨。而你也可以慢慢躺下，把这一夜交给窗外的声音。

不用想明天的路，也不用想白日里的事。明早城门会开，街上会重新有马蹄声，市井会重新热闹起来，蒸饼铺的热气会从巷口冒出来，卖花的人会沿街走过，长安会从雨后的清晨里醒来。

可是现在还早。

现在仍是雨夜。

灯还在低低地亮着，雨还在很轻地落着，长安还在安静地睡着。你也可以睡了。
        `)
      }
    }
  },
  {
    id: "bianliang-after-market",
    title: "汴梁夜市散后",
    region: "中国历史",
    category: "古人日常",
    defaultAmbient: "wind",
    summary: "夜市渐散，灯棚收起，汴河边的水声和未熄的炉火留住白日的余温。",
    versions: emptyVersions("xiaoxiao")
  },
  {
    id: "suzhou-garden-summer-night",
    title: "苏州园林夏夜",
    region: "中国历史",
    category: "古人日常",
    defaultAmbient: "wind",
    summary: "月色落在太湖石和花窗上，廊下茶凉，池边有很轻的虫声。",
    versions: emptyVersions("xiaoyi")
  },
  {
    id: "forbidden-city-snow-night",
    title: "紫禁城雪夜",
    region: "中国历史",
    category: "历史夜游",
    defaultAmbient: "wind",
    summary: "宫墙、琉璃瓦和雪后的石阶，适合做成低声慢行的夜间导览。",
    versions: emptyVersions("xiaoxiao")
  },
  {
    id: "dunhuang-post-station",
    title: "敦煌驿站",
    region: "中国历史",
    category: "历史夜游",
    defaultAmbient: "wind",
    summary: "驼铃远去，驿站灯火低下，沙地和木门把夜色分成内外两层。",
    versions: emptyVersions("yunxi")
  },
  {
    id: "jiangnan-study",
    title: "江南书房",
    region: "中国历史",
    category: "古人日常",
    defaultAmbient: "pages",
    summary: "纸、墨、茶、木窗和雨后院落，适合写成几乎没有情节的慢速日常。",
    versions: emptyVersions("xiaoyi")
  },
  {
    id: "florence-studio",
    title: "佛罗伦萨画室",
    region: "欧洲历史",
    category: "低刺激人物陪伴",
    defaultAmbient: "pages",
    summary: "傍晚的画室里，颜料、木板、手稿和窗外钟声慢慢安静下来。",
    versions: emptyVersions("yunxi")
  },
  {
    id: "venice-merchant-dock",
    title: "威尼斯商船码头",
    region: "欧洲历史",
    category: "古人日常",
    defaultAmbient: "wind",
    summary: "清晨前的码头，货箱、绳索、潮水和船舷声，让城市从水上醒来。",
    versions: emptyVersions("xiaoxiao")
  },
  {
    id: "paris-bookshop",
    title: "巴黎旧书店",
    region: "欧洲历史",
    category: "古人日常",
    defaultAmbient: "pages",
    summary: "旧书脊、木地板、炉火和窗外街灯，适合低声讲一间书店的夜。",
    versions: emptyVersions("xiaoyi")
  },
  {
    id: "vienna-winter-night",
    title: "维也纳冬夜",
    region: "欧洲历史",
    category: "低刺激人物陪伴",
    defaultAmbient: "fireplace",
    summary: "雪落在街灯下，屋里有炉火、谱纸和很远处的马车声。",
    versions: emptyVersions("yunxi")
  },
  {
    id: "louvre-after-closing",
    title: "卢浮宫闭馆后",
    region: "欧洲历史",
    category: "博物馆睡前导览",
    defaultAmbient: "pages",
    summary: "人群离开后，展厅、楼梯和石像留下另一种很低的博物馆声音。",
    versions: emptyVersions("xiaoxiao")
  },
  {
    id: "alsace-timber-house-rain",
    title: "阿尔萨斯木筋屋雨夜",
    region: "欧洲历史",
    category: "历史夜游",
    defaultAmbient: "rain",
    summary: "雨水沿着陡屋顶落下，木梁、花窗和窄巷在夜里慢慢变暗。",
    versions: emptyVersions("xiaoxiao")
  }
];

export function getStory(id) {
  return stories.find((story) => story.id === id) ?? stories[0];
}

export function getVoice(id) {
  return voices.find((voice) => voice.id === id) ?? voices[0];
}

export function getVersion(story, durationId) {
  return story.versions[durationId] ?? story.versions.long ?? story.versions.short;
}

export function hasText(version) {
  return Array.isArray(version.text) && version.text.length > 0;
}

export function stripCues(paragraphs) {
  return paragraphs
    .filter((paragraph) => !/^\[[^\]]+\]$/.test(paragraph.trim()))
    .map((paragraph) => paragraph.replace(/\[[^\]]+\]/g, "").trim())
    .filter(Boolean);
}
