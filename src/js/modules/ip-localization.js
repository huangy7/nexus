// Localized Geography, ISP & RIR Dictionary for IP Telemetry
export const GEO_DICT_ZH = {
  // Continents
  continents: {
    'Asia': '亚洲',
    'North America': '北美洲',
    'Europe': '欧洲',
    'South America': '南美洲',
    'Oceania': '大洋洲',
    'Africa': '非洲',
    'Antarctica': '南极洲'
  },
  // Countries
  countries: {
    'China': '中国',
    'United States': '美国',
    'Japan': '日本',
    'Hong Kong': '中国香港',
    'Taiwan': '中国台湾',
    'Macau': '中国澳门',
    'Singapore': '新加坡',
    'South Korea': '韩国',
    'Korea': '韩国',
    'United Kingdom': '英国',
    'Germany': '德国',
    'France': '法国',
    'Canada': '加拿大',
    'Australia': '澳大利亚',
    'Russia': '俄罗斯',
    'India': '印度',
    'Thailand': '泰国',
    'Vietnam': '越南',
    'Malaysia': '马来西亚',
    'Indonesia': '印度尼西亚',
    'Philippines': '菲律宾',
    'Netherlands': '荷兰',
    'Sweden': '瑞典',
    'Switzerland': '瑞士',
    'Italy': '意大利',
    'Spain': '西班牙',
    'Brazil': '巴西',
    'Mexico': '墨西哥'
  },
  // Chinese Provinces (Pinyin -> Chinese)
  provinces: {
    'Fujian': '福建省',
    'Fujian Sheng': '福建省',
    'Guangdong': '广东省',
    'Guangdong Sheng': '广东省',
    'Zhejiang': '浙江省',
    'Zhejiang Sheng': '浙江省',
    'Beijing': '北京市',
    'Beijing Shi': '北京市',
    'Shanghai': '上海市',
    'Shanghai Shi': '上海市',
    'Jiangsu': '江苏省',
    'Jiangsu Sheng': '江苏省',
    'Shandong': '山东省',
    'Shandong Sheng': '山东省',
    'Sichuan': '四川省',
    'Sichuan Sheng': '四川省',
    'Henan': '河南省',
    'Henan Sheng': '河南省',
    'Hubei': '湖北省',
    'Hubei Sheng': '湖北省',
    'Hunan': '湖南省',
    'Hunan Sheng': '湖南省',
    'Hebei': '河北省',
    'Hebei Sheng': '河北省',
    'Liaoning': '辽宁省',
    'Liaoning Sheng': '辽宁省',
    'Shaanxi': '陕西省',
    'Shaanxi Sheng': '陕西省',
    'Chongqing': '重庆市',
    'Chongqing Shi': '重庆市',
    'Tianjin': '天津市',
    'Tianjin Shi': '天津市',
    'Yunnan': '云南省',
    'Yunnan Sheng': '云南省',
    'Guangxi': '广西壮族自治区',
    'Anhui': '安徽省',
    'Anhui Sheng': '安徽省',
    'Heilongjiang': '黑龙江省',
    'Jiangxi': '江西省',
    'Jiangxi Sheng': '江西省',
    'Jilin': '吉林省',
    'Shanxi': '山西省',
    'Guizhou': '贵州省',
    'Xinjiang': '新疆维吾尔自治区',
    'Gansu': '甘肃省',
    'Hainan': '海南省',
    'Inner Mongolia': '内蒙古自治区',
    'Neimenggu': '内蒙古自治区',
    'Ningxia': '宁夏回族自治区',
    'Qinghai': '青海省',
    'Tibet': '西藏自治区',
    'Xizang': '西藏自治区'
  },
  // Cities (Pinyin -> Chinese)
  cities: {
    'Quanzhou': '泉州市',
    'Fuzhou': '福州市',
    'Xiamen': '厦门市',
    'Zhangzhou': '漳州市',
    'Putian': '莆田市',
    'Sanming': '三明市',
    'Nanping': '南平市',
    'Longyan': '龙岩市',
    'Ningde': '宁德市',
    'Guangzhou': '广州市',
    'Shenzhen': '深圳市',
    'Dongguan': '东莞市',
    'Foshan': '佛山市',
    'Zhongshan': '中山市',
    'Zhuhai': '珠海市',
    'Hangzhou': '杭州市',
    'Ningbo': '宁波市',
    'Wenzhou': '温州市',
    'Jiaxing': '嘉兴市',
    'Jinhua': '金华市',
    'Nanjing': '南京市',
    'Suzhou': '苏州市',
    'Wuxi': '无锡市',
    'Changzhou': '常州市',
    'Wuhan': '武汉市',
    'Chengdu': '成都市',
    'Xi\'an': '西安市',
    'Xian': '西安市',
    'Zhengzhou': '郑州市',
    'Changsha': '长沙市',
    'Jinan': '济南市',
    'Qingdao': '青岛市',
    'Shenyang': '沈阳市',
    'Dalian': '大连市',
    'Harbin': '哈尔滨市',
    'Changchun': '长春市',
    'Nanning': '南宁市',
    'Kunming': '昆明市',
    'Guiyang': '贵阳市',
    'Urumqi': '乌鲁木齐市',
    'Lanzhou': '兰州市',
    'Taiyuan': '太原市',
    'Hefei': '合肥市',
    'Nanchang': '南昌市',
    'Haikou': '海口市',
    'Sanya': '三亚市'
  }
};

