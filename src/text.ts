// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

import { Coordinates, Place, Text3d, Text3dBatch, Vector3d } from "@wwtelescope/engine";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";

function placeForObject(object: SolarSystemObjects): Place {
  const place = new Place();
  // For creating a place based on a name, WWT requires that the name be capitalized
  let name = SolarSystemObjects[object];
  name = name.charAt(0).toUpperCase() + name.slice(1);
  place.set_names([name]);
  place.set_classification(Classification.solarSystem);
  place.set_target(object);
  return place;
}

function textOverlayForSolarSystemObject(object: SolarSystemObjects, text: string, glyphHeight: number): Text3d {
  const scale = 0.00018;
  const up = Vector3d.create(0, 1, 0);

  const place = placeForObject(object);
  const ra = place.get_RA();
  const location = Coordinates.raDecTo3d(place.get_RA(), place.get_dec());
  return new Text3d(location, up, text, glyphHeight, scale);

}

export function makeTextOverlays(): Text3dBatch {
  console.log("makeTextOverlays");
  const glyphHeight = 75 * 0.5;
  const batch = new Text3dBatch(glyphHeight);
  const values = Object.keys(SolarSystemObjects).filter(key => !isNaN(Number(key)))
  console.log(values);
  values.forEach(object => {
    console.log(object);
    if (Number(object) >= SolarSystemObjects.earth) {
      return;
    }
    batch.add(textOverlayForSolarSystemObject(object, glyphHeight));
  });
  return batch;
}
