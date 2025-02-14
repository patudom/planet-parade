// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/* eslint-disable */

import { Coordinates, Place, RenderContext, SpaceTimeController, Text3d, Text3dBatch, Vector3d } from "@wwtelescope/engine";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";

function nameForObject(object: SolarSystemObjects): string {
  // For creating a place based on a name, WWT requires that the name be capitalized
  let name = SolarSystemObjects[object];
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return name;
}

function placeForObject(object: SolarSystemObjects): Place {
  const place = new Place();
  const name = nameForObject(object);
  place.set_names([name]);
  place.set_classification(Classification.solarSystem);
  place.set_target(object);
  return place;
}

const maxFOV = 90;
const minFOV = 0.1;
const maxFactor = 0.9;
const minFactor = 0.1;
const gMax = Math.log(maxFactor / (1 - maxFactor));
const gMin = Math.log(minFactor/ (1 - minFactor));
const b = (gMax - gMin) / (maxFOV - minFOV);
const a = gMax - b * maxFOV;

const planetTextOffsetsY = [
  115,  // Sun
  -60,  // Mercury
  130,  // Venus
  100,  // Mars
  250,  // Jupiter
  240,  // Saturn
  180,  // Uranus
  180,  // Neptune
  100,  // Pluto
  -70,  // Moon
];

const planetTextOffsetsX = [
  85,  // Sun
  -275,  // Mercury
  0,  // Venus
  0,  // Mars
  0,  // Jupiter
  0,  // Saturn
  0,  // Uranus
  0,  // Neptune
  0,  // Pluto
  0,  // Moon
];

function textOverlayForSolarSystemObject(renderContext: RenderContext, object: SolarSystemObjects, text: string, glyphHeight: number): Text3d {
  const zoom = renderContext.viewCamera.zoom;
  const fov = zoom / 6;
  const exp = Math.exp(a + b * fov);
  const scale = 0.0002 * ((1.4 * exp / (1 + exp)) + 1);
  const sign = SpaceTimeController.get_location().get_lat() < 0 ? -1 : 1;
  const up = Vector3d.create(0, sign, 0);

  const place = placeForObject(object);
  const location = Coordinates.raDecTo3d(place.get_RA(), place.get_dec());
  location.y -= planetTextOffsetsY[object] * scale ?? 0.035;
  location.x -= planetTextOffsetsX[object] * scale ?? 0;
  return new Text3d(location, up, text, glyphHeight, scale);
}

export function makeTextOverlays(renderContext: RenderContext): Text3dBatch {
  const glyphHeight = 75 * 0.5;
  const batch = new Text3dBatch(glyphHeight);
  const values = Object.keys(SolarSystemObjects).filter(key => !isNaN(Number(key)))
  values.forEach(object => {
    if (Number(object) <= SolarSystemObjects.moon) {
      const name = nameForObject(object);
      const text = textOverlayForSolarSystemObject(renderContext, object, name, glyphHeight);
      batch.add(text);
    }
  });
  return batch;
}
