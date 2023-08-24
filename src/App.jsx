import "./App.css";
import Home from "./components/Home/Home.jsx";
import { createStore, combineReducers } from "redux";
import userReducer from "./UserRedux";
import { Provider } from "react-redux";


const rootReducer = combineReducers({
  user: userReducer,
});

const store = createStore(rootReducer);

const App = () => {
  return (
    <Provider store={store}>
      <div className="w-full ">
        <Home />
      </div>
    </Provider>
  );
};

export default App;
