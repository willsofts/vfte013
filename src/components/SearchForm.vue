<template>
<div id="searchpanel" class="panel-body search-panel">
    <div class="row row-height">
        <div class="col-height col-md-3">
            <label for="templates">{{ labels.templates_label }}</label>
            <InputMask v-model="localData.template" id="templates" picture="(50)X" /> 
        </div>
        <div class="col-height col-md-3">
            <label for="templatetypes">{{ labels.templatetypes_label }}</label>
            <InputMask v-model="localData.templatetype" id="templatetypes" picture="(50)X" /> 
        </div>
        <div class="col-height col-md">
            <br/>
            <button id="searchbutton" @click="searchClick" class="btn btn-dark btn-sm btn-ctrl"><i class="fa fa-search fa-btn-icon" aria-hidden="true"></i>{{ labels.search_button }}</button>
            <button id="resetbutton" @click="resetClick" class="btn btn-dark btn-sm btn-ctrl"><i class="fa fa-refresh fa-btn-icon" aria-hidden="true"></i>{{ labels.reset_button }}</button>
            <button id="insertbutton" @click="insertClick" class="btn btn-dark btn-sm btn-ctrl pull-right"><i class="fa fa-plus fa-btn-icon" aria-hidden="true"></i>{{ labels.insert_button }}</button>
        </div>
    </div>
    <div id="listpanel" class="table-responsive fa-list-panel">
        <DataTable ref="dataTable" :settings="tableSettings" :labels="labels" :dataset="dataset" @data-select="dataSelected" @data-sort="dataSorted" />
        <DataPaging ref="dataPaging" :settings="pagingSettings" @page-select="pageSelected" />
    </div>
</div>
</template>
<script>
import { ref } from 'vue';
import $ from "jquery";
import { DEFAULT_CONTENT_TYPE, getApiUrl }  from '@willsofts/will-app';
import { startWaiting, stopWaiting, submitFailure, serializeParameters }  from '@willsofts/will-app'
import { Paging } from "@willsofts/will-app";
import { InputMask, DataTable, DataPaging } from '@willsofts/will-control';

const APP_URL = "/api/sfte013";
const defaultData = {
  template: "",
  templatetype: "",
};

const tableSettings = {
    sequence: { label: "seqno_label" },
    columns: [
        {name: "template", type: "STRING", sorter: "template", label: "template_headerlabel" },
        {name: "templatetype", type: "STRING", sorter: "templatetype", label: "templatetype_headerlabel" },
        {name: "subjecttitle", type: "STRING", sorter: "subjecttitle", label: "subjecttitle_headerlabel" },
    ],        
    actions: [
        {type: "button", action: "edit"},
        {type: "button", action: "delete"},
    ],
};

export default {
  components: {
    InputMask, DataTable, DataPaging
  },
  props: {
    labels: Object,
    formData: Object,
    dataCategory: Object
  },
  emits: ["data-select","data-insert"],
  setup(props) {
    const localData = ref({ ...defaultData, ...props.formData });
    let paging = new Paging();
    let pagingSettings = paging.setting;
    let filters = {};
    const dataset = ref({});
    return { localData, tableSettings, pagingSettings, paging, filters, dataset };
  },
  methods: {
    reset(newData) {
      if(newData) this.localData = {...newData};
    },
    getPagingOptions(settings) {
      if(!settings) settings = this.pagingSettings;
      return {page: settings.page, limit: settings.limit, rowsPerPage: settings.rowsPerPage, orderBy: settings.orderBy?settings.orderBy:"", orderDir: settings.orderDir?settings.orderDir:"" };
    },
    resetClick() {
      this.localData = {...defaultData};
      this.resetFilters();
      this.$refs.dataTable.clear();
      this.$refs.dataPaging.clear();
      this.pagingSettings.rows = 0;
    },
    insertClick() {
      this.$emit('data-insert',this.filters);
    },
    searchClick() {
      this.filters = {...this.localData};
      this.resetFilters();
      this.search();
    },
    resetFilters() {
      this.pagingSettings.page = 1;
      this.pagingSettings.orderBy = "";
      this.pagingSettings.orderDir = "";
    },
    search(ensurePaging=false) {
      if(ensurePaging) {
        if(this.pagingSettings.rows <= 1 && this.pagingSettings.page > 1) {
          this.pagingSettings.page = this.pagingSettings.page - 1;
        }
      }
      console.log("search: pagingSettings",this.pagingSettings);
      let options = this.getPagingOptions();
      this.collecting(options,this.filters);
    },
    collecting(options,criterias) {
      console.log("collecting: options",options,", criteria",criterias);
      let jsondata = Object.assign({ajax: true},options);
      let formdata = serializeParameters(jsondata,criterias);
      startWaiting();
      $.ajax({
        url: getApiUrl()+APP_URL+"/collect",
        data: formdata.jsondata,
        headers : formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) {
          console.error("error: status",status,"errorThrown",errorThrown);
          submitFailure(transport,status,errorThrown);
        },
        success: (data) => {
          stopWaiting();
          console.log("collecting: success",data);
          if(data.body) {
            this.$refs.dataTable.reset(data.body);
            this.$refs.dataPaging.reset(data.body?.offsets);
            this.pagingSettings.rows = data.body?.rows?.length;
          }
        }
      });	
    },
    pageSelected(item) {
      console.log("page selected:",item);
      this.pagingSettings.page = item.page;
      let options = this.getPagingOptions();
      this.collecting(options,this.filters);
    },
    dataSelected(item,action) {
      console.log("dataSelected",item,"action",action);
      this.$emit('data-select', item, action);
    },
    dataSorted(sorter,direction) {
      console.log("dataSorted",sorter,"direction",direction);
      this.pagingSettings.orderBy = sorter;
      this.pagingSettings.orderDir = direction;
      let options = this.getPagingOptions();
      this.collecting(options,this.filters);
    },
  }
};
</script>
