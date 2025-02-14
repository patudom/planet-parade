<template>
  <div
    class="forward-geocoding-container"
    :style="cssStyles"
  >
    <v-combobox
      v-show="searchOpen"
      :class="['forward-geocoding-input', locationJustUpdated ? 'geocode-success' : '', small ? 'forward-geocoding-input-small' : '']"
      v-model="searchItem"
      :items="searchResults ? searchResults.features : []"
      :item-title="itemText"
      :bg-color="bgColor"
      label="Enter city or zip"
      :density="small ? 'compact' : 'default'"
      hide-details
      solo
      :color="accentColor"
      @input="() => {}"
      @keydown.enter="performForwardGeocodingSearch"
      @keydown.esc="searchResults = null"
      @keydown.stop
      :error-messages="searchErrorMessage"
      @click:append="focusCombobox"
      @update:focused="onFocusChange($event)"
      ref="searchInput"
      :menu="menuOpen"
      @update:menu="menuOpen = $event"
    >
    <template v-slot:append>
      <font-awesome-icon
        class="geocoding-search-icon"
        icon="magnifying-glass"
        :size="searchOpen ? 'xl' : buttonSize"
        color="gray"
        @click="toggleSearch"
      ></font-awesome-icon>

      <slot name="append-icon" class="geocode-icon"></slot>

      <font-awesome-icon
        class="geocoding-close-icon"
        v-show="searchOpen && !stayOpen"
        icon="circle-xmark"
        :size="searchOpen ? 'xl' : '1x'"
        color="gray"
        @click="closeSearch"
      ></font-awesome-icon>
    </template>
  </v-combobox>
  <font-awesome-icon
      v-show="!searchOpen && !stayOpen"
      class="geocoding-search-icon"
      icon="magnifying-glass"
      :size="searchOpen ? 'xl' : buttonSize"
      color="gray"
      @click.prevent="toggleSearch"
    ></font-awesome-icon>
  </div>
</template> 

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { MapBoxFeature, MapBoxFeatureCollection, textForMapboxFeature } from "@cosmicds/vue-toolkit/src/mapbox";

type SearchProvider = (searchText: string) => Promise<MapBoxFeatureCollection | null>;

export interface LocationSearchProps {
  searchProvider?: SearchProvider;
  modelValue?: boolean;
  stayOpen?: boolean;
  accentColor?: string;
  small?: boolean;
  theme?: string;
  buttonSize?: string;
  bgColor?: string;
}

const props = withDefaults(defineProps<LocationSearchProps>(), {
  searchProvider: (_searchText: string) => null,
  modelValue: true,
  stayOpen: false,
  accentColor: "white",
  small: false,
  theme: "dark",
  buttonSize: "1x",
  bgColor: "black",
});

const emit = defineEmits<{
  (e: "error", message: string): void
  (e: "set-location", feature: MapBoxFeature): void
  (e: "update:modelValue", value: boolean): void
}>();

const searchOpen = ref(props.modelValue || props.stayOpen);
const searchItem = ref<string | null>(null);
const searchResults = ref<MapBoxFeatureCollection | null>(null);
const searchErrorMessage = ref<string | null>(null);
const locationJustUpdated = ref(false);
const menuOpen = ref(false);
const comboFocused = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

const cssStyles = computed(() => {
  return {
    "--accent-color": props.accentColor,
    "--bg-color": props.bgColor,
    "--fg-container-padding": searchOpen.value ? (props.small ? "0px 5px 0px 0px" : "5px 10px 12px 10px") : "0px",
    "--border-radius": searchOpen.value ? "7px" : "20px",
  };
});

function itemText(item: string | MapBoxFeature): string {
  if (typeof item === "string") {
    return item;
  }
  return textForMapboxFeature(item);
}

function performForwardGeocodingSearch() {
  const search = searchItem.value;
  if (search === null || search.length < 3) {
    return;
  }

  props.searchProvider(search).then(info => {
    if (info !== null && info.features.length === 1) {
      setLocationFromSearchFeature(info.features[0]);
    } else if (info !== null && info.features.length === 0) {
      searchErrorMessage.value = "No matching places were found";
      emit("error", searchErrorMessage.value); 
    } else {
      searchResults.value = info;
    }
  });
}

function focusCombobox() {
  const input = searchInput.value as HTMLInputElement;
  input.focus();
}

function blurCombobox() {
  const input = searchInput.value as HTMLInputElement;
  input.blur();
}

function toggleSearch() {
  if (searchOpen.value) {
    performForwardGeocodingSearch();
    menuOpen.value = true;
    focusCombobox();
  } else {
    searchOpen.value = true;
  }
}

function closeSearch() {
  searchOpen.value = false;
  clearSearchData();
}

function onFocusChange(focused: boolean) {
  comboFocused.value = focused;
}

function setLocationFromSearchFeature(feature: MapBoxFeature) {
  blurCombobox();
  timedJustUpdatedLocation();
  clearSearchData();
  emit("set-location", feature);
}

function clearSearchData() {
  searchResults.value = null;
  searchItem.value = null;
  searchErrorMessage.value = null;
}

function timedJustUpdatedLocation() {
  locationJustUpdated.value = true;
  setTimeout(() => {
    locationJustUpdated.value = false;
  }, 5000);
}

watch(() => props.modelValue, (value: boolean) => { searchOpen.value = value; });

watch(searchOpen, (value: boolean) => emit("update:modelValue", value));

watch(searchItem, function(item: string | MapBoxFeature | null) {
  if (searchErrorMessage.value) {
    searchErrorMessage.value = null;
  }
  if (!item || (typeof item === "string" && item.length === 0)) {
    searchResults.value = null;
  }
  if (item && typeof item !== "string") {
    setLocationFromSearchFeature(item);
  }
});
</script>

<style lang="less">

// https://vue-loader.vuejs.org/guide/scoped-css.html#deep-selectors
.forward-geocoding-container {
  --border-radius: 20px;
  position: relative;
  color: var(--accent-color);
  border: 2px solid var(--accent-color);
  border-radius: var(--border-radius);
  background-color: var(--bg-color);
  margin-left: 0.25rem;
  margin-bottom: 0.25rem;
  padding: var(--fg-container-padding);

  // there are two separate labels, we want the 2nd one to be large. the first is the small floating label
  .v-field > .v-field__field > .v-label.v-field-label:nth-child(2) {
    font-size: 1.2rem;
  }

  // .v-input--horizontal .v-input__append {
  //   margin-inline-start: 0;
  // }
  
  .v-text-field {
    min-width: 150px;
  }
  
  .v-field--variant-filled.v-field--has-background .v-field__overlay {
    border-top-right-radius: 0px;
}

  .forward-geocoding-input > .v-input__control > .v-field {
    border-radius: var(--border-radius);
  }
  
  .forward-geocoding-input.geocode-success label {
    opacity: 1;
  }
  
  .forward-geocoding-input-small label {
    // .v-label sets default to 1rem
    font-size: 0.8rem;
  }

  .forward-geocoding-input-row {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    gap: 10px;
    align-items: center;
  }
  
  .geocoding-search-icon {
    padding-inline: calc(0.3 * var(--default-line-height));
    padding-block: calc(0.4 * var(--default-line-height));
  }

  .geocoding-search-icon:hover, #geocoding-close-icon:hover {
    cursor: pointer;
  }

}
</style>
