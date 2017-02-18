<template>
  <div>
    <div id="map_container">
      <v-map :zoom="zoom" :center="center">
        <v-tilelayer :url="url" :attribution="attribution"></v-tilelayer>
        <v-marker v-for="marker in activeMarkers" :lat-lng="marker">

      </v-map>
    </div>
  </div>
</template>

<script>
import Vue2Leaflet from 'vue2-leaflet';
import Vue from 'vue';

import VueResource from 'vue-resource';

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/images/';

Vue.use(VueResource);

export default {
  name: 'example',
  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer' :Vue2Leaflet.TileLayer,
    'v-marker': Vue2Leaflet.Marker
  },
  mounted() {
    //

    let baseUrl = 'https://fortlauderdale.data.socrata.com/resource/uqjx-pish.json';

    this.$http.get(baseUrl).then(res => {
      // TAKE THE RESPONSE BODY AND UPDATE THE STATE activeMarkers
      this.activeMarkers = res.body.map(v => {
        if(v.location) {
          return L.latLng(v.location.coordinates[1],v.location.coordinates[0]);
        }
        return false;
      }).filter(v => v !== false)
    }, err => {
      console.warn('SOMETHING WENT WRONG');
    });
  },
  data () {
    return {
      zoom: 10,
      center:[26.1411526,-80.2200131],
      url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: L.latLng(26.1411526,-80.2200131),
      activeMarkers: []
    }
  }
}
</script>
