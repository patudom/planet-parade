<template>
  <div
    class="forward-geocoding-container"
    :style="cssStyles"
  >
    <div
      class="forward-geocoding-input-row"
    >
      <v-text-field
        v-show="searchOpen"
        v-model="searchText"
        :class="['forward-geocoding-input', locationJustUpdated ? 'geocode-success' : '', small ? 'forward-geocoding-input-small' : '']"
        :label="locationJustUpdated ? 'Location Updated' : 'Enter a location'"
        bg-color='black'
        density="compact"
        hide-details
        variant="solo"
        :color="accentColor"
        @keydown.stop
        @keyup.enter="() => performForwardGeocodingSearch()"
        @keyup.esc="searchResults = null"
        @click:clear="searchResults = null"
        :error-messages="searchErrorMessage"
      ></v-text-field>
      <font-awesome-icon
        class="geocoding-search-icon"
        icon="magnifying-glass"
        :size="searchOpen ? 'xl' : buttonSize"
        :color="!searchOpen || (searchText && searchText.length > 2) ? accentColor : 'gray'"
        @click="() => {
          if (searchOpen) {
            performForwardGeocodingSearch();
          } else {
            searchOpen = true;
          }
        }"
      ></font-awesome-icon>
      
      <slot name="append-icon" class="geocode-icon"></slot>
      
      <font-awesome-icon
        class="geocoding-close-icon"
        v-show="searchOpen && !stayOpen"
        icon="circle-xmark"
        :size="searchOpen ? 'xl' : '1x'"
        color="gray"
        @click="() => {
          searchOpen = false;
          clearSearchData();
        }"
      ></font-awesome-icon>
      
    </div>
    
    <div
      class="forward-geocoding-results"
      :class="[small ? 'results-small' : '']"
      v-if="searchResults !== null"
    >
      <div
        v-for="(feature, index) in (searchResults !== null ?  searchResults.features : [])"
        class="forward-geocoding-result"
        :key="index"
        @click="() => setLocationFromSearchFeature(feature)"
      >
        {{ feature.place_name }}
      </div>
    </div>
  </div>
</template> 

<script setup lang="ts">
import { ref } from "vue";
import { MapBoxFeatureCollection } from "@cosmicds/vue-toolkit/src/mapbox";

type SearchProvider = (searchText: string) => Promise<MapBoxFeatureCollection | null>;

export interface LocationSearchProps {
  searchProvider?: SearchProvider;
  modelValue?: boolean;
  stayOpen?: boolean;
  accentColor?: string;
  small?: boolean;
  theme?: string;
  buttonSize?: string;
}

const props = withDefaults(defineProps<LocationSearchProps>(), {
  searchProvider: (_searchText: string) => null,
  modelValue: true,
  stayOpen: false,
  accentColor: "white",
  small: false,
  theme: "dark",
  buttonSize: "1x",
});

const searchOpen = ref(props.modelValue || props.stayOpen);
const searchText = ref<string | null>(null);
const searchResults = ref<MapBoxFeatureCollection | null>(null);
const searchErrorMessage = ref<string | null>(null);
const locationJustUpdated = ref(false);
</script>
