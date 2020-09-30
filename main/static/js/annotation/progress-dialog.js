class ProgressDialog extends ModalDialog {
  constructor() {
    super();

    this._div.setAttribute("class", "modal-wrap d-flex text-center");
    this._modal.setAttribute("class", "modal rounded-2");
    this._titleDiv.setAttribute("class", "h2");
    this._title.nodeValue = "";
    this._main.remove();

    const otherDiv = document.createElement("div");
    otherDiv.setAttribute("class", "");
    this._header.appendChild(otherDiv);
    
    // Loading Icon
    this._loadingImg = document.createElement("img");
    this._loadingImg.setAttribute("src", "/static/images/spinner-transparent.svg");
    this._loadingImg.style.margin = "auto";
    otherDiv.appendChild(this._loadingImg);

    // Success Icon
    // Note: Scaled up version of success-light.js
    this._successSvg = document.createElementNS(svgNamespace, "svg");
    this._successSvg.setAttribute("class", "py-6 text-center")
    this._successSvg.setAttribute("viewBox", "0 0 80 80");
    this._successSvg.setAttribute("height", "84px");
    this._successSvg.setAttribute("width", "84px");
    this._successSvg.setAttribute("fill", "none");
    this._successSvg.setAttribute("stroke", "#54e37a");
    this._successSvg.setAttribute("stroke-width", "2");
    this._successSvg.setAttribute("stroke-linecap", "round");
    this._successSvg.setAttribute("stroke-linejoin", "round");
    this._successSvg.style.fill = "none";
    this._successSvg.style.display = "none";
    this._successSvg.style.margin = "auto";
    otherDiv.appendChild(this._successSvg);

    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("d", "M 36 3 C 18 3 3 18 3 36 C 3 54 18 69 36 69 C 54 69 69 54 69 36 C 69 18 54 3 36 3");
    this._successSvg.appendChild(path);

    const path2 = document.createElementNS(svgNamespace, "path");
    path2.setAttribute("d", "M 51 21 L 30 48 L 18 39");
    this._successSvg.appendChild(path2);

    // Failed Icon
    // Note: Scaled up version of warning-light.js
    this._failedSvg = document.createElementNS(svgNamespace, "svg");
    this._failedSvg.setAttribute("class", "py-6 text-center")
    this._failedSvg.setAttribute("viewBox", "0 0 80 80");
    this._failedSvg.setAttribute("height", "84px");
    this._failedSvg.setAttribute("width", "84px");
    this._failedSvg.setAttribute("fill", "none");
    this._failedSvg.setAttribute("stroke", "#ff3e1d");
    this._failedSvg.setAttribute("stroke-width", "2");
    this._failedSvg.setAttribute("stroke-linecap", "round");
    this._failedSvg.setAttribute("stroke-linejoin", "round");
    this._failedSvg.style.fill = "none";
    this._failedSvg.style.display = "none";
    this._failedSvg.style.margin = "auto";
    otherDiv.appendChild(this._failedSvg);

    const path3 = document.createElementNS(svgNamespace, "path");
    path3.setAttribute("d", "M 30.87 11.58 L 5.46 54 a 6 6 90 0 0 5.13 9 h 50.82 a 6 6 90 0 0 5.13 -9 L 41.13 11.58 a 6 6 90 0 0 -10.26 0 z");
    this._failedSvg.appendChild(path3);

    const line_0 = document.createElementNS(svgNamespace, "line");
    line_0.setAttribute("x1", "36");
    line_0.setAttribute("y1", "27");
    line_0.setAttribute("x2", "36");
    line_0.setAttribute("y2", "43");
    this._failedSvg.appendChild(line_0);

    const line_1 = document.createElementNS(svgNamespace, "line");
    line_1.setAttribute("x1", "36");
    line_1.setAttribute("y1", "52");
    line_1.setAttribute("x2", "36.03");
    line_1.setAttribute("y2", "52");
    this._failedSvg.appendChild(line_1);

    // Message to display to the user that will be configurable with the monitorJob function
    this._contentDiv = document.createElement("div");
    this._contentDiv.setAttribute("class", "py-6 text-center")
    otherDiv.appendChild(this._contentDiv);
    this._msg = document.createElement("p");
    this._contentDiv.appendChild(this._msg)

    // Ok Button
    this._okButton = document.createElement("button");
    this._okButton.setAttribute("class", "btn btn-clear");
    this._okButton.setAttribute("disabled", "");
    this._okButton.textContent = "Ok";
    this._okButton.addEventListener("click", this._okClickHandler.bind(this));
    this._footer.appendChild(this._okButton);
  }

  /**
   * This function won't return until the corresponding job's status is not "Running"
   * 
   * Returns true if the job's status is succeeded. False is failed.
   */
  async getJobCompleteStatus(jobUid) {

    let response = await fetchRetry("/rest/Job/" + jobUid, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    });

    let jobStatus = await response.json();
    var jobSucceeded = true;

    if (jobStatus.status === "Running") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      jobSucceeded = await this.getJobCompleteStatus(jobUid);
    }
    else if (jobStatus.status === "Succeeded") {
      return true;
    }
    else {
      return false;
    }

    return jobSucceeded;
  }

  /**
   * Returns a promise once the job is completed. The promise contains a boolean
   * that is true if the job was successful. If the job failed, false is returned.
   */
  monitorJob(jobUid, runningMsg, successfulMsg, failedMsg) {

    var promise = new Promise((resolve) => {
      this._okButton.setAttribute("disabled", "");
      this._failedSvg.style.display = "none";
      this._successSvg.style.display = "none";
      this._loadingImg.style.display = "block";
      this._msg.textContent = runningMsg;

      this.getJobCompleteStatus(jobUid)
      .then(jobStatus => {
        this._loadingImg.style.display = "none";
        this._okButton.removeAttribute("disabled", "");
        if (jobStatus) {
          this._successSvg.style.display = "block";
          this._msg.textContent = successfulMsg;
        }
        else {
          this._failedSvg.style.display = "block";
          this._msg.textContent = failedMsg;
        }
        resolve(jobStatus);
      });
    });
    
    return promise;
    
  }

  /**
   * Callback when the OK button has been clicked.
   */
  _okClickHandler() {
      this.dispatchEvent(new Event("close"));
  }
}

customElements.define("progress-dialog", ProgressDialog)