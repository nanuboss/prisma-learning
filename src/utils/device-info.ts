export const getDeviceName = (userAgent?: string): string | null => {
  if (!userAgent) {
    return null;
  }

  let browser = "Unknown Browser";
  let os = "Unknown OS";

  // Detect browser
  if (/Edg\//i.test(userAgent)) {
    browser = "Edge";
  } else if (/OPR\//i.test(userAgent)) {
    browser = "Opera";
  } else if (/Chrome\//i.test(userAgent)) {
    browser = "Chrome";
  } else if (/Firefox\//i.test(userAgent)) {
    browser = "Firefox";
  } else if (/Safari\//i.test(userAgent)) {
    browser = "Safari";
  }

  // Detect operating system
  if (/Windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/Android/i.test(userAgent)) {
    os = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = "iOS";
  } else if (/Mac OS/i.test(userAgent)) {
    os = "macOS";
  } else if (/Linux/i.test(userAgent)) {
    os = "Linux";
  }

  return `${browser} on ${os}`;
};