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

    <splash-screen 
      v-show="false"
      title="Planetary Parade" 
      :cssVars="cssVars" 
      @close="closeSplashScreen"
      />
    <v-dialog
      v-model="inIntro"
    >
      <div v-if="inIntro" id="introduction-overlay">
        <v-card class="info-card elevation-5">

          <div id="intro-window-close-button">
            <font-awesome-icon
              size="xl"
              class="ma-1"
              :color="accentColor"
              icon='xmark'
              @click="inIntro = !inIntro"
              @keyup.enter="inIntro = !inIntro"
              tabindex="0"
              tooltip-location="start"
            /> 
          </div>


          <div class="intro-text">
            <h3 style="color: #f4ba3e" class="mb-2">Quick Start</h3>
            <ol>
              <li>Set desired location using <font-awesome-icon class="bullet-icon" icon="location-dot" style="color: #f4ba3e" /> <strong><span style="color: #f4ba3e">(top-center)</span></strong>.</li>
              <li>Click box that displays date/time 
                <strong>
                <span v-show="!xs" style="color: #f4ba3e">(bottom-left)</span>
                <span v-show="xs" style="color: #f4ba3e">(bottom-center)</span>
              </strong>
              to update, or press <font-awesome-icon class="bullet-icon" icon="play" style="color: #f4ba3e" /> to advance time.</li>
              <li>Go outdoors and find the planet parade!</li>
              <li>Learn more using <font-awesome-icon class="bullet-icon" icon="info" style="color: #f4ba3e" /> and <font-awesome-icon class="bullet-icon" icon="video" style="color: #f4ba3e" /> <strong><span style="color: #f4ba3e">(upper-left)</span></strong>.   </li>
            </ol>
          </div>

          <v-checkbox
            v-model="skipIntroChecked"
            label="Do not display Intro Content again"
            density="default"
            hide-details
          >
          </v-checkbox>
        </v-card>
      </div>

    </v-dialog>

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
        <div id="location-info">
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
              <div id="geolocation-close">
                <font-awesome-icon
                  style="cursor: pointer; z-index: 1000;"
                  icon="xmark"
                  size="xl"
                  @click="showLocationSelector = false"
                  @keyup.enter="showLocationSelector = false"
                  tabindex="0"
                  color="black"
                ></font-awesome-icon>
              </div>
              <div id="geolocation-controls">
                <geolocation-button
                  id="location"
                  size="30px"
                  density="default"
                  elevation="5"
                  :color="accentColor"
                  @geolocation="selectedLocation = {longitudeDeg: $event.longitude, latitudeDeg: $event.latitude}"
                />
                <location-search
                  :class="['location-search']"
                  small
                  button-size="xl"
                  :accent-color="accentColor"
                  :search-provider="searchProvider"
                  @set-location="setLocationFromSearchFeature"
                  @error="searchErrorMessage = $event"
                >
                </location-search>
              </div>
              <location-selector
                :model-value="selectedLocation"
                @update:modelValue="updateLocationFromMap"
              />

            </v-card>
          </v-dialog>
          <div tabindex="0" id="my-location-label"  @click="showLocationSelector=true" @keyup.enter="showLocationSelector=true">
            <div>View from:</div>
            <div>{{ selectedLocationText != '' ? selectedLocationText : 'Cambridge, MA (default)' }}</div> 
          </div>
        </div>


        <icon-button
          v-if="false"
          v-model="showTextSheet"
          fa-icon="info"
          :color="buttonColor"
          :tooltip-text="showTextSheet ? 'Hide Info' : 'Learn More'"
          tooltip-location="start"
        >
        </icon-button>
        <icon-button
          v-if="false"
          v-model="showVideoSheet"
          fa-icon="video"
          :color="buttonColor"
          tooltip-text="Watch video"
          tooltip-location="start"
        >
        </icon-button>
      </div>

      <div id="right-buttons">
        <div id="controls" class="collapsable-control control-icon-wrapper">
          <div class="controls-top-row">
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
            <v-checkbox :color="accentColor" v-model="showEcliptic" @keyup.enter="showEcliptic = !showEcliptic"
            label="Ecliptic" hide-details />
            <v-checkbox :color="accentColor" v-model="showAltAzGrid" @keyup.enter="showAltAzGrid = !showAltAzGrid"
              label="Sky Grid" hide-details />
            <v-checkbox :color="accentColor" v-model="showHorizon" @keyup.enter="showHorizon = !showHorizon"
              label="Horizon/Sky" hide-details />
              <v-checkbox :color="accentColor" v-model="showPlanetLabels" @keyup.enter="showPlanetLabels = !showPlanetLabels"
              label="Planet Labels" hide-details />
              <v-checkbox :color="accentColor" v-model="showConstellations" @keyup.enter="showConstellations = !showConstellations"
              label="Constellations" hide-details />

          </div>
        </div>
        
        <div v-show="false" id="planet-visibility-box" class="collapsable-control control-icon-wrapper">
          <div class="controls-top-row planet-visibility">
            <div class="planet-visibility-title">Risen</div>
            <font-awesome-icon
              size="lg"
              class="tab-focusable"
              :color="accentColor"
              :icon="showPlanetVisiblity ? `chevron-down` : `chevron-up`"
              @click="showPlanetVisiblity = !showPlanetVisiblity" 
              @keyup.enter="showPlanetVisiblity = !showPlanetVisiblity"
              tabindex="0" />
          </div>
          <!-- {{ planetIsVisible(SolarSystemObjects.sun, dateTime,  selectedLocation) }} -->
          <div v-if="showPlanetVisiblity" id="planet-visibility-label">
            <p :class="['planet-label','sun', sunVis ? '' : 'not-visible' ]"><v-icon>mdi-weather-sunny</v-icon> Sun</p>
            <p :class="['planet-label', mercuryVis ? '' : 'not-visible' ]"><v-icon>mdi-eye-outline</v-icon> Mercury</p>
            <p :class="['planet-label', venusVis   ? '' : 'not-visible' ]"><v-icon>mdi-eye-outline</v-icon> Venus</p>
            <p :class="['planet-label', marsVis    ? '' : 'not-visible' ]"><v-icon>mdi-eye-outline</v-icon> Mars</p>
            <p :class="['planet-label', jupiterVis ? '' : 'not-visible' ]"><v-icon>mdi-eye-outline</v-icon> Jupiter</p>
            <p :class="['planet-label', saturnVis  ? '' : 'not-visible' ]"><v-icon>mdi-eye-outline</v-icon> Saturn</p>
            <p :class="['planet-label', uranusVis  ? '' : 'not-visible' ]"><v-icon>mdi-binoculars</v-icon> Uranus</p>
            <p :class="['planet-label', neptuneVis ? '' : 'not-visible' ]"><v-icon>mdi-telescope</v-icon> Neptune</p>
          </div>
        </div>
      </div>
    </div>


    <!-- This block contains the elements (e.g. the project icons) displayed along the bottom of the screen -->

    <div id="bottom-content">
      <div id="date-picker">
        <v-overlay 
          v-model="datePickerOpen"
          activator="parent"
          location-strategy="connected"
          location="top end"
          origin="bottom end"
          :scrim="false"
          :style="cssVars"
        >
        <template #activator="{props}">
          <!-- any props added are passed directly to v-card -->
          <v-card 
            v-bind="props"
            class="td__card"
            width="fit-content"
            rounded="lg"
            tabindex="0"
            @keyup.enter="props.onClick"
            >
            <time-display class="bsn__time" :date="localSelectedDate" ampm :short-time-date="true" show-timezone :timezone="shortTimezone" />
            <v-icon v-if="!(smAndDown || mobile)" class="td__icon"  >mdi-cursor-default-click</v-icon>
          </v-card>
        </template>
          <v-card ref="dtpCard" tabindex="0" width="fit-content" elevation="5">
            <v-icon tabindex="0" class="dtp-close-button" @click="datePickerOpen=false" @keyup.enter="datePickerOpen=false" :color="accentColor" size="18">mdi-close</v-icon>
            <date-time-picker tabindex="0" v-model="localSelectedDate" :editable-time="true">
              <!-- <button class="dtp__button" @click="() => {playbackControl.pause(); set9pm(); goToTCrB()}" name="set-9pm" aria-label="Set time to 9pm">9pm</button>
              <button class="dtp__button" @click="() => {playbackControl.pause(); setMidnight(); goToTCrB()}" name="set-midnight" aria-label="Set time to Midnight">Midnight</button>-->
              <button class="dtp__button" @click="() => {selectedTime = Date.now()}" name="set-now" aria-label="Set time to Now">Now</button> 
            </date-time-picker>
          </v-card>
        </v-overlay>
      </div>
      
      <!-- eslint-disable-next-line vue/no-v-model-argument -->
      <speed-control v-model:playing="playing" 
        :store="store"
        :color="accentColor" 
        :defaultRate="1000"
        :useInline="xs"
        :maxSpeed="10000"
        show-text
        @reset="() => {
          selectedTime = Date.now();
          const altTime = getTimeforSunAlt(2).setting;
          if (altTime) {
            selectedTime = altTime;
            nextTick(() => {
            resetCamera(new Date(altTime));
          });
          } else {
            // reasonable fallback
            selectedTime = Date.now();
          }
          wwtStats.timeResetCount += 1;
        }"
        @update:reverse="(_reverse: boolean) => {
          wwtStats.reverseCount += 1;
        }"
        @update:playing="(_playing: boolean) => {
          wwtStats.playPauseCount += 1;
        }"
        @slow-down="(rate: number) => {
          wwtStats.slowdowns.push(rate);
        }"
        @speed-up="(rate: number) => {
          wwtStats.speedups.push(rate);
        }"
        @set-rate="(rate: number) => {
          wwtStats.rateSelections.push(rate);
        }"
        />
      <div id="change-flags">
        <icon-button
          v-if="false"
          md-icon="mdi-information-outline"
          @activate="() => inIntro = true"
          :color="accentColor"
          :focus-color="accentColor"
          tooltip-text="Show Quick Start Guide"
          tooltip-location="bottom"
          tooltip-offset="5px"
          :show-tooltip="!mobile"
          mdSize="1.2em"
        >
        </icon-button>
        <icon-button
          v-if="false"
          md-icon="mdi-lock"
          @activate="() => showPrivacyDialog = true"
          :color="accentColor"
          :focus-color="accentColor"
          tooltip-text="Change privacy settings"
          tooltip-location="bottom"
          tooltip-offset="5px"
          :show-tooltip="!mobile"
          mdSize="1.2em"
        >
        </icon-button>
      </div>
      <div id="body-logos" v-if="!smallSize">
        <credit-logos
          :default-logos="['cosmicds', 'wwt', 'sciact', 'nasa']"
        />
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
          <source src="CosmicDS Planet Parade Overhead View.mp4" type="video/mp4">
        </video>
      </div>
    </v-dialog>

    <!-- Data collection opt-out dialog -->
    <v-dialog
      scrim="false"
      v-model="showPrivacyDialog"
      max-width="400px"
      id="privacy-popup-dialog"
    >
      <v-card>
        <v-card-text>
          To evaluate usage of this app, <strong>anonymized</strong> data may be collected, including locations searched or selected on map. Places selected via geolocation services on your device are NOT collected.
        </v-card-text>
        <v-card-actions class="pt-3">
          <v-spacer></v-spacer>
          <v-btn
            color="#BDBDBD"
            href="https://www.cfa.harvard.edu/privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
          Privacy Policy
          </v-btn>
          <v-btn
            color="#ff6666"
            @click="() => {
              responseOptOut = true;
              showPrivacyDialog = false;
            }"
          >
          Opt out
          </v-btn>
          <v-btn 
            color="green"
            @click="() => {
              responseOptOut = false;
              showPrivacyDialog = false;
            }"
          >
            Allow
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- This dialog contains the informational content that is displayed when the info icon is clicked -->

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
      :retain-focus="!showRating"
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
                <h3>What is a planet parade?</h3>
                <p>
                  A planet parade occurs when four or more planets are visible in the night sky at once. Even more rare and notable are parades where six, or even all seven other planets&#8212;Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune&#8212;are visible in the sky together. The most recent seven-planet parade occurred in February 2025. The next six-planet parade will occur in February 2026.
                </p>
                <p> 
                  Which planets will be visible to your eye depends on how dark your night sky is. Starting around mid-February 2026, from a reasonably dark, clear sky, you should be able to see four of the six planets (Venus, Mercury, Saturn, and Jupiter) by eye. Neptune and Uranus will also be up, but you will likely need binoculars or a small telescope to see them.
                </p> 
                <h3>Cool! How do I see a planet parade?</h3>
                <p>
                  You can use this resource to see which planets are visible in the sky on a given date. 
                </p>
                <ul>
                  <li>Click <font-awesome-icon class="bullet-icon" icon="location-dot"/> in the top-center of the view and choose your location. (The default location is Cambridge, MA.)</li>
                  <li>The display defaults to the current day just before sunset. Use the time controls to advance time until just after sunset.</li>
                  <li>
                    If <span style="color: var(--accent-color)">Horizon/Sky</span> is checked, you can see the Sun rise above the horizon in the morning and set in the evening. The sky will lighten and darken with the Sun's changing position. 
                  </li>
                  <li>
                    Check <span style="color: var(--accent-color)">Sky Grid</span> to display the cardinal directions and/or check <span style="color: var(--accent-color)">Constellations</span> to help orient yourself .
                  </li>
                </ul>
                <h3>How do I find my way around the sky?</h3>
                <p>
                  Here are some tips for finding the planets in the sky.
                </p>
                <ul>
                  <li>
                    Venus, Jupiter, Saturn, and Mars are the brightest planets and usually the easiest to spot. 
                  </li>
                  <li>
                    Depending on where Venus and Mercury are in their orbits around the Sun, they will either be visible just after sunset (if they are "following" the Sun) or just before sunrise (if they are "ahead of" the Sun).
                  </li>
                  <li>
                    If Venus is "following" the Sun and visible in the evening, you can find it just above the western horizon for a short time after sunset. (If it is "ahead of" the Sun and visible in the morning before sunrise, you can see it above the eastern horizon.)
                  </li>
                  <li>
                    If <span style="color: var(--accent-color)">Ecliptic</span> is checked, you can see a magenta arc that passes through all the planets. The ecliptic is the path that the Sun appears to follow over the course of a year. All the planets (and the Moon) also move roughly along the ecliptic. Imagine that arc in your sky to find all the planets that are above the horizon.
                  </li>
                </ul> 
                <h3>What is the significance of a planet parade?</h3>
                <p>
                  A seven-planet parade happens when all the planets happen to be on the same side of their orbits around the Sun as Earth, so they all are on Earth's night-time side. (When a planet is on the opposite side of the Sun from Earth, that means it is up in our sky during the day when the Sun outshines it.) 
                </p>
                <p>
                  <strong>The planets are not really all in a line.</strong> It only appears that way from Earth because Earth and the other planets all orbit the Sun in roughly the same plane (as if they were on a vinyl record). From Earth's point of view, all the other solar system objects appear to move along a circular path around the sky, which ancient astronomers called the "ecliptic."  
                </p>
                <p>
                  Click <font-awesome-icon class="bullet-icon" icon="video" style="color: #f4ba3e" /> in the upper left to watch a (silent) video showing an overhead view of the planets and how their positions lead to the planet parade.
                </p>
                <h3>What else can I do to learn more?</h3>
                <p>
                  Take your own images of the planets using <strong><a href="https://mo-www.cfa.harvard.edu/OWN/todays_solar_system.html#SS" target="_blank" rel="noopener noreferrer">MicroObservatory's Observing With NASA</a></strong> program!
                </p>
                <h3>Will the planets be this big in my sky?</h3>
                <p>
                  Unfortunately, no. In this visualization, we scaled up the size of the solar system objects so you would be able to see them when zoomed out to a large swath of sky. In reality, the planets will appear in the sky as points of light (or very small disks through binoculars or a telescope).
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

  <v-container>
    <v-expand-transition>
      <user-experience
        v-show="showRating"
        :question="question"
        icon-size="3x"
        @dismiss="(_rating: UserExperienceRating | null, _comments: string | null) => {
          showRating = false;
        }"
        @rating="(rating: UserExperienceRating | null) => {
          currentRating = rating;
          updateUserExperienceInfo(currentRating, currentComments);
        }"
        @finish="(rating: UserExperienceRating | null, comments: string | null) => {
          currentRating = rating;
          currentComments = comments;
          updateUserExperienceInfo(currentRating, currentComments)
          showRating = false;
        }"
      >
        <template #footer>
          <v-btn
            class="privacy-button"
            color="#BDBDBD"
            href="https://www.cfa.harvard.edu/privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
          Privacy Policy
          </v-btn>
        </template>
      </user-experience>
      </v-expand-transition>
  </v-container>
  </div>
