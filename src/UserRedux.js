const initialState = {
  user: null, // Initial user state
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};
export const setUser = (userData) => {
  return {
    type: "SET_USER",
    payload: userData,
  };
};
export default userReducer;
