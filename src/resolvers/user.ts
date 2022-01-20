import { User } from './../entities/User';
import { Context } from "../types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { ErrorResponse } from "../helpers/Error";
import { UsernamePasswordInput } from './UsernamePasswordInput';
import { validateUser } from '../helpers/validateUser';
import argon2 from 'argon2'

@ObjectType()
class UserResponse {
  @Field(() => [ErrorResponse], {nullable: true})
  errors?: ErrorResponse[]

  @Field(() => User, {nullable: true})
  user?: User
}


@Resolver(() => UserResponse)
export class userResolver {

  @Query(() => UserResponse)
  async me(
    @Ctx() {req}: Context
  ): Promise<UserResponse> {
    if (req.session.userId === undefined || null) {
      return {
        errors:  [
        {
          code: 401,
          message: 'User is not loggedin'
        }
      ]
      }
    }

    const user =  await User.findOne(req.session.userId)

    return {
      user
    }
  }


  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() {req} : Context 
  ): Promise<UserResponse> {
    const  errors = validateUser(options)

    if (errors) {
      return {
        errors
      }
    }

    const hashedPassword = await argon2.hash(options.password)

    let user;
    try {
       user = await User.create({
        email: options.email,
        password: hashedPassword,
        username: options.username
       }).save()
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              code: 400,
              message: "username already taken",
            },
          ],
        };
      }
    }

    req.session.userId =  user?.id

    return {
      user
    }
  }

  @Query(() => UserResponse) 
  async login(
    @Ctx() { req }: Context,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { email } })
    
    if (!user) {
      return {
        errors: [
          {
            code: 400,
            message: 'User not found'
          }
        ]
      }
    }

    const isPasswordValid = await argon2.verify(user.password, password)

    if (!isPasswordValid) {
      return {
        errors: [
          {
            code: 400,
            message: 'Wrong Password'
          }
        ]
      }
    }

    req.session.userId = user.id

    return {
      user
    }
  }
}
