import { describe, expect, it } from 'vitest';

import {
  countLogLevels,
  formatLogTime,
  logEntryFields,
  parseLogEntryTime,
  readableLogTimestamp,
  summarizeHttpAccessLog,
  toParsedLogLines,
} from './log-entries';

const NOW = new Date(2026, 9, 29, 20, 30, 0).getTime();
const OPTIONS = {
  fallbackSource: 'pubsub-consumer',
  locale: 'en-US',
  nowMs: NOW,
};

describe('parseLogEntryTime', () => {
  it.each([
    ['1793280019429.226', 1793280019429.226],
    ['1793280019', 1793280019000],
    ['1793280019429226', 1793280019429.226],
    ['1793280019429226000', 1793280019429.226],
    ['2026-10-29T16:20:19.000Z', Date.UTC(2026, 9, 29, 16, 20, 19)],
  ])('reads %s', (value, expected) => {
    expect(parseLogEntryTime(value)).toBeCloseTo(expected, 0);
  });

  it.each([undefined, '', 'soon'])('ignores %o', (value) => {
    expect(parseLogEntryTime(value)).toBeUndefined();
  });
});

describe('formatLogTime', () => {
  it('names today and yesterday', () => {
    expect(
      formatLogTime(new Date(2026, 9, 29, 20, 20, 19).getTime(), NOW, 'en-US'),
    ).toBe('Today 20:20:19');
    expect(
      formatLogTime(new Date(2026, 9, 28, 9, 5, 2).getTime(), NOW, 'en-US'),
    ).toBe('Yesterday 09:05:02');
  });

  it('shows the date for older lines and the year across years', () => {
    expect(
      formatLogTime(new Date(2026, 9, 25, 14, 3, 11).getTime(), NOW, 'en-US'),
    ).toBe('Oct 25, 14:03:11');
    expect(
      formatLogTime(new Date(2025, 11, 31, 23, 0, 0).getTime(), NOW, 'en-US'),
    ).toBe('Dec 31, 2025, 23:00:00');
  });
});

describe('toParsedLogLines', () => {
  const at = String(new Date(2026, 9, 29, 20, 20, 19).getTime());

  it('pulls the message out of a JSON payload and drops the Go timestamp', () => {
    const [line] = toParsedLogLines(
      [
        {
          line: '2026/10/29 20:20:19 [postRequestForm] Response from API: {"ok":1,"message":"Pembayaran Berhasil Diterima"}',
          severity: 'INFO',
          time: at,
          source: 'bbo-pubsub-consumer-01',
        },
      ],
      OPTIONS,
    );

    expect(line?.message).toBe('Pembayaran Berhasil Diterima');
    expect(line?.jsonPayload).toEqual({
      ok: 1,
      message: 'Pembayaran Berhasil Diterima',
    });
    expect(line?.jsonPrefix).toBe('[postRequestForm] Response from API:');
    expect(line?.timestamp).toBe('Today 20:20:19');
    expect(line?.level).toBe('info');
    expect(line?.sourceLabel).toBe('bbo-pubsub-consumer-01');
    expect(line?.raw).toContain('2026/10/29 20:20:19');
  });

  it('keeps the more severe of the stamped severity and the text', () => {
    const [stampedInfo, stampedError] = toParsedLogLines(
      [
        {
          line: 'payment failed with error: timeout',
          severity: 'INFO',
          time: at,
        },
        { line: 'worker stopped', severity: 'ERR', time: at },
      ],
      OPTIONS,
    );

    expect(stampedInfo?.level).toBe('error');
    expect(stampedError?.level).toBe('error');
  });

  it('falls back to the given source and keeps repeated lines distinct', () => {
    const lines = toParsedLogLines(
      [
        { line: 'Print Response Status: 200 OK', time: at },
        { line: 'Print Response Status: 200 OK', time: at },
      ],
      OPTIONS,
    );

    expect(lines.map((line) => line.sourceLabel)).toEqual([
      'pubsub-consumer',
      'pubsub-consumer',
    ]);
    expect(new Set(lines.map((line) => line.id)).size).toBe(2);
  });

  it('counts lines per level', () => {
    const counts = countLogLevels(
      toParsedLogLines(
        [
          { line: 'ok', severity: 'info' },
          { line: 'disk almost full', severity: 'warning' },
          { line: 'ok again', severity: 'info' },
        ],
        OPTIONS,
      ),
    );

    expect(Object.fromEntries(counts)).toEqual({ info: 2, warn: 1 });
  });

  it('numbers rows from the start of their page', () => {
    const lines = toParsedLogLines([{ line: 'a' }, { line: 'b' }], {
      ...OPTIONS,
      lineOffset: 200,
    });

    expect(lines.map((line) => line.lineNumber)).toEqual([201, 202]);
  });
});

describe('readableLogTimestamp', () => {
  it('reads an ISO time as local time', () => {
    const at = new Date(2026, 9, 29, 15, 24, 12).toISOString();
    expect(readableLogTimestamp(at, NOW, 'en-US')).toBe('Today 15:24:12');
  });

  it.each([
    ['a syslog time without a year', 'Oct 29 14:00:01'],
    ['an already readable time', 'Today 15:24:12'],
    ['nothing', undefined],
  ])('leaves %s alone', (_, value) => {
    expect(readableLogTimestamp(value, NOW, 'en-US')).toBe(value);
  });
});

describe('stderr severity', () => {
  it('reads the level from the text for lines stamped by their stream', () => {
    const lines = toParsedLogLines(
      [
        {
          line: '#29 exporting layers done',
          severity: 'ERROR',
          stream: 'stderr',
        },
        {
          line: 'ERROR: failed to solve: process did not complete',
          severity: 'ERROR',
          stream: 'stderr',
        },
        { line: 'worker stopped', severity: 'ERROR', stream: 'stdout' },
      ],
      OPTIONS,
    );

    expect(lines.map((line) => line.level)).toEqual(['info', 'error', 'error']);
  });
});

