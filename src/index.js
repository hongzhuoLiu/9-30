import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { store } from "./app/store";
import { Provider } from "react-redux";
import "./index.css";
// import App from './App';
import reportWebVitals from "./reportWebVitals";
import Universities from "./pages/NavigationPages/Universities";
import Programs from "./pages/NavigationPages/Programs";
import Subjects from "./pages/NavigationPages/Subjects";

import AboutUs from "./pages/Footer Pages/AboutUs";
import ContactUs from "./pages/Footer Pages/ContactUs";

import UniReview from "./pages/ContentPages/UniReview";

import Menubar from "./components/Navigation/Menubar";
import Home from "./home/Home";
import DetailView from "./pages/ContentPages/DetailView";
import PrivacyPolicy from "./pages/Footer Pages/PrivacyPolicy";
import TermsAndConditions from "./pages/Footer Pages/TermsAndConditions";
import CookiesPolicy from "./pages/Footer Pages/CookiesPolicy"
import Footer from "./components/Navigation/Footer";

import Add from "./pages/Footer Pages/AddContent";

import GoogleCallback from './pages/LoginCallbackPages/GoogleCallback';
import FacebookCallback from './pages/LoginCallbackPages/FacebookCallback';
import ThemedContentPage from "./themeList/ThemedContentPage.js";

import Destinations from "./pages/Destination Pages/Destinations";
import DestinationView from "./pages/Destination Pages/DestinationView";
import FacilityDetailPage from "./themeList/FacilityDetailPage.js";
import FeedbackModal from "./components/FeedbackModal/FeedbackModal";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Menubar />
        <div className="flex-grow pt-[7vh]">
          <Routes>
            <Route index element={<Home />} />
            <Route path="universities" element={<Universities />} />
            <Route path="programs" element={<Programs />} />
            <Route path="subjects" element={<Subjects />} />
            <Route
              path="/universities/:idUniversity/program/:idDetail"
              element={<DetailView />}
            />
            <Route
              path="/universities/:idUniversity/subject/:idDetail"
              element={<DetailView />}
            />
            <Route path="/universities/:idUniversity" element={<UniReview />} />
            <Route path="aboutus" element={<AboutUs />} />
            <Route path="contactus" element={<ContactUs />} />
            <Route path="privacy" element={<PrivacyPolicy/>} />
            <Route path="cookies" element={<CookiesPolicy/>} />
            <Route path="termsandconditions" element={<TermsAndConditions/>} />
            
            <Route path="add" element={<Add/>} />
            <Route path="/auth/google/callback" element={<GoogleCallback/>} />
            <Route path="/auth/facebook/callback" element={<FacebookCallback/>} />

            <Route
              path="/health"
              element={<ThemedContentPage title="Health" />}
            />
            <Route
              path="/fitness"
              element={<ThemedContentPage title="Fitness" />}
            />
            <Route
              path="/eateries"
              element={<ThemedContentPage title="Eateries" />}
            />
            <Route
              path="/culture-religion"
              element={<ThemedContentPage title="Culture & Religion" />}
            />
            <Route
              path="/clubs-societies"
              element={<ThemedContentPage title="Clubs & Societies" />}
            />
            <Route
              path="/accommodation"
              element={<ThemedContentPage title="Accommodation" />}
            />

            {/* routes responsible for destination */}
            <Route path="/destinations" element={<Destinations />} />
            <Route
              path="/destination/:idDestination"
              element={<DestinationView />}
            />

            <Route
              path="/facility/:facilityId"
              element={<FacilityDetailPage />}
            />

            {/* routes responsible for destination */}
            <Route path="/destinations" element={<Destinations />} />
            <Route
              path="/destination/:idDestination"
              element={<DestinationView />}
            />
          </Routes>
        </div>
        <div className="mt-4">
          <Footer />
        </div>
        <FeedbackModal />
        <ToastContainer />
      </div>
    </BrowserRouter>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
