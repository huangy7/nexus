/**
 * Comprehensive 40+ Ports Database & Catalog
 */
export const PORT_DATABASE = [
  // 1. Web & Frameworks
  { port: 80, service: 'HTTP', category: 'web', desc: '标准未加密 Web 网页传输服务', isHighRisk: false },
  { port: 443, service: 'HTTPS', category: 'web', desc: 'SSL/TLS 安全加密 Web 传输服务', isHighRisk: false },
  { port: 8080, service: 'HTTP-Alt / Tomcat', category: 'web', desc: 'Java Web / Tomcat / Spring 备用端口', isHighRisk: false },
  { port: 8443, service: 'HTTPS-Alt', category: 'web', desc: 'SSL/TLS 加密 Web 备用端口', isHighRisk: false },
  { port: 3000, service: 'Node.js / React / Grafana', category: 'web', desc: 'Vite / React 前端开发与 Grafana 监控', isHighRisk: false },
  { port: 5000, service: 'Flask / .NET', category: 'web', desc: 'Python Flask / .NET Core 默认端口', isHighRisk: false },
  { port: 8000, service: 'Django / FastAPI', category: 'web', desc: 'Python Web 框架服务端口', isHighRisk: false },
  { port: 8888, service: '宝塔面板 / Jupyter', category: 'web', desc: '宝塔 Server 面板或 Jupyter 控制台', isHighRisk: true },
  { port: 9000, service: 'PHP-FPM / MinIO', category: 'web', desc: 'PHP 进程池与 MinIO 对象存储', isHighRisk: false },

  // 2. Remote Access & Management
  { port: 22, service: 'SSH', category: 'remote', desc: 'Linux 远程安全终端 (SFTP/SCP)', isHighRisk: false },
  { port: 3389, service: 'RDP (Windows Remote)', category: 'remote', desc: 'Windows 远程桌面连接端口', isHighRisk: true },
  { port: 21, service: 'FTP', category: 'remote', desc: 'FTP 文件传输控制端口 (明文)', isHighRisk: true },
  { port: 20, service: 'FTP-Data', category: 'remote', desc: 'FTP 主动模式数据传输端口', isHighRisk: false },
  { port: 23, service: 'Telnet', category: 'remote', desc: '传统明文远程终端 (极度高危)', isHighRisk: true },
  { port: 5900, service: 'VNC Desktop', category: 'remote', desc: 'VNC 远程图形桌面服务', isHighRisk: true },
  { port: 2222, service: 'SSH-Alt', category: 'remote', desc: '常用自定义非标准 SSH 端口', isHighRisk: false },

  // 3. Databases & Caching
  { port: 3306, service: 'MySQL / MariaDB', category: 'db', desc: 'MySQL / MariaDB 关系型数据库', isHighRisk: false },
  { port: 5432, service: 'PostgreSQL', category: 'db', desc: 'PostgreSQL 企业级关系型数据库', isHighRisk: false },
  { port: 6379, service: 'Redis', category: 'db', desc: 'Redis 内存高速缓存 (未授权未加密极度高危)', isHighRisk: true },
  { port: 27017, service: 'MongoDB', category: 'db', desc: 'MongoDB NoSQL 文档数据库', isHighRisk: true },
  { port: 1433, service: 'SQL Server (MSSQL)', category: 'db', desc: 'Microsoft SQL Server 数据库', isHighRisk: false },
  { port: 1521, service: 'Oracle DB', category: 'db', desc: 'Oracle 甲骨文企业数据库', isHighRisk: false },
  { port: 9200, service: 'Elasticsearch HTTP', category: 'db', desc: 'Elasticsearch RESTful 搜索 API', isHighRisk: true },
  { port: 9300, service: 'Elasticsearch TCP', category: 'db', desc: 'Elasticsearch 节点间集群通信', isHighRisk: false },
  { port: 11211, service: 'Memcached', category: 'db', desc: 'Memcached 内存缓存数据库', isHighRisk: true },
  { port: 8123, service: 'ClickHouse', category: 'db', desc: 'ClickHouse 列式分析型数据库', isHighRisk: false },

  // 4. Message Queues & Microservices
  { port: 5672, service: 'RabbitMQ (AMQP)', category: 'mq', desc: 'RabbitMQ AMQP 消息队列协议', isHighRisk: false },
  { port: 15672, service: 'RabbitMQ Web', category: 'mq', desc: 'RabbitMQ 可视化 Web 管理后台', isHighRisk: false },
  { port: 9092, service: 'Apache Kafka', category: 'mq', desc: 'Kafka 高吞吐分布式消息队列', isHighRisk: false },
  { port: 2181, service: 'ZooKeeper', category: 'mq', desc: 'Apache ZooKeeper 分布式协调服务', isHighRisk: false },
  { port: 8848, service: 'Nacos', category: 'mq', desc: '阿里 Nacos 配置中心与服务注册中心', isHighRisk: false },
  { port: 8500, service: 'Consul', category: 'mq', desc: 'HashiCorp Consul 服务发现中心', isHighRisk: false },
  { port: 2379, service: 'etcd Client', category: 'mq', desc: 'K8s 底层 etcd 状态客户端', isHighRisk: false },

  // 5. Cloud Native & Network Protocol
  { port: 2375, service: 'Docker Engine (HTTP)', category: 'cloud', desc: 'Docker 远程未加密 API (无密高危RCE)', isHighRisk: true },
  { port: 2376, service: 'Docker Engine (TLS)', category: 'cloud', desc: 'Docker 安全 TLS 远程 API', isHighRisk: false },
  { port: 6443, service: 'Kubernetes API', category: 'cloud', desc: 'K8s Master 主控节点 API Server', isHighRisk: false },
  { port: 9090, service: 'Prometheus UI', category: 'cloud', desc: 'Prometheus 监控系统 Web 端口', isHighRisk: false },
  { port: 8081, service: 'Nexus Repository', category: 'cloud', desc: 'Sonatype Nexus Maven/NPM 私服', isHighRisk: false },
  { port: 53, service: 'DNS Protocol', category: 'cloud', desc: 'DNS 域名解析服务协议', isHighRisk: false },
  { port: 25, service: 'SMTP (Mail)', category: 'cloud', desc: 'SMTP 发送邮件服务端口', isHighRisk: false },
  { port: 465, service: 'SMTPS (Mail)', category: 'cloud', desc: 'SSL/TLS 加密邮件发送端口', isHighRisk: false },
  { port: 445, service: 'SMB / CIFS', category: 'cloud', desc: 'Windows 局域网共享 (永恒之蓝高危)', isHighRisk: true }
];