describe('summarizeHttpAccessLog', () => {
  it('reads a Caddy access log line', () => {
    expect(
      summarizeHttpAccessLog({
        msg: 'handled request',
        request: { method: 'get', host: 'api.example.com', uri: '/v1/users' },
        status: 502,
        duration: 1.2371,
      }),
    ).toEqual({
      message: 'GET api.example.com/v1/users → 502 · 1.24 s',
      level: 'error',
      host: 'api.example.com',
    });
  });

  it.each([
    [200, 'info'],
    [304, 'info'],
    [404, 'warn'],
    [503, 'error'],
  ])('levels status %i as %s', (status, level) => {
    expect(
      summarizeHttpAccessLog({
        request: { method: 'GET', uri: '/' },
        status,
        duration: 0.0042,
      })?.level,
    ).toBe(level);
  });

  it('shows sub-second durations in milliseconds', () => {
    expect(
      summarizeHttpAccessLog({
        request: { method: 'POST', uri: '/hook' },
        status: 204,
        duration: 0.0042,
      })?.message,
    ).toBe('POST /hook → 204 · 4 ms');
  });

  it.each([
    ['plain JSON', { message: 'hello' }],
    ['no status', { request: { method: 'GET', uri: '/' } }],
    ['not an object', 'GET / 200'],
  ])('leaves %s alone', (_, payload) => {
    expect(summarizeHttpAccessLog(payload)).toBeUndefined();
  });

  it('summarises access lines in the parsed rows', () => {
    const [line] = toParsedLogLines(
      [
        {
          line: '{"level":"info","msg":"handled request","request":{"method":"GET","host":"app.example.com","uri":"/health"},"status":404,"duration":0.01}',
        },
      ],
      OPTIONS,
    );

    expect(line?.message).toBe('GET app.example.com/health → 404 · 10 ms');
    expect(line?.level).toBe('warn');
    expect(line?.sourceLabel).toBe('app.example.com');
    expect(line?.jsonLabel).toBe('HTTP');
  });

  // The logs API splits Caddy's JSON into a message and fields: the line is
  // "handled request" and the request is in the attributes. Shapes taken
  // from load balancer 31 and application 25 on production.
  it('summarises an access line whose fields arrive beside it', () => {
    const attributes = {
      bytes_read: 0,
      dpanel_agent_id: '42',
      dpanel_event_type: 'var_log',
      duration: 0.147857207,
      host_name: 'dpanel-wordpress',
      log_file_path: '/var/log/caddy/dbmanager.devetek.app.log',
      log_severity: 'INFO',
      logger: 'http.log.access.log4',
      otel_library_name: 'dpanel',
      request: {
        host: 'dbmanager.devetek.app',
        method: 'GET',
        uri: '/api/info',
        remote_ip: '203.0.113.9',
      },
      service_name: 'dpanel-agent',
      size: 8161,
      status: 200,
      ts: 1793566603.83,
    };

    const [line] = toParsedLogLines(
      [
        {
          line: 'handled request',
          severity: 'INFO',
          fields: logEntryFields(attributes),
        },
      ],
      OPTIONS,
    );

    expect(line?.message).toBe(
      'GET dbmanager.devetek.app/api/info → 200 · 148 ms',
    );
    expect(line?.level).toBe('info');
    expect(line?.sourceLabel).toBe('dbmanager.devetek.app');
    // The details show the event, not the shipping.
    expect(line?.jsonPayload).toEqual({
      msg: 'handled request',
      bytes_read: 0,
      duration: 0.147857207,
      logger: 'http.log.access.log4',
      request: attributes.request,
      size: 8161,
      status: 200,
    });
    expect(line?.searchText).toContain('/api/info');
  });

  it('reads flattened request fields too', () => {
    expect(
      summarizeHttpAccessLog({
        request_method: 'post',
        request_host: 'api.example.com',
        request_uri: '/login',
        status: 502,
        duration: 1.5,
      }),
    ).toEqual({
      message: 'POST api.example.com/login → 502 · 1.50 s',
      level: 'error',
      host: 'api.example.com',
    });
  });

  it('shows the fields of a structured app log that is not an access line', () => {
    const [line] = toParsedLogLines(
      [
        {
          line: 'connection opened',
          severity: 'INFO',
          fields: logEntryFields({
            caller: 'client/ssh.go:88',
            server_id: 113,
            dpanel_application_id: '25',
            host_name: 'dpanel-wordpress',
          }),
        },
      ],
      OPTIONS,
    );

    expect(line?.message).toBe('connection opened');
    expect(line?.jsonPayload).toEqual({
      msg: 'connection opened',
      caller: 'client/ssh.go:88',
      server_id: 113,
    });
  });
});

describe('logEntryFields', () => {
  it('drops pipeline attributes and keeps the event', () => {
    expect(
      logEntryFields({
        dpanel_machine_id: '113',
        otel_library_version: '1',
        service_name: 'dpanel-app-25',
        systemd_unit: 'devetek-db-manager.service',
        log_severity: 'WARN',
        status: 404,
        user_id: 'abc',
      }),
    ).toEqual({ status: 404, user_id: 'abc' });
  });

  it('returns nothing when only pipeline attributes are left', () => {
    expect(logEntryFields({ host_name: 'h', dpanel_agent_id: '1' })).toBe(
      undefined,
    );
    expect(logEntryFields(null)).toBe(undefined);
  });
});
