<template>
<v-app
  id="app"
  :style="cssVars"
>
  <div
    id="main-content"
  >
    <WorldWideTelescope
      :wwt-namespace="wwtNamespace"
    ></WorldWideTelescope>


    <!-- This contains the splash screen content -->

    <v-overlay
      :model-value="showSplashScreen"
      absolute
      opacity="0.6"
      :style="cssVars"
      id="splash-overlay"
    >
      <div
        id="splash-screen"
        v-click-outside="closeSplashScreen"
        :style="cssVars"
      >
        <font-awesome-icon
          id="close-splash-button"
          @click="closeSplashScreen"
          icon="xmark"
          />
        <div id="splash-screen-text">
          <pp>Want to see the</pp>
          <p class="highlight">Planetary Parade?</p>
        </div>
        <div>
            <v-btn
              class="splash-get-started"
              @click="closeSplashScreen"
              :color="accentColor"
              :density="xSmallSize ? 'compact' : 'default'"
              size="x-large"
              variant="elevated"
              rounded="lg"
            >
              Get Started
            </v-btn>
          </div>
        <div id="splash-screen-acknowledgements" class="small">
          This Data Story is brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
          
          <div id="splash-screen-logos">
            <credit-logos logo-size="5vmin"/>
          </div>
        </div>
      </div>
    </v-overlay>

    <transition name="fade">
      <div
        class="modal"
        id="modal-loading"
        v-show="isLoading"
      >
        <div class="container">
          <div class="spinner"></div>
          <p>Loading …</p>
        </div>
      </div>
    </transition>


    <!-- This block contains the elements (e.g. icon buttons displayed at/near the top of the screen -->

    <div id="top-content">
      <div id="left-buttons">
        <icon-button
          v-model="showTextSheet"
          fa-icon="book-open"
          :color="buttonColor"
          :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
          tooltip-location="start"
        >
        </icon-button>
        <!-- <icon-button
          v-model="showVideoSheet"
          fa-icon="video"
          :color="buttonColor"
          tooltip-text="Watch video"
          tooltip-location="start"
        >
        </icon-button> -->
      </div>
      <div id="center-buttons">
        <icon-button
          v-model="showLocationSelector"
          fa-icon="location-dot"
          :color="buttonColor"
          tooltip-text="Select Location"
          tooltip-location="start"
        ></icon-button>
        <v-dialog
          v-model="showLocationSelector"
          max-width="fit-content"
          transition="slide-y-transition"
        >
          <v-card>
            <font-awesome-icon
              style="position: absolute; right: 12px; top: 12px; cursor: pointer; padding: 1em; margin: -1em; z-index: 1000;"
              icon="xmark"
              size="xl"
              @click="showLocationSelector = false"
              @keyup.enter="showLocationSelector = false"
              tabindex="0"
              color="black"
            ></font-awesome-icon>
            <location-selector
              v-model="selectedLocation"
            />
            <geolocation-button
              id="location"
              :debug="false"
              size="30px"
              density="default"
              elevation="5"
              color="black"
              @location="selectedLocation = {longitudeDeg: $event.longitude, latitudeDeg: $event.latitude}"
            />
          </v-card>
        </v-dialog>
      </div>
      <div id="right-buttons">
        <div id="controls" class="control-icon-wrapper">
          <div id="controls-top-row">
            <font-awesome-icon
              size="lg"
              class="tab-focusable"
              :color="accentColor"
              :icon="showControls ? `chevron-down` : `gear`"
              @click="showControls = !showControls" 
              @keyup.enter="showControls = !showControls"
              tabindex="0" />
          </div>
        
          <div v-if="showControls" id="control-checkboxes">
            <v-checkbox :color="accentColor" v-model="showAltAzGrid" @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Sky Grid" hide-details />
            <v-checkbox :color="accentColor" v-model="showHorizon" @keyup.enter="showHorizon = !showHorizon"
              label="Horizon/Sky" hide-details />
              <v-checkbox :color="accentColor" v-model="showPlanetLabels" @keyup.enter="showPlanetLabels = !showPlanetLabels"
              label="Planet Labels" hide-details />
              <v-checkbox :color="accentColor" v-model="showEcliptic" @keyup.enter="showEcliptic = !showEcliptic"
              label="Ecliptic" hide-details />
              <v-checkbox :color="accentColor" v-model="showConstellations" @keyup.enter="showConstellations = !showConstellations"
              label="Constellations" hide-details />

          </div>
        </div>
      </div>
    </div>


    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

    <div id="bottom-content">
      <div id="time-controls">
        <icon-button
          id="play-pause-button"
          :fa-icon="playing ? 'pause' : 'play'"
          @activate="() => { playing = !playing }"
          :color="accentColor"
          :focus-color="accentColor"
          :tooltip="playing ? 'Pause' : 'Play'"
          tooltip-location="top"
          tooltip-offset="5px"
          faSize="1x"
          :show-tooltip="!mobile"
        ></icon-button>
        <div id="slider">
          <v-slider
            v-model="selectedTime"
            :min="minTime"
            :max="maxTime"
            :color="accentColor"
            :ripple="false"
            hide-details
            track-size="8px"
            thumb-size="20px"
            thumb-label="always"
            :step="millisecondsPerInterval"
            @mousedown="() => { playing = false; }"
            >
            <template v-slot:thumb-label="item">
              {{ toTimeString(new Date(item.modelValue))  }}
            </template>
          </v-slider>
        </div>
      </div>
      <div id="body-logos" v-if="!smallSize">
        <credit-logos/>
      </div>
    </div>


    <!-- This dialog contains the video that is displayed when the video icon is clicked -->

    <v-dialog
      id="video-container"
      v-model="showVideoSheet"
      transition="slide-y-transition"
      fullscreen
    >
      <div class="video-wrapper">
        <font-awesome-icon
          id="video-close-icon"
          class="close-icon"
          icon="times"
          size="lg"
          @click="showVideoSheet = false"
          @keyup.enter="showVideoSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <video
          controls
          id="info-video"
        >
          <source src="" type="video/mp4">
        </video>
      </div>
    </v-dialog>


    <!-- This dialog contains the informational content that is displayed when the book icon is clicked -->

    <v-dialog
      :style="cssVars"
      class="bottom-sheet"
      id="text-bottom-sheet"
      hide-overlay
      persistent
      no-click-animation
      absolute
      width="100%"
      :scrim="false"
      location="bottom"
      v-model="showTextSheet"
      transition="dialog-bottom-transition"
    >
      <v-card height="100%">
        <v-tabs
          v-model="tab"
          height="32px"
          :color="accentColor"
          :slider-color="accentColor"
          id="tabs"
          dense
        >
          <v-tab class="info-tabs" tabindex="0"><h3>Information</h3></v-tab>
          <v-tab class="info-tabs" tabindex="0"><h3>Using WWT</h3></v-tab>
        </v-tabs>
        <font-awesome-icon
          id="close-text-icon"
          class="control-icon"
          icon="times"
          size="lg"
          @click="showTextSheet = false"
          @keyup.enter="showTextSheet = false"
          tabindex="0"
        ></font-awesome-icon>
        <v-window v-model="tab" id="tab-items" class="pb-2 no-bottom-border-radius">
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                <h4>What is the planet parade?</h4>
                <p>
                  During February 2025, seven planets&#8212;Mercury, Saturn, Neptune, Venus, Uranus, Jupiter, and Mars&#8212;will be visible in the night sky all at once!
                </p> 
                <h4>Cool! How do I see it?</h4>
                <p>
                  The best time to see it will be shortly after it gets dark, maybe 20-30 minutes after sunset. In the Northern Hemisphere, you'll want a clear view towards the southern half of the sky, from west to east. 
                </p>
                <p>
                  You can use this resource to simulate the planet parade where you are. Click <font-awesome-icon class="bullet-icon" icon="location-dot"/> in the top-center of the view and choose your location. 
                </p>
                <p>
                  The display defaults to the current date and time. Use the time controls to advance time until the Sun sets.
                  <ul>
                    <li>
                      If <span style="color: var(--accent-color)">Horizon/Sky</span> is checked, you can see the Sun go below the horizon, and the sky will turn dark. 
                    </li>
                    <li>
                      Display the cardinal directions in the view to help orient yourself by checking <span style="color: var(--accent-color)">Sky Grid</span>.
                    </li>
                  </ul>
                </p>
                <h4>Which planets will I be able to see?</h4>
                <p>
                  The planets that will be visible to your eye depends on how dark your night sky is. People in reasonably dark skies will be able to see Mercury, Saturn, Venus, Jupiter, and Mars by eye. Binoculars will help for seeing Uranus. A small telescope may be needed to see Neptune. 
                </p>
                <h4>What is the significance of the planet parade?</h4>
                <p>
                  The planet parade happens when all the planets happen to be on the same side of their orbits around the Sun as Earth, so they all are on Earth's night-time side. (When a planet is on the opposite side of the Sun during Earth, that means it is up in the sky during the day when the Sun outshines it.) 
                </p>
                <p>
                  The planets are also not really all in a line. It only appears that way from Earth because Earth and the other planets all orbit the Sun in roughly the same plane (as if they were on a vinyl record). From Earth's point of view, all the other solar system objects appear to move along a circular path around the sky, which ancient astronomers called the "ecliptic." Check <span style="color: var(--accent-color)">Ecliptic</span> in the control box to display this path in the virtual sky. 
                </p>
                <h4>Will the planets be this big in my sky?</h4>
                <p>
                  Unfortunately, no. We scaled up the size of the planet images so you would be able to see them when zoomed out to a large swath of sky. In reality, the planets will appear in the sky as very small discs or points of light.
                </p>
                <v-spacer class="end-spacer"></v-spacer>
              </v-card-text>
            </v-card>
          </v-window-item>
          <v-window-item>
            <v-card class="no-bottom-border-radius scrollable">
              <v-card-text class="info-text no-bottom-border-radius">
                <v-container>
                  <v-row align="center">
                  <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Pan
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "press + drag" : "click + drag" }}</strong>  {{ touchscreen ? ":" : "or" }}  <strong>{{ touchscreen ? ":" : "W-A-S-D" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row align="center">
                    <v-col cols="4">
                      <v-chip
                        label
                        outlined
                      >
                        Zoom
                      </v-chip>
                    </v-col>
                    <v-col cols="8" class="pt-1">
                      <strong>{{ touchscreen ? "pinch in and out" : "scroll in and out" }}</strong> {{ touchscreen ? ":" : "or" }} <strong>{{ touchscreen ? ":" : "I-O" }}</strong> {{ touchscreen ? ":" : "keys" }}<br>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <div class="credits">
                      <h3>Credits:</h3>
                      <h4><a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">CosmicDS</a> Vue Data Stories Team:</h4>
                      Jon Carifio<br>
                      Pat Udomprasert<br>
                      John Lewis<br>
                      Alyssa Goodman<br>
                      Mary Dussault<br>
                      Harry Houghton<br>
                      Evaluator: Sue Sunbury<br>
                      <br>
                      <h4>WorldWide Telescope Team:</h4>
                      Peter Williams<br>
                      A. David Weigel<br>
                      Jon Carifio<br>
                      </div>
                      <v-spacer class="end-spacer"></v-spacer>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <funding-acknowledgement/>
                    </v-col>
                  </v-row>
                </v-container>              
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
    </v-dialog>

  </div>
</v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { Color, Grids, Place, Planets, Settings, WWTControl } from "@wwtelescope/engine";
import { Classification, SolarSystemObjects } from "@wwtelescope/engine-types";
import { engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, LocationDeg, skyBackgroundImagesets, supportsTouchscreen, blurActiveElement, useWWTKeyboardControls, D2R } from "@cosmicds/vue-toolkit";
import { useDisplay } from "vuetify";
import { formatInTimeZone } from "date-fns-tz";

import { useTimezone } from "./timezones";
import { equatorialToHorizontal, horizontalToEquatorial } from "./utils";
import { resetAltAzGridText, makeAltAzGridText, drawPlanets, renderOneFrame } from "./wwt-hacks";

const SECONDS_PER_DAY = 60 * 60 * 24;
const MILLISECONDS_PER_DAY = 1000 * SECONDS_PER_DAY;
const millisecondsPerInterval = MILLISECONDS_PER_DAY / 48;
const minTime = Date.UTC(2025, 1, 11);
const maxTime = Date.UTC(2025, 2, 1);

type SheetType = "text" | "video";
export interface PlanetParadeProps {
  wwtNamespace?: string;
}

const store = engineStore();

useWWTKeyboardControls(store);

const touchscreen = supportsTouchscreen();
const { smAndDown, smAndUp, xs } = useDisplay();

const _props = withDefaults(defineProps<PlanetParadeProps>(), {
  wwtNamespace: "planet-parade",
});

const splash = new URLSearchParams(window.location.search).get("splash")?.toLowerCase() !== "false";
const showSplashScreen = ref(splash);
const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const sheet = ref<SheetType | null>(null);
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#f4ba3e");
const accentColor2 = ref("#6793ff");
const buttonColor = ref("#f4ba3e");
const tab = ref(0);
const showHorizon = ref(true);
const showAltAzGrid = ref(true);
const showEcliptic = ref(false);
const showLocationSelector = ref(false);
const playing = ref(false);
const showControls = ref(smAndUp.value);
const showConstellations = ref(false);
const showPlanetLabels = ref(true);

const selectedLocation = ref<LocationDeg>({
  longitudeDeg: -71.1056,
  latitudeDeg: 42.3581,
});
const selectedTime = ref(Date.now());
const { selectedTimezone } = useTimezone(selectedLocation);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const wwtSettings: Settings = Settings.get_active();

function doWWTModifications() {

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Grids._makeAltAzGridText = makeAltAzGridText;

  // We need to render one frame ahead of time
  // as there's a lot of setup done on the first frame
  // render that we need to use
  WWTControl.singleton.renderOneFrame();

  const boundRenderOneFrame = renderOneFrame.bind(WWTControl.singleton);
  const newFrameRender = function() { 
    boundRenderOneFrame(
      showHorizon.value,
      showHorizon.value,
      showPlanetLabels.value,
    );
  };

  // as well as our custom text overlays
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  WWTControl.singleton.renderOneFrame = newFrameRender;

  const originalUpdatePlanetLocations = Planets.updatePlanetLocations;
  function newUpdatePlanetLocations(threeD: boolean) {
    originalUpdatePlanetLocations(threeD);
    for (let i = 0; i <= SolarSystemObjects.moon; i++) {
      Planets._planetScales[i] *= 5;
    }
  }
  Planets.updatePlanetLocations = newUpdatePlanetLocations;
  Planets.drawPlanets = drawPlanets;

  // Recall that zoom = 6 * FOV, in WWT
  const maxFOV = 90;
  WWTControl.singleton.set_zoomMax(maxFOV * 6);

}

onMounted(() => {
  store.waitForReady().then(async () => {
    skyBackgroundImagesets.forEach(iset => backgroundImagesets.push(iset));

    // If there are layers to set up, do that here!
    layersLoaded.value = true;

    store.applySetting(["localHorizonMode", true]);
    store.applySetting(["altAzGridColor", Color.fromArgb(180, 133, 201, 254)]);
    store.applySetting(["eclipticColor", Color.fromArgb(180, 255, 255, 255)]);
    store.applySetting(["actualPlanetScale", false]);
    updateAltAzGrid(showAltAzGrid.value);
    updateEcliptic(showEcliptic.value);
    updateConstellations(showConstellations.value);
    updateWWTLocation(selectedLocation.value);

    store.setClockSync(false);
    store.setClockRate(1800);

    doWWTModifications();
    resetCamera().then(() => positionSet.value = true);

    setInterval(() => {
      if (playing.value) {
        const time = store.currentTime;
        selectedTime.value = time.getTime();
      }
    }, 500);

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      if (["Esc", "Escape"].includes(event.key) && showVideoSheet.value) {
        showVideoSheet.value = false;
      }
    });

  });
});

