// daily-weather-pet-toxic.js
// 功能：每天早上推送 天气预报 + 随机猫猫/狗狗图 + 毒鸡汤
// API来源：Open-Meteo (免费、无key) + thecatapi/dog.ceo
// Loon cron 专用脚本

// ==================== 配置区（可自行修改） ====================
const LOCATION = {
  lat: 36.580689,    // 北京纬度（改成你自己的）
  lon: 116.255270    // 北京经度
  // 示例：上海 31.2304, 121.4737
  // 广州 23.1291, 113.2644
};

const LANGUAGE = "zh";  // zh=简体中文，en=英文

// ============================================================

const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LOCATION.lat}&longitude=${LOCATION.lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&forecast_days=1`;

const petTypes = [
  { type: 'cat', api: 'https://api.thecatapi.com/v1/images/search?mime_types=jpg,gif', title: '今日猫猫天气日报' },
  { type: 'dog', api: 'https://dog.ceo/api/breeds/image/random', title: '今日狗狗天气日报' }
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

// 随机猫/狗
const randomPet = petTypes[Math.floor(Math.random() * petTypes.length)];

// 随机毒鸡汤
const randomSoup = toxicSoups[Math.floor(Math.random() * toxicSoups.length)];

// 先获取天气
$httpClient.get(weatherUrl, function(error, response, data) {
  if (error || response.status !== 200) {
    $notification.post('天气加载失败', '今天连天气都看不到了', 'API又鸽了，下次再说吧～');
    $done();
    return;
  }

  let weather = JSON.parse(data);

  // 当前天气
  let currentTemp = weather.current.temperature_2m;
  let weatherCode = weather.current.weather_code;

  // 今日预报
  let maxTemp = weather.daily.temperature_2m_max[0];
  let minTemp = weather.daily.temperature_2m_min[0];
  let rainProb = weather.daily.precipitation_probability_max[0];

  // 简单天气描述（Open-Meteo WMO代码转中文）
  const weatherDesc = {
    0: "晴天", 1: "晴间多云", 2: "多云", 3: "阴天",
    45: "雾", 48: "浓雾",
    51: "小雨", 53: "中雨", 55: "大雨",
    61: "小雨", 63: "中雨", 65: "大雨",
    71: "小雪", 73: "中雪", 75: "大雪",
    80: "阵雨", 95: "雷阵雨"
    // 可继续补充更多代码
  };

  let desc = weatherDesc[weatherCode] || "天气有点神秘";

  let weatherText = `🌡️ 当前：${currentTemp}℃\n☀️ 今日：${desc}\n🔥 最高：${maxTemp}℃   ❄️ 最低：${minTemp}℃\n🌧️ 降雨概率：${rainProb}%`;

  // 再获取猫/狗图片
  $httpClient.get(randomPet.api, function(petErr, petResp, petData) {
    let imageUrl = "";
    if (!petErr && petResp.status === 200) {
      let petJson = JSON.parse(petData);
      imageUrl = randomPet.type === 'cat' ? petJson[0].url : petJson.message;
    }

    // 最终推送
    $notification.post(
      randomPet.title,
      weatherText + "\n\n" + randomSoup,
      "点开查看大图，顺便看看天气有多毒～",
      {
        'open-url': imageUrl || "https://open-meteo.com",
        'media-url': imageUrl
      }
    );

    $done();
  });
});
