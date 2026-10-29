import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_ZFkLXbwTl",
      userPoolClientId: "29h8k7mjbpoh9tkdrsb1jkpf1g",
      loginWith: {
        email: true,
      },
    },
  },
});