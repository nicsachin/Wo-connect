import { store } from "../Store";
export const getSubregionOrLocation = (parentId = null, type = null) => {
  const { userData } = store.getState();
  if (userData && userData.manifest && userData.manifest.regions) {
    let result = [];
    for (let el of userData.manifest.regions) {
      if (el.parent === parentId && el.type === type) {
        result.push({ value: el._id, label: el.area });
      }
    }
    return result;
  }
  return [];
};
