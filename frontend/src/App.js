import './App.css';
import { Routes, Route } from "react-router-dom";
import { lazy, useEffect, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import { useErrorHandler } from 'react-error-boundary';
import PublicRoute from './PublicRoute';
import ProtectedOutlet from './ProtectedOutlet';
import FlashNoti from "./Components/FlashNoti";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from 'redux';
import * as actionCreators from "./state/actions/actionCreators";

const UserHome = lazy(() => import("./Routes/UserHome"));
const Home = lazy(() => import("./Routes/Home"));
const Login = lazy(() => import("./Routes/Login"));
const Register = lazy(() => import("./Routes/Register"));
const ForgotPassword = lazy(() => import("./Routes/ForgotPassword"));
const ResetPassword = lazy(() => import("./Routes/ResetPassword"));
const Board = lazy(() => import("./Routes/Board"));

function App() {

  const dispatch = useDispatch();
  const handleError = useErrorHandler();
  const actions = bindActionCreators(actionCreators, dispatch);
  const flashNoti = useSelector(state => state.flashNoti.message);
  const auth = useSelector(state => state.auth);
  const serverError = useSelector(state => state.serverError.error);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      actions.checkIsAuthenticated();
    }

    return () => {
      isMounted = false;
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      actions.setFlashNoti(undefined);
      clearTimeout(timeout);
    }, 5000)
  }, [flashNoti]);

  useEffect(() => {
    if (serverError) {
      handleError(serverError)
    }
  })

  return (
    <div className="App">
      {flashNoti &&
        <FlashNoti setFlashNoti={actions.setFlashNoti} flashNoti={flashNoti} />
      }
      <Suspense fallback={<h1>Loading</h1>}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Home />
              </PublicRoute>
            }
            exact
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login logIn={actions.logIn} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register register={actions.registerUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot"
            element={
              <PublicRoute>
                <ForgotPassword forgotPassword={actions.forgotPassword} removeForgotPasswordMessage={actions.removeForgotPasswordMessage} />
              </PublicRoute>
            }
          />
          <Route
            path="/reset"
            element={
              <PublicRoute>
                <ResetPassword checkPasswordReset={actions.checkPasswordReset} resetPassword={actions.resetPassword} />
              </PublicRoute>
            }
          />
          <Route path="/" element={<ProtectedOutlet />}>
            <Route path=":username/boards" element={<UserHome logOut={actions.logOut} getAllBoards={actions.getAllBoards} />} >
              <Route index={true} element={<Board />} />
              <Route path='b' element={<Board />} />
            </Route>
          </Route>

          {/* <Route path="/" element={<ProtectedOutlet />}>
              <Route path=":username/boards" element={<UserHome logOut={actions.logOut} getAllBoards={actions.getAllBoards} />} >
                <Route path="b" element={<Board />} />
              </Route>
            </Route> */}

          <Route
            path="*"
            element={<h1>Page not found</h1>}
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
