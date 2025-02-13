<template>
  <div id="speed-control">
    <icon-button
      id="reverse-speed"
      :fa-icon="'angles-left'"
      @activate="
        () => {
          reversePlaybackRate();
          // timePlaying = true;
        }
      "
      :color="color"
      :focus-color="color"
      :tooltip-text="playbackRate < 0 ? 'Reverse Faster' : 'Reverse'"
      tooltip-location="top"
      tooltip-offset="5px"
      faSize="1x"
      :show-tooltip="!mobile"
    ></icon-button>
    <icon-button
      id="play-pause-icon"
      :fa-icon="!timePlaying ? 'play' : 'pause'"
      @activate="
        () => {
          timePlaying = !timePlaying;
        }
      "
      :color="color"
      :focus-color="color"
      tooltip-text="Play/Pause"
      tooltip-location="top"
      tooltip-offset="5px"
      faSize="1x"
      :show-tooltip="!mobile"
    ></icon-button>
    <icon-button
      id="forward-speed"
      :fa-icon="'angles-right'"
      @activate="
        () => {
          increasePlaybackRate();
          // timePlaying = true;
        }
      "
      :color="color"
      :focus-color="color"
      :tooltip-text="playbackRate > 0 ? 'Faster' : 'Forward'"
      tooltip-location="top"
      tooltip-offset="5px"
      faSize="1x"
      :show-tooltip="!mobile"
    ></icon-button>
    <icon-button
      id="reset"
      :fa-icon="'rotate'"
      @activate="
        () => {
          playbackRate = 500;
          timePlaying = false;
          forceRate = false;
          emit('reset');
        }
      "
      :color="color"
      :focus-color="color"
      tooltip-text="Reset"
      tooltip-location="top"
      tooltip-offset="5px"
      faSize="1x"
      :show-tooltip="!mobile"
    ></icon-button>

    <v-dialog
      v-if="!useInline"
      v-model="playbackVisible"
      :scrim="false"
      location="top"
      offset="40"
      location-strategy="connected"
      persistent
      no-click-animation
      :retain-focus="false"
    >
      <template v-slot:activator="{ props }">
        <icon-button
          id="speed-control-icon"
          @activate="
            () => {
              playbackVisible = !playbackVisible;
            }
          "
          :fa-icon="playbackVisible ? 'times' : 'gauge-high'"
          :color="color"
          :focus-color="color"
          tooltip-text="Speed Controls"
          tooltip-location="top"
          tooltip-offset="5px"
          faSize="1x"
          :show-tooltip="!mobile"
          v-bind="props"
        ></icon-button>
      </template>
      <playback-control
        class="desktop-playback-control"
        v-if="playbackVisible"
        :model-value="playbackRate"
        @update:modelValue="(value: number) => {
                        forceRate = false;
                        playbackRate = value;
                      }"
        :paused="!timePlaying"
        @paused="timePlaying = !$event"
        :max-power="Math.log10(maxSpeed)"
        :max="Math.log10(maxSpeed) + 1"
        :color="color"
        :inline="false"
        show-close-button
        @close="
          () => {
            playbackVisible = false;
          }
        "
      />
    </v-dialog>

    <div v-if="useInline" id="inline-speed-control">
      <icon-button
        id="speed-control-icon"
        @activate="
          () => {
            playbackVisible = !playbackVisible;
          }
        "
        :fa-icon="playbackVisible ? 'times' : 'gauge-high'"
        :color="color"
        :focus-color="color"
        tooltip-text="Time Controls"
        tooltip-location="top"
        tooltip-offset="5px"
        faSize="1x"
        :show-tooltip="!mobile"
      ></icon-button>

      <playback-control
        class="mobile-playback-control"
        v-show="playbackVisible"
        :model-value="playbackRate"
        @update:modelValue="(value: number) => {
                        forceRate = false;
                        playbackRate = value;
                      }"
        :paused="!timePlaying"
        @paused="timePlaying = !$event"
        :max-power="Math.log10(maxSpeed)"
        :max="Math.log10(maxSpeed) + 1"
        :color="color"
        :inline="true"
        inline-button
        @close="
          () => {
            playbackVisible = false;
          }
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';

