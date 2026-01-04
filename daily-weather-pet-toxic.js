// daily-weather-pet-toxic-final.js
// 完整版：天气预报 + 随机猫/狗图 + 毒鸡汤
// 已全部使用半角英文标点，清理潜在问题字符

const LOCATION = { lat: 36.580689, lon: 116.255270 }; // 北京，改成你的经纬度

const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + LOCATION.lat + "&longitude=" + LOCATION.lon + "&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=1";

const petTypes = [
  { type: "cat", api: "https://api.thecatapi.com/v1/images/search?mime_types=jpg,gif", title: "今日猫猫天气日报" },
  { type: "dog", api: "https://dog.ceo/api/breeds/image/random", title: "今日狗狗天气日报" }
];

const toxicSoups = [
  "今天天气不错，就是出门还得上班这件事很丧。",
  "外面晴空万里，你的心情却阴转多云。",
  "降雨概率30%，但你emo的概率100%。",
  "生活就像天气预报，说好就晴，说变就变。",
  "早安啊，今天又是被闹钟叫醒的一天，恭喜你又苟活了24小时。",
  "温度适宜，适合躺平，不适合奋斗。",
  "风很大，建议别把梦想说出来，容易被吹散。",
  "紫外线强，记得防晒，也记得防脱发。",
  "今日最高温35°，最低温35°（心态）。",
  "天气很好，适合出去走走……然后继续躺着。"
];

// 随机选择猫或狗
const randomPet = petTypes[Math.floor(Math.random() * petTypes.length)];

// 随机毒鸡汤
const randomSoup = toxicSoups[Math.floor(Math.random() * toxicSoups.length)];

// 天气代码转中文（简化版）
const weatherDesc = {
  0: "晴天", 1: "晴间多云", 2: "多云", 3: "阴天",
  45: "雾", 48: "浓雾",
  51: "小雨", 53: "中雨", 55: "大雨",
  61: "小雨", 63: "中雨", 65: "大雨",
  71: "小雪", 73: "中雪", 75: "大雪",
  80: "阵雨", 95: "雷阵雨"
};

$httpClient.get(weatherUrl, function(err, resp, data) {
  if (err) {
    $notification.post("天气加载失败", "API出问题了", "今天先喝鸡汤吧～");
    $done();
    return;
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch (e) {
    $notification.post("天气解析失败", "数据格式不对", e.toString());
    $done();
    return;
  }

  // 提取天气信息
  const currentTemp = json.current ? json.current.temperature_2m : "??";
  const weatherCode = json.current ? json.current.weather_code : 0;
  const desc = weatherDesc[weatherCode] || "天气有点神秘";

  const maxTemp = json.daily ? json.daily.temperature_2m_max[0] : "??";
  const minTemp = json.daily ? json.daily.temperature_2m_min[0] : "??";
  const rainProb = json.daily ? json.daily.precipitation_probability_max[0] : "??";

  const weatherText = "🌡️ 当前: " + currentTemp + "℃\n" +
                      "☀️ 今日: " + desc + "\n" +
                      "🔥 最高: " + maxTemp + "℃   ❄️ 最低: " + minTemp + "℃\n" +
                      "🌧️ 降雨概率: " + rainProb + "%";

  // 获取猫/狗图片
  $httpClient.get(randomPet.api, function(petErr, petResp, petData) {
    let imageUrl = "https://http.cat/200"; // 默认备用图

    if (!petErr && petResp.status === 200) {
      let petJson = JSON.parse(petData);
      imageUrl = randomPet.type === "cat" ? petJson[0].url : petJson.message;
    }

    // 最终推送
    $notification.post(
      randomPet.title,
      weatherText + "\n\n" + randomSoup,
      "点开看大图，顺便看看今天有多毒～",
      {
        "media-url": imageUrl,
        "open-url": imageUrl
      }
    );

    $done();
  });
});
