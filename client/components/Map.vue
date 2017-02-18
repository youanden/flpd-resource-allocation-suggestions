<template>
  <div>
    <div id="map_container">
      <v-map :zoom="zoom" :center="center">
        <v-tilelayer :url="url" :attribution="attribution"></v-tilelayer>
        <v-marker v-for="marker in activeMarkers" :lat-lng="marker" v-if="filters.enablePoints">
      </v-map>
      <div id="filters">
         <button class="btn-toggle-points" @click="filters.enablePoints = !filters.enablePoints">EP</button>
         <multiselect
            v-model="filters.selectedCodes"
            :options="filters.availableOptions"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="false"
            :hide-selected="true"
            placeholder="Select category(ies)"
            label="name"
            track-by="name"
            @select="filterSearch"></multiselect>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import Vue2Leaflet from 'vue2-leaflet';
import Multiselect from 'vue-multiselect';
import VueResource from 'vue-resource';

import dateFns from 'date-fns';

require('leaflet.heat');

// Register Components Globally
Vue.component(Multiselect);

L.Icon.Default.imagePath = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.3/images/';

Vue.use(VueResource);

// DATA HAS WEIRD COORDINATE LOCATIONS

let ncodes = "ABANDONED VEHICLE|ACCIDENT|ACCIDENT DEALYED REP|ACCIDENT DELAYED REP|ACCIDENT HIGHWAY|ACCIDENT ROLLOVER OR|ACCIDENT W/INJURIES|ACCIDENT/EMERGENCY O|ACCIDENT-MINOR|ANIMAL BITE|ANIMAL BITE/ABUSE|ANIMAL CALL/ABUSE|ANY FIRE NOT OTHERWI|AOA|AOA (ASSIST TO OTHER|ASSAULT DELAYED|ASSAULT IN PROGRESS|ASSAULT JUST OCCURRE|AUDIBLE ALARM|BEVERAGE VIOLATION|BIOLOGICAL HAZARD|BOAT MARINE-FIRE|BOAT-MARINE ACCIDENT|BOMB THREAT|BREAKING & ENTERING|BURGLARY VEHICLE|CHILD MOLESTATION DE|CHILD MOLESTATION IN|CHILD MOLESTATION JU|CHILD/ELDERLY ABUSE|CIVIL MATTER|CODE ENFORCEMENT|COMMERCIAL STRUCTURE|CONTACT|DEAD PERSON|DISTURBANCE|DISTURBANCE - NOISE|DISTURBANCE JUVENILE|DISTURBANCE NEIGHBOR|DOMESTIC DISTURBANCE|DROWNING|DROWNING OPEN WATER|DRUNK DRIVER|DRUNK PEDESTRIAN|ELECTRICAL/UTILITY F|ELEVATOR RESCUE|EMBEZZLEMENT FRAUD|EMBEZZLEMENT-FRAUD D|EMBEZZLEMENT-FRAUD I|EMBEZZLEMENT-FRAUD J|ESCAPED PRISONER|EXPLOSION|FELONY|FIGHT DELAYED|FIGHT IN PROGRESS|FIGHT JUST OCCURRED|FIRE ALARM|FIRST ALARM|FORGERY-COUNTERFEIT|FRAUD LATE REPORT|GAMBLING|GPS TRACKER|HAZ-MAT INCIDENT|HEAVY RESCUE (COLLAS|HIT & RUN DELAYED RE|HIT & RUN W/INJURIES|HIT AND RUN|HOLD-UP ALARM|IMPERSONATING OFFICE|INFORMATION|KIDNAPPING/FALSE IMP|LARCENY DELAYED|LARCENY IN PROGRESS|LARCENY JUST OCCURRE|LARCENY-AUTO PARTS D|LARCENY-AUTO PARTS I|LARCENY-AUTO PARTS J|LEWD LACIVIOUS ACTS|LEWD-LASCIVIOUS ACTS|LOOSE FARM ANIMAL ON|LOST  FOUND PROPERTY|LOST/FOUND PROPERTY|MARINE ACCIDENT/EMER|MEDICAL -  CHEST PAI|MEDICAL -  ELECTROCU|MEDICAL -  FALL INJU|MEDICAL -  FALL NO I|MEDICAL -  HEAT/COLD|MEDICAL -  OVER DOSE|MEDICAL - ABDMONIAL|MEDICAL - ALLERGIC R|MEDICAL - BURN|MEDICAL - CHOKING|MEDICAL - DIABETIC|MEDICAL - HEART ATTA|MEDICAL - HEMORRHAGE|MEDICAL - INJURY|MEDICAL - INTERFACIL|MEDICAL - OBSTETRICA|MEDICAL - PASSED OUT|MEDICAL - PERSON DOW|MEDICAL - SEIZURE|MEDICAL - SICK PERSO|MEDICAL - STROKE|MEDICAL - TROUBLE BR|MEDICAL - UNKNOWN ME|MEDICAL ALARM|MENTALLY ILL PERSON|MISDEMEANOR|MISSING PERSON|MISSING PERSON (ENDA|MISSING PERSON (RECO|MISSING PERSON JUVEN|MURDER|NARCOTICS|ON VIEW|OPEN DOOR|POLICE SERVICE CALL|PRINTRAK TEST EVENT|PRIVATE INVESTIGATOR|PROWLER/PEEPING TOM|RE-CALL|RECKLESS DRIVING|RECKLESS OPERATION-B|RESIDENTIAL FIRE|ROBBERY - IN-PROGRES|ROBBERY - JUST OCCUR|ROBBERY DELAYED|SCC TEST TYPE PRIORI|SECOND ALARM|SEXUAL ASSAULT DELAY|SEXUAL ASSAULT IN-PR|SEXUAL ASSAULT JUST|SHOOTING DELAYED|SHOOTING IN PROGRESS|SHOOTING JUST OCCURR|SHOPLIFTER|SILENT ALARM|SILENT HOLD-UP ALARM|SILENT INTRUSION ALA|SMOKE INVESTIGATION|SNAKE CALL|SPECIAL DETAIL|STABBING DELAYED|STABBING IN PROGRESS|STABBING JUST OCCURR|STALKER DELAYED|STALKER IN PROGRESS|STALKER JUST OCCURRE|STOLEN TAG DELAYED|STOLEN TAG IN PROGRE|STOLEN TAG JUST OCCU|STOLEN TAG RECOVERY|STOLEN VEHICLE DELAY|STOLEN VEHICLE IN PR|STOLEN VEHICLE JUST|STOLEN VEHICLE RECOV|SUICIDE IN PROGRESS|SUICIDE THREATS ONLY|SUSPICIOUS INCIDENT|SUSPICIOUS PERSON|SUSPICIOUS VEHICLE|THEFT ATTEMPT|THEFT DELAYED|THIRD ALARM|TRAFFIC|TRAFFIC STOP|TRESPASSING|VANDALISM/MALICIOUS|VEHICLE ALARM|VEHICLE FIRE|VICE CASE (NON DRUG)".split("|");


