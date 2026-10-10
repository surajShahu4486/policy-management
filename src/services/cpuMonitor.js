import os from "os";

function getCpuUsage(previous, current) {
  const idle = current.idle - previous.idle;
  const total = current.total - previous.total;

  return total > 0 ? ((total - idle) / total) * 100 : 0;
}

function getCpuSnapshot() {
  let idle = 0;
  let total = 0;

  for (const cpu of os.cpus()) {
    idle += cpu.times.idle;
    total += Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
  }

  return { idle, total };
}

export function startCpuMonitor() {
  const threshold = Number(process.env.CPU_THRESHOLD || 70);
  const interval = Number(process.env.CPU_CHECK_INTERVAL_MS || 5000);

  let previous = getCpuSnapshot();

  setInterval(() => {
    const current = getCpuSnapshot();
    const usage = getCpuUsage(previous, current);

    previous = current;

    console.log(`CPU Usage: ${usage.toFixed(2)}%`);

    if (usage >= threshold) {
      console.warn(`High CPU usage detected: ${usage.toFixed(2)}%`);
    }
  }, interval);

  console.log(`CPU Monitor started. Threshold: ${threshold}%`);
}