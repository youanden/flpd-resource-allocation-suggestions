<template>
  <div>
    <div id="map_container">
      <v-map :zoom="zoom" :center="center" ref="fullscreenMap">
        <v-tilelayer :url="url" :attribution="attribution"></v-tilelayer>
        <v-marker v-for="marker in activeMarkers" :lat-lng="marker.latlng" v-if="filters.enablePoints">
          <v-popup :content="marker.content"></v-popup>
        </v-marker>
      </v-map>
      <div id="filters">
         <button class="btn-toggle-points" @click="filters.enablePoints = !filters.enablePoints">EP</button>
         <multiselect
            v-model="filters.selectedCodes"
            :options="filters.availableOptions"
            :multiple="true"
            :close-on-select="false"
            :clear-on-select="true"
            :hide-selected="true"
            placeholder="Select category(ies)"
            label="name"
            track-by="name"
            @input="filterSearch"></multiselect>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import Vue2Leaflet from 'vue2-leaflet';
import Multiselect from 'vue-multiselect';
import VueResource from 'vue-resource';

import dateFns, { parse, format, startOfDay, addHours, addMinutes, differenceInMinutes } from 'date-fns';

Vue.use(VueResource);

// Multiselect styles
require('../../node_modules/vue-multiselect/dist/vue-multiselect.min.css');
// Leaflet static image dependencies
require('../../node_modules/leaflet/dist/images/marker-icon-2x.png');
require('../../node_modules/leaflet/dist/images/marker-shadow.png');


L.Icon.Default.imagePath = process.env.basePath + 'static/';

require('leaflet.heat');

// Register Components Globally
Vue.component(Multiselect);

