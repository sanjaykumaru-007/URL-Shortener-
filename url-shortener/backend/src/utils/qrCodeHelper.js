import QRCode from 'qrcode';

export const generateQRCode = async (url) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return qrCodeDataUrl;
  } catch (err) {
    console.error('QR Code generation error:', err);
    return '';
  }
};