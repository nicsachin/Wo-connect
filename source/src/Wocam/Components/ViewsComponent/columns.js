exports.columns = () => {
  return [
    {
      name: "",
      selector: "checkbox",
      minWidth: "50px",
      maxWidth: "0%",
    },
    {
      name: "Camera name",
      selector: "camera",
      sortable: true,
      minWidth: "215px",
    },
    {
      name: "Branch",
      selector: "location",
      sortable: true,
      minWidth: "125px",
    },
    {
      name: "City",
      selector: "city",
      sortable: true,
      minWidth: "125px",
    },
    {
      name: "Status",
      selector: "status",
      sortable: false,
      minWidth: "125px",
    },

    {
      name: "NVR",
      selector: "dvr",
      sortable: true,
      minWidth: "125px",
    },
  ];
};