// TODO: Check if socrata lets me get distinct rows from a column
// TODO: SOCRATA DOESN'T LIKE & SO URL ENCODE BEFORE SENDING PARAMS (& = %26)
let ncodes = "ABANDONED VEHICLE|ACCIDENT|ACCIDENT DEALYED REP|ACCIDENT DELAYED REP|ACCIDENT HIGHWAY|ACCIDENT ROLLOVER OR|ACCIDENT W/INJURIES|ACCIDENT/EMERGENCY O|ACCIDENT-MINOR|ANIMAL BITE|ANIMAL BITE/ABUSE|ANIMAL CALL/ABUSE|ANY FIRE NOT OTHERWI|AOA|AOA (ASSIST TO OTHER|ASSAULT DELAYED|ASSAULT IN PROGRESS|ASSAULT JUST OCCURRE|AUDIBLE ALARM|BEVERAGE VIOLATION|BIOLOGICAL HAZARD|BOAT MARINE-FIRE|BOAT-MARINE ACCIDENT|BOMB THREAT|BREAKING & ENTERING|BURGLARY VEHICLE|CHILD MOLESTATION DE|CHILD MOLESTATION IN|CHILD MOLESTATION JU|CHILD/ELDERLY ABUSE|CIVIL MATTER|CODE ENFORCEMENT|COMMERCIAL STRUCTURE|CONTACT|DEAD PERSON|DISTURBANCE|DISTURBANCE - NOISE|DISTURBANCE JUVENILE|DISTURBANCE NEIGHBOR|DOMESTIC DISTURBANCE|DROWNING|DROWNING OPEN WATER|DRUNK DRIVER|DRUNK PEDESTRIAN|ELECTRICAL/UTILITY F|ELEVATOR RESCUE|EMBEZZLEMENT FRAUD|EMBEZZLEMENT-FRAUD D|EMBEZZLEMENT-FRAUD I|EMBEZZLEMENT-FRAUD J|ESCAPED PRISONER|EXPLOSION|FELONY|FIGHT DELAYED|FIGHT IN PROGRESS|FIGHT JUST OCCURRED|FIRE ALARM|FIRST ALARM|FORGERY-COUNTERFEIT|FRAUD LATE REPORT|GAMBLING|GPS TRACKER|HAZ-MAT INCIDENT|HEAVY RESCUE (COLLAS|HIT & RUN DELAYED RE|HIT & RUN W/INJURIES|HIT AND RUN|HOLD-UP ALARM|IMPERSONATING OFFICE|INFORMATION|KIDNAPPING/FALSE IMP|LARCENY DELAYED|LARCENY IN PROGRESS|LARCENY JUST OCCURRE|LARCENY-AUTO PARTS D|LARCENY-AUTO PARTS I|LARCENY-AUTO PARTS J|LEWD LACIVIOUS ACTS|LEWD-LASCIVIOUS ACTS|LOOSE FARM ANIMAL ON|LOST  FOUND PROPERTY|LOST/FOUND PROPERTY|MARINE ACCIDENT/EMER|MEDICAL -  CHEST PAI|MEDICAL -  ELECTROCU|MEDICAL -  FALL INJU|MEDICAL -  FALL NO I|MEDICAL -  HEAT/COLD|MEDICAL -  OVER DOSE|MEDICAL - ABDMONIAL|MEDICAL - ALLERGIC R|MEDICAL - BURN|MEDICAL - CHOKING|MEDICAL - DIABETIC|MEDICAL - HEART ATTA|MEDICAL - HEMORRHAGE|MEDICAL - INJURY|MEDICAL - INTERFACIL|MEDICAL - OBSTETRICA|MEDICAL - PASSED OUT|MEDICAL - PERSON DOW|MEDICAL - SEIZURE|MEDICAL - SICK PERSO|MEDICAL - STROKE|MEDICAL - TROUBLE BR|MEDICAL - UNKNOWN ME|MEDICAL ALARM|MENTALLY ILL PERSON|MISDEMEANOR|MISSING PERSON|MISSING PERSON (ENDA|MISSING PERSON (RECO|MISSING PERSON JUVEN|MURDER|NARCOTICS|ON VIEW|OPEN DOOR|POLICE SERVICE CALL|PRINTRAK TEST EVENT|PRIVATE INVESTIGATOR|PROWLER/PEEPING TOM|RE-CALL|RECKLESS DRIVING|RECKLESS OPERATION-B|RESIDENTIAL FIRE|ROBBERY - IN-PROGRES|ROBBERY - JUST OCCUR|ROBBERY DELAYED|SCC TEST TYPE PRIORI|SECOND ALARM|SEXUAL ASSAULT DELAY|SEXUAL ASSAULT IN-PR|SEXUAL ASSAULT JUST|SHOOTING DELAYED|SHOOTING IN PROGRESS|SHOOTING JUST OCCURR|SHOPLIFTER|SILENT ALARM|SILENT HOLD-UP ALARM|SILENT INTRUSION ALA|SMOKE INVESTIGATION|SNAKE CALL|SPECIAL DETAIL|STABBING DELAYED|STABBING IN PROGRESS|STABBING JUST OCCURR|STALKER DELAYED|STALKER IN PROGRESS|STALKER JUST OCCURRE|STOLEN TAG DELAYED|STOLEN TAG IN PROGRE|STOLEN TAG JUST OCCU|STOLEN TAG RECOVERY|STOLEN VEHICLE DELAY|STOLEN VEHICLE IN PR|STOLEN VEHICLE JUST|STOLEN VEHICLE RECOV|SUICIDE IN PROGRESS|SUICIDE THREATS ONLY|SUSPICIOUS INCIDENT|SUSPICIOUS PERSON|SUSPICIOUS VEHICLE|THEFT ATTEMPT|THEFT DELAYED|THIRD ALARM|TRAFFIC|TRAFFIC STOP|TRESPASSING|VANDALISM/MALICIOUS|VEHICLE ALARM|VEHICLE FIRE|VICE CASE (NON DRUG)".split("|");

// Helper Functions

// TODO: bug still possible when call arrives at 1159 and officer is dispatched next day (i.e. 0002)
// Potential fix would be to see if hour of call is > 20 then run condition to check if dispatched
// hour is < 2 - 4 hour window might prove useful as data correction.
const setTimeOfDay = (date, timeOfDay) => {
  var hours = timeOfDay.substring(0, 2);
  var mins  = timeOfDay.substring(2);
  return addHours(addMinutes(startOfDay(date), mins), hours);
};

