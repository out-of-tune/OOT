import { gql } from 'graphql-tag';
const schema = gql `

directive @deprecated(
  reason: String = "No longer supported"
) on FIELD_DEFINITION | ENUM_VALUE

directive @auth(
  requires: ROLES
) on FIELD_DEFINITION

directive @cacheControl(
  maxAge: Int
  scope: String
) on FIELD_DEFINITION | OBJECT

type Artist @cacheControl(maxAge: 1000) {
  id: ID!
  sid: String
  mbid: String
  name: String!
  genres: [Genre]
  images: [String]
  popularity: Int @cacheControl(maxAge: 60)
}

type Genre @cacheControl(maxAge: 1000) {
  id: ID!
  name: String!
  artists: [Artist]
  subgenres: [Genre]
  supergenres: [Genre]
}

type Token {
  token: String
  expires_in: String
}

enum NUMCOMP {
  LT
  GT
  EQ
  LTEQ
  GTEQ
  IN
}

input NumericsFilter {
  comp: NUMCOMP!
  val: Int!
  val2: Int
}

enum STRCOMP {
  LIKE
  EQ
}

input StringFilter {
  comp: STRCOMP!
  val: String!
}

type User {
  id: ID!
  email: String!
  firstname: String
  lastname: String
  name: String!
}

type AddArtistResponse {
  success: Boolean!
  message: String
  artist: Artist
}

enum ROLES {
  ADMIN
  USER
  GOD
}

type Query {
  user(id: ID, name: String, email: String, limit: Int = 10): [User] @auth(requires: ADMIN)
  me: User @auth
  artist(id: ID, sid: ID, mbid: ID, name: String, limit: Int = 10): [Artist]
  genre(id: ID, name: String, limit: Int = 10): [Genre]
  publicToken: Token
}

input Signup {
  email: String!
  firstname: String
  lastname: String
  name: String!
}

type LoginResponse {
  success: Boolean!
  message: String
  user: User
  token: Token
}
type AppLoginResponse {
  success: Boolean!
  message: String
  token: Token
}

type Mutation {
  login(email: String): LoginResponse!,
  signup(user: Signup!): LoginResponse!,
  addroles(id: ID!, roles: [ROLES]!): Boolean! @auth(requires: ADMIN)
  loginapp(base: String): AppLoginResponse!
  createfeedback(feedback: String!, email: String, type: String, group: String): Boolean!
  addArtist(sid: ID!): AddArtistResponse!
}`;
/*
type Mutation {
  login(email: String): LoginResponse!
}

type LoginResponse {
  success: Boolean!
  message: String
  token: String
}
*/
export default schema;