</v-app>
</template>

<script setup lang="ts">
import { ref, reactive, computed, markRaw, onMounted, nextTick, watch } from "vue";
import { Color, Grids, Planets, Settings, WWTControl, AstroCalc } from "@wwtelescope/engine";
import { SolarSystemObjects } from "@wwtelescope/engine-types";
import { engineStore } from "@wwtelescope/engine-pinia";
import { BackgroundImageset, LocationDeg, skyBackgroundImagesets, supportsTouchscreen, blurActiveElement, useWWTKeyboardControls, API_BASE_URL, D2R } from "@cosmicds/vue-toolkit";
import { useDisplay } from "vuetify";
import { v4 } from "uuid";

import { useTimezone } from "./timezones";
import { horizontalToEquatorial, skyOpacityForSunAlt, getJulian, equatorialToHorizontal, type UserExperienceRating } from "./utils";
import { resetAltAzGridText, makeAltAzGridText, drawPlanets, renderOneFrame, drawEcliptic, drawSkyOverlays } from "./wwt-hacks";
import { MapBoxFeature, MapBoxFeatureCollection, geocodingInfoForSearch, textForLocation } from "@cosmicds/vue-toolkit/src/mapbox";
// import { useGeolocation } from "@cosmicds/vue-toolkit";
import { useSun } from './useSun';