/**
 * Parse input string into deduplicated sorted port numbers array
 */
export function parsePortsInput(inputStr) {
  if (!inputStr) return [];
  const parts = String(inputStr).split(/[,;\s]+/);
  const set = new Set();

  parts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed) return;
    if (trimmed.includes('-')) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end) && start > 0 && end <= 65535) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let p = min; p <= max; p++) {
          if (p <= 65535) set.add(p);
        }
      }
    } else {
      const p = parseInt(trimmed, 10);
      if (!isNaN(p) && p > 0 && p <= 65535) {
        set.add(p);
      }
    }
  });

  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Get preset ports array by preset key
 */
export function getPresetPorts(presetKey) {
  if (presetKey === 'all') {
    return PORT_DATABASE.map(item => item.port);
  }
  if (presetKey === 'highrisk') {
    return PORT_DATABASE.filter(item => item.isHighRisk).map(item => item.port);
  }
  return PORT_DATABASE.filter(item => item.category === presetKey).map(item => item.port);
}

/**
 * Find info for a specific port number
 */
export function getPortInfo(port) {
  const found = PORT_DATABASE.find(item => item.port === Number(port));
  if (found) return found;
  return {
    port: Number(port),
    service: `PORT-${port}`,
    category: 'custom',
    desc: `自定义端口 ${port}`,
    isHighRisk: false
  };
}

/**
 * Probe a single port status on a given target host
 */
export async function probePortStatus(host, port) {
  const info = getPortInfo(port);
  const start = performance.now();
  const portNum = Number(port);

  // Standard web ports or custom http check
  const protocol = (portNum === 443 || portNum === 8443) ? 'https' : 'http';
  const targetUrl = `${protocol}://${host}:${portNum}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Attempt no-cors fetch to test if port responds
    await fetch(targetUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - start);
    return { ...info, status: 'open', latency };
  } catch (e) {
    const elapsed = Math.round(performance.now() - start);
    
    // Timeout >= 2900ms or AbortError => Filtered / Firewall Blocked
    if (e.name === 'AbortError' || elapsed >= 2900) {
      return { ...info, status: 'filtered', latency: elapsed };
    }
    
    // Connection Refused / Failed => Closed
    return { ...info, status: 'closed', latency: elapsed };
  }
}

/**
 * Search Port Dictionary Catalog
 */
export function searchPortDictionary(keyword) {
  if (!keyword) return PORT_DATABASE;
  const kw = String(keyword).toLowerCase().trim();
  return PORT_DATABASE.filter(item => {
    return String(item.port).includes(kw) ||
      item.service.toLowerCase().includes(kw) ||
      item.desc.toLowerCase().includes(kw) ||
      item.category.toLowerCase().includes(kw);
  });
}
