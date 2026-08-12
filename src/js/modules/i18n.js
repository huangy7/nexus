export const translations = {
  'en-US': {
    tagline: 'Developer Workbench · Instant Utility',
    searchPlaceholder: 'Search tools (⌘K)...',
    footerText: 'Nexus DevTools · Privacy-First · Deployed on Vercel',
    
    // Categories
    cat_network: 'Network',
    cat_dev: 'Developer',

    // Tools
    ip_title: 'IP Lookup', ip_desc: 'Your IP, Location, ISP & WebRTC leak test',
    ping_title: 'Ping Test', ping_desc: 'Global node latency measurement',
    dns_title: 'DNS Query', dns_desc: 'A, AAAA, MX, TXT record resolver',
    json_title: 'JSON Studio', json_desc: 'Format, minify & validate in real-time',
    codec_title: 'Encoder / Crypto', codec_desc: 'Base64, JWT parse, SHA-256 hash',
    time_title: 'Timestamp', time_desc: 'Unix epoch ↔ Local / ISO datetime',

    // UI Buttons & Actions
    btn_sample: 'Sample Data',
    btn_copy: 'Copy',
    btn_clear: 'Clear',
    btn_format: 'Format',
    btn_minify: 'Minify',
    btn_encode: 'Base64 Enc',
    btn_decode: 'Base64 Dec',
    btn_parse_jwt: 'Parse JWT',
    btn_now: 'Current Time',
    btn_run_ping: 'Run Ping Test',
    btn_run_dns: 'Query DNS',
    btn_cancel: 'Cancel',
    btn_confirm: 'Confirm & Add',

    // IP Tool Translations
    ip_loading_status: 'Safely probing node IP telemetry & geolocation...',
    ip_loading_tag_1: '📡 IPv4 / IPv6 Probe',
    ip_loading_tag_2: '🌍 BGP / ASN Telemetry',
    ip_loading_tag_3: '🛡️ WebRTC Leak Audit',

    // Ping Tool Translations
    ping_placeholder: 'Enter IP, domain or URL to test (e.g. google.com / 8.8.8.8)...',
    ping_add_btn: 'Add Target',
    ping_filter_all: 'All Nodes',
    ping_filter_china: 'China Nodes',
    ping_filter_asia: 'Asia Nodes',
    ping_filter_west: 'Western Nodes',
    ping_filter_dev: 'AI & API Dev',
    ping_running_status: 'Probing latency across global nodes...',
    ping_completed_status: '✅ Latency probe complete across all nodes',
    ping_running_btn: 'Testing...',
    ping_stat_min: 'Best Latency (MIN)',
    ping_stat_avg: 'Avg Latency (AVG)',
    ping_stat_fast: 'Fast Nodes (<120ms)',
    ping_stat_loss: 'Loss / Timeout (LOSS)',
    ping_timeout: 'Timeout',
    ping_retest_tooltip: 'Retest this node',

    // DNS Tool Translations
    dns_placeholder: 'Enter domain name to query (e.g. github.com / google.com)...',
    dns_add_custom: '➕ Custom',
    dns_running_btn: 'Querying...',
    dns_stat_total: 'Total Records (TOTAL)',
    dns_stat_ip: 'IPv4 / IPv6 (IP)',
    dns_stat_mx: 'Mail Servers (MX)',
    dns_stat_rcode: 'Response Code (RCODE)',
    dns_querying_status: 'Querying DNS records via {provider}...',
    dns_no_records: 'No valid {type} DNS records found',
    dns_th_name: 'HOST NAME',
    dns_th_ttl: 'TTL (sec)',
    dns_th_value: 'RECORD VALUE / RESPONSE CONTENT',
    dns_th_copy: 'Copy',
    dns_copy_toast: 'DNS record copied to clipboard',

    // Modal Translations
    modal_doh_title: '➕ Add Custom DoH Server',
    modal_doh_url_label: 'DoH Server Endpoint URL',
    modal_doh_name_label: 'Display Name (Optional)',

    // Status & Toasts
    status_fetching_ip: 'Detecting IP...',
    status_safe: 'WebRTC Safe',
    status_leak: 'WebRTC Leak',
    toast_copied: 'Copied to clipboard!',
    toast_cleared: 'Cleared!',
    toast_sample_loaded: 'Sample data loaded!',
    toast_formatted: 'Formatted successfully!',
    toast_error: 'Error processing input'
  },
  'zh-CN': {
    tagline: '开发者极速工作台 · 零零碎碎一站搞定',
    searchPlaceholder: '搜索所有工具 (⌘K)...',
    footerText: 'Nexus DevTools · 隐私优先 · 部署于 Vercel',
    
    cat_network: '网络诊断',
    cat_dev: '常用工具',

    ip_title: 'IP 查询', ip_desc: '本机 IP · 地理位置 · WebRTC 泄漏测试',
    ping_title: 'Ping 测速', ping_desc: '全球多节点延迟实测',
    dns_title: 'DNS 查询', dns_desc: 'A / AAAA / MX / TXT 记录解析',
    json_title: 'JSON 工坊', json_desc: '实时格式化 · 压缩 · 校验',
    codec_title: '编解码/哈希', codec_desc: 'Base64 · JWT 解析 · SHA256',
    time_title: '时间戳转换', time_desc: 'Unix 时间戳 ↔ 标准时间',

    btn_sample: '示例数据',
    btn_copy: '复制',
    btn_clear: '清空',
    btn_format: '格式化',
    btn_minify: '压缩',
    btn_encode: 'Base64 编码',
    btn_decode: 'Base64 解码',
    btn_parse_jwt: '解析 JWT',
    btn_now: '当前时间',
    btn_run_ping: '开始 Ping 测速',
    btn_run_dns: '查询 DNS',
    btn_cancel: '取消',
    btn_confirm: '确定添加',

    // IP 模块
    ip_loading_status: '正在安全探查本节点 IP 遥测与地理位置...',
    ip_loading_tag_1: '📡 IPv4 / IPv6 探测',
    ip_loading_tag_2: '🌍 BGP / ASN 归属',
    ip_loading_tag_3: '🛡️ WebRTC 泄漏审计',

    // Ping 测速模块
    ping_placeholder: '输入任意 IP、域名或 URL 自定义测速 (例: google.com / 8.8.8.8 / 1.1.1.1)...',
    ping_add_btn: '添加测速',
    ping_filter_all: '全部节点 (All)',
    ping_filter_china: '中国节点 (China)',
    ping_filter_asia: '亚太节点 (Asia)',
    ping_filter_west: '欧美节点 (West)',
    ping_filter_dev: 'AI & API (Dev)',
    ping_running_status: '正在从本地浏览器发往多节点测速...',
    ping_completed_status: '✅ 全球节点测速完成 (均由客户端网络发起)',
    ping_running_btn: '测速进行中...',
    ping_stat_min: '最佳延迟 (MIN)',
    ping_stat_avg: '平均延迟 (AVG)',
    ping_stat_fast: '极速节点 (<120ms)',
    ping_stat_loss: '丢包/超时 (LOSS)',
    ping_timeout: '超时 (Timeout)',
    ping_retest_tooltip: '重新测试此节点',

    // DNS 解析模块
    dns_placeholder: '输入要查询的域名 (例: github.com / google.com)...',
    dns_add_custom: '➕ 自定义',
    dns_running_btn: '查询中...',
    dns_stat_total: '总解析记录数 (TOTAL)',
    dns_stat_ip: 'IPv4/v6 地址数 (IP)',
    dns_stat_mx: '邮件服务器 (MX)',
    dns_stat_rcode: '响应状态 (RCODE)',
    dns_querying_status: '正在通过 {provider} 全量解析 DNS 记录...',
    dns_no_records: '未查询到任何有效的 {type} DNS 解析记录',
    dns_th_name: '主机名称 (NAME)',
    dns_th_ttl: 'TTL (秒)',
    dns_th_value: '记录值 / 响应数据 (VALUE / CONTENT)',
    dns_th_copy: '复制',
    dns_copy_toast: 'DNS 记录已复制',

    // 弹窗
    modal_doh_title: '➕ 添加自定义 DoH 服务器',
    modal_doh_url_label: 'DoH 服务器 URL',
    modal_doh_name_label: '服务器显示名称 (可选)',

    // 状态与 Toast
    status_fetching_ip: '正在检测 IP...',
    status_safe: 'WebRTC 安全',
    status_leak: 'WebRTC 泄漏风险',
    toast_copied: '已复制到剪贴板！',
    toast_cleared: '已清空！',
    toast_sample_loaded: '示例数据已加载！',
    toast_formatted: '格式化成功！',
    toast_error: '处理输入出错'
  }
};

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem('nexus_lang') || this.detect();
  }
  detect() {
    const n = navigator.language || 'en-US';
    if (n.startsWith('zh')) return 'zh-CN';
    return 'en-US';
  }
  set(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem('nexus_lang', lang);
      this.updateDom();
    }
  }
  t(key, params = {}) {
    let str = (translations[this.currentLang] || translations['en-US'])[key] || translations['en-US'][key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  }
  updateDom() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
    });
  }
}

export const i18n = new I18n();