const STORY_DATA_URL = `${API_BASE_URL}/planet-parade/data`;
const STORY_RATING_URL = `${API_BASE_URL}/planet-parade/user-experience`;

const UUID_KEY = "eclipse-mini-uuid" as const;
const OPT_OUT_KEY = "eclipse-mini-optout" as const;
const SKIP_INTRO_CONTENT_KEY = "skip-intro-content" as const;
const maybeUUID = window.localStorage.getItem(UUID_KEY);
const storedOptOut = window.localStorage.getItem(OPT_OUT_KEY);
const skipIntroContent = window.localStorage.getItem(SKIP_INTRO_CONTENT_KEY)?.toLowerCase() === "true";
const existingUser = maybeUUID !== null;
const uuid = maybeUUID ?? v4();
const question = Math.random() > 0.5 ? 
  "Does this spark your curiosity?" :
  "Are you learning something new?";
const currentRating = ref<UserExperienceRating | null>(null);
const currentComments = ref<string | null>(null);
if (!existingUser) {
  window.localStorage.setItem(UUID_KEY, uuid);
}
let infoTimeMs = 0;
let videoPlayingTimeMs = 0;
let videoPlaying = false;
let videoOpened = false;
let videoPlayed = false;
let appStartTimestamp = Date.now();
let infoStartTimestamp = null as number | null;
let videoPlayingStartTimestamp = null as number | null;

