import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase.config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Markdown from "../Markdown";

const Auth = () => {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        navigate("/");
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleSignIn = async (e: any) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      console.log("User signed in successfully");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    try {
      if (signUpPassword === signUpConfirmPassword) {
        await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
        console.log("User created successfully");
        try {
          if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
            console.log("Email verification sent");
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        console.log("Passwords do not match");

        return;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const autharray = [
    {
      id: 0,
      title: "## Sign In \n\n Welcome back!",
      text: "Sign In",
      colorful: true,
      fields: [
        {
          id: 0,
          type: "email",
          placeholder: "Email Address",
          onchange: (e: any) => setSignInEmail(e.target.value),
          value: signInEmail,
        },
        {
          id: 1,
          type: "password",
          placeholder: "Password",
          onchange: (e: any) => setSignInPassword(e.target.value),
          value: signInPassword,
        },
      ],
      submitText: "Sign In",
      onclick: handleSignIn,
      signInWithGoogle: signInWithGoogle,
    },
    {
      id: 1,
      title: "## Don't have an account? \n\n Create one!",
      text: "Sign Up",
      colorful: false,
      fields: [
        {
          id: 1,
          type: "email",
          placeholder: "Email Address",
          onchange: (e: any) => setSignUpEmail(e.target.value),
          value: signUpEmail,
        },
        {
          id: 2,
          type: "password",
          placeholder: "Password",
          onchange: (e: any) => setSignUpPassword(e.target.value),
          value: signUpPassword,
        },
        {
          id: 3,
          type: "password",
          placeholder: "Confirm Password",
          onchange: (e: any) => setSignUpConfirmPassword(e.target.value),
          value: signUpConfirmPassword,
        },
      ],
      submitText: "Sign Up",
      onclick: handleSignUp,
      signInWithGoogle: signInWithGoogle,
    },
  ];

  return (
    <section className="overflow-hidden" id="roadmap">
      <div className="container md:pb-10">
        <Markdown markdownString="# Authentication first!" />

        <div className="relative grid gap-6 md:grid-cols-2 md:gap-4 md:pb-[7rem]">
          {autharray.map((item) => {
            return (
              <div
                className={`md:flex p-0.25 rounded-lg border`}
              >
                <div className="relative p-8 bg-n-8 xl:p-15">
                  <div className="relative z-1">
                  <Markdown markdownString={item.title} />
                  </div>
                  <div className="flex items-center justify-center  min-h-32">
                    <button
                      className="flex items-center bg-white  border border-gray-600 rounded-lg shadow-md px-6 py-2 text-sm font-medium text-gray-800"
                      onClick={item.signInWithGoogle}
                    >
                      <svg
                        className="h-6 w-6 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                      
                        width="800px"
                        height="800px"
                        viewBox="-0.5 0 48 48"
                        version="1.1"
                      >
                        {" "}
                        <title>Google-color</title>{" "}
                        <desc>Created with Sketch.</desc> <defs> </defs>{" "}
                        <g
                          id="Icons"
                          stroke="none"
                          stroke-width="1"
                          fill="none"
                          fill-rule="evenodd"
                        >
                          {" "}
                          <g
                            id="Color-"
                            transform="translate(-401.000000, -860.000000)"
                          >
                            {" "}
                            <g
                              id="Google"
                              transform="translate(401.000000, 860.000000)"
                            >
                              {" "}
                              <path
                                d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                                id="Fill-1"
                                fill="#FBBC05"
                              >
                                {" "}
                              </path>{" "}
                              <path
                                d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                                id="Fill-2"
                                fill="#EB4335"
                              >
                                {" "}
                              </path>{" "}
                              <path
                                d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                                id="Fill-3"
                                fill="#34A853"
                              >
                                {" "}
                              </path>{" "}
                              <path
                                d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                                id="Fill-4"
                                fill="#4285F4"
                              >
                                {" "}
                              </path>{" "}
                            </g>{" "}
                          </g>{" "}
                        </g>{" "}
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>
                  <div className="mb-10 -my-5 -mx-15">
                    <div className="flex flex-col gap-4">
                      {item.fields.map((field) => (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          className="p-2 ml-10 mr-10 border border-gray-800 rounded w-full"
                          onChange={field.onchange}
                          value={field.value}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={item.onclick}
                    className="flex items-center justify-center w-full bg-black text-white rounded-lg shadow-md px-6 py-2 text-sm font-medium"
                  >
                    {item.submitText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Auth;