const ready = computed(() => layersLoaded.value && positionSet.value);

/* `isLoading` is a bit redundant here, but it could potentially have independent logic */
const isLoading = computed(() => !ready.value);

// It doesn't really matter which one we note here
const inNorthernHemisphere = computed(() => selectedLocation.value.latitudeDeg > 0);

const dateTime = computed(() => new Date(selectedTime.value));

/* Properties related to device/screen characteristics */
const smallSize = computed(() => smAndDown.value);

const mobile = computed(() => smallSize.value && touchscreen);

const xSmallSize = computed(() => xs.value);

/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    "--accent-color": accentColor.value,
    "--accent-color2": accentColor2.value,
    "--app-content-height": showTextSheet.value ? "66%" : "100%",
  };
});


/**
  Computed flags that control whether the relevant dialogs display.
  The `sheet` data member stores which sheet is open, so these are just
  computed wrappers around modifying/querying that which can be used as
  dialog v-model values
*/
const showTextSheet = computed({
  get() {
    return sheet.value === "text";
  },
  set(_value: boolean) {
    selectSheet("text");
  }
});

const showVideoSheet = computed({
  get() {
    return sheet.value === "video";
  },
  set(value: boolean) {
    selectSheet("video");
    if (!value) {
      const video = document.querySelector("#info-video") as HTMLVideoElement;
      video.pause();
    }
  }
});

