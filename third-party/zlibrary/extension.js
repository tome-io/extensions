(() => {
  const SEED_DOMAINS = [
    'https://article.sk',
    'https://1lib.sk',
    'https://librella.fi',
    'https://lexlib.fi',
    'https://bookabooki.fi',
  ];
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
  };

  const parseJson = (value) => {
    if (value == null || typeof value === 'object') return value;
    const source = String(value).replace(/^\uFEFF/, '').trim();
    try {
      const parsed = JSON.parse(source);
      return typeof parsed === 'string' ? parseJson(parsed) : parsed;
    } catch {}
    const start = source.indexOf('{');
    if (start < 0) return null;
    let depth = 0;
    let quoted = false;
    let escaped = false;
    for (let index = start; index < source.length; index += 1) {
      const character = source[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') quoted = false;
      } else if (character === '"') quoted = true;
      else if (character === '{') depth += 1;
      else if (character === '}' && --depth === 0) {
        try {
          return JSON.parse(source.slice(start, index + 1));
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const config = async (key) => reado.config.get(key);
  const cookie = (session) =>
    `siteLanguageV2=en; remix_userid=${encodeURIComponent(session.userId)}; remix_userkey=${encodeURIComponent(session.userKey)}`;

  const domains = async () => {
    const configured = String((await config('domain')) || '').replace(/\/$/, '');
    if (configured) return [configured];
    const remembered = await reado.store.get('domain');
    return [remembered, ...SEED_DOMAINS].filter(
      (domain, index, values) => domain && values.indexOf(domain) === index
    );
  };

  const request = async (url, options = {}) => {
    const response = await reado.fetch(url, options);
    const data = parseJson(response.body);
    return { response, data };
  };

  const saveSession = async (session) => {
    await reado.secureStore.set('session_user_id', session.userId);
    await reado.secureStore.set('session_user_key', session.userKey);
    return session;
  };

  const clearSession = async () => {
    await reado.secureStore.remove('session_user_id');
    await reado.secureStore.remove('session_user_key');
  };

  const acquireSession = async () => {
    const pastedId = String((await config('remixUserId')) || '');
    const pastedKey = String((await config('remixUserKey')) || '');
    if (pastedId && pastedKey) return saveSession({ userId: pastedId, userKey: pastedKey });

    const email = String((await config('email')) || '');
    const password = String((await config('password')) || '');
    if (!email || !password) {
      throw new Error('Configure an email and password, or Remix User ID and Remix User Key.');
    }

    const failures = [];
    for (const domain of await domains()) {
      try {
        const { response, data } = await request(`${domain}/eapi/user/login`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        });
        if (data?.success && data.user?.remix_userkey) {
          await reado.store.set('domain', domain);
          return saveSession({
            userId: String(data.user.id),
            userKey: String(data.user.remix_userkey),
          });
        }
        const message = String(data?.error || `HTTP ${response.status}`);
        if (/email|password|credential/i.test(message)) throw new Error(message);
        failures.push(`${domain}: ${message}`);
      } catch (error) {
        failures.push(`${domain}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    throw new Error(`Login failed on every configured mirror. ${failures.slice(-2).join(' | ')}`);
  };

  const session = async () => {
    const userId = await reado.secureStore.get('session_user_id');
    const userKey = await reado.secureStore.get('session_user_key');
    return userId && userKey ? { userId, userKey } : acquireSession();
  };

  const authenticated = async (path, options, validate) => {
    const activeSession = await session();
    const failures = [];
    for (const domain of await domains()) {
      try {
        const result = await request(`${domain}${path}`, {
          ...options,
          headers: {
            ...headers,
            ...(options?.headers || {}),
            Cookie: cookie(activeSession),
          },
        });
        if (result.data && (!validate || validate(result.data))) {
          await reado.store.set('domain', domain);
          return { ...result, domain, activeSession };
        }
        failures.push(`${domain}: HTTP ${result.response.status}`);
      } catch (error) {
        failures.push(`${domain}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    await clearSession();
    throw new Error(`Every configured mirror failed. ${failures.slice(-2).join(' | ')}`);
  };

  const mapBook = (book) => {
    const id = String(book.id ?? book.md5 ?? book.slug ?? '');
    const hash = String(book.hash ?? book.md5 ?? '');
    return {
      id: `${id}::${hash}`,
      title: String(book.title || '').trim(),
      authors: [String(book.author || 'Unknown').trim()],
      description: String(book.description || book.synopsis || '').trim(),
      coverUrl: String(book.cover || book.cover_url || ''),
      publishedYear: Number(book.year || book.publishedYear) || undefined,
      subjects: [],
      identifiers: { zlibraryId: id, zlibraryHash: hash },
    };
  };

  const identity = (bookId) => {
    const separator = bookId.lastIndexOf('::');
    if (separator < 1) throw new Error('Book identity is missing its download hash.');
    return { id: bookId.slice(0, separator), hash: bookId.slice(separator + 2) };
  };

  globalThis.readoExtension = {
    search: async (query) => {
      const preferredFormat = String((await config('preferredFormat')) || '');
      const format = String(query.format || preferredFormat);
      let body =
        `message=${encodeURIComponent(String(query.query || ''))}` +
        `&order=bestmatch&page=${Number(query.page || 1)}&limit=${Number(query.limit || 25)}`;
      if (format) body += `&extensions[]=${encodeURIComponent(format)}`;
      const { data } = await authenticated(
        '/eapi/book/search',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        },
        (value) => Array.isArray(value.books) || Array.isArray(value.results)
      );
      const books = (data.books || data.results || [])
        .map(mapBook)
        .filter((book) => book.id && book.title);
      return {
        items: books,
        nextPage: books.length >= Number(query.limit || 25) ? Number(query.page || 1) + 1 : undefined,
      };
    },

    acquisition: async (bookId) => {
      const book = identity(bookId);
      const { data, activeSession } = await authenticated(
        `/eapi/book/${encodeURIComponent(book.id)}/${encodeURIComponent(book.hash)}/file`,
        undefined,
        (value) => Boolean(value.file?.downloadLink || value.file?.downloadUrl)
      );
      const file = data.file;
      const url = String(file.downloadLink || file.downloadUrl);
      const format = String(file.extension || file.format || url.split('?')[0].split('.').pop() || 'bin');
      return [
        {
          id: `${book.id}::${book.hash}::${format}`,
          bookId,
          format,
          label: String(file.name || `Download ${format.toUpperCase()}`),
          downloadUrl: url,
          sizeBytes: Number(file.filesize || file.size) || undefined,
          language: String(file.language || ''),
          headers: { ...headers, Cookie: cookie(activeSession) },
        },
      ];
    },
  };
})();
