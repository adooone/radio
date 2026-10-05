import { sql } from 'drizzle-orm';
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').default('user'),
  isActive: integer('is_active').default(1),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  isPublic: integer('is_public').default(0),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const audioFiles = sqliteTable('audio_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  path: text('path').notNull(),
  duration: text('duration').notNull(),
  size: integer('size').notNull(),
  format: text('format').notNull(),
  uploadedBy: integer('uploaded_by')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  uploadedAt: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`),
  metadata: text('metadata'),
});

export const collectionItems = sqliteTable('collection_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  collectionId: integer('collection_id')
    .notNull()
    .references(() => collections.id, { onDelete: 'cascade' }),
  audioFileId: integer('audio_file_id')
    .notNull()
    .references(() => audioFiles.id, { onDelete: 'cascade' }),
  order: integer('order').default(0),
  addedAt: text('added_at').default(sql`CURRENT_TIMESTAMP`),
});

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  lastUsedAt: text('last_used_at').default(sql`CURRENT_TIMESTAMP`),
});

export const streamConfigs = sqliteTable('stream_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  rtmpUrl: text('rtmp_url').notNull(),
  streamKey: text('stream_key').notNull(),
  inputUrl: text('input_url').notNull(),
  isActive: integer('is_active').default(0),
  createdBy: integer('created_by')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const albums = sqliteTable('albums', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  year: integer('year'),
  cover: text('cover'),
  description: text('description'),
  tags: text('tags'),
  isPublic: integer('is_public').default(0),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  folderSlug: text('folder_slug').unique(),
  hasMedia: integer('has_media').default(0),
  isPublished: integer('is_published').default(0),
  releaseYear: integer('release_year'),
  rpmSpeed: text('rpm_speed'),
  vinylCondition: text('vinyl_condition'),
  digitizationDate: text('digitization_date'),
  equipmentUsed: text('equipment_used'),
  recordingDetails: text('recording_details'),
  releaseInfo: text('release_info'),
  personnel: text('personnel'),
  production: text('production'),
  visuals: text('visuals'),
  additionalInfo: text('additional_info'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const songs = sqliteTable(
  'songs',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    albumId: integer('album_id')
      .notNull()
      .references(() => albums.id, { onDelete: 'cascade' }),
    audioFileId: integer('audio_file_id')
      .notNull()
      .references(() => audioFiles.id, { onDelete: 'cascade' }),
    trackNumber: integer('track_number').notNull(),
    title: text('title').notNull(),
    artist: text('artist'),
    duration: text('duration').notNull(),
    format: text('format').notNull(),
    fileSlug: text('file_slug'),
    position: text('position'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex('songs_album_id_file_slug_unique').on(
      table.albumId,
      table.fileSlug,
    ),
  ],
);