// Vue Component Definition
export default {
  name: 'map',
  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer' :Vue2Leaflet.TileLayer,
    'v-popup' :Vue2Leaflet.Popup,
    'v-marker': Vue2Leaflet.Marker,
    Multiselect
  },
  mounted() {
    this.filters.availableOptions = ncodes.map(code => ({ name: code }));

    this.mapObject = this.$refs.fullscreenMap.mapObject;

    this.fetchMapData();
  },
  data () {
    return {
      zoom: 12,
      center: [26.1402244,-80.1908217],
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: L.latLng(26.1402244,-80.1908217),
      activeMarkers: [],
      // HEATMAP
      heatMap: null,
      mapObject: null,
      // SELECT
      // TODO: Refactor into separate Filters Component - Map should just receive points and settings
      filters: {
        selectedCodes: [],
        availableOptions: [],
        enablePoints: false
      },
      popupFields: [
        'capriority',
        'actdate',
        'timedisp',
        'timearrive',
        'timeclear',
        'emshift',
        'officer',
        'ncodedesc',
        'zone',
        'zip'
      ]
    }
  },
  methods: {
    fetchMapData(type = 'init', codeQuery) {
      this.$root.loading();
      var reqUrl = this.getMeAUrl();
      if(type !== 'init') {
        this.heatMap.remove();
        reqUrl = this.getMeAUrl(`ncodedesc=${codeQuery}`, 500);
      }
      this.$http.get(reqUrl).then(res => {
        // TAKE THE RESPONSE BODY AND UPDATE THE STATE activeMarkers
        this.activeMarkers = this.processMarkers(res.body)
        var heatMapMarkers = res.body.map(call => {
          // TODO - move this to the query to avoid sanity checking in code!
          if(!call.timedisp || !call.actdate || !call.timearrive) {
            return [0,0,0];
          }
          // TODO: Move this calculation to the ajax response of the raw data to avoid heavy recalculation
          let callArrived = parse(call.actdate);
          // Not all mil time is a 4 digit string - this normalizes it
          let disp = ('0000' + call.timedisp).substring(call.timedisp.length);
          let arrived = ('0000' + call.timearrive).substring(call.timearrive.length);
          // TODO: Simplify - if disp > HHmm of callArrived assume officer arrived next day
          let officerDispatched = setTimeOfDay(callArrived, disp);
          let officerArrived = setTimeOfDay(callArrived, arrived)
          var minutesToArrive = differenceInMinutes(officerArrived, officerDispatched);


          var seriousness = 0;

          var RESPONSE_THRESHOLD_IN_MINUTES = 30;
          if(minutesToArrive > RESPONSE_THRESHOLD_IN_MINUTES) {
            seriousness = 1;
          } else {
            seriousness = minutesToArrive / RESPONSE_THRESHOLD_IN_MINUTES;
          }

          return [
            call.location.coordinates[1],
            call.location.coordinates[0],
            seriousness
          ];
        });
        this.heatMap = L.heatLayer(heatMapMarkers, {
          maxZoom: 1,
          radius: 20
        }).addTo(this.mapObject);

        this.$root.loaded();
      }, err => {
        this.$root.loaded();
      });
    },
    getMeAUrl(where = false, limit = 250) {
      return `https://fortlauderdale.data.socrata.com/resource/uqjx-pish.json?$limit=${limit}&$where=timedisp IS NOT NULL AND actdate > "2016-01-01T00:00:00.000" AND geox > 25 ` + (where ? `AND (${where})` : '');
    },
    processMarkers(markers) {
      return markers.filter(m => m.location)
        .map(m => ({
          latlng: L.latLng(m.location.coordinates[1], m.location.coordinates[0]),
          content: `
            <b>Case: ${Number(m.case_id)}</b><br>
            ${this.popupFields.map(field => (
              `${field.toUpperCase()}: ${m[field]}`
            )).join('<br>')}
          `
        }));
    },
    processMarkersForHeatMap(markers) {
      return markers.filter(m => m.location)
        .map(m => [m.location.coordinates[1], m.location.coordinates[0], 1]);
    },
    filterSearch(e) {
      var codeQuery = e.map(c => `"${c.name}"`).join(" OR ncodedesc=");
      this.fetchMapData('update', codeQuery);
    }
  }
}
</script>
