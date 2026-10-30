import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_I8wmJa8tS",
      userPoolClientId: "3u6k06p2vpgjisicj5rulhd5qu",
      loginWith: {
        email: true,
      },
    },
  },
});