CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`wishlist_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`price` real,
	`currency` text DEFAULT 'USD' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`images` text,
	`purchase_urls` text,
	`notes` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`claimed_by_name` text,
	`claimed_by_note` text,
	`claimed_by_token` text,
	`claimed_at` integer,
	`is_purchased` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_items_claimed_by_token_unique` ON `wishlist_items` (`claimed_by_token`);--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`notes` text,
	`cover_image_type` text,
	`cover_image_url` text,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlists_slug_unique` ON `wishlists` (`slug`);