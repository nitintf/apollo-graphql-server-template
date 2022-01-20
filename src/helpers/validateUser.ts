import { UsernamePasswordInput } from './../resolvers/UsernamePasswordInput';

export const validateUser = (options: UsernamePasswordInput) => {
  const { username, email, password } = options 

  if (!email.includes('@')) {
    return [
      {
        code: 400,
        message: "invalid email"
      }
    ]
  }

  if (username.length <= 2) {
    return [
      {
        code: 400,
        message: "length must be greater than 2",
      },
    ];
  }

  if (username.includes("@")) {
    return [
      {
        code: 400,
        message: "cannot include an @",
      },
    ];
  }

  if (password.length <= 2) {
    return [
      {
        code: 400,
        message: "length must be greater than 2",
      },
    ];
  }

  return null;  
}
