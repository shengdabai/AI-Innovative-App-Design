const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const axios = require('axios');

function setup() {
  const tokens = new Map([['accessToken', 'old-access'], ['refreshToken', 'refresh']]);
  const store = {
    getItemAsync: async (key) => tokens.get(key),
    setItemAsync: async (key, value) => tokens.set(key, value),
    deleteItemAsync: async (key) => tokens.delete(key),
  };
  const source = ts.transpileModule(readFileSync(join(__dirname, 'api.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exported = {};
  vm.runInNewContext(source, {
    exports: exported,
    process: { env: { EXPO_PUBLIC_API_URL: 'https://api.example.test' } },
    require: (name) => {
      if (name === 'axios') return axios;
      if (name === 'expo-secure-store') return store;
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return { client: exported.apiClient, tokens };
}

function unauthorized(config) {
  return Promise.reject(new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
    status: 401, statusText: 'Unauthorized', config, headers: {}, data: {},
  }));
}

afterEach(() => jest.restoreAllMocks());

test('a refreshed request returns the same data shape as an ordinary request', async () => {
  const { client, tokens } = setup();
  let attempts = 0;
  client.defaults.adapter = async (config) => {
    if (++attempts === 1) return unauthorized(config);
    expect(config.headers.Authorization).toBe('Bearer new-access');
    return { status: 200, statusText: 'OK', config, headers: {}, data: { records: [1] } };
  };
  const refresh = jest.spyOn(axios, 'post').mockResolvedValue({
    data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
  });
  expect(await client.get('/records')).toEqual({ records: [1] });
  expect(attempts).toBe(2);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(tokens.get('refreshToken')).toBe('new-refresh');
});

test('a repeated 401 refreshes only once and clears rejected credentials', async () => {
  const { client, tokens } = setup();
  let attempts = 0;
  client.defaults.adapter = (config) => {
    attempts += 1;
    // Fail clearly if a retry loop is introduced.
    if (attempts > 2) throw new Error('Unexpected retry loop');
    return unauthorized(config);
  };
  const refresh = jest.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'new-access' } });
  await expect(client.get('/records')).rejects.toThrow('Unauthorized');
  expect(attempts).toBe(2);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(tokens.size).toBe(0);
});