let userSelectedSearchLocations: [number, number][] = [];
let userSelectedMapLocations: [number, number][] = [];

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

const showSplashScreen = false;
const backgroundImagesets = reactive<BackgroundImageset[]>([]);
const sheet = ref<SheetType | null>(null);
const layersLoaded = ref(false);
const positionSet = ref(false);
const accentColor = ref("#f4ba3e");
const accentColor2 = ref("#6793ff");
const buttonColor = ref("#f4ba3e");
const tab = ref(0);
const showHorizon = ref(false);
const showAltAzGrid = ref(false);
const showEcliptic = ref(true);
const showLocationSelector = ref(false);
const playing = ref(false);
const showControls = ref(smAndUp.value);
const showConstellations = ref(false);
const showPlanetLabels = ref(true);
const inIntro = ref(false);
const showPrivacyDialog = ref(false);
const datePickerOpen = ref(false);
const skipIntroChecked = ref(skipIntroContent);
const showPlanetVisiblity = ref(true);

const wwtStats = markRaw({
  timeResetCount: 0,
  reverseCount: 0,
  playPauseCount: 0,
  speedups: [] as number[],
  slowdowns: [] as number[],
  rateSelections: [] as number[],
  startTime: Date.now(),
});

const optOut = typeof storedOptOut === "string" ? storedOptOut === "true" : null;
const responseOptOut = ref(optOut);

const showRating = ref(false);

const geocodingOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  access_token: process.env.VUE_APP_MAPBOX_ACCESS_TOKEN ?? "", 
};

const selectedLocation = ref<LocationDeg>({
  longitudeDeg: -97.03,
  latitudeDeg: 47.92,
});
const selectedLocationText = ref("");
updateSelectedLocationText();

// const { geolocation, geolocate} = useGeolocation();
// function useGeolocated() {
//   if (!geolocation.value) {return;}
//   selectedLocation.value = { latitudeDeg: geolocation.value.latitude, longitudeDeg: geolocation.value.longitude };
// }
// watch(
//   geolocation,
//   (location) => {
//     if (location) {
//       selectedLocation.value = { latitudeDeg: location?.latitude, longitudeDeg: location?.longitude };
//     }
//   }
// );

const searchErrorMessage = ref<string | null>(null);
const { selectedTimezoneOffset, shortTimezone, browserTimezoneOffset } = useTimezone(selectedLocation);

const selectedTime = ref(Date.now());