export default {
  name: 'map',
  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer' :Vue2Leaflet.TileLayer,
    'v-marker': Vue2Leaflet.Marker,
    Multiselect
  },
  mounted() {
    this.filters.availableOptions = ncodes.map(code => {
      return { name: code };
    });

    this.mapObject = this.$children[0].mapObject;


    this.$http.get(this.getMeAUrl()).then(res => {
      // TAKE THE RESPONSE BODY AND UPDATE THE STATE activeMarkers
      this.activeMarkers = res.body.map(this.processMarkers).filter(v => v !== false)
      var heatMapMarkers = res.body.map(call => {
        var callArrived = dateFns.format(dateFns.parse(call.actdate), 'HHmm');
        //console.log(callArrived);
        var seriousness = 1; // between 1 - 500
        var timeToArrive = +call.timedisp - callArrived;
        var SERIOUSNESS_THRESHOLD = 180;
        if(timeToArrive > SERIOUSNESS_THRESHOLD) {
          seriousness = 500;
        } else {
          seriousness = timeToArrive * 500 / SERIOUSNESS_THRESHOLD;
        }
        return [
          call.location.coordinates[1],
          call.location.coordinates[0],
          seriousness];
      });
      this.heatMap = L.heatLayer(heatMapMarkers).addTo(this.mapObject);

      return;
      this.heatMap = L.heatLayer(
        res.body.map(this.processMarkersForHeatMap)
        .filter(v => v !== false), {
          radius: 25
        }
      ).addTo(this.mapObject);
      //console.log(heat);
    }, err => {

    });
  },
  data () {
    return {
      zoom: 10,
      center:[26.1411526,-80.2200131],
      url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: L.latLng(26.1411526,-80.2200131),
      activeMarkers: [],
      // HEATMAP
      heatMap: null,
      mapObject: null,
      // SELECT
      filters: {
        selectedCodes: [],
        availableOptions: [],
        enablePoints: false
      }
    }
  },
  methods: {
    getMeAUrl(where = false, limit = 100) {
      return `https://fortlauderdale.data.socrata.com/resource/uqjx-pish.json?$limit=${limit}&$where=actdate > "2016-06-01T00:00:00.000" AND geox > 25 ` + (where ? `AND (${where})` : '');
    },
    processMarkers(v) {
      if(v.location) {
        return L.latLng(v.location.coordinates[1],v.location.coordinates[0]);
      }
      return false;
    },
    processMarkersForHeatMap(v) {
      if(v.location) {
        return [v.location.coordinates[1],v.location.coordinates[0], 100];
      }
      return false;
    },
    filterSearch(e) {
      var codeQuery = [`"${e.name}"`]
        .concat(this.filters.selectedCodes.map(c => `"${c.name}"`))
        .join(" OR ncodedesc=");
      //console.log();
      //let url = `${baseUrl} AND (ncodedesc=${codeQuery})`;
      this.$http.get(this.getMeAUrl(`ncodedesc=${codeQuery}`, 500)).then(res => {
        this.activeMarkers = res.body.map(this.processMarkers).filter(v => v !== false)
        this.heatMap.remove();

        var heatMapMarkers = res.body.map(call => {
          var callArrived = dateFns.format(dateFns.parse(call.actdate), 'HHmm');
          //console.log(callArrived);
          var seriousness = 1; // between 1 - 500
          var timeToArrive = +call.timedisp - callArrived;
          var SERIOUSNESS_THRESHOLD = 180;
          if(timeToArrive > SERIOUSNESS_THRESHOLD) {
            seriousness = 500;
          } else {
            seriousness = timeToArrive * 500 / SERIOUSNESS_THRESHOLD;
          }
          return [
            call.location.coordinates[1],
            call.location.coordinates[0],
            seriousness];
        });
        this.heatMap = L.heatLayer(heatMapMarkers).addTo(this.mapObject);
      });

    }
  }
}
</script>
