/**
 * Names that never point at a server on the internet: reserved (RFC 2606,
 * RFC 6761), mDNS and home-network names. The API refuses the same ones.
 */
const UNREACHABLE_HOST_SUFFIXES = [
  'localhost',
  'example',
  'invalid',
  'test',
  'local',
  'internal',
  'lan',
  'home.arpa',
  'example.com',
  'example.net',
  'example.org',
];

type Octets = [number, number, number, number];

function ipv4Octets(value: string): Octets | null {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(value);
  if (!match) return null;
  const octets: Octets = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
  ];
  return octets.every((octet) => octet <= 255) ? octets : null;
}

function isUnreachableIPv4([a, b, c]: Octets) {
  return (
    a === 0 || // "this network", including 0.0.0.0
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // shared address space (CGNAT)
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224 // multicast and reserved
  );
}

/**
 * Whether dPanel can never reach `address` over SSH from the internet: the
 * unspecified address, loopback, a private network (LAN), shared or
 * documentation ranges, link-local, or a reserved name. Such machines join
 * with the agent install command instead.
 */
export function isUnreachableServerAddress(address: string) {
  const host = address.trim().toLowerCase().replace(/\.$/, '');
  if (!host) return false;

  if (
    UNREACHABLE_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    )
  ) {
    return true;
  }

  const octets = ipv4Octets(host);
  if (octets) return isUnreachableIPv4(octets);

  const ipv6 = host.replace(/^\[|\]$/g, '');
  if (ipv6.includes(':')) {
    return (
      ipv6 === '::' ||
      ipv6 === '::1' ||
      /^f[cd][0-9a-f]{0,2}:/.test(ipv6) || // unique local fc00::/7
      /^fe[89ab][0-9a-f]?:/.test(ipv6) || // link-local fe80::/10
      /^ff[0-9a-f]{0,2}:/.test(ipv6) || // multicast
      ipv6.startsWith('2001:db8:')
    );
  }
  return false;
}
