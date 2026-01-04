// daily-weather-pet-toxic-clean.js
// 已清理版 - 所有引号、分号、括号均为半角英文字符

const LOCATION = { lat: 36.580689, lon: 116.255270 };

const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" + LOCATION.lat + "&longitude=" + LOCATION.lon + "&current=temperature_2m&timezone=Asia%2FShanghai";

$httpClient.get(weatherUrl, function(err, resp, data) {
  if (err) {
    $notification.post("天气API错误", "调试失败", err.toString());
    $done();
    return;
  }

  let json;
  try {
    json = JSON.parse(data);
  } catch (e) {
    $notification.post("JSON解析失败", "天气数据格式错", e.toString());
    $done();
    return;
  }

  const temp = json.current ? json.current.temperature_2m : "获取失败";
  const imgUrl = "https://http.cat/200";  // 测试用固定猫图

  $notification.post(
    "天气调试测试",
    "当前温度: " + temp + "℃\n(如果看到猫猫图就成功了)",
    "检查 Loon 版本和通知权限",
    {
      "media-url": imgUrl,
      "open-url": imgUrl
    }
  );

  $done();
});
