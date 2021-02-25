class TatorData {

  constructor(project) {
    this._project = project;
  }

  /**
   * Returns the list of localization types associated with this project
   */
  async getAllLocalizationTypes() {

    var outData;
    var donePromise = new Promise(resolve => {

      const mediaRestUrl = "/rest/MediaTypes/" + this._project;
      const mediaPromise = fetchRetry(mediaRestUrl, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
      });

      const localizationRestUrl = "/rest/LocalizationTypes/" + this._project;
      const localizationPromise = fetchRetry(localizationRestUrl, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": getCookie("csrftoken"),
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
      });

      Promise.all([mediaPromise, localizationPromise])
        .then(([mediaResponse, localizationResponse]) => {
          const mediaJson = mediaResponse.json();
          const localizationJson = localizationResponse.json();
          Promise.all([mediaJson, localizationJson])
        .then(([mediaTypes, localizationTypes]) => {
          outData = [...mediaTypes, ...localizationTypes];
          resolve();
        });
      });

    });

    await donePromise;
    return outData;
  }

  /**
   * Returns data for getFrame with project ID
   */
  async getFrame( frameId ){     
    const response = fetch(`/rest/GetFrame/${frameId}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log(data);

    return data;
  }


  /**
   * Returns a data for user with user ID
   */
  async getUser( userId ){     
    const response = fetch(`/rest/User/${userId}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log(data);
    
    return data;
  }


  /**
   * Returns a data for user with user ID
   */
  async getLocalizationCount({ start = 0, stop = 20} = {}){     
    const response = fetch(`/rest/LocalizationCount/${userId}?start=${start}&stop=${stop}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    console.log(data);
    
    return data;
  }
}