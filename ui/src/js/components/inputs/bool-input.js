import { TatorElement } from "../tator-element.js";
import { hasPermission } from "../../util/has-permission.js";

export class BoolInput extends TatorElement {
  constructor() {
    super();

    const fieldset = document.createElement("fieldset");
    this._shadow.appendChild(fieldset);

    const div = document.createElement("div");
    div.setAttribute("class", "radio-slide-wrap d-flex flex-justify-between flex-items-center");
    fieldset.appendChild(div);

    this._legend = document.createElement("legend");
    div.appendChild(this._legend);

    this._controls = document.createElement("div");
    this._controls.setAttribute("class", "d-flex flex-items-center col-8");
    div.appendChild(this._controls);

    this._on = document.createElement("input");
    this._on.setAttribute("class", "hidden");
    this._on.setAttribute("type", "radio");
    this._on.setAttribute("id", "on");
    this._on.setAttribute("name", "asdf");
    this._on.checked = true;
    this._controls.appendChild(this._on);

    this._onLabel = document.createElement("label");
    this._onLabel.setAttribute("for", "on");
    this._controls.appendChild(this._onLabel);

    this._off = document.createElement("input");
    this._off.setAttribute("class", "hidden");
    this._off.setAttribute("type", "radio");
    this._off.setAttribute("id", "off");
    this._off.setAttribute("name", "asdf");
    this._controls.appendChild(this._off);

    this._offLabel = document.createElement("label");
    this._offLabel.setAttribute("for", "off");
    this._controls.appendChild(this._offLabel);

    const span = document.createElement("span");
    span.setAttribute("class", "radio-slide rounded-2");
    this._controls.appendChild(span);
    this._span = span;

    this._on.addEventListener("change", () => {
      this.dispatchEvent(new Event("change"));
      this._onLabel.blur();
      this._offLabel.blur();
    });

    this._off.addEventListener("change", () => {
      this.dispatchEvent(new Event("change"));
      this._onLabel.blur();
      this._offLabel.blur();
    });

    span.addEventListener("click", () => {
      if (this._on.checked) {
        this._offLabel.click();
      } else {
        this._onLabel.click();
      }
    });
  }

  static get observedAttributes() {
    return ["name", "on-text", "off-text"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "name":
        this._legend.textContent = newValue;
        break;
      case "on-text":
        this._onLabel.textContent = newValue;
        break;
      case "off-text":
        this._offLabel.textContent = newValue;
        break;
    }
  }

  set permission(val) {
    if (hasPermission(val, "Can Edit")) {
      this._on.removeAttribute("readonly");
      this._off.removeAttribute("readonly");
      this._onLabel.removeEventListener("click", this._preventDefault);
      this._offLabel.removeEventListener("click", this._preventDefault);
    } else {
      this._on.setAttribute("readonly", "");
      this._off.setAttribute("readonly", "");
      this._onLabel.addEventListener("click", this._preventDefault);
      this._offLabel.addEventListener("click", this._preventDefault);
    }
  }

  set default(val) {
    this._default = val;
  }
  
  changed(){
    return this.getValue() !== this._default;
  }

  reset() {
    // Go back to default value
    if (typeof this._default !== "undefined") {
      this.setValue(this._default);
    } else {
      this.setValue(false);
    }
  }

  getValue() {
    return this._on.checked;
  }

  setValue(val) {
    if (val) {
      this._on.checked = true;
      this._off.checked = false;
      this._on.setAttribute("checked", "");
      this._off.removeAttribute("checked");
    } else {
      this._on.checked = false;
      this._off.checked = true;
      this._on.removeAttribute("checked");
      this._off.setAttribute("checked", "");
    }
  }

  setDisable(val)
  {
    if (val)
    {
      this._on.setAttribute("disabled", true);
      this._off.setAttribute("disabled", true);
      this._span.style.backgroundColor = "#6d7a96";
      this._span.style.cursor = "not-allowed";
    }
    else
    {
      this._on.removeAttribute("disabled");
      this._off.removeAttribute("disabled");
      this._span.style.backgroundColor = null;
      this._span.style.cursor = null;
    }
  }

  _preventDefault(evt) {
    evt.preventDefault();
  }
}

customElements.define("bool-input", BoolInput);