const { getTimeforSunAlt, getSunPositionAtTime } = useSun(store, selectedLocation, selectedTime, selectedTimezoneOffset);
// faking localization because
// <date-time-picker> and <time-display> are not timezone aware
const localSelectedDate = computed({
  // if you console log this date it will still say the local timezone 
  // as determined by the browser Intl.DateTimeFormat().resolvedOptions().timeZone
  // but we have manually offset it so the hours are correct for the selected timezone
  get: () => {
    const time = selectedTime.value;
    const fakeUTC = time + browserTimezoneOffset;
    return new Date(fakeUTC + selectedTimezoneOffset.value);
  },
  set: (value: Date) => {
    // get local time
    const time = value.getTime();
    // undo fake localization
    const newTime = time - selectedTimezoneOffset.value - browserTimezoneOffset;
    selectedTime.value = new Date(newTime).getTime();
  }
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const wwtSettings: Settings = Settings.get_active();

function doWWTModifications() {

  Grids._makeAltAzGridText = makeAltAzGridText;
  Grids.drawEcliptic = drawEcliptic;

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  WWTControl.singleton._drawSkyOverlays = drawSkyOverlays.bind(WWTControl.singleton);

  // as well as our custom text overlays
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  WWTControl.singleton.renderOneFrame = newFrameRender;

  const originalUpdatePlanetLocations = Planets.updatePlanetLocations;
  const planetScales = [
    1,  // Sun
    2.5,  // Mercury
    3.5,  // Venus
    1.25,  // Mars
    6,  // Jupiter
    20,  // Saturn
    15,  // Uranus
    0,  // Neptune
    1,  // Pluto
    0,  // Moon
  ];
  function newUpdatePlanetLocations(threeD: boolean) {
    originalUpdatePlanetLocations(threeD);
    for (let i = 0; i <= SolarSystemObjects.moon; i++) {
      Planets._planetScales[i] = planetScales[i];
    }
  }
  Planets.updatePlanetLocations = newUpdatePlanetLocations;
  Planets.drawPlanets = drawPlanets;

  // Recall that zoom = 6 * FOV, in WWT
  const maxFOV = 180;
  WWTControl.singleton.set_zoomMax(maxFOV * 6);
 
}


function planetIsVisible(planetName, date: Date, location: LocationDeg) {
  // Get planet position
  const planetPos = AstroCalc.getPlanet(getJulian(date), planetName, location.latitudeDeg * D2R, location.longitudeDeg * D2R, 0);
  // Convert to horizontal
  const altAz = equatorialToHorizontal(planetPos.RA * 15 * D2R, planetPos.dec * D2R, location.latitudeDeg * D2R, location.longitudeDeg * D2R, date);
  // Check if planet is above minimum altitude
  return altAz.altRad > 0;
}

const sunVis = computed(() => planetIsVisible(SolarSystemObjects.sun, dateTime.value, selectedLocation.value));
const mercuryVis = computed(() => planetIsVisible(SolarSystemObjects.mercury, dateTime.value, selectedLocation.value));
const venusVis = computed(() => planetIsVisible(SolarSystemObjects.venus, dateTime.value, selectedLocation.value));
const marsVis = computed(() => planetIsVisible(SolarSystemObjects.mars, dateTime.value, selectedLocation.value));
const jupiterVis = computed(() => planetIsVisible(SolarSystemObjects.jupiter, dateTime.value, selectedLocation.value));
const saturnVis = computed(() => planetIsVisible(SolarSystemObjects.saturn, dateTime.value, selectedLocation.value));
const uranusVis = computed(() => planetIsVisible(SolarSystemObjects.uranus, dateTime.value, selectedLocation.value));
const neptuneVis = computed(() => planetIsVisible(SolarSystemObjects.neptune, dateTime.value, selectedLocation.value));

onMounted(() => {
  store.waitForReady().then(async () => {
    skyBackgroundImagesets.forEach(iset => backgroundImagesets.push(iset));

    // If there are layers to set up, do that here!
    layersLoaded.value = true;

    const altTime = getTimeforSunAlt(2).setting;
    if (altTime) {
      selectedTime.value = altTime;
    }
    wwtStats.startTime = selectedTime.value;
    setTimeout(() => resetCamera().then(() => positionSet.value = true), 300);

    store.applySetting(["localHorizonMode", true]);
    store.applySetting(["altAzGridColor", Color.fromArgb(180, 133, 201, 254)]);
    store.applySetting(["eclipticColor", Color.fromArgb(255, 255, 0, 255)]);
    store.applySetting(["actualPlanetScale", false]);
    updateAltAzGrid(showAltAzGrid.value);
    updateAltAzGridText(showAltAzGrid.value || showHorizon.value);
    updateEcliptic(showEcliptic.value);
    updateConstellations(showConstellations.value);
    updateWWTLocation(selectedLocation.value);
    store.setClockSync(false);
    store.setClockRate(1800);

    doWWTModifications();
    // geolocate().then(() => {
    //   console.log('got location');
    //   useGeolocated(); 
    //   selectedTime.value = todayAt4pm.value;
    //   resetCamera();
    // });
    
    createUserEntry();
    ratingDisplaySetup();

    setInterval(() => {
      if (playing.value) {
        const time = store.currentTime;
        selectedTime.value = time.getTime();
      }
      const sunPosition = getSunPositionAtTime(store.currentTime);
      updateEclipticColor(sunPosition.altRad);
    }, 500);

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      if (["Esc", "Escape"].includes(event.key) && showVideoSheet.value) {
        showVideoSheet.value = false;
      }
    });

    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        updateUserData();
      } else {
        resetData();
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

/* This lets us inject component data into element CSS */
const cssVars = computed(() => {
  return {
    "--accent-color": accentColor.value,
    "--accent-color2": accentColor2.value,
    "--app-content-height": showTextSheet.value ? "66%" : "100%",
    // "--rating-width": smallSize.value ? "40%" : "40%",
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
    } else {
      nextTick(() => {
        const video = document.querySelector("#info-video") as HTMLVideoElement;
        video.addEventListener("play", (_event: Event) => {
          videoPlaying = true;
          videoPlayingStartTimestamp = Date.now();
          videoPlayed = true;
        });

        video.addEventListener("pause", (_event: Event) => {
          videoPlaying = false;
          const now = Date.now();
          if (videoPlayingStartTimestamp !== null) {
            videoPlayingTimeMs += (now - videoPlayingStartTimestamp);
            videoPlayingStartTimestamp = null;
          }
        });
      });
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

function getTextForLocation(longitudeDeg: number, latitudeDeg: number): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return textForLocation(longitudeDeg, latitudeDeg, geocodingOptions);
}

function setLocationFromFeature(feature: MapBoxFeature) {
  selectedLocation.value = { longitudeDeg: feature.center[0], latitudeDeg: feature.center[1] };
  getTextForLocation(feature.center[0], feature.center[1]).then(text => {
    selectedLocationText.value = text;
  }).catch(_err => {
    searchErrorMessage.value = "An error occurred while searching";
  });
}

function setLocationFromSearchFeature(feature: MapBoxFeature) {
  setLocationFromFeature(feature);
  userSelectedSearchLocations.push(feature.center);
}

async function updateSelectedLocationText() {
  selectedLocationText.value = await getTextForLocation(selectedLocation.value.longitudeDeg, selectedLocation.value.latitudeDeg);
}

function searchProvider(text: string): Promise<MapBoxFeatureCollection> {
  return geocodingInfoForSearch(text, geocodingOptions);
}

function updateLocationFromMap(location: LocationDeg) {
  selectedLocation.value = location;
  userSelectedMapLocations.push([location.latitudeDeg, location.longitudeDeg]);
}

async function ratingDisplaySetup() {
  if (responseOptOut.value) {
    return;
  }

  const existsResponse = await fetch(`${STORY_RATING_URL}/${uuid}`, {
    method: "GET",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "" }
  });

  // NB: If we want to ask multiple questions, this logic can be adjusted
  const existsContent = await existsResponse.json();
  const exists = existsResponse.status === 200 && existsContent.ratings?.length > 0;

  if (exists) {
    return;
  }

  setTimeout(() => {
    showRating.value = true; 
  }, 40_000);
}

function updateUserExperienceInfo(rating: UserExperienceRating | null, comments: string | null) {
  const body: Record<string, unknown> = {
    uuid,
    question,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    story_name: "planet-parade",
  };
  if (rating) {
    body.rating = rating;
  }
  if (comments) {
    body.comments = comments;
  }
  fetch(STORY_RATING_URL, {
    method: "PUT",
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function createUserEntry() {
  if (responseOptOut.value) {
    return;
  }

  const response = await fetch(`${STORY_DATA_URL}/${uuid}`, {
    method: "GET",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    headers: { "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "" },
  });
  const content = await response.json();
  const exists = response.status === 200 && content.response?.user_uuid != undefined;
  if (exists) {
    return;
  }

  fetch(`${STORY_DATA_URL}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "",
    },
    body: JSON.stringify({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      user_uuid: uuid,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      user_selected_search_locations: userSelectedSearchLocations,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      user_selected_map_locations: userSelectedMapLocations,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      app_time_ms: 0, info_time_ms: 0, video_time_ms: 0,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      video_opened: videoOpened, video_played: videoPlayed,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_time_reset_count: wwtStats.timeResetCount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_reverse_count: wwtStats.reverseCount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_play_pause_count: wwtStats.playPauseCount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_speedups: wwtStats.speedups,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_slowdowns: wwtStats.slowdowns,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_rate_selections: wwtStats.rateSelections,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_start_stop_times: [wwtStats.startTime, selectedTime.value],
    }),
  });
}

function resetData() {
  userSelectedMapLocations = [];
  userSelectedSearchLocations = [];
  infoTimeMs = 0;
  videoPlayingTimeMs = 0;
  const now = Date.now();
  appStartTimestamp = now;
  infoStartTimestamp = showTextSheet.value ? now : null;
  videoPlayingStartTimestamp = videoPlaying ? now : null;
  Object.assign(wwtStats, {
    timeResetCount: 0,
    reverseCount: 0,
    playPauseCount: 0,
    speedups: [],
    slowdowns: [],
    rateSelections: [],
    startTime: selectedTime.value,
  });
}

async function updateUserData() {
  if (responseOptOut.value) {
    return;
  }

  const now = Date.now();
  const infoTime = (showTextSheet.value && infoStartTimestamp !== null) ? now - infoStartTimestamp : infoTimeMs;
  const videoTime = (videoPlaying && videoPlayingStartTimestamp !== null) ? now - videoPlayingStartTimestamp : videoPlayingTimeMs;

  fetch(`${STORY_DATA_URL}/${uuid}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Authorization": process.env.VUE_APP_CDS_API_KEY ?? "",
    },
    body: JSON.stringify({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      user_selected_search_locations: userSelectedSearchLocations,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      user_selected_map_locations: userSelectedMapLocations,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      delta_app_time_ms: now - appStartTimestamp,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      delta_info_time_ms: infoTime,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      delta_video_time_ms: videoTime,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      video_opened: videoOpened, video_played: videoPlayed,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      delta_wwt_time_reset_count: wwtStats.timeResetCount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      delta_wwt_reverse_count: wwtStats.reverseCount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      delta_wwt_play_pause_count: wwtStats.playPauseCount,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_speedups: wwtStats.speedups,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_slowdowns: wwtStats.slowdowns,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_rate_selections: wwtStats.rateSelections,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      wwt_start_stop_times: [wwtStats.startTime, selectedTime.value],
    }),
    keepalive: true,
  }).then(() => {
    resetData();
  });
}

async function resetCamera(time?: Date): Promise<void> {
  if (time === undefined) {
    time = store.currentTime;
  }

  const latRad = selectedLocation.value.latitudeDeg * D2R;
  const lonRad = selectedLocation.value.longitudeDeg * D2R;

  const sunAltAz = getSunPositionAtTime(time);
  const sunAz = sunAltAz.azRad;
  const startAlt = smallSize.value ? 15 * D2R : 20 * D2R;
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
}

function updateAltAzGridText(show: boolean) {
  store.applySetting(["showAltAzGridText", show]);
}

function updateEcliptic(show: boolean) {
  store.applySetting(["showEcliptic", show]);
  // store.applySetting(["showEclipticOverviewText", show]);
}

function updateEclipticColor(sunAlt: number) {
  const opacity = skyOpacityForSunAlt(sunAlt);
  const component = 255 - opacity * (255 - 119);
  const color = Color.fromArgb(255, component, 0, component);
  store.applySetting(["eclipticColor", color]);
}

function updateConstellations(show: boolean) {
  store.applySetting(["showConstellationFigures", show]);
  store.applySetting(["showConstellationLabels", show]);
}

watch(selectedLocation, (location: LocationDeg) => {
  console.log('selectedLocation changed', location);
  updateSelectedLocationText();
  updateWWTLocation(location);
  resetCamera();
  WWTControl.singleton.renderOneFrame();
});

// watch(selectedTime, (value: number) => {
//   console.log(value);});
watch(playing, (play: boolean) => {
  store.setClockSync(play);
});

watch(showAltAzGrid, (show: boolean) => {
  updateAltAzGrid(show);
  updateAltAzGridText(show || showHorizon.value);
});
watch(showEcliptic, updateEcliptic);
watch(showConstellations, updateConstellations);
watch(showHorizon, (show: boolean) => {
  updateAltAzGridText(show || showAltAzGrid.value);
});

watch(dateTime, (dt: Date) => {
  store.setTime(dt);
});

watch(skipIntroChecked, (checked: boolean) => {
  window.localStorage.setItem(SKIP_INTRO_CONTENT_KEY, String(checked));
});

watch(showTextSheet, (show: boolean) => {
  const now = Date.now();
  if (show) {
    infoStartTimestamp = now; 
  } else if (infoStartTimestamp !== null) {
    infoTimeMs += (now - infoStartTimestamp);
    infoStartTimestamp = null;
  }
});

watch(showVideoSheet, (show: boolean) => {
  if (show) {
    videoOpened = true;
  }
});

watch(inNorthernHemisphere, (_inNorth: boolean) => resetAltAzGridText());

watch(showSplashScreen, (show: boolean) => {
  if (!show) {
    inIntro.value = true;
  }
});

watch(inIntro, (intro: boolean) => {
  if (!intro) {
    if (!showSplashScreen.value && responseOptOut.value === null) {
      showPrivacyDialog.value = true;
    }
  }
});

watch(responseOptOut, (optOut: boolean | null) => {
  if (optOut !== null) {
    window.localStorage.setItem(OPT_OUT_KEY, String(optOut));
  }
});
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
  overflow: auto !important;

  
  -ms-overflow-style: none;
  // scrollbar-width: none;
}

body {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: auto !important;

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

p {
  margin-block: 10px;
}

li {
  margin-left: 20px;
  margin-block: 8px;
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

  .icon-wrapper {
    width: 30%;
    height: 20%;
    flex-shrink: 0;
  }
}

#location-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;

  #my-location-label {
    font-size: var(--default-font-size);
    display: flex;
    flex-direction: column;
    align-content: center;
    color: var(--accent-color);
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
    font-weight: bold;
    pointer-events: auto;
    cursor:pointer
  }
  
  #my-location-label:hover {
    filter: drop-shadow(0 0 2px white;)
  }
}

#right-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  height: auto;
}

.collapsable-control {
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
  
  .controls-top-row {
    padding-left: 0.5em;
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
  }
}

#planet-visibility-box {
  color: var(--accent-color);
  font-size: calc(1.1 * var(--default-font-size));
  
  .controls-top-row.planet-visibility {
    justify-content: space-between;
  }
  
  .planet-visibility-title {
    // flex-basis: 12ch;
    line-height: calc(1 * var(--default-line-height));
    margin-bottom: 5px;
    margin-right: 5px;
    font-weight: bold;
  }
  
  #planet-visibility-label {
      
    p.planet-label {
      font-size: var(--default-font-size);
      margin: 0;
      margin-left: 0.5em;
      line-height: calc(1 * var(--default-line-height));
      transition: color 0.3s;
    }
    
    .sun {
      color: rgb(232, 232, 59);
      font-weight: bold;
    }

    p.planet-label.not-visible {
      color: #333;
    }
  }
}

#bottom-content {
  display: flex;
  flex-direction: row;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: calc(100% - 2rem);
  pointer-events: none;
  align-items: center;
  gap: 5px;
  justify-content: center;
}

