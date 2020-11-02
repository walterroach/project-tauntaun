import React, { ReactElement } from 'react';

import { Unit, getStaticUnit, AppStateContainer } from '../../../../models';
import { CategoryContext } from '../contexts';
import { ThreatCircle } from '../markers/ThreatCircle';
import { CoalitionContext } from '..';

export type DcsUnitThreatRingProps = {
  unit: Unit;
};

export function DcsUnitThreatRing(props: DcsUnitThreatRingProps): ReactElement {
  const { coalition } = AppStateContainer.useContainer();
  const { unit } = props;
  const groupCategory = React.useContext(CategoryContext);

  const groupCoalition = React.useContext(CoalitionContext);
  const isSameCoalition = coalition === groupCoalition;

  const staticUnit = getStaticUnit(groupCategory, unit);
  const airWeaponRange = staticUnit ? +staticUnit.air_weapon_dist : 0;

  return (
    <ThreatCircle
      radius={airWeaponRange}
      position={unit.position}
      color={isSameCoalition ? 'blue' : 'red'}
      weight={3}
    />
  );
}