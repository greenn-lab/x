import { networkInterfaces } from 'os';

export const getServerIp = () => {
  const nets = networkInterfaces();

  const net = Object.keys(nets)
    .map((i) => nets[i])
    .flatMap((i) => i)
    .filter((i) => i?.family === 'IPv4' && !i.internal)
    .sort((a, b) => ((a?.address ?? '') > (b?.address ?? '') ? -1 : 1))[0];

  return net?.address || 'localhost';
};