/**
  This is convenient if there's any other logic that we want to run
  when the splash screen is closed
*/
function closeSplashScreen() {
  showSplashScreen.value = false;
}

function selectSheet(sheetType: SheetType | null) {
  if (sheet.value === sheetType) {
    sheet.value = null;
    nextTick(() => {
      blurActiveElement();
    });
  } else {
    sheet.value = sheetType;
  }
}

function toTimeString(date: Date | null, seconds = false, utc = false) {
  // return this.toLocaleTimeString(date);
  if (date === null) {
    return "";
  }
  
  if (seconds) {
    return formatInTimeZone(date, utc ? 'UTC' : selectedTimezone.value, 'h:mm:ss aaa (zzz)');
  }
  return formatInTimeZone(date, utc ? 'UTC' : selectedTimezone.value, 'h:mm aaa (zzz)');
}

async function resetCamera(): Promise<void> {
  const time = store.currentTime;

  const sunPlace = new Place();
  sunPlace.set_names(["Sun"]);
  sunPlace.set_classification(Classification.solarSystem);
  sunPlace.set_target(SolarSystemObjects.sun);

  const latRad = selectedLocation.value.latitudeDeg * D2R;
  const lonRad = selectedLocation.value.longitudeDeg * D2R;

  const sunAltAz = equatorialToHorizontal(
    sunPlace.get_RA() * 15 * D2R,
    sunPlace.get_dec() * D2R,
    latRad,
    lonRad,
    time,
  );

  const sunAz = sunAltAz.azRad;
  const startAlt = 25 * D2R;
  const startRADec = horizontalToEquatorial(
    startAlt,
    sunAz,
    latRad,
    lonRad,
    time,
  );

  return store.gotoRADecZoom({
    raRad: startRADec.raRad,
    decRad: startRADec.decRad,
    zoomDeg: 360,
    instant: true,
  });
  
}

