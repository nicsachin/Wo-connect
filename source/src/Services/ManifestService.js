import { store } from "../Store";
class ManifestService {
  static userIsAdmin() {
    let { userData } = store.getState();
    if (!userData) return "";
    return !!Object.keys(userData).length && userData.user.isAdmin;
  }
}

export default ManifestService;
