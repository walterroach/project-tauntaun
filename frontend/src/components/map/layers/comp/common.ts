import { Group, Unit } from '../../../../models/dcs';
import { DcsStaticData } from '../../../../models/dcs_static';
import { getStaticUnit } from '../../../../models/dcs_util';

export type UnitWithRange = {
  range: number;
  unit: Unit;
};

export function unitsWithPropGreaterThanZero(
  dcsStaticData: DcsStaticData,
  group: Group,
  groupCategory: string,
  prop: string
) {
  const getProp = (unit: Unit, prop: string) => {
    const staticUnit = getStaticUnit(dcsStaticData, groupCategory, unit);
    return staticUnit ? staticUnit[prop] : 0;
  };

  return group.units
    .map(unit => ({ range: getProp(unit, prop), unit: unit } as UnitWithRange))
    .filter(kv => kv.range > 0);
}
