<template>
    <div>
        <!-- map -->
        <GmapMap :center="center" :zoom="zoom" id="gmap">
            <GmapMarker v-if="self_marker" :position="self_marker" />
            <GmapMarker v-for="(marker, index) in markers" :key="index" :position="marker"
                @mouseover="hoveredMarker = marker" @mouseout="hoveredMarker = null" @click="toggleInfoWindow(marker)">
                <GmapInfoWindow :opened="marker.isOpened" @closeclick="marker.isOpened = false">
                    {{ marker.address }}
                </GmapInfoWindow>
            </GmapMarker>
        </GmapMap>

        <!-- get current location -->
        <div @click="getCurrentLocation" class="location-button"></div>

        <!-- search location -->
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

        <!-- open search history btn -->
        <div @click="toggleHistoryTable" class="search-history-button"></div>

        <!-- search history table -->
        <div v-if="isHistoryTableOpened" class="history-table-wrapper">
            <div id="history-table">
                <div class="container-fluid">
                    <div class="row">
                        <div class="col">
                            <button @click="deleteSelected" class="btn btn-secondary">Delete Selected</button>
                        </div>
                        <div class="col-sm-auto">
                            <button @click="toggleHistoryTable" class="btn btn-danger">X</button>
                        </div>
                    </div>
                </div>

                <table class="table">
                    <tbody>
                        <tr v-for="(record, index) in paginatedRecords" :key="index">
                            <td>
                                <input type="checkbox" :value="record" v-model="selectedRecords">
                            </td>
                            <td>{{ record.address }}</td>
                        </tr>
                    </tbody>
                </table>
                <paginate :page-count="pageCount" :click-handler="changePage" :prev-text="'Prev'" :next-text="'Next'"
                    :container-class="'pagination'" :page-class="'page-item'" :page-link-class="'page-link'"
                    :prev-class="'page-item'" :next-class="'page-item'" :prev-link-class="'page-link'"
                    :next-link-class="'page-link'" :active-class="'active'"></paginate>
            </div>
        </div>
    </div>
</template>
  
<script>
import { gmapApi } from 'vue2-google-maps';
import PlaceInput from 'vue2-google-maps/dist/components/placeInput';
import Paginate from 'vuejs-paginate'

export default {
    data() {
        return {
            center: { lat: 0, lng: 0 },
            zoom: 3,
            self_marker: null,
            markers: [],
            searchQuery: '',
            hoveredMarker: null,
            searchHistory: [],
            selectedRecords: [],
            isHistoryTableOpened: false,
            currentPage: 1,
            paginatedRecords: [],
        }
    },
    components: {
        PlaceInput,
        'paginate': Paginate,
    },
    computed: {
        google: gmapApi,
        pageCount() {
            return Math.max(Math.ceil(this.searchHistory.length / 10), 1);
        }
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
                this.searchHistory.push({
                    lat: lat,
                    lng: lng,
                    address: place.formatted_address,
                })
            }
        },
        toggleInfoWindow(marker) {
            if (marker.isOpened) {
                marker.isOpened = false
            } else {
                marker.isOpened = true
            }
        },
        changePage(pageNumber) {
            this.currentPage = pageNumber;
        },
        deleteSelected() {
            console.log("-- before delete --")
            console.log(this.searchHistory)
            console.log(this.markers)

            for (let record of this.selectedRecords) {
                this.searchHistory = this.searchHistory.filter(item => item !== record);
                this.markers = this.markers.filter(marker => marker.lat !== record.lat && marker.lng !== record.lng);
            }
            this.selectedRecords = [];

            console.log("-- after delete --")
            console.log(this.searchHistory)
            console.log(this.markers)

            this.toggleHistoryTable()
        },
        setPaginatedRecords() {
            const start = (this.currentPage - 1) * 10;
            const end = start + 10;
            const records = this.searchHistory.slice(start, end);
            console.log(records)
            return records
        },
        toggleHistoryTable() {
            this.paginatedRecords = this.setPaginatedRecords()

            this.isHistoryTableOpened = !this.isHistoryTableOpened
        }
    },
    // mixins: [Paginate]
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

.search-history-button {
    position: fixed;
    right: 10px;
    bottom: 250px;
    z-index: 999;
    background-image: url("../assets/history.png");
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

.history-table-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: transparent;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

#history-table {
    min-width: 400px;
    min-height: 400px;
    background-color: #fff;
    display: inline-flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 5px;
    box-shadow: 0 0px 2px rgb(0 0 0 / 25%);
}


#history-table .pagination {
    margin-top: auto;
}
</style>