function updateWWTLocation(location: LocationDeg) {
  wwtSettings.set_locationLat(location.latitudeDeg);
  wwtSettings.set_locationLng(location.longitudeDeg);
}

function updateAltAzGrid(show: boolean) {
  store.applySetting(["showAltAzGrid", show]);
  store.applySetting(["showAltAzGridText", show]);
}

function updateEcliptic(show: boolean) {
  store.applySetting(["showEcliptic", show]);
  // store.applySetting(["showEclipticOverviewText", show]);
}

function updateConstellations(show: boolean) {
  store.applySetting(["showConstellationFigures", show]);
  store.applySetting(["showConstellationLabels", show]);
}

watch(selectedLocation, (location: LocationDeg) => {
  updateWWTLocation(location);
  resetCamera();
  WWTControl.singleton.renderOneFrame();
});

watch(playing, (play) => {
  store.setClockSync(play);
});

watch(showAltAzGrid, updateAltAzGrid);
watch(showEcliptic, updateEcliptic);
watch(showConstellations, updateConstellations);

watch(dateTime, (dt: Date) => {
  store.setTime(dt);
});

watch(inNorthernHemisphere, (_inNorth: boolean) => resetAltAzGridText());
</script>

<style lang="less">
@font-face {
  font-family: "Highway Gothic Narrow";
  src: url("./assets/HighwayGothicNarrow.ttf");
}

