import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type AddArtistResponse = {
  __typename?: 'AddArtistResponse';
  artist?: Maybe<Artist>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type AppLoginResponse = {
  __typename?: 'AppLoginResponse';
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
  token?: Maybe<Token>;
};

export type Artist = {
  __typename?: 'Artist';
  genres?: Maybe<Array<Maybe<Genre>>>;
  id: Scalars['ID'];
  images?: Maybe<Array<Maybe<Scalars['String']>>>;
  mbid?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  popularity?: Maybe<Scalars['Int']>;
  sid?: Maybe<Scalars['String']>;
};

export type Genre = {
  __typename?: 'Genre';
  artists?: Maybe<Array<Maybe<Artist>>>;
  id: Scalars['ID'];
  name: Scalars['String'];
  subgenres?: Maybe<Array<Maybe<Genre>>>;
  supergenres?: Maybe<Array<Maybe<Genre>>>;
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
  token?: Maybe<Token>;
  user?: Maybe<User>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addArtist: AddArtistResponse;
  addroles: Scalars['Boolean'];
  createfeedback: Scalars['Boolean'];
  login: LoginResponse;
  loginapp: AppLoginResponse;
  signup: LoginResponse;
};


export type MutationAddArtistArgs = {
  sid: Scalars['ID'];
};


export type MutationAddrolesArgs = {
  id: Scalars['ID'];
  roles: Array<InputMaybe<Roles>>;
};


export type MutationCreatefeedbackArgs = {
  email?: InputMaybe<Scalars['String']>;
  feedback: Scalars['String'];
  group?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
};


export type MutationLoginArgs = {
  email?: InputMaybe<Scalars['String']>;
};


export type MutationLoginappArgs = {
  base?: InputMaybe<Scalars['String']>;
};


export type MutationSignupArgs = {
  user: Signup;
};

export enum Numcomp {
  Eq = 'EQ',
  Gt = 'GT',
  Gteq = 'GTEQ',
  In = 'IN',
  Lt = 'LT',
  Lteq = 'LTEQ'
}

export type NumericsFilter = {
  comp: Numcomp;
  val: Scalars['Int'];
  val2?: InputMaybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  artist?: Maybe<Array<Maybe<Artist>>>;
  genre?: Maybe<Array<Maybe<Genre>>>;
  me?: Maybe<User>;
  publicToken?: Maybe<Token>;
  user?: Maybe<Array<Maybe<User>>>;
};


export type QueryArtistArgs = {
  id?: InputMaybe<Scalars['ID']>;
  limit?: InputMaybe<Scalars['Int']>;
  mbid?: InputMaybe<Scalars['ID']>;
  name?: InputMaybe<Scalars['String']>;
  sid?: InputMaybe<Scalars['ID']>;
};


export type QueryGenreArgs = {
  id?: InputMaybe<Scalars['ID']>;
  limit?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
};


export type QueryUserArgs = {
  email?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  limit?: InputMaybe<Scalars['Int']>;
  name?: InputMaybe<Scalars['String']>;
};

export enum Roles {
  Admin = 'ADMIN',
  God = 'GOD',
  User = 'USER'
}

export enum Strcomp {
  Eq = 'EQ',
  Like = 'LIKE'
}

export type Signup = {
  email: Scalars['String'];
  firstname?: InputMaybe<Scalars['String']>;
  lastname?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type StringFilter = {
  comp: Strcomp;
  val: Scalars['String'];
};

export type Token = {
  __typename?: 'Token';
  expires_in?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  firstname?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  lastname?: Maybe<Scalars['String']>;
  name: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddArtistResponse: ResolverTypeWrapper<AddArtistResponse>;
  AppLoginResponse: ResolverTypeWrapper<AppLoginResponse>;
  Artist: ResolverTypeWrapper<Artist>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Genre: ResolverTypeWrapper<Genre>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  LoginResponse: ResolverTypeWrapper<LoginResponse>;
  Mutation: ResolverTypeWrapper<{}>;
  NUMCOMP: Numcomp;
  NumericsFilter: NumericsFilter;
  Query: ResolverTypeWrapper<{}>;
  ROLES: Roles;
  STRCOMP: Strcomp;
  Signup: Signup;
  String: ResolverTypeWrapper<Scalars['String']>;
  StringFilter: StringFilter;
  Token: ResolverTypeWrapper<Token>;
  User: ResolverTypeWrapper<User>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddArtistResponse: AddArtistResponse;
  AppLoginResponse: AppLoginResponse;
  Artist: Artist;
  Boolean: Scalars['Boolean'];
  Genre: Genre;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  LoginResponse: LoginResponse;
  Mutation: {};
  NumericsFilter: NumericsFilter;
  Query: {};
  Signup: Signup;
  String: Scalars['String'];
  StringFilter: StringFilter;
  Token: Token;
  User: User;
};

export type AuthDirectiveArgs = {
  requires?: Maybe<Roles>;
};

export type AuthDirectiveResolver<Result, Parent, ContextType = any, Args = AuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CacheControlDirectiveArgs = {
  maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<Scalars['String']>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AddArtistResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddArtistResponse'] = ResolversParentTypes['AddArtistResponse']> = {
  artist?: Resolver<Maybe<ResolversTypes['Artist']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AppLoginResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AppLoginResponse'] = ResolversParentTypes['AppLoginResponse']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArtistResolvers<ContextType = any, ParentType extends ResolversParentTypes['Artist'] = ResolversParentTypes['Artist']> = {
  genres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  mbid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  popularity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenreResolvers<ContextType = any, ParentType extends ResolversParentTypes['Genre'] = ResolversParentTypes['Genre']> = {
  artists?: Resolver<Maybe<Array<Maybe<ResolversTypes['Artist']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subgenres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
  supergenres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['LoginResponse'] = ResolversParentTypes['LoginResponse']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addArtist?: Resolver<ResolversTypes['AddArtistResponse'], ParentType, ContextType, RequireFields<MutationAddArtistArgs, 'sid'>>;
  addroles?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationAddrolesArgs, 'id' | 'roles'>>;
  createfeedback?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCreatefeedbackArgs, 'feedback'>>;
  login?: Resolver<ResolversTypes['LoginResponse'], ParentType, ContextType, Partial<MutationLoginArgs>>;
  loginapp?: Resolver<ResolversTypes['AppLoginResponse'], ParentType, ContextType, Partial<MutationLoginappArgs>>;
  signup?: Resolver<ResolversTypes['LoginResponse'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'user'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  artist?: Resolver<Maybe<Array<Maybe<ResolversTypes['Artist']>>>, ParentType, ContextType, RequireFields<QueryArtistArgs, 'limit'>>;
  genre?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType, RequireFields<QueryGenreArgs, 'limit'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  publicToken?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  user?: Resolver<Maybe<Array<Maybe<ResolversTypes['User']>>>, ParentType, ContextType, RequireFields<QueryUserArgs, 'limit'>>;
};

export type TokenResolvers<ContextType = any, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = {
  expires_in?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AddArtistResponse?: AddArtistResponseResolvers<ContextType>;
  AppLoginResponse?: AppLoginResponseResolvers<ContextType>;
  Artist?: ArtistResolvers<ContextType>;
  Genre?: GenreResolvers<ContextType>;
  LoginResponse?: LoginResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  auth?: AuthDirectiveResolver<any, any, ContextType>;
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};
