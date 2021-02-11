class TypeForm extends TatorElement {
  constructor() {
    super();

    // Correct name for the type, ie. "LocalizationType"
    this.typeName = "";
    this.readableTypeName = "";

    // Main Div to append content is an "item" for sideNav.
    this.typeFormDiv = document.createElement("div");
    this.typeFormDiv.setAttribute("class", "pl-md-6")
    this._shadow.appendChild(this.typeFormDiv);

    // Required helpers.
    this.boxHelper = new SettingsBox( this.typeFormDiv );
    this.inputHelper = new SettingsInput("");
    this.attributeFormHelper = new AttributesForm();
    
    // Loading spinner
    this.loading = new LoadingSpinner();
    this._shadow.appendChild( this.loading.getImg());
  }

  _init({ data, modal }){
    // Log to verify init
    console.log(`${this.readableTypeName} init.`);
    console.log(data);
    
    // Initial values
    this.data = data;
    this.modal = modal;
    this.projectId = this.data.project;
    this.typeId = this.data.id

    // Register the update nav events
    //if name is edited
    this.updateNavEvent = new Event('settings-nav-update', { detail : `${this.typeName}-${this.typeId}` });
    // trigger when new type added
    this.addNavEvent = new Event('settings-nav-new', { detail : `${this.typeName}-${this.typeId}` });

    // Add form to page
    this.setupFormPage(data)
  }

  setupFormPage(data = this.data) {
    // Log to verify setupTypeFormPage
    console.log(`${this.readableTypeName} setupTypeFormPage.`);

    // Section h1.
    const h1 = document.createElement("h1");
    h1.setAttribute("class", "h2 pb-3 edit-project__h1");

    // Create a form with values, or empty editable form
    if(!this.data.form && !this.data.form != "empty"){
      const t = document.createTextNode(`${this.readableTypeName} ${this.typeId} settings.`); 
      h1.appendChild(t);

      // Add all elements to page
      this.typeFormDiv.appendChild(h1);
      this.typeFormDiv.appendChild( this._getSectionForm( this.data) );
      this.typeFormDiv.appendChild( this._getAttributeSection( ) );
      this.typeFormDiv.appendChild( this._getSubmitDiv( {"id": this.data.id }) );
      this.typeFormDiv.appendChild( this.deleteTypeSection() );
      return this.typeFormDiv;
    } else {
      const t = document.createTextNode(`Add new ${this.readableTypeName}.`); 
      h1.appendChild(t);

      this.typeFormDiv.appendChild(h1);
      this.typeFormDiv.appendChild( this._getSectionForm( this._getEmptyData() ) );
      this.typeFormDiv.appendChild( this._getSubmitNewDiv( {"id": this.data.id }) );

      return this.typeFormDiv;
    }
  }

  _getSubmitNewDiv(){
    let text = document.createTextNode("Save");
    this.savePost = document.createElement("Button");
    this.savePost.appendChild(text);
    this.savePost.setAttribute("value", "Save");
    this.savePost.setAttribute("class", `btn btn-clear text-center f1 text-semibold`);
    this.savePost.style.margin = "0 auto";
    this.savePost.addEventListener("click", this._savePost.bind(this));
    
    return this.savePost;
  }

  _savePost(){
    this.loading.showSpinner();
    let addNew = new TypeNew({
      "type" : this.typeName,
      "projectId" : this.projectId
    });

    let formData = this._getFormData("New", true);
    addNew.saveFetch(formData).then((data) => {
      console.log(data.message);
      this.loading.hideSpinner();
      
      return this._modalComplete(data.message);
    });
  }

  //
  _getSubmitDiv({id = -1} = {}){
    const submitDiv = document.createElement("div");
    submitDiv.setAttribute("class", "d-flex flex-items-center flex-justify-center py-3");

    // Save button and reset link
    submitDiv.appendChild( this._saveEntityButton(id) );
    submitDiv.appendChild( this._resetEntityLink(id) );

    return submitDiv;
  }

  _getAttributeSection(){
    this.attributeSection = document.createElement("attributes-main");
    this.attributeSection.setAttribute("data-from-id", `${this.typeId}`)
    this.attributeSection._init(this.typeName, this.typeId, this.projectId, this.data.attribute_types);

    // Register the update event - If attribute list name changes, or it is to be added/deleted listeners refresh data
    this.attributeSection.addEventListener('settings-refresh', this._attRefreshListener.bind(this) );

    return this.attributeSection;
  }

  _attRefreshListener(e){
    return this.resetHard();
  }

  _saveEntityButton(id){
    this.saveButton = this.inputHelper.saveButton();
    this.saveButton.addEventListener("click", (event) => {
      event.preventDefault();
      if( this._shadow.querySelectorAll(".changed").length > 0 ){
        console.log("Save for id: "+id);
        this._save( {"id":id} )
      } else {
        // @TODO- UX Save button disabled until form change
        let happyMsg = "Nothing new to save!";
        this._modalSuccess( happyMsg );
      }
    });
    return this.saveButton;
  }

  _resetEntityLink(id){
    this.resetLink = this.inputHelper.resetLink();

    // Form reset event
    this.resetLink.addEventListener("click", (event) => {
      event.preventDefault();
      this.reset(id)
      console.log("Reset complete.");
    });
    return this.resetLink;
  }

  // form with parts put together
  _setForm(){
    this._form = document.createElement("form");
    this._form.id = this.typeId;

    this._form.addEventListener("change", this._formChanged.bind(this));

    return this._form;
  }

  _getHeading(){
    let headingSpan = document.createElement("span");
    let labelSpan = document.createElement("span");
    labelSpan.setAttribute("class", "item-label");
    let t = document.createTextNode(`${this.readableTypeName}s`); 
    labelSpan.appendChild(t);
    headingSpan.innerHTML = this.icon;
    headingSpan.appendChild(labelSpan);

    return headingSpan;
  }

  deleteTypeSection(){
    let button = document.createElement("button");
    button.setAttribute("class", "btn btn-small btn-charcoal float-right btn-outline text-gray");
    button.style.marginRight = "10px";

    let deleteText = document.createTextNode(`Delete`);
    button.appendChild( deleteText );

    let descriptionText = `Delete this ${this.readableTypeName} and all its data?`;
    let headingDiv = document.createElement("div");
    headingDiv.setAttribute("class", "clearfix py-6");

    let heading = document.createElement("div");
    heading.setAttribute("class", "py-md-5 float-left col-md-5 col-sm-5 text-right");
    
    heading.appendChild( button );
        
    let description = document.createElement("div");
    let _descriptionText = document.createTextNode("");
    _descriptionText.nodeValue = descriptionText;
    description.setAttribute("class", "py-md-6 f1 text-gray float-left col-md-7 col-sm-7");
    description.appendChild( _descriptionText );
    
    headingDiv.appendChild(heading);
    headingDiv.appendChild(description);

    this.deleteBox = this.boxHelper.boxWrapDelete( {
      "children" : headingDiv
    } );

    this.deleteBox.style.backgroundColor = "transparent";

    button.addEventListener("click", this._deleteTypeConfirm.bind(this))

    return this.deleteBox;
  }

  _deleteTypeConfirm(){
    let button = document.createElement("button");
    let confirmText = document.createTextNode("Confirm")
    button.appendChild(confirmText);
    button.setAttribute("class", "btn btn-clear f1 text-semibold")

    button.addEventListener("click", this._deleteType.bind(this));

    this._modalConfirm({
      "titleText" : `Delete Confirmation`,
      "mainText" : `Pressing confirm will delete this ${this.typeName} and all its data from your account. Do you want to continue?`,
      "buttonSave" : button,
      "scroll" : false    
    });
  }

  _deleteType(){
    this._modalCloseCallback();
    this.loading.showSpinner();
    let deleteType = new TypeDelete({
      "type" : this.typeName,
      "typeId" : this.typeId
    });
  
    if(this.typeId != "undefined"){
      deleteType.deleteFetch().then((data) => {
        console.log(data.message);
        this.loading.hideSpinner();
        return this._modalComplete(data.message);
      });
    } else {
      console.log("this.typeId");
      console.log(this.typeId);
      this.loading.hideSpinner();
      return this._modalError("Error with delete.");
    }

  }

  _getEmptyData() {
    return {
      "id" : `New`,
      "name" : "",
      "description" : "",
      "visible" : false,
      "grouping_default" : false,
      "media" : [],
      "dtype" : "",
      "delete_child_localizations" : false,
      "form" : "empty"
    };
  }


  // FETCH FROM MODEL PROMISE STRUCTURE
  // GET
  _fetchGetPromise({id = this.projectId} = {}){
    return fetch(`/rest/${this.typeName}s/${id}`, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
  }

  // PATCH
  _fetchPatchPromise({id = -1 } = {}){
    console.log("Patch id: "+id);
    let formData = this._getFormData(id);
    console.log(formData);

    //return fetch("/rest/StateType/" + id, {
    return fetch(`/rest/${this.typeName}/${id}`, {
      method: "PATCH",
      mode: "cors",
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    })
  }



  _save({id = -1, globalAttribute = false} = {}){
    this.loading.showSpinner();

    let promises = []
    console.log("Settings _save method for id: "+id);

    let mainForm = this._shadow.getElementById(id);
    let mainFormChanged = false;
    if(mainForm.classList.contains("changed")) {
      mainFormChanged = true;
      promises.push( this._fetchPatchPromise({id}) );
    }
    let hasAttributeChanges =false;
    let attrPromises = null;
    let attrForms = this._shadow. querySelectorAll(`.item-group-${id} attributes-main .attribute-form`);
    let attrFormsChanged = this._shadow.querySelectorAll(`.item-group-${id} attributes-main .attribute-form.changed`);

    if(attrFormsChanged.length > 0 ){
      hasAttributeChanges = true;
      attrPromises = this.attributeFormHelper._getAttributePromises({
        id,
        "entityType" : this.typeName,
        globalAttribute,
        attrForms,
        attrFormsChanged
      });
      promises = [...promises, ...attrPromises.promises];
    }

    let messageObj = {};
    if(promises.length > 0){
      // Check if anything changed
      Promise.all(promises).then( async( respArray ) => {
        console.log(respArray);
        let responses = [];
        respArray.forEach((item, i) => {
          responses.push( item.json() )
        });

          Promise.all( responses )
            .then ( dataArray => {
              messageObj = this._handleResponseWithAttributes({
                id,
                dataArray,
                hasAttributeChanges,
                attrPromises,
                respArray
              });

              let message = "";
              let success = false;
              let error = false;
              if(messageObj.messageSuccess) {
                let heading = `<div class=" pt-4 h3 pt-4">Success</div>`;
                message += heading+messageObj.messageSuccess;
                success = true;
              }
              if(messageObj.messageError) {
                let heading = `<div class=" pt-4 h3 pt-4">Error</div>`;
                message += heading+messageObj.messageError;
                error = true;
              }

              if(messageObj.requiresConfirmation) {
                let buttonSave = this._getAttrGlobalTrigger(id);
                let confirmHeading = `<div class=" pt-4 h3 pt-4">Global Change(s) Found</div>`
                let subText = `<div class="f1 py-2">Confirm to update across all types. Uncheck and confirm, or cancel to discard.</div>`
                
                let mainText = `${message}${confirmHeading}${subText}${messageObj.messageConfirm}`;
                this.loading.hideSpinner();
                this._modalConfirm({
                  "titleText" : "Complete",
                  mainText,
                  buttonSave
                });
              } else {
                let mainText = `${message}`;
                this.loading.hideSpinner();
                this._modalComplete(
                  mainText
                );
                // Reset forms to the saved data from model
                this.resetHard(id);
              }
          }).then( () => {
            console.log(this);
            // Reset changed flag
            for(let f in attrFormsChanged) f.classList.remove("changed");
            let mainForm = this._shadow.getElementById(id);
            if(mainForm.classList.contains("changed")) mainForm.classList.remove("changed");
            
            let attrFormsChanged = this._shadow.querySelectorAll(`.item-group-${id} attributes-main .attribute-form.changed`);
            if(attrFormsChanged.length > 0 ) {
              for(let f of attrFormsChanged) f.classList.remove("changed");
            }
          
          });

        }).catch(err => {
          console.error("File "+ err.fileName + " Line "+ err.lineNumber +"\n" + err);
          this.loading.hideSpinner();
        });
    } else {
      this._modalSuccess("Nothing new to save!");
    }


  }

  _formChanged( event ) {
    if(event != "") console.log("Change value... "+event.target.value);
    return this._form.classList.add("changed");
  }

  _handleResponseWithAttributes({
    id = -1,
    dataArray = [],
    hasAttributeChanges = false,
    attrPromises = [],
    respArray = []}
    = {}){

    let messageSuccess = "";
    let messageError = "";
    let messageConfirm = "";
    let requiresConfirmation = false;

    respArray.forEach((item, i) => {
      let currentMessage = dataArray[i].message;
      let succussIcon = document.createElement("modal-success");
      let iconWrap = document.createElement("span");
      let warningIcon = document.createElement("modal-warning");
      let index = (hasAttributeChanges && respArray[0].url.indexOf("Attribute") > 0) ? i : i-1;
      let formReadable = hasAttributeChanges ? attrPromises.attrNames[index] : "";
      let formReadable2 = hasAttributeChanges ? attrPromises.attrNamesNew[index] : "";

      if( item.status == 200){
        console.log("Return Message - It's a 200 response.");
        iconWrap.appendChild(succussIcon);
        messageSuccess += `<div class="py-2">${iconWrap.innerHTML} <span class="v-align-top">${currentMessage}</span></div>`;
      } else if(item.status != 200){
        if (!hasAttributeChanges ){
          iconWrap.appendChild(warningIcon);
          console.log("Return Message - It's a 400 response for main form.");
          messageError += `<div class="py-2">${iconWrap.innerHTML} <span class="v-align-top">${currentMessage}</span></div>`;
        } else if(hasAttributeChanges && currentMessage.indexOf("global") > 0) {
          console.log("Return Message - It's a 400 response for attr form.");
          let input = `<input type="checkbox" checked name="global" data-old-name="${formReadable}" class="checkbox"/>`;
          let newName = formReadable == formReadable2 ? "" : ` new name "${formReadable2}"`
          messageConfirm += `<div class="py-2">${input} Attribute "${formReadable}" ${newName}</div>`
          requiresConfirmation = true;            
        } else {
          iconWrap.appendChild(warningIcon);
          messageError += `<div class="py-4">${iconWrap.innerHTML} <span class="v-align-top">Changes editing ${formReadable} not saved.</span></div>`
          messageError += `<div class="f1">Error: ${currentMessage}</div>`
        }
      }
    });

    return {requiresConfirmation, messageSuccess, messageConfirm, messageError};
  }

  _getAttrGlobalTrigger(id){
    let buttonSave = document.createElement("button")
    buttonSave.setAttribute("class", "btn btn-clear f1 text-semibold");
    buttonSave.innerHTML = "Confirm";

    buttonSave.addEventListener("click", (e) => {
      e.preventDefault();
      let confirmCheckboxes = this.modal._shadow.querySelectorAll('[name="global"]');
      this._modalCloseCallback();
         
      console.log(confirmCheckboxes);
      for(let check of confirmCheckboxes){
        //add and changed flag back to this one
        console.log(check);
        let name = check.dataset.oldName;
        let formId = `${name.replace(/[^\w]|_/g, "").toLowerCase()}_${id}`;

        //add back changed flag
        this._shadow.querySelector(`#${formId}`).classList.add("changed");

        if(check.checked == true){
          console.log("User marked as global: "+name);
          this._shadow.querySelector(`#${formId}`).dataset.isGlobal = "true";
        } else {
          console.log("User marked NOT global, do not resend: "+name);

          //this._shadow.querySelector(`#${formId}`).dataset.isGlobal = "false";
        }
      }

      //run the _save method again with global true
      this._save({"id" : id, "globalAttribute" : true})
    });

    return buttonSave
  }

  _toggleChevron(e){
    var el = e.target;
    return el.classList.toggle('chevron-trigger-90');
  }

  _toggleAttributes(e){
    let el = e.target.parentNode.nextSibling;
    let hidden = el.hidden

    return el.hidden = !hidden;
  };

  // name
  _getNameFromData({ data = this.data} = {}){
    return data.name;
  }

  _setNameInput(name){
    let key = "name"
    return this.inputHelper.inputText( { "labelText": "Name", "name": key, "value": name } );
  }

  _getNameInputValue(){
    return this._editName.querySelector("input").value;
  }

  _setNameInputValue(newValue){
    return this._editName.querySelector("input").value = newValue;
  }

  _nameChanged() {
    console.log(this.data.name);
    if (this._getNameInputValue() === this._getNameFromData()) return false;
    return true;
  }

  // summary
  _getSummaryFromData({ data = this.data} = {}){
    return data.summary;
  }

  _setSummaryInput(summary){
    let key = "summary";
    return this.inputHelper.inputText( { "labelText": "Summary", "Name": key, "value": summary } )
  }

  _getSummaryInputValue(){
    return this._editSummary.querySelector("input").value;
  }

  _setSummaryInputValue(newValue){
    return this._editSummary.querySelector("input").value = newValue;
  }

  _summaryChanged() {
    if (this._getSummaryInputValue() === this._getSummaryFromData()) return false;
    return true;
  }

  // description
  _getDescriptionFromData({ data = this.data} = {}){
    return data.description;
  }

  _setDescriptionInput(description){
    let key = "description";
    return this.inputHelper.inputText( { "labelText": "Description", "name": key, "value": description } )
  }

  _getDescriptionInputValue(){
    return this._editDescription.querySelector("input").value;
  }

  _setDescriptionInputValue(newValue){
    return this._editDescription.querySelector("input").value = newValue;
  }

  // RESET FUNCTIONS
  reset(data = this.data){
    this.typeFormDiv.innerHTML = "";
    return this.setupFormPage(data);
  }

  async resetHard(){
    console.log("reset hard");
    this.loading.showSpinner();
    Utilities.warningAlert("Refreshing data", "#fff", false);
    const response = await this._fetchGetPromise();
    const data = await response.json();
    this.data = this._findDataById(data)
    Utilities.hideAlert()
    this.loading.hideSpinner();
    return this.reset(this.data);
  }

  _findDataById(allData){
    for(let x in allData){
      if (allData[x].id == this.typeId) return allData[x];
      console.log("didn't match "+allData.id);
    }
    return false;
  }

  // MODAL
  _modalSuccess(message){
    console.log("modal success");
    this._modalClear();
    let text = document.createTextNode(" Success");
    this.modal._titleDiv.innerHTML = "";
    this.modal._titleDiv.append( document.createElement("modal-success") );
    this.modal._titleDiv.append(text);
    this.modal._main.innerHTML = message;
    //this.modal._main.classList.add("fixed-heigh-scroll");

    return this.modal.setAttribute("is-open", "true")
  }

  _modalError(message){
    console.log("modal error");
    this._modalClear();
    let text = document.createTextNode(" Error");
    this.modal._titleDiv.innerHTML = "";
    this.modal._titleDiv.append( document.createElement("modal-warning") );
    this.modal._titleDiv.append(text);
    this.modal._main.innerHTML = message;
    return this.modal.setAttribute("is-open", "true")
  }

  _modalConfirm({
    titleText = "",
    mainText = "",
    buttonSave = document.createElement("button"),
    scroll = true
  } = {}){
    console.log("modal confirm");
    this._modalClear();
    this.modal._titleDiv.innerHTML = titleText;

    if(mainText.nodeType == Node.ELEMENT_NODE){
      this.modal._main.appendChild(mainText);
    } else {
      this.modal._main.innerHTML = mainText;
    }
    
    if(scroll) this.modal._main.classList.add("fixed-heigh-scroll");

    let buttonClose = document.createElement("button")
    buttonClose.setAttribute("class", "btn btn-clear f1 text-semibold btn-charcoal");
    buttonClose.innerHTML = "Cancel";

    buttonClose.addEventListener("click", this._modalCloseCallback);

    this.modal._footer.appendChild(buttonSave);
    this.modal._footer.appendChild(buttonClose);
    return this.modal.setAttribute("is-open", "true");
  }

  _modalComplete(message){
    console.log("modal complete");
    this._modalClear();
    let text = document.createTextNode("Complete");
    this.modal._titleDiv.innerHTML = "";
    this.modal._titleDiv.append(text);
    this.modal._main.innerHTML = message;
    this.modal._footer.innerHTML = "";
    this.modal._main.classList.remove("fixed-heigh-scroll");

    return this.modal.setAttribute("is-open", "true");
  }

  _modalClear(){
    console.log("modal clear");
    this.modal._titleDiv.innerHTML = "";
    this.modal._main.innerHTML = "";
    this.modal._footer.innerHTML = "";
    
    return this.modal;
  }

  _modalCloseCallback(){
    console.log("modal close");
    return this.modal._closeCallback();
  }
}

customElements.define("type-form", TypeForm);