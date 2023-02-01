import { api } from "src/blitz-server"
import GithubProvider from "next-auth/providers/github"
import { NextAuthAdapter, BlitzNextAuthOptions } from "@blitzjs/auth/adapters/next-auth"
import db, { User } from "db"
import { Role } from "types"

const config: BlitzNextAuthOptions = {
  successRedirectUrl: "/",
  errorRedirectUrl: "/error",
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callback: async (user, account, profile, session) => {
    console.log("USER SIDE PROFILE_DATA", { user, account, profile })
    let newUser: User
    try {
      newUser = await db.user.findFirstOrThrow({ where: { name: { equals: user.name } } })
    } catch (e) {
      newUser = await db.user.create({
        data: {
          email: user.email as string,
          name: user.name as string,
          role: "USER",
        },
      })
    }
    const publicData = {
      userId: newUser.id,
      role: newUser.role as Role,
      source: "github",
    }
    await session.$create(publicData)
    return { redirectUrl: "/github" }
  },
}

export default api(NextAuthAdapter(config))