:root {
  --default-font-size: clamp(0.7rem, min(1.7vh, 1.7vw), 1.1rem);
  --default-line-height: clamp(1rem, min(2.2vh, 2.2vw), 1.6rem);
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #000;
  overflow: hidden;

  
  -ms-overflow-style: none;
  // scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  font-family: Verdana, Arial, Helvetica, sans-serif;
}

#main-content {
  position: fixed;
  width: 100%;
  height: var(--app-content-height);
  overflow: hidden;

  transition: height 0.1s ease-in-out;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  font-size: 11pt;

  .wwtelescope-component {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    border-style: none;
    border-width: 0;
    margin: 0;
    padding: 0;
  }
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.modal {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 100;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

#modal-loading {
  background-color: #000;
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    .spinner {
      background-image: url("https://projects.cosmicds.cfa.harvard.edu/cds-website/misc/lunar_loader.gif");
      background-repeat: no-repeat;
      background-size: contain;
      width: 3rem;
      height: 3rem;
    }
    p {
      margin: 0 0 0 1rem;
      padding: 0;
      font-size: 150%;
    }
  }
}

h4 {
  margin-top: 20px;
  margin-bottom: 6px;
}

p {
  margin-block: 10px;
}

li {
  margin-left: 20px;
  margin-block: 5px;
}