export function localizeContinent(continent, lang = 'zh-CN') {
  if (!continent) return 'N/A';
  if (lang.startsWith('zh')) {
    const raw = String(continent).split('(')[0].trim();
    return GEO_DICT_ZH.continents[raw] || continent;
  }
  return continent;
}

export function localizeCountry(country, code, lang = 'zh-CN') {
  if (!country) return 'Unknown';
  if (lang.startsWith('zh')) {
    const name = GEO_DICT_ZH.countries[country] || country;
    return `${name} (${code || 'UN'})`;
  }
  return `${country} (${code || 'UN'})`;
}

export function localizeRegionCity(city, region, countryCode, lang = 'zh-CN') {
  if (lang.startsWith('zh') && (countryCode === 'CN' || countryCode === 'HK' || countryCode === 'TW' || countryCode === 'MO')) {
    const regZh = GEO_DICT_ZH.provinces[region] || region;
    const cityZh = GEO_DICT_ZH.cities[city] || city;
    if (regZh && cityZh) return `${regZh} ${cityZh}`;
    return cityZh || regZh || `${city || ''} ${region || ''}`.trim() || 'N/A';
  }
  const parts = [city, region].filter(Boolean);
  return parts.join(' · ') || 'N/A';
}

export function localizeIsp(isp, lang = 'zh-CN') {
  if (!isp) return '未知 ISP';
  if (!lang.startsWith('zh')) return isp;
  
  const l = isp.toUpperCase();
  if (l.includes('CHINATELECOM') || l.includes('CHINA TELECOM') || l.includes('CHINANET')) {
    if (l.includes('IDC')) return '中国电信 IDC 机房';
    return '中国电信 (China Telecom)';
  }
  if (l.includes('CHINAUNICOM') || l.includes('CHINA UNICOM') || l.includes('UNICOM')) {
    return '中国联通 (China Unicom)';
  }
  if (l.includes('CHINAMOBILE') || l.includes('CHINA MOBILE') || l.includes('CMNET')) {
    return '中国移动 (China Mobile)';
  }
  if (l.includes('CERNET')) return '中国教育网 (CERNET)';
  if (l.includes('CHINAGBN') || l.includes('BROADBAND')) return '中国广电 (China Broadnet)';
  if (l.includes('ALIBABA') || l.includes('ALIYUN')) return '阿里云 (Alibaba Cloud)';
  if (l.includes('TENCENT')) return '腾讯云 (Tencent Cloud)';
  if (l.includes('BAIDU')) return '百度云 (Baidu Cloud)';
  if (l.includes('HUAWEI')) return '华为云 (Huawei Cloud)';
  if (l.includes('AMAZON') || l.includes('AWS')) return '亚马逊云 (AWS)';
  if (l.includes('GOOGLE') || l.includes('GCP')) return '谷歌云 (Google Cloud)';
  if (l.includes('CLOUDFLARE')) return 'Cloudflare 网络';
  if (l.includes('MICROSOFT') || l.includes('AZURE')) return '微软云 (Microsoft Azure)';
  return isp;
}

export function localizeOrg(org, lang = 'zh-CN') {
  if (!org) return 'N/A';
  if (!lang.startsWith('zh')) return org;

  const l = org.toUpperCase();
  if (l.includes('FUJIAN PROVINCE NETWORK') || l.includes('FUJIAN-TELECOM')) return '中国电信福建省网';
  if (l.includes('CHINANET-BACKBONE')) return '中国电信 CHINANET 骨干网';
  if (l.includes('CHINA UNICOM') || l.includes('UNICOM')) return '中国联通骨干网';
  if (l.includes('CHINA MOBILE') || l.includes('CMNET')) return '中国移动骨干网';
  return localizeIsp(org, lang);
}

export function localizeRir(rir, lang = 'zh-CN') {
  if (!lang.startsWith('zh')) return rir;
  const map = {
    'APNIC': '亚太网络信息中心 (APNIC)',
    'ARIN': '北美网络信息中心 (ARIN)',
    'RIPE NCC': '欧洲网络信息中心 (RIPE NCC)',
    'LACNIC': '拉美网络信息中心 (LACNIC)',
    'AFRINIC': '非洲网络信息中心 (AFRINIC)'
  };
  return map[rir] || rir;
}

export function localizeTrafficProfile(profile, lang = 'zh-CN') {
  if (!profile) return '';
  if (!lang.startsWith('zh')) return profile;
  return profile.replace('Human', '真人').replace('Bot', '爬虫');
}
