import React from 'react';

import { EditablePolyline } from '.';
import { Group, AppStateContainer } from '../models';
import { LatLng } from 'leaflet';
import { gameService } from '../services';

export type GroupRouteProps = {
  group: Group;
};

export function GroupRoute(props: GroupRouteProps) {
  const appState = AppStateContainer.useContainer();

  const { group } = props;
  const positions = group.points.map(point => new LatLng(point.position.lat, point.position.lon));

  const handlePositionInserted = (index: number, pos: LatLng) => {
    const oldPoint = group.points[index];

    gameService.sendRouteInsertAt(group, oldPoint.position, {
      lat: pos.lat,
      lon: pos.lng
    });

    console.log('Point inserted.');
  };

  const handlePositionModified = (index: number, pos: LatLng) => {
    const oldPoint = group.points[index];

    gameService.sendRouteModify(group, oldPoint.position, {
      ...oldPoint,
      position: {
        lat: pos.lat,
        lon: pos.lng
      }
    });

    console.log('Point modified.');
  };

  const handlePositionRemoved = (index: number) => {
    const oldPoint = group.points[index];

    gameService.sendRouteRemove(group, oldPoint.position);

    console.log('Point removed.');
  };

  const handlePositionClicked = (index: number) => {
    if (appState.masterMode && appState.masterMode.name === 'EditGroupMode') {
      appState.selectWaypoint(index);
    }

    console.log('Point clicked.', index);
  };

  return (
    <EditablePolyline
      positions={positions}
      color="#2d4687"
      stroke={true}
      onPositionInserted={handlePositionInserted}
      onPositionModified={handlePositionModified}
      onPositionRemoved={handlePositionRemoved}
      onPositionClicked={handlePositionClicked}
    />
  );
}