import { supportsTouchscreen } from "@cosmicds/vue-toolkit";


// import { storeToRefs } from 'pinia';
import { engineStore } from "@wwtelescope/engine-pinia";
import {usePlaybackControl } from '../wwt_playback_control';

interface Props {
  color: string,
  maxSpeed?: number,
  defaultRate?: number,
  useInline?: boolean
}

const {color, maxSpeed, defaultRate} = withDefaults(defineProps<Props>(),
  {
    color: 'white',
    maxSpeed: 10000,
    defaultRate: 1,
    useInline: false,
  }
);

const playing = defineModel<boolean>('playing', {default: false, required: true});


const emit = defineEmits(['reset', 'update:playing']);

const playbackVisible = ref(false);
const forceRate = ref(false);

const store = engineStore();
const {timePlaying, clockRate, setSpeed} = usePlaybackControl(store, false);
setSpeed(defaultRate);

timePlaying.value = playing.value;
watch(playing, (v) => {timePlaying.value = v;});
watch(timePlaying, (v) => {playing.value = v;});

const playbackRate = computed({
  get: function(): number {
    if (forceRate.value) {
      const sign = Math.sign(clockRate.value);
      return sign * Math.min(10, sign * clockRate.value);
    }
    return clockRate.value;
  },
  set: function(value: number) {
    clockRate.value = Math.sign(value) * Math.min(Math.abs(value), 5000);
  }
});

function reversePlaybackRate() {
  forceRate.value = false;
  const sign = Math.sign(playbackRate.value);
  if (sign > 0) {
    playbackRate.value = -Math.min(playbackRate.value, 1);
    return;
  }
  const abs = Math.abs(playbackRate.value);
  let ezrate = Math.floor(Math.log10(abs));
  ezrate -= sign * 1;
  playbackRate.value = sign * Math.pow(10, Math.abs(ezrate));
}

function increasePlaybackRate() {
  forceRate.value = false;
  if (Math.sign(playbackRate.value) < 0 ) {
    playbackRate.value = -Math.max(playbackRate.value,-1);
    return;
  }
  const sign = Math.sign(playbackRate.value);
  const abs = Math.abs(playbackRate.value);
  let ezrate = Math.floor(Math.log10(abs));
  ezrate += sign * 1;
  playbackRate.value = sign * Math.pow(10, Math.abs(ezrate));
}

const { smAndDown } = useDisplay();
const mobile = computed( () => smAndDown && supportsTouchscreen());
</script>

<style lang="less">

#speed-control {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 5px;
  //margin-left: 10px;
  justify-content: center;
  
  @media (orientation: landscape) {
    // margin-left: 3rem;
  }
  
  .icon-wrapper {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
    border: 2px solid var(--accent-color);
  }

}

#enclosing-playback-container.desktop-playback-control {
  --tick-font-size: 12px;
  margin-bottom: calc(2.5rem + 5px);
  padding-right: 1rem;
  
}

// account for the long 10000x text
#enclosing-playback-container.inset {
  padding-right: 1rem;
}


#inline-speed-control {
  display: flex; 
  flex-grow: 0;
  align-items: flex-end; 
  position: relative; 
  gap: 5px;
  
  #enclosing-playback-container.mobile-playback-control {
    position: fixed;
    width: calc(90% - 1rem);
    left: 50%;
    --off: 0; //calc(50%);
    transform: translateX(-50%) translateY(var(--off)) !important;
  }

}


#speed-text {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  padding-inline: 0.4em;
  padding-block: 0.15em;
  border-radius: 0.3em;
  font-size: calc(1 * var(--default-font-size));
  text-wrap: nowrap;  
  width: fit-content;

  left: calc(100% + 1rem);
  top: 1.5rem;
  
  @media (max-width: 600px) {
    position: relative;
    top: 3rem;
    left: 0.5rem;
    display: inline;
  }
}

</style>
