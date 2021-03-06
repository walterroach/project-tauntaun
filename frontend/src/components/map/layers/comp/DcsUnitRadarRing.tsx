import React, { ReactElement } from 'react';

import { Unit, getStaticUnit, DcsStaticDataStateContainer } from '../../../../models';
import { CategoryContext } from '../contexts';
import { ThreatCircle } from '../markers/ThreatCircle';
import { CoalitionContext } from '..';

export type DcsUnitRadarRingProps = {
  unit: Unit;
};

export function DcsUnitRadarRing(props: DcsUnitRadarRingProps): ReactElement {
  const { unit } = props;
  const { dcsStaticData } = DcsStaticDataStateContainer.useContainer();

  const groupCategory = React.useContext(CategoryContext);

  const { sessionCoalition, groupCoalition } = React.useContext(CoalitionContext);
  const isSameCoalition = sessionCoalition === groupCoalition;

  const staticUnit = getStaticUnit(dcsStaticData, groupCategory, unit);
  const detectionRange = staticUnit ? +staticUnit.detection_range : 0;

  return (
    <ThreatCircle
      radius={detectionRange}
      position={unit.position}
      color={isSameCoalition ? 'cyan' : 'orange'}
      weight={2}
    />
  );
}
