import type {
  SizeChoice,
  SizeType,
} from '@/shared/api/cloud.project.sizes.$id';

export function findSize(sizes: SizeChoice[], cpu: number, memoryGB: number) {
  return sizes.find((size) => size.vcpu === cpu && size.memory_gb === memoryGB);
}

export function cpuAvailable(sizes: SizeChoice[], cpu: number) {
  return sizes.some((size) => size.vcpu === cpu);
}

export function memoryAvailable(
  sizes: SizeChoice[],
  cpu: number,
  memoryGB: number,
) {
  return findSize(sizes, cpu, memoryGB) != null;
}

/**
 * Returns the pair the provider can serve that is closest to the requested
 * one. The dimension the user just moved is kept when possible and the other
 * one follows, preferring the nearest larger value.
 */
export function snapSize(
  sizes: SizeChoice[],
  cpu: number,
  memoryGB: number,
  moved: 'cpu' | 'memory',
): SizeChoice | undefined {
  const exact = findSize(sizes, cpu, memoryGB);
  if (exact || sizes.length === 0) return exact ?? undefined;

  const keep = sizes.filter((size) =>
    moved === 'cpu' ? size.vcpu === cpu : size.memory_gb === memoryGB,
  );
  const pool = keep.length > 0 ? keep : sizes;
  const distance = (size: SizeChoice) => {
    const cpuGap = Math.abs(Math.log2(size.vcpu) - Math.log2(cpu));
    const memoryGap = Math.abs(Math.log2(size.memory_gb) - Math.log2(memoryGB));
    const larger = size.vcpu >= cpu && size.memory_gb >= memoryGB ? 0 : 0.01;
    return cpuGap + memoryGap + larger;
  };

  return [...pool].sort((a, b) => distance(a) - distance(b))[0];
}

export function formatGB(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function sizeTypeSpecs(item: SizeType) {
  return `${item.vcpu} vCPU · ${formatGB(item.memory_gb)} GB RAM`;
}
