import { z } from 'zod';

/**
 * One bucket of fleet-wide resource usage. `avg` is the mean across the
 * machines reporting in that bucket; `max` is the worst single machine. Both
 * are carried because a fleet mean hides the one machine that was saturated.
 */
export const schemaFleetUtilisationPointV2 = z.object({
  timestamp: z.string(),
  machines: z.number().optional(),
  cpu_avg: z.number().optional(),
  cpu_max: z.number().optional(),
  memory_avg: z.number().optional(),
  memory_max: z.number().optional(),
  disk_avg: z.number().optional(),
  disk_max: z.number().optional(),
});

/** The machine that drove a metric's worst reading in the window. */
export const schemaFleetUtilisationPeakV2 = z.object({
  machine_id: z.string().optional(),
  machine_hostname: z.string().optional(),
  percent: z.number().optional(),
});

/**
 * Fleet resource history. Points are contiguous and ordered oldest first,
 * with empty buckets included, so a chart can plot them without filling gaps.
 */
export const schemaFleetUtilisationV2 = z.object({
  bucket: z.string().optional(),
  window_start: z.string().optional(),
  window_end: z.string().optional(),
  points: z.array(schemaFleetUtilisationPointV2).optional(),
  peak: z.record(z.string(), schemaFleetUtilisationPeakV2).optional(),
  machines: z.number().optional(),
  /** False when nothing reported, which is not the same as every machine at zero. */
  has_data: z.boolean().optional(),
});

export type FleetUtilisationPointV2 = z.infer<
  typeof schemaFleetUtilisationPointV2
>;
export type FleetUtilisationPeakV2 = z.infer<
  typeof schemaFleetUtilisationPeakV2
>;
export type FleetUtilisationV2 = z.infer<typeof schemaFleetUtilisationV2>;
