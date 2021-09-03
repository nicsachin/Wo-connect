const GetLocalStorageKey = (key) => {
  return window.localStorage.getItem(key);
};

const DeleteLocalStorageKey = (key) => {
  window.localStorage.removeItem(key);
};

const ClearLocalStorage = () => {
  window.localStorage.clear();
};

const SetLocalStorageKey = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const SetLocalStorageObject = (dataObject) => {
  if (Object.keys(dataObject).length) {
    for (let object in dataObject) {
      window.localStorage.setItem(object, JSON.stringify(dataObject[object]));
    }
  }
};

const saveCommonReducerToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("state", serializedState);
  } catch (err) {
    console.log(err);
  }
};

const loadCommonReducerFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    return undefined;
  }
};

export {
  ClearLocalStorage,
  DeleteLocalStorageKey,
  GetLocalStorageKey,
  SetLocalStorageKey,
  SetLocalStorageObject,
  saveCommonReducerToLocalStorage,
  loadCommonReducerFromLocalStorage,
};