// vuetify smAndDown
@media ( max-width: 960px ) {
  #bottom-content {
    align-items: flex-start;
  }
  #date-picker {
    margin-block: 0;
  }
  
  .td__container.bsn__time {
    margin-block: 0.25em !important;
  }
}

@media (max-width: 600px) {
  #bottom-content {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
}

// From Sara Soueidan (https://www.sarasoueidan.com/blog/focus-indicators/) & Erik Kroes (https://www.erikkroes.nl/blog/the-universal-focus-state/)
:focus-visible:not(.v-overlay__content, .v-field__input input),
button:focus-visible,
.focus-visible,
.v-selection-control--focus-visible .v-selection-control__input,
#intro-window-close-button:focus-visible {
  outline: 9px double white !important;
  box-shadow: 0 0 0 6px black !important;
  border-radius: .125rem;
}

.video-wrapper {
  height: 100%;
  background: black;
  text-align: center;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

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
  // height: 100%;
  // width: auto;
  // max-width: 100%;
  object-fit: contain;
}

#info-video {
  // position: absolute;
  // top: 0;
  // left: 0;
  width: 95%;
  height: auto;
  max-width: 100%;
  overflow: hidden;
  padding: 0px;
  z-index: 10;
  border: 1px solid white;
}

#introduction-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-card {
  height: fit-content;
  padding-inline: 30px !important;
  padding-block: 20px !important;
  max-width: 500px;

  @media (max-width: 600px) {
    width: 95%;
  }

  @media (min-width: 600px) {
    width: 80%;
  }
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

    & h3 {
      margin-top: 20px;
      margin-bottom: 6px;
      color: var(--accent-color);
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
  @media (max-width: 600px) {
    width: 90vw;
    height: 70vh;
  }

@media (min-width: 601px) {
    width: 70vw;
    height: 60vh;
  }
}

