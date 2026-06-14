import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';

export const getClientInfo = (req) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
             req.socket?.remoteAddress || 
             req.ip || 
             'Unknown';
  
  const geo = geoip.lookup(ip) || {};
  const parser = new UAParser(req.headers['user-agent']);
  const result = parser.getResult();

  return {
    ipAddress: ip,
    country: geo.country || 'Unknown',
    city: geo.city || 'Unknown',
    browser: result.browser.name || 'Unknown',
    os: result.os.name || 'Unknown',
    device: result.device.type ? `${result.device.vendor || 'Unknown'} ${result.device.model || 'Unknown'}` : (result.device.type === 'mobile' ? 'Mobile' : 'Desktop'),
    referrer: req.headers.referer || 'Direct'
  };
};