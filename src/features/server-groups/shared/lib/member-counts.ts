interface GroupDetailLike {
  id?: string;
  members?: Array<unknown>;
}

export function buildHostGroupMemberCountMap(groups: GroupDetailLike[]) {
  return groups.reduce<Record<string, number>>((acc, group) => {
    if (!group.id || !group.members) return acc;

    acc[group.id] = group.members.length;
    return acc;
  }, {});
}
