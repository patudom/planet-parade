import { Ref, ref, computed } from "vue";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { Place} from "@wwtelescope/engine";
import { AltAzRad, EquatorialRad, LocationDeg, LocationRad } from "./types";
import { equatorialToHorizontal } from "./utils";
import { D2R } from "@cosmicds/vue-toolkit";
import { engineStore } from "@wwtelescope/engine-pinia";
type WWTEngineStore = ReturnType<typeof engineStore>;


const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;

const secondsInterval = 40;
const MILLISECONDS_PER_INTERVAL = 1000 * secondsInterval;

export function useSun(store: WWTEngineStore, location: Ref<LocationDeg>, _selectedTime: Ref<number> | number, _selectedTimezoneOffset: Ref<number> | number) {
  
  store.waitForReady().then(async ()=>{
    // setup any watchers here
  });
  
  const selectedTime = ref(_selectedTime);
  const selectedTimezoneOffset = ref(_selectedTimezoneOffset);
  
  const locationRad = computed<LocationRad>(() => {
    return {
      latitudeRad: location.value.latitudeDeg * D2R,
      longitudeRad: location.value.longitudeDeg * D2R,
    };
  });

  const sunPlace = new Place();
  sunPlace.set_names(["Sun"]);
  sunPlace.set_classification(Classification.solarSystem);
  sunPlace.set_target(SolarSystemObjects.sun);
  sunPlace.set_zoomLevel(20);
  
  const sunPosition = computed<EquatorialRad>(() =>{
    return {
      raRad: sunPlace.get_RA() * 15 * D2R,
      decRad: sunPlace.get_dec() * D2R,
    } as EquatorialRad;
  });

  function getSunPositionAtTime(time: Date): AltAzRad {
    const sunAltAz = equatorialToHorizontal(sunPosition.value.raRad, sunPosition.value.decRad, locationRad.value.latitudeRad, locationRad.value.longitudeRad, time);
    return sunAltAz;
  }

  // function that finds at what time the sun will reach a given altitude during the current day to within 15 minutes
  function getTimeforSunAlt(altDeg: number): { rising: number | null; setting: number | null; } {
    // takes about 45ms to run
    // search for time when sun is at given altitude
    // start at 12:00am and search every MINUTES_PER_INTERVAL
    const minTime = selectedTime.value - (selectedTime.value % MILLISECONDS_PER_DAY) - selectedTimezoneOffset.value + MILLISECONDS_PER_DAY * 0.5;
    const maxTime = minTime + MILLISECONDS_PER_DAY * 0.5;
    // const ehr = eclipticHorizonAngle(location.latitudeRad, dateTime);
    let time = minTime;
    let sunAlt = getSunPositionAtTime(new Date(time)).altRad; // negative
    // find the two times it crosses the given altitude
    while ((sunAlt < altDeg * D2R) && (time < maxTime)) {
      time += MILLISECONDS_PER_INTERVAL;
      sunAlt = getSunPositionAtTime(new Date(time)).altRad;
    }
    const rising = time == maxTime ? null : time;
    while ((sunAlt > altDeg * D2R) && (time < maxTime)) {
      time += MILLISECONDS_PER_INTERVAL;
      sunAlt = getSunPositionAtTime(new Date(time)).altRad;
    }
    const setting = time == maxTime ? null : time;

    return {
      'rising': (rising !== null && setting !== null) ? Math.min(rising, setting) : rising,
      'setting': (rising !== null && setting !== null) ? Math.max(rising, setting) : setting
    };
  }
  
  
  return { getTimeforSunAlt, getSunPositionAtTime, sunPlace, sunPosition };
}
