<template>
  <v-overlay
    :model-value="showSplashScreen"
    absolute
    opacity="0.6"
    :style="cssVars"
    id="splash-overlay"
  >
    <focus-trap>
    <div
      id="splash-screen"
      v-click-outside="closeSplashScreen"
      :style="cssVars"
    >
      <div
        id="first-splash-row"
      >
        <font-awesome-icon
          id="close-splash-button"
          @click="closeSplashScreen"
          @keyup.enter="closeSplashScreen"
          icon="xmark"
          tabindex="0"
          />
        <div id="splash-screen-text">
          <p>Want to see the</p>
          <p class="highlight">{{ title }}?</p>
        </div>
      </div>

      <div>
        <v-btn
          class="splash-get-started"
          @click="closeSplashScreen"
          @keyup.enter="closeSplashScreen"
          :color="cssVars['--accent-color']"
          :density="$vuetify.display.xs ? 'compact' : 'default'"
          :size="$vuetify.display.width < 250 ? 'large' : 'x-large'"
          variant="elevated"
          rounded="lg"
        >
          Get Started
        </v-btn>
      </div>
    
      <div id="splash-screen-acknowledgements">
        Brought to you by <a href="https://www.cosmicds.cfa.harvard.edu/" target="_blank" rel="noopener noreferrer">Cosmic Data Stories</a> and <a href="https://www.worldwidetelescope.org/home/" target="_blank" rel="noopener noreferrer">WorldWide Telescope</a>.
        
        <div id="splash-screen-logos">
          <credit-logos/>
        </div>
      </div>
    </div>
    </focus-trap>
  </v-overlay>
</template>


<script setup lang="ts">
import {computed} from 'vue';
export interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cssVars?: any;
  title: string;
  color?: string,
  highlightColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  cssVars: () => ({}),
});

console.log(props.cssVars);

const cssVars = computed(() => {
  return {
    ...props.cssVars,
    ...{'--accent-color': props.color == null ? props.cssVars['--accent-color'] : props.color},
    ...{'--accent-color2': props.highlightColor == null ? props.cssVars['--accent-color2'] : props.highlightColor}
  };
});

const emits = defineEmits(['close']);

const showSplashScreen = defineModel({ default: true });


function closeSplashScreen() {
  showSplashScreen.value = false;
  emits('close');
}


</script>


<style lang="less">

#splash-overlay {
  align-items: center;
  justify-content: center;
  font-size: min(8vw, 7vh);
}

#splash-screen {
  color: #E0E0E0;

  @media (max-width: 699px) {
    max-height: 80vh;
    max-width: 90vw;
  }

  @media (min-width: 700px) {
    max-height: 85vh;
    max-width: min(70vw, 800px);
  }


  background-color: black;
  backdrop-filter: blur(5px);
  justify-content: space-around;
  align-content: center;
  padding-top: 2rem;
  padding-bottom: 1rem;

  border-radius: 30px;
  border: min(1.2vw, 0.9vh) solid var(--accent-color);
  overflow: auto;
  font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;

  div {
    margin-inline: auto;
    text-align: center;
  }
  // make a paragraph inside the div centered horizontally and vertically
  p {
    font-family: 'Highway Gothic Narrow', 'Roboto', sans-serif;
    font-weight: bold;
    vertical-align: middle;
  }
    
  p.highlight {
    color: var(--accent-color2);
    text-transform: uppercase;
    font-weight: bolder;
  }
  
  p.small {
    font-size: var(--default-font-size);
    font-weight: bold;
  }

  #first-splash-row {
    width: 100%;
  }

  #close-splash-button {
    position: absolute;
    top: 20px;
    right: 20px;
    text-align: end;
    color: var(--accent-color);
    font-size: min(5vw, 4vh);
    padding: 0.25rem;
    margin: -0.25rem;

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

</style>