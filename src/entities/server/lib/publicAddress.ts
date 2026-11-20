/**
 * IPv4 ranges the internet cannot route to: private networks, carrier-grade
 * NAT, loopback, link-local, "this network", benchmarking, and multicast or
 * reserved space. Each entry is [first octet, second octet low, second octet
 * high]; undefined bounds match any second octet.
 */
const NON_PUBLIC_IPV4: Array<[number, number?, number?]> = [
  [0],
  [10],
  [100, 64, 127],
  [127],
  [169, 254, 254],
  [172, 16, 31],
  [192, 168, 168],
  [198, 18, 19],
];

function parseIPv4(value: string) {
  const parts = value.split('.');
  if (parts.length !== 4) return undefined;

  const octets = parts.map((part) =>
    /^\d{1,3}$/.test(part) ? Number(part) : Number.NaN,
  );
  if (octets.some((octet) => Number.isNaN(octet) || octet > 255)) {
    return undefined;
  }
  return octets;
}

/**
 * True when address is one the internet can reach. A cloud VM created
 * without a public IP is recorded with its private one (an AWS VM showed
 * 10.88.31.75 as its "Public address", 2026-11-20), so a private, shared or
 * local address is never public. Anything that is not an IP, such as a
 * hostname, is taken as given.
 */
export function isPublicAddress(address?: string) {
  const value = String(address ?? '').trim();
  if (!value) return false;

  const ipv4 = parseIPv4(value);
  if (ipv4) {
    const [first = 0, second = 0] = ipv4;
    if (first >= 224) return false;
    return !NON_PUBLIC_IPV4.some(
      ([a, low, high]) =>
        first === a &&
        (low === undefined || (second >= low && second <= (high ?? low))),
    );
  }

  if (value.includes(':')) {
    const ipv6 = value.toLowerCase();
    return !(
      ipv6 === '::' ||
      ipv6 === '::1' ||
      ipv6.startsWith('fc') ||
      ipv6.startsWith('fd') ||
      ipv6.startsWith('fe80')
    );
  }

  return true;
}