#top-content {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

#left-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

#center-buttons {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;
}

#controls {
  pointer-events: auto;

  background: black;
  padding-block: 0.5em;
  padding-right: 0.5em;
  border-radius: 5px;
  border: solid 1px var(--accent-color);
  display: flex;
  flex-direction: column;
  pointer-events: auto;

  .v-label {
    color: var(--accent-color);
    opacity: 1;
    font-size: var(--default-font-size);
  }

  #control-checkboxes {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    // padding-left: calc(0.5 * var(--default-line-height));

    .v-checkbox .v-selection-control {
      font-size: calc(1.1 * var(--default-font-size));
      height: calc(1.2 * var(--default-line-height));
      min-height: calc(1.2 * var(--default-line-height));
    }
    
    .v-selection-control .v-label {
      white-space: nowrap;
    }

    .v-checkbox .v-selection-control__input {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
    }

    .v-checkbox .v-selection-control__wrapper {
      width: calc(1.2 * var(--default-line-height));
      height: calc(1.2 * var(--default-line-height));
    }

    .v-selection-control--focused .v-selection-control__input {
      outline: 9px double black;
      box-shadow: 0 0 0 6px white !important;
    }

    .v-btn {
      align-self: center;
      padding-left: 5px;
      padding-right: 5px;
      border: solid 1px #899499;

      &:focus {
        border: 2px solid white;
      }
    }

    .v-btn__content {
      color: black;
      font-weight: 900;
      white-space: break-spaces;
      width: 150px;
    }
  }
  
  #controls-top-row {
    padding-left: 0.5em;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}

#bottom-content {
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
}

#splash-overlay {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#splash-screen {
  color: #FFFFFF;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: center;
  justify-content: space-around;

  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
  font-size: min(8vw, 7vh);

  p {
    font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
    font-weight: bold;
    vertical-align: middle;
  }
    
  .highlight {
    color: var(--accent-color2);
    text-transform: uppercase;
    font-weight: bolder;
  }

  border-radius: 30px;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  padding-top: 4rem;
  padding-bottom: 1rem;

  @media (max-width: 699px) {
    max-height: 80vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 85vh;
    max-width: min(70vw, 800px);
  }

  div {
    margin-inline: auto;
    text-align: center;
  }

  .small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #close-splash-button {
    position: absolute;
    top: 20px;
    right: 20px;
    text-align: end;
    color: var(--accent-color);
    font-size: min(5vw, 4vh);

    &:hover {
      cursor: pointer;
    }
  }

  #splash-screen-text {
    // in the grid, the text is in the 2nd column
    display: flex;
    flex-direction: column;
    line-height: 130%;    
  }

  .splash-get-started {
    border: 2px solid white;
    font-size: calc(1.8 * var(--default-font-size));
    margin-top: 5%;
    margin-bottom: 2%;
    font-weight: bold !important;
  }

  #splash-screen-guide {
    margin-block: 1.5em;
    font-size: min(5vw, 4vh);
    line-height: 140%;
    width: 75%;

    .v-col{
      padding: 0;
    }
    
    .svg-inline--fa {
      color:var(--accent-color);
      margin: 0 10px;
    }
  }

  #splash-screen-acknowledgements {
    margin-top: 3rem;
    font-size: calc(1.7 * var(--default-font-size));
    line-height: calc(1.5 * var(--default-line-height));
    width: 60%; 
  }
  #splash-screen-logos {
    margin-block: 0.75em;
    img {
    height: 5vmin;
    vertical-align: middle;
    margin: 2px;
    }
    @media only screen and (max-width: 600px) {
      img {
        height: 24px;
      }
    }
    svg {
      vertical-align: middle;
      height: 24px;
    }
  }
}