#geolocation-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

#geolocation-controls {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  width: 350px;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;
  gap: 5px;

  .location-search {
    flex-grow: 1;
  }

  @media (max-width: 600px) {
    width: 300px;
  }
}

#geolocation-wrapper\+location .v-btn {
  background-color: black;
}

#slider {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  gap: 0.5em;
  align-items: center;
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

#change-flags {
  position: absolute;
  display: flex;
  flex-direction: row;
  gap: 5px;

  @media (max-width: 990px) {
    right: 0rem;
    bottom: 0rem;
  }
  @media (min-width: 948px) {
    right: 0.5rem;
    bottom: 40px;
  }
    
  .icon-wrapper {
    margin: 0;
    padding: 0.15em;
    border: none;
    min-width: 0;
  }
}

#privacy-popup-dialog {

  .v-card-text {
    color: #BDBDBD;
  }

  .v-overlay__content {
    font-size: var(--default-font-size);
    background-color: purple;
    position: absolute;
    bottom: 0;
    right: 0;
  }

  .v-btn--size-default {
      font-size: calc(0.9 * var(--default-font-size));
    }  

  .v-card-actions .v-btn {
    padding: 0 4px;
  }
}

#intro-window-close-button {
    position: absolute;
    top: 0.25em;
    right: 0.25em;

    &:hover {
      cursor: pointer;
    }
}

