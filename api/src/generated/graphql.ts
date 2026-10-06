import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AddArtistResponse = {
  __typename?: 'AddArtistResponse';
  artist?: Maybe<Artist>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Artist = {
  __typename?: 'Artist';
  genres?: Maybe<Array<Maybe<Genre>>>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  mbid?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  popularity?: Maybe<Scalars['Int']['output']>;
  sid?: Maybe<Scalars['String']['output']>;
};

export type Genre = {
  __typename?: 'Genre';
  artists?: Maybe<Array<Maybe<Artist>>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  subgenres?: Maybe<Array<Maybe<Genre>>>;
  supergenres?: Maybe<Array<Maybe<Genre>>>;
};

export enum MetadataStatus {
  Found = 'FOUND',
  NotFound = 'NOT_FOUND',
  /** Not looked up yet. Ask again in a few seconds. */
  Pending = 'PENDING'
}

/**
 * Metadata from MusicBrainz, the open music database, for a Spotify artist or album.
 * An album is a MusicBrainz release group. The answers are never cached, because a
 * PENDING answer becomes FOUND or NOT_FOUND.
 */
export type MusicMetadata = {
  __typename?: 'MusicMetadata';
  area?: Maybe<Scalars['String']['output']>;
  /** Artist: the year it began. Album: the year of its first release. */
  beginYear?: Maybe<Scalars['Int']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  endYear?: Maybe<Scalars['Int']['output']>;
  genres: Array<MusicTag>;
  mbid?: Maybe<Scalars['String']['output']>;
  /** Average rating of the users, 0 to 5. */
  rating?: Maybe<Scalars['Float']['output']>;
  ratingVotes?: Maybe<Scalars['Int']['output']>;
  /** Album: Live, Compilation, Remix... */
  secondaryTypes: Array<Scalars['String']['output']>;
  /** Spotify id. */
  sid: Scalars['ID']['output'];
  status: MetadataStatus;
  tags: Array<MusicTag>;
  /** Artist: Person, Group, Orchestra... Album: Album, EP, Single... */
  type?: Maybe<Scalars['String']['output']>;
  /** MusicBrainz page. */
  url?: Maybe<Scalars['String']['output']>;
};

/** A tag of MusicBrainz with the number of users who gave it. */
export type MusicTag = {
  __typename?: 'MusicTag';
  count: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addArtist: AddArtistResponse;
  createfeedback: Scalars['Boolean']['output'];
};


export type MutationAddArtistArgs = {
  sid: Scalars['ID']['input'];
};


export type MutationCreatefeedbackArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  feedback: Scalars['String']['input'];
  group?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
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
  val: Scalars['Int']['input'];
  val2?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  /** Metadata of up to 200 Spotify albums, like artistMetadata. */
  albumMetadata: Array<MusicMetadata>;
  artist?: Maybe<Array<Maybe<Artist>>>;
  /**
   * Metadata of up to 200 Spotify artists, in the order of the ids. With urgent, the ids that
   * are not known yet go before the rest of the queue: for a node that a user looks at.
   */
  artistMetadata: Array<MusicMetadata>;
  genre?: Maybe<Array<Maybe<Genre>>>;
  publicToken?: Maybe<Token>;
};


export type QueryAlbumMetadataArgs = {
  sids: Array<Scalars['ID']['input']>;
  urgent?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryArtistArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  mbid?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sid?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryArtistMetadataArgs = {
  sids: Array<Scalars['ID']['input']>;
  urgent?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGenreArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export enum Strcomp {
  Eq = 'EQ',
  Like = 'LIKE'
}

export type StringFilter = {
  comp: Strcomp;
  val: Scalars['String']['input'];
};

export type Token = {
  __typename?: 'Token';
  expires_in?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AddArtistResponse: ResolverTypeWrapper<AddArtistResponse>;
  Artist: ResolverTypeWrapper<Artist>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Genre: ResolverTypeWrapper<Genre>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  MetadataStatus: MetadataStatus;
  MusicMetadata: ResolverTypeWrapper<MusicMetadata>;
  MusicTag: ResolverTypeWrapper<MusicTag>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  NUMCOMP: Numcomp;
  NumericsFilter: NumericsFilter;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  STRCOMP: Strcomp;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  StringFilter: StringFilter;
  Token: ResolverTypeWrapper<Token>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddArtistResponse: AddArtistResponse;
  Artist: Artist;
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  Genre: Genre;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  MusicMetadata: MusicMetadata;
  MusicTag: MusicTag;
  Mutation: Record<PropertyKey, never>;
  NumericsFilter: NumericsFilter;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  StringFilter: StringFilter;
  Token: Token;
};

export type CacheControlDirectiveArgs = {
  maxAge?: Maybe<Scalars['Int']['input']>;
  scope?: Maybe<Scalars['String']['input']>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AddArtistResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['AddArtistResponse'] = ResolversParentTypes['AddArtistResponse']> = {
  artist?: Resolver<Maybe<ResolversTypes['Artist']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type ArtistResolvers<ContextType = any, ParentType extends ResolversParentTypes['Artist'] = ResolversParentTypes['Artist']> = {
  genres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  mbid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  popularity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type GenreResolvers<ContextType = any, ParentType extends ResolversParentTypes['Genre'] = ResolversParentTypes['Genre']> = {
  artists?: Resolver<Maybe<Array<Maybe<ResolversTypes['Artist']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subgenres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
  supergenres?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType>;
};

export type MusicMetadataResolvers<ContextType = any, ParentType extends ResolversParentTypes['MusicMetadata'] = ResolversParentTypes['MusicMetadata']> = {
  area?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  beginYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  country?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endYear?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  genres?: Resolver<Array<ResolversTypes['MusicTag']>, ParentType, ContextType>;
  mbid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  ratingVotes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  secondaryTypes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  sid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['MetadataStatus'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['MusicTag']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type MusicTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['MusicTag'] = ResolversParentTypes['MusicTag']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addArtist?: Resolver<ResolversTypes['AddArtistResponse'], ParentType, ContextType, RequireFields<MutationAddArtistArgs, 'sid'>>;
  createfeedback?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCreatefeedbackArgs, 'feedback'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  albumMetadata?: Resolver<Array<ResolversTypes['MusicMetadata']>, ParentType, ContextType, RequireFields<QueryAlbumMetadataArgs, 'sids' | 'urgent'>>;
  artist?: Resolver<Maybe<Array<Maybe<ResolversTypes['Artist']>>>, ParentType, ContextType, RequireFields<QueryArtistArgs, 'limit'>>;
  artistMetadata?: Resolver<Array<ResolversTypes['MusicMetadata']>, ParentType, ContextType, RequireFields<QueryArtistMetadataArgs, 'sids' | 'urgent'>>;
  genre?: Resolver<Maybe<Array<Maybe<ResolversTypes['Genre']>>>, ParentType, ContextType, RequireFields<QueryGenreArgs, 'limit'>>;
  publicToken?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
};

export type TokenResolvers<ContextType = any, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = {
  expires_in?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AddArtistResponse?: AddArtistResponseResolvers<ContextType>;
  Artist?: ArtistResolvers<ContextType>;
  Genre?: GenreResolvers<ContextType>;
  MusicMetadata?: MusicMetadataResolvers<ContextType>;
  MusicTag?: MusicTagResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};
