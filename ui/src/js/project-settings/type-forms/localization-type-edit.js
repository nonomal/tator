import { TypeFormTemplate } from "./type-form-template.js";
import { getCompiledList } from "../store.js";

export class LocalizationEdit extends TypeFormTemplate {
  constructor() {
    super();
    this.typeName = "LocalizationType";
    this.readableTypeName = "Localization Type";
    this._hideAttributes = false;

    // 
    var templateInner = document.getElementById("localization-type-edit");
    var innerClone = document.importNode(templateInner.content, true);
    this._shadow.appendChild(innerClone);

    this._form = this._shadow.getElementById("localization-type-edit--form");
    this._editName = this._shadow.getElementById("localization-type-edit--name");
    this.dtypeSelect = this._shadow.getElementById("localization-type-edit--data-type");  
    this._editDescription = this._shadow.getElementById("localization-type-edit--description");
    this._colorMap = this._shadow.getElementById("localization-type-edit--color-map");
    this._visibleBool = this._shadow.getElementById("localization-type-edit--visible");
    this._drawableBool = this._shadow.getElementById("localization-type-edit--drawable");
    
    this._lineWidth = this._shadow.getElementById("localization-type-edit--line-width");
    this._lineWidth._input.min = 1;
    this._lineWidth._input.max = 10;

    this._groupingDefault = this._shadow.getElementById("localization-type-edit--grouping-default");
    this._mediaCheckboxes = this._shadow.getElementById("localization-type-edit--media");
  }

  async _setupFormUnique() {
    // dtype
    const dTypeOptions = [
      { "label": "Select", "value": "" },
      { "label": "Box", "value": "box" },
      { "label": "Line", "value": "line" },
      { "label": "Dot", "value": "dot" },
      { "label": "Poly", "value": "poly" }
    ];
    if(typeof this.dtypeSelect._choices == "undefined") this.dtypeSelect.choices = dTypeOptions;
    if (!this._data.dtype || this._data.dtype === "") {
      this.dtypeSelect._select.required = true;
      this.dtypeSelect.setValue("");
      this.dtypeSelect.default = "";
      this.dtypeSelect._select.disabled = false;
    } else {
      this.dtypeSelect.setValue(this._data.dtype);
      this.dtypeSelect.default = this._data.dtype;
      this.dtypeSelect._select.disabled = true;
    }

    // description
    this._editDescription.setValue(this._data.description);
    this._editDescription.default = this._data.description;

    // color map
    if (this._data.colorMap && this._data.colorMap.default) {
      this._colorMap.setValue(this._data.colorMap.default);
      this._colorMap.default = this._data.colorMap.default;
    } else {
      this._colorMap.setValue(null);
      this._colorMap.default = null;
    }

    // visible
    this._visibleBool.setValue(this._data.visible);
    this._visibleBool.default = this._data.visible;

    // drawable
    this._drawableBool.setValue(this._data.drawable);
    this._drawableBool.default = this._data.drawable;

    // line_width
    this._lineWidth.setValue(this._data.line_width);
    this._lineWidth.default = this._data.line_width;


    // grouping default
    this._groupingDefault.setValue(this._data.grouping_default);
    this._groupingDefault.default = this._data.grouping_default;

    // const MEDIA = "Media"; 
    if (typeof this._data.media !== "undefined") {
      try {
        const mediaListWithChecked = await getCompiledList({ type: "MediaType", skip: null, check: this._data.media});
        this._mediaCheckboxes.setValue(mediaListWithChecked);
        this._mediaCheckboxes.default = mediaListWithChecked;
      } catch (err) {
        console.error("Error populating media list.", err);
      }
    }
  }

  _getFormData(){
    const formData = {};
    const isNew = this._data.id == "New" ? true : false;

    if (this._editName.changed() || isNew) {
      formData.name = this._editName.getValue();
    }

    if (this.dtypeSelect.changed() || isNew) {
      formData.dtype = this.dtypeSelect.getValue()
    }

    if (this._editDescription.changed() || isNew) {
      formData.description = this._editDescription.getValue();
    }

    if (this._colorMap.changed() || isNew) {
      formData.colorMap = {};
      const colorMapDefaultVal = this._colorMap.getValue();
      if (this._colorMap.getValue() !== null) {
        formData.colorMap.default = colorMapDefaultVal;
      }
    }

    if (this._visibleBool.changed() || isNew) {
      formData.visible = this._visibleBool.getValue();
    }

    if (this._drawableBool.changed() || isNew) {
      formData.drawable = this._drawableBool.getValue();
    }

    if (this._lineWidth.changed() || isNew) {
      formData.line_width = Number(this._lineWidth.getValue());
    }

    if (this._groupingDefault.changed() || isNew) {
      formData.grouping_default = this._groupingDefault.getValue();
    }

    if (this._mediaCheckboxes.changed() || isNew) {
      formData.media_types = this._mediaCheckboxes.getValue();
    }

    return formData;
  }
  
}

customElements.define("localization-edit", LocalizationEdit);
