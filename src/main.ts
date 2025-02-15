import Vue, { createApp, type Plugin } from "vue";

import { CreditLogos, FundingAcknowledgement, GeolocationButton, IconButton, LocationSelector } from "@cosmicds/vue-toolkit";
import PlanetParade from "./PlanetParade.vue";

import vuetify from "../plugins/vuetify";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { WWTComponent, wwtPinia } from "@wwtelescope/engine-pinia";

import DateTimePicker from "./components/DateTimePicker.vue";
import LocationSearch from "./components/LocationSearch.vue";
import PlaybackControl from './components/PlaybackControl.vue';
import SpeedControl from "./components/SpeedControl.vue";
import TimeDisplay from "./components/TimeDisplay.vue";
import SplashScreen from "./SplashScreen.vue";


import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBookOpen,
  faChevronDown,
  faCircleXmark,
  faGear,
  faLocationDot,
  faMagnifyingGlass,
  faPlay,
  faPause,
  faTimes,
  faVideo,
  faXmark,
  faGaugeHigh,
  faAnglesLeft,
  faAnglesRight,
  faAnglesUp,
  faAnglesDown,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";

library.add(faBookOpen);
library.add(faChevronDown);
library.add(faCircleXmark);
library.add(faGear);
library.add(faLocationDot);
library.add(faMagnifyingGlass);
library.add(faPlay);
library.add(faPause);
library.add(faTimes);
library.add(faVideo);
library.add(faXmark);
library.add(faGaugeHigh);
library.add(faAnglesLeft);
library.add(faAnglesRight);
library.add(faAnglesUp);
library.add(faAnglesDown);
library.add(faRotate);

/** v-hide directive taken from https://www.ryansouthgate.com/2020/01/30/vue-js-v-hide-element-whilst-keeping-occupied-space/ */
// Extract the function out, up here, so I'm not writing it twice
const update = (el: HTMLElement, binding: Vue.DirectiveBinding) => el.style.visibility = (binding.value) ? "hidden" : "";

createApp(PlanetParade, {
  wwtNamespace: "planet-parade"
})
 
  // Plugins
  .use(wwtPinia as unknown as Plugin<[]>)
  .use(vuetify)

  // Directives
  .directive(
    /**
    * Hides an HTML element, keeping the space it would have used if it were visible (css: Visibility)
    */
    "hide", {
      // Run on initialisation (first render) of the directive on the element
      beforeMount(el, binding, _vnode, _prevVnode) {
        update(el, binding);
      },
      // Run on subsequent updates to the value supplied to the directive
      updated(el, binding, _vnode, _prevVnode) {
        update(el, binding);
      }
    })

  // Components
  .component("WorldWideTelescope", WWTComponent)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('credit-logos', CreditLogos)
  .component('funding-acknowledgement', FundingAcknowledgement)
  .component('geolocation-button', GeolocationButton)
  .component('icon-button', IconButton)
  .component('location-selector', LocationSelector)
  .component('location-search', LocationSearch)
  .component('time-display', TimeDisplay)
  .component('date-time-picker', DateTimePicker)
  .component('speed-control', SpeedControl)
  .component('playback-control', PlaybackControl)
  .component('splash-screen', SplashScreen)

  // Mount
  .mount("#app");
