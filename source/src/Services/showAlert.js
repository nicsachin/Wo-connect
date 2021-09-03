import { toast } from "react-toastify";
import Service from "./Service";

export const showAlert = (message, type = "info") => {
  toast.dismiss();
  if (Service.isOnline()) {
    toast(`${message}`, {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: true,
      closeButton: true,
      type: `${type}`,
    });
  } else {
    // console.log("inside else");
    window.location.reload();
  }
};