.bullet-icon {
  color: var(--accent-color);
  width: 1.5em;
}

#date-picker {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
  margin-top: 2px;

  @media (max-width: 600px) {
    // margin: 0;
    // margin-left: 1rem;
  }

  @media (min-width: 601px) {
    // margin: 1rem;
  }

}

.dtp-close-button {
  position: absolute !important;
  top: 0.5em;
  right: 0.5em;
  border-radius: 50%;
  border: 1.5px solid car(--accent-color)
}
.dtp__button {
  background-color: var(--accent-color);
  font-size: 0.85em;
  color: black;
  border-radius: 5px;
  padding: 4px;
  margin: 4px;
  cursor: pointer;
}

.td__card {
  border: 2px solid var(--accent-color);
  text-align: right;
  position: relative;
  overflow: visible;
}

.td__icon {
  position: absolute;
  bottom: -4px;
  right: 0px;
  z-index: 10000;
}

.bsn__time .td__time_time {
  font-size: var(--default-font-size);
}

@media (min-width: 960px) {
  .bsn__time .td__time_time.td__short_time {
    font-size: calc(1.2 * var(--default-font-size));
  }
}



.bsn__time .td__date_date {
  font-size: calc(0.85 * var(--default-font-size));
}

.bsn__time .td__timezone_tz {
  font-size: calc(0.85 * var(--default-font-size));
}

#body-logos  {
  position: fixed;
  right: 0.5em;
  bottom: 0.5em;

  #icons-container img {
    height: 35px;
    vertical-align: middle;
    margin: 2px;
  }
}

.rating-root {
  position: absolute !important;
  right: 5px;
  bottom: 0;
  padding: 5px;
  width: fit-content !important;
  // left: 50%;
  // transform: translateX(-50%);
  gap: 0 !important;
  border: solid 1px #EFEFEF !important;
  border-radius: 10px !important;
  background-color: #222222 !important;
  opacity: 0.95 !important;
  z-index: 20000;

  .rating-title {
    color: #EFEFEF;
    font-size: var(--default-font-size);
  }

  .rating-icon-row {
    
    padding: 0px;

    .svg-inline--fa {
      height: 30px;
    }
  }

  .comments-box {
    width: 100%;
    margin-top: 20px;
  }

  .v-card-text {
    padding-bottom: 0;
  }

  .v-card-actions {
    padding: 0;
  }

  .privacy-button {
    font-size: 10px;
    position: absolute;
    left: 5px;
  }

  .v-btn.bg-success {
    position: absolute;
    right: 5px;
  }
}

</style>
