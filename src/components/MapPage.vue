<template>
    <div>
        <GmapMap :center="center" :zoom="zoom" id="gmap">
            <GmapMarker v-if="self_marker" :position="self_marker" />
            <GmapMarker v-for="(marker, index) in markers" :key="index" :position="marker"
                @mouseover="hoveredMarker = marker" @mouseout="hoveredMarker = null" @click="toggleInfoWindow(marker)">
                <GmapInfoWindow :opened="marker.isOpened" @closeclick="marker.isOpened = false">
                    {{ marker.address }}
                </GmapInfoWindow>
            </GmapMarker>
        </GmapMap>
        <div @click="getCurrentLocation" class="location-button"></div>
        <div class="container-fluid search">
            <div class="input-group rounded" id="search">
                <PlaceInput class="form-control rounded search-input" placeholder="Search" :selectFirstOnEnter="true"
                    @place_changed="placeChanged" />
                <!-- <input @keyup.enter="searchLocation" v-model="searchQuery" type="search" class="form-control rounded"
                    placeholder="Search" aria-label="Search" /> -->
                <span @click="searchLocation" class="input-group-text border-0 search-icon-container">
                    <div class="icon" name="search"></div>
                </span>
            </div>
        </div>
    </div>
</template>
  
<script>
import { gmapApi } from 'vue2-google-maps';
import PlaceInput from 'vue2-google-maps/dist/components/placeInput';

export default {
    data() {
        return {
            center: { lat: 0, lng: 0 },
            zoom: 3,
            self_marker: null,
            markers: [],
            searchQuery: '',
            hoveredMarker: null,
        }
    },
    components: {
        PlaceInput,
    },
    computed: {
        google: gmapApi
    },
    methods: {
        getCurrentLocation() {
            if (navigator.geolocation) {
                this.self_marker = null;
                navigator.geolocation.getCurrentPosition(position => {
                    this.center = this.self_marker = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    this.zoom = 15;
                }, error => {
                    // Handle error
                    console.log(error);
                });
            } else {
                // Browser doesn't support Geolocation
                console.log('Geolocation is not supported by this browser.');
            }
        },
        searchLocation() {
            console.log("Searching for: ", this.searchQuery);
        },
        placeChanged(place) {
            console.log(place)
            if (place.geometry) {
                // Use the coordinates of the selected place for center and marker
                let lat = place.geometry.location.lat()
                let lng = place.geometry.location.lng()

                this.center = {
                    lat: lat,
                    lng: lng
                };
                this.zoom = 15;
                this.markers.push({
                    lat: lat,
                    lng: lng,
                    address: place.formatted_address,
                    isOpened: false
                });
            }
        },
        toggleInfoWindow(marker) {
            if (marker.isOpened) {
                marker.isOpened = false
            } else {
                marker.isOpened = true
            }
        }
    }
}
</script>
  
<style>
#gmap {
    width: 100%;
    height: 100vh;
}

.location-button {
    position: fixed;
    right: 10px;
    bottom: 200px;
    z-index: 999;
    background-image: url("../assets/target.png");
    background-size: calc(100% - 15px);
    background-repeat: no-repeat;
    background-position: center;
    width: 40px;
    height: 40px;
    background-color: #fff;
    border-radius: 50%;
    cursor: pointer;
}

.container-fluid.search {
    position: fixed;
    top: 10px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

#search {
    width: 50%;
}

.search-input {
    padding: 0;
}

.search-input input {
    border: none;
    width: 100%;
}

.search-icon-container {
    cursor: pointer;
}

.icon[name="search"] {
    width: 15px;
    height: 15px;
    background-image: url("../assets/search.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
</style>