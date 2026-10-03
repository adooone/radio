import { z } from 'zod';

export const commonSchemas = {
  pagination: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }),

  id: z.coerce.number().int().positive(),
};

export const accountSchemas = {
  create: z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.string().optional().default('user'),
  }),

  update: z.object({
    password: z.string().min(8).optional(),
    role: z.string().optional(),
    isActive: z.boolean().optional(),
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};

export const collectionSchemas = {
  create: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional().default(false),
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().optional(),
  }),

  addItem: z.object({
    audioFileId: z.number().int().positive(),
    order: z.number().int().min(0).optional(),
  }),

  reorderItems: z.object({
    items: z.array(
      z.object({
        id: z.number().int().positive(),
        order: z.number().int().min(0),
      }),
    ),
  }),
};

export const albumSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    artist: z.string().min(1).max(200),
    year: z.number().int().min(1900).max(2100).optional(),
    description: z.string().max(1000).optional(),
    tags: z.string().optional(),
    isPublic: z.boolean().optional().default(false),
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    artist: z.string().min(1).max(200).optional(),
    year: z.number().int().min(1900).max(2100).optional(),
    description: z.string().max(1000).optional(),
    tags: z.string().optional(),
    isPublic: z.boolean().optional(),
  }),

  filter: z.object({
    artist: z.string().optional(),
    year: z.coerce.number().int().optional(),
    tags: z.string().optional(),
    search: z.string().optional(),
  }),
};

export const songSchemas = {
  addToAlbum: z.object({
    audioFileId: z.number().int().positive(),
    trackNumber: z.number().int().min(1),
    title: z.string().min(1).max(200),
    artist: z.string().max(200).optional(),
  }),

  update: z.object({
    trackNumber: z.number().int().min(1).optional(),
    title: z.string().min(1).max(200).optional(),
    artist: z.string().max(200).optional(),
  }),

  reorder: z.object({
    songs: z.array(
      z.object({
        id: z.number().int().positive(),
        trackNumber: z.number().int().min(1),
      }),
    ),
  }),
};

const albumDataJsonSchema = z.object({
  album_title: z.string().optional(),
  artist: z.string().optional(),
  recording_year: z.number().int().optional(),
  recording_details: z
    .object({
      period: z.string().optional(),
      location: z.string().optional(),
      exceptions: z.string().optional(),
    })
    .optional(),
  release_info: z
    .object({
      label: z.string().optional(),
      distributor: z.string().optional(),
      catalog_number: z.string().optional(),
      country: z.string().optional(),
      issue_year: z.number().int().optional(),
      released: z.string().optional(),
      format: z.string().optional(),
      phonographic_copyright: z.string().optional(),
    })
    .optional(),
  discogs: z
    .object({
      release_id: z.number().int().optional(),
      master_id: z.number().int().nullable().optional(),
      url: z.string().optional(),
    })
    .optional(),
  tracklist: z
    .array(
      z.object({
        position: z.string(),
        title: z.string(),
        duration: z.string().optional(),
      }),
    )
    .optional(),
  personnel: z
    .array(
      z.object({
        name: z.string(),
        roles: z.array(z.string()),
      }),
    )
    .optional(),
  production: z
    .object({
      engineer: z.string().optional(),
      producers: z.array(z.string()).optional(),
      coordination: z.string().optional(),
      thanks: z.string().optional(),
      mastering: z.string().optional(),
    })
    .optional(),
  visuals: z
    .object({
      photography: z.array(z.string()).optional(),
      design: z.string().optional(),
      sleeve_printing: z.string().optional(),
    })
    .optional(),
  additional_info: z.string().optional(),
});

export const digitizationSchemas = {
  fetchMetadata: z.object({
    release: z.string().min(1),
    force: z.boolean().optional(),
  }),

  updateMetadata: albumDataJsonSchema,

  search: z.object({
    q: z.string().min(1),
  }),
};
