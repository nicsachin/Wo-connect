export const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: "white", color: "#fff" }),
  option: (styles, { isDisabled, isSelected }) => {
    return {
      ...styles,
      color: isDisabled ? "#7E7E7E" : isDisabled,
      color: isSelected ? "#fff" : isSelected,
      fontSize: isDisabled ? "11px" : isDisabled,
      fontWeight: isDisabled ? "500" : isDisabled,
      textTransform: isDisabled ? "uppercase" : isDisabled,
      letterSpacing: isDisabled ? "1.1px" : isDisabled,
    };
  },
  input: (styles) => ({ ...styles }),
  placeholder: (styles) => ({ ...styles }),
  singleValue: (styles) => ({ ...styles }),
};