.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;

  #video-close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;
    
    &:hover {
      cursor: pointer;
    }

    &:focus {
      color: white;
      border: 2px solid white;
    }
  }
}

video {
  height: 100%;
  width: auto;
  max-width: 100%;
  object-fit: contain;
}

#info-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 10;
}

.bottom-sheet {
  .v-overlay__content {
    align-self: flex-end;
    padding: 0;
    margin: 0;
    max-width: 100%;
    height: 34%;
  }

  #tabs {
    width: calc(100% - 3em);
    align-self: left;
  }
  
  .info-text {
    height: 33vh;
    padding-bottom: 25px;
  
    & a {
      text-decoration: none;
    }
  }
  
  .close-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 15;
  
    &:hover {
      cursor: pointer;
    }
  
    &:focus {
      color: white;
      border: 2px solid white;
    }
  }
  
  .scrollable {
    overflow-y: auto;
  }
  
  #tab-items {
    // padding-bottom: 2px !important;
  
    .v-card-text {
      font-size: ~"max(14px, calc(0.7em + 0.3vw))";
      padding-top: ~"max(2vw, 16px)";
      padding-left: ~"max(4vw, 16px)";
      padding-right: ~"max(4vw, 16px)";
  
      .end-spacer {
        height: 25px;
      }
    }
  
  }
  
  #close-text-icon {
    position: absolute;
    top: 0.25em;
    right: calc((3em - 0.6875em) / 3); // font-awesome-icons have width 0.6875em
    color: white;
  }

  // This prevents the tabs from having some extra space to the left when the screen is small
  // (around 400px or less)
  .v-tabs:not(.v-tabs--vertical).v-tabs--right>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__next, .v-tabs:not(.v-tabs--vertical):not(.v-tabs--right)>.v-slide-group--is-overflowing.v-tabs-bar--is-mobile:not(.v-slide-group--has-affixes) .v-slide-group__prev {
    display: none;
  }

}

.map-container {
  width: 60vw;
  height: 60vh;
}

#geolocation-wrapper\+location {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 1000;
}

#geolocation-wrapper\+location .v-btn {
  background-color: black;
}

#slider {
  flex-grow: 1;
}

// Styling the slider
#slider .v-slider {
  pointer-events: auto;

  .v-slider-track {
    // --v-slider-track-size: 4px !important;

    .v-slider-track__background {
      background-color: #CCC !important;
    }

    .v-slider-track__fill {
      background-color: rgb(255 193 203)!important;
      height: var(--v-slider-track-size) !important;
    }

    .v-slider-track__background--opacity {
      opacity: 1 !important;
    }
  }

  .v-slider-thumb {
    
    .v-slider-thumb__surface {
      border: 1px solid black !important;
    }
  }
  

  .v-slider-thumb__label {
    min-width: fit-content;
    white-space: nowrap;
    color: black;
    padding-inline: 0.7rem;
    background-color: var(--accent-color);

    font-size: var(--default-font-size);
    padding-block: calc(0.5 * var(--default-line-height));

    @media (max-width: 600px) {
      font-size: calc(1 * var(--default-font-size));
      padding-block: 0;
      padding-inline: 0.3rem;
      height: 15px;
    }
  }
  
  .v-slider-thumb__label::before {
    color: var(--accent-color);
  }
}

#time-controls {
  display: flex;
  gap: 10px;
  width: 100% !important;
  margin-left: 5px;
  margin-right: 0;
  position: relative;
}

.bullet-icon {
  color: var(--accent-color);
  width: 1.5em;
}
</style>
