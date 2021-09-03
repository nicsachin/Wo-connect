// Roles ["Owner" , "Admin" , "Executive" , "Supervisor" , "Account Manager"]
import { store } from "../Store";

//rules for role base access
const rolesConfig = {
  owner: {
    restrictedRoutes: [],
    restrictedTabs: [],
    restrictedCards: [],
  },
  admin: {
    restrictedRoutes: [],
    restrictedTabs: [],
    restrictedCards: [],
  },
  "account manager": {
    restrictedRoutes: [],
    restrictedTabs: [],
    restrictedCards: [],
  },
  executive: {
    restrictedRoutes: ["/task/", "/settings/", "/wocam/live"],
    restrictedTabs: ["Live View", "task", "settings"],
    restrictedCards: ["Company", "Live View", "Tasks"],
  },
  supervisor: {
    restrictedRoutes: ["/task/", "/settings/", "/wocam/live"],
    restrictedTabs: ["Live View", "task", "settings"],
    restrictedCards: ["Company", "Live View", "Tasks"],
  },
};

class Roles {
  //get user role from redux store
  static getUserRole() {
    const { userData } = store.getState();
    return userData?.user?.role &&
      userData.user.role.toLowerCase() in rolesConfig
      ? userData.user.role
      : "Owner";
  }

  //check if sidebar tab should be visible to role
  static authenticateTabs(tabName) {
    return (
      rolesConfig[this.getUserRole().toLowerCase()].restrictedTabs.indexOf(
        tabName
      ) === -1
    );
  }

  //check if route is accessible to role
  static authenticateRoutes(routeName) {
    let flag = true;
    rolesConfig[this.getUserRole().toLowerCase()].restrictedRoutes.forEach(
      (el) => {
        if (routeName.indexOf(el) !== -1) flag = false;
      }
    );
    return flag;
  }

  //check whether to show card to the role or not
  static authenticateCards(cardTitle) {
    return (
      rolesConfig[this.getUserRole().toLowerCase()].restrictedCards.indexOf(
        cardTitle
      ) === -1
    );
  }
}

export default Roles;
