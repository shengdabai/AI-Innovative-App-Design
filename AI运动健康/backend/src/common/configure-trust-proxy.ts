import { NestExpressApplication } from '@nestjs/platform-express';

export function configureTrustProxy(app: NestExpressApplication, value?: string) {
  const setting = value?.trim();
  if (!setting || setting === 'false') {
    app.set('trust proxy', false);
    return;
  }

  if (/^\d+$/.test(setting)) {
    const hops = Number(setting);
    if (!Number.isSafeInteger(hops)) {
      throw new Error('TRUST_PROXY hop count must be a safe non-negative integer');
    }
    app.set('trust proxy', hops);
    return;
  }

  if (/^[+-]?\d+(?:\.\d+)?$/.test(setting)) {
    throw new Error('TRUST_PROXY hop count must be a safe non-negative integer');
  }

  // Express validates IP addresses/CIDRs and rejects invalid values (including "true").
  const proxies = setting.split(',').map((proxy) => proxy.trim());
  if (proxies.some((proxy) => !proxy)) {
    throw new Error('TRUST_PROXY must contain non-empty proxy addresses');
  }
  app.set('trust proxy', proxies);
}
