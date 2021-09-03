const getQueryVariable = (variable) => {
  let query = window.location.search.substring(1);
  /**
   * For hash router
   * */
  //let query = window.location.hash.split("?")[1];
  let vars = query ? query.split("&") : "";
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
};

export default getQueryVariable;
