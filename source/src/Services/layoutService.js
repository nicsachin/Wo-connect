import {
  GetLocalStorageKey,
  SetLocalStorageKey,
} from "./localStorageService.js";

const ViewLayoutService = {
  getViewLayouts: function () {
    // since the array stored is first converted to string and again to string
    // hence JSON.parse is double utilised
    if (GetLocalStorageKey("layouts")) {
      return JSON.parse(JSON.parse(GetLocalStorageKey("layouts")));
    } else {
      return undefined;
    }
  },

  getViewLayoutById: function (id = "") {
    const layoutMap = new Map(this.getViewLayouts());
    return layoutMap.get(id);
  },

  saveViewLayouts: function (layouts = new Map()) {
    SetLocalStorageKey("layouts", JSON.stringify([...layouts]));
  },

  updateViewLayoutById: function (id = "", layouts = new Map()) {
    let layoutMap = new Map(this.getViewLayouts());
    layoutMap.set(id, layouts);
    this.saveViewLayouts(layoutMap);
  },
  clearViewLayoutById: function (id = "") {
    let layoutMap = new Map(this.getViewLayouts());
    layoutMap.delete(id);
    this.saveViewLayouts(layoutMap);
  },
  clearCameraLayoutByCameraId: function (ViewId = "", cameraId) {},
};

export default ViewLayoutService;
