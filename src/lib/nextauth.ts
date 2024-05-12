import { DefaultSession, getServerSession, NextAuthOptions} from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import GoogleProvider from 'next-auth/providers/google'
import { Adapter } from 'next-auth/adapters'


declare  module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
    }& DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: async  ({token}) => {
      const db_user = await prisma.user.findFirst({
        where: {
          email: token?.email
        }
      })
      if(db_user) {
        token.id = db_user.id
      }
      return token
    },
    session: ({session, token}) => {
      if(token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // authorization: {
      //   params: {
      //     prompt: "consent",
      //     access_type: "offline",
      //     response_type: "code"
      //   }
      // }
    }),
  ],
}


export const getAuthSession = () => {
  return getServerSession(authOptions)
}
