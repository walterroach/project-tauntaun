import React, { useMemo } from 'react';
import { LatLng, Polyline, Marker, divIcon } from 'leaflet';
import { useMap, PolylineProps } from 'react-leaflet';

export type EditablePolylineProps = PolylineProps & {
  onPositionInserted?: (index: number, pos: LatLng) => void;
  onPositionModified?: (index: number, pos: LatLng) => void;
  onPositionRemoved?: (index: number) => void;
  onPositionClicked?: (index: number) => void;
  drawMarkers?: boolean;
  drawMidmarkers?: boolean;
  disableWpZero?: boolean;
};

function editablePolylineCtor(map: any, props: EditablePolylineProps) {
  const {
    color,
    stroke,
    weight,
    opacity,
    dashArray,
    onPositionInserted,
    onPositionModified,
    onPositionRemoved,
    onPositionClicked
  } = props;
  const positions = props.positions as LatLng[];

  const drawMarkers = props.drawMarkers !== undefined ? props.drawMarkers : true;
  const drawMidmarkers = props.drawMidmarkers !== undefined ? props.drawMidmarkers : true;
  const disableWpZero = props.disableWpZero !== undefined ? props.disableWpZero : false;

  let polyline: Polyline | null = null;
  let markers = [] as Marker[];
  let mid_markers = [] as Marker[];
  let dragging = false;

  const onDragStart = () => {
    dragging = true;
  };

  const onDrag = (index: number, e: any) => {
    if (polyline === null) return;

    const polylineLatLngs = polyline.getLatLngs();
    polylineLatLngs[index] = e.target._latlng;
    positions[index].lat = e.target._latlng.lat;
    positions[index].lng = e.target._latlng.lng;
    polyline.setLatLngs(polylineLatLngs);
    if (index !== markers.length - 1) {
      updateMidMarker(index);
    }
    if (index !== 0) {
      updateMidMarker(+index - 1);
    }
  };

  const onContextMenu = (index: number, e: any) => {
    if (markers.length < 3) {
      return;
    }

    if (disableWpZero && index === 0) {
      return;
    }

    positions.splice(index, 1);
    createMarkers();
    createPolyline();

    onPositionRemoved?.(index);
  };

  const onMidDragStart = (index: number, e: any) => {
    if (polyline === null) return;

    const polylineLatLngs = polyline.getLatLngs();
    polylineLatLngs.splice(index + 1, 0, e.target._latlng);
    polyline.setLatLngs(polylineLatLngs);
  };

  const onMidDrag = (index: number, e: any) => {
    if (polyline === null) return;

    const polylineLatLngs = polyline.getLatLngs();
    polylineLatLngs[index + 1] = e.target._latlng;
    polyline.setLatLngs(polylineLatLngs);
  };

  const onMidDragEnd = (index: number, e: any) => {
    const latlng = e.target._latlng;
    positions.splice(index + 1, 0, latlng);
    createMarkers();

    onPositionInserted?.(index + 1, latlng);
  };

  const updateMidMarker = (index: number) => {
    if (!drawMidmarkers) {
      return;
    }

    const a = markers[+index].getLatLng();
    const b = markers[+index + 1].getLatLng();
    const mid = new LatLng((a.lat + b.lat) / 2.0, (a.lng + b.lng) / 2.0);
    mid_markers[index].setLatLng(mid);
  };

  const onMarkerClick = (index: number, e: any) => {
    if (dragging) {
      dragging = false;
      return;
    }

    onPositionClicked?.(index);
  };

  const clearMarkers = () => {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    mid_markers.forEach(m => map.removeLayer(m));
    mid_markers = [];
  };

  const createPolyline = () => {
    if (polyline !== null) {
      map.removeLayer(polyline);
    }
    polyline = new Polyline(positions, {
      color: color,
      weight: weight,
      opacity: opacity,
      interactive: false,
      stroke: stroke,
      dashArray: dashArray
    }).addTo(map);
  };

  const clearPolyline = () => {
    map.removeLayer(polyline);
  };

  const createMarkers = () => {
    clearMarkers();

    if (!drawMarkers) {
      return;
    }

    const markerIcon = divIcon({ className: 'pl-marker-icon' });
    for (const index in positions) {
      const isAtWpZeroAndDisabled = disableWpZero && +index === 0;
      markers[index] = new Marker(positions[index], { draggable: !isAtWpZeroAndDisabled, icon: markerIcon }).addTo(map);

      if (!isAtWpZeroAndDisabled) {
        markers[index].on('dragstart', onDragStart);
        markers[index].on('dragend', e => onPositionModified?.(+index, e.target._latlng));
        markers[index].on('drag', e => onDrag(+index, e));
        markers[index].on('contextmenu', e => onContextMenu(+index, e));
      }
      markers[index].on('mouseup', e => onMarkerClick(+index, e));
    }

    if (drawMidmarkers) {
      const midMarkerIcon = divIcon({ className: 'pl-mid-marker-icon' });
      for (let index = 0; index < positions.length - 1; ++index) {
        const a = positions[index];
        const b = positions[index + 1];
        const mid = new LatLng((a.lat + b.lat) / 2.0, (a.lng + b.lng) / 2.0);
        mid_markers[index] = new Marker(mid, { draggable: true, icon: midMarkerIcon }).addTo(map);
        const index_const = +index;
        mid_markers[index].on('dragstart', e => onMidDragStart(index_const, e));
        mid_markers[index].on('drag', e => onMidDrag(index_const, e));
        mid_markers[index].on('dragend', e => onMidDragEnd(index_const, e));
      }
    }
  };

  const dtor = () => {
    clearMarkers();
    clearPolyline();
  };

  createPolyline();
  createMarkers();

  return dtor;
}

export function EditablePolylineNonMemo(props: EditablePolylineProps) {
  // https://github.com/bbecquet/Leaflet.PolylineDecorator
  const map = useMap();

  React.useEffect(() => {
    if (!map) {
      console.error('Map is undefined!');
      return;
    }

    return editablePolylineCtor(map, props);
  });

  return null;
}

export function EditablePolyline(props: EditablePolylineProps) {
  const { drawMarkers, positions } = props;
  const latLngArray = JSON.stringify(positions as LatLng[]);

  const memorizedItem = useMemo(() => <EditablePolylineNonMemo {...props} />, [drawMarkers, latLngArray]);

  return memorizedItem;
}