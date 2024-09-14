import React from 'react';
import { ClerkProvider, SignIn, SignUp } from '@clerk/nextjs';
const SignInComponent = () => {
  return (
    <ClerkProvider>
      <div className="flex">
        <SignIn routing="hash" />
        <SignUp routing="hash" />
      </div>
    </ClerkProvider>
  );
};

export default SignInComponent;
