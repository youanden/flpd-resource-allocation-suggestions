<template>
  <div class="page">
    <map-container></map-container>
  </div>
</template>

<script>

import Map from '../components/Map'

export default {
  components: {
    'map-container': Map
  }
}
</script>

<style lang='scss'>

.leaflet-fake-icon-shadow {
  background-image: url('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/images/marker-shadow.png');
}
@import "../../node_modules/leaflet/dist/leaflet.css";

#side {
  float:left;
  width:200px;
}
#container {
  margin: 0 0 0 200px;
}
#map_container {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>

