const { withInfoPlist, withStringsXml } = require("expo/config-plugins");

// app.json의 name은 네이티브 프로젝트·타깃 이름으로도 쓰여 기호를 넣을 수 없습니다.
// 홈 화면에 보이는 이름만 따로 지정합니다.
module.exports = (config, displayName) => {
  config = withInfoPlist(config, (c) => {
    c.modResults.CFBundleDisplayName = displayName;
    return c;
  });
  return withStringsXml(config, (c) => {
    c.modResults.resources.string.find((s) => s.$.name === "app_name")._ =
      displayName;
    return c;
  });
};
