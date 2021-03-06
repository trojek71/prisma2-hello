const { PrismaClient } = require("@prisma/client")
const { GraphQLServer } = require("graphql-yoga")
const { makeExecutableSchema, addErrorLoggingToSchema } = require("@graphql-tools/schema")
import { GraphQLDateTime } from 'graphql-iso-date'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getUserId from './src/utils/getUserId'

const typeDefs = `
scalar DateTime

type User {
        id: String!      
        email: String
        name:  String
        createdAt: DateTime!
        updatedAt: DateTime!
        posts: [Post]
        profile: Profile
        password: String!
    }

    type Profile {
        id:  String!        
        bio:  String
        user:  User!    
            
    }
    type Post {
        id: String! 
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String 
        content: String
        published: Boolean  
        author: User!     
    
    }  
    
    type Query {
        users: [User]
        user(id: String!): User
        posts: [Post]
        profile(id: String):Profile
        me:User!
    }

    type Mutation {
         createUser(name: String, email: String, password: String!): AuthPayload!
         createProfile(bio: String, userID: String!): Profile
         createPost(title: String, content: String, published : Boolean): Post!
         deleteUser(id:String):User
         login(email:String!, password:String!): AuthPayload!
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    
`
//const token =jwt.sign({id:46}, 'mysecret')
//console.log(token)

const resolvers = {
  DateTime: GraphQLDateTime,
    Query: {
        users: async (parent, args, context, info) =>{
             // const userId = getUserId(context.request)
          return context.prisma.user.findMany({
                 include:{ profile:true, posts: true }
             })
        },

        user: async (parent, args, context, info) => {
          const userId = getUserId(context.request)
            return context.prisma.user.findUnique({
              where: {
                id: userId,
              },
              include: { profile: true }
            })
          },
          posts: async (parent, args, context, info) => {
           const userId = getUserId(context.request)
           console.log(userId)
            return context.prisma.post.findMany({
              include:{
                author:true
              }
            })
          },
          profile: async (parent, args, context, info ) =>{
            const{id}= args
            return context.prisma.profile.findUnique({
              where:{
                id: args.id
              },
              include: {user: true}
            })
          },
          me(parent, args, context, info) {
        const userId = getUserId(context.request)
       // const{id}= args
        return context.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
    },
    },
   
    Mutation: {
   async   createUser(parent, args, context, info) {
          
       const  password = await bcrypt.hash(args.password, 10)

        const user = await context.prisma.user.create({
          data: {
            id: uuid(),
            email: args.email,
            name: args.name,
            password
          }
        })
        return {
          user,
          token: jwt.sign({userId: user.id},'sekret')
      }
    },
      createProfile: (parent, args, context, info) =>{
        const { userID, bio} = args
        const newBio = context.prisma.profile.create({
          data :{
            id: uuid(),
            bio,
            user: {
            connect :{ 
              id: userID}
            }
          }
        })
        return newBio
      },

      createPost: ( parent, args, context, info) => {
        const { author, title, content, published} = args
        const userId = getUserId(context.request)
        const newPost = context.prisma.post.create({
            data: {
              id:uuid(),
              title,
              content,
              published,
                author: { 
                  connect: {
                    id: userId
                  }

                }
            }
        })
        return newPost
      },
      deleteUser: (parent, args, context, info) => {
        const{id} = args
        return context.prisma.user.delete({
          where:{
            id: args.id
          }
        })
      },
      
      async login(parent, args, context, info) {
          const{email, password}= args
        const user = await context.prisma.user.findUnique({
          where: {
            email: args.email
          }
        })
        if (!user){
          throw new Error('Nie mog?? znale???? u??ytkownika')
        }

        const isMatch = await bcrypt.compare(args.password, user.password)
          if (!isMatch) {
            throw new Error('Nie mog?? zalogowa??')
          }
          
         return {
          user,
          token: jwt.sign({userId: user.id}, 'sekret')
        }
      },
        
    }  
}

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

const prisma = new PrismaClient()

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context(request) {
    //console.log(request.request.headers)
    return {
      prisma,
      request
    }
  }
})

const options = {
    port: 8000,
    endpoint: "/graphql",
    subscriptions: "/subscriptions",
    playground: "/playground",
}

server.start(options, ({port}) => 
console.log(
    `Server started, listening on port ${port} for incoming requests.`
)
)
