const { PrismaClient } = require("@prisma/client")
const { GraphQLServer } = require("graphql-yoga")
const { makeExecutableSchema } = require("@graphql-tools/schema")

const typeDefs = `
    
type User {
        id: Int!      
        email: String
        name:  String
        posts: [Post]
        profile: Profile
    }

    type Profile {
        id:  ID!        
        bio:  String
        user:  User!    
            
    }
    type Post {
        id: Int! 
        createdAt: String
        updatedAt: String
        title: String   
        content: String
        published: Boolean  
        author: User!     
    
    }  
    
    type Query {
        users: [User]
        user(id: Int!): User
    }

    type Mutation {
         createUser(name: String, email: String): User
         createProfile(bio: String, userID: Int!): Profile
    }
`
const resolvers = {
    Query: {
        users: async (parent, args, context) =>{
             return context.prisma.user.findMany({
                 include:{ profile:true }
             })
        },

        user: async (parent, args, context) => {
           const{ id } = args
            return context.prisma.user.findUnique({
              where: {
                id: args.id,
              },
              include: { profile: true }
            })
          },
    },

    Mutation: {
      createUser: (parent, args, context, info) => {
        const newUser = context.prisma.user.create({
          data: {
            name: args.name,
            email: args.email
          },

        });
        return newUser;
      },
      createProfile: (parent, args, context, info) =>{
        const { userID, bio} = args
        const newBio = context.prisma.profile.create({
          data :{
            bio,
            user: {
            connect :{ 
              id: userID}
            }
          }

        })
        return newBio
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
  context: {
    prisma,
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
