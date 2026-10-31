/** Turns a tool identifier such as "dns_record_list" into "dns record list". */
export function toolLabel(name: string) {
  return name.replace(/[_-]+/g, ' ').trim();
}
