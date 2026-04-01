CREATE TABLE `diary_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`title` text,
	`content` text NOT NULL,
	`date` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trip_id`) REFERENCES `viagem`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_id` integer NOT NULL,
	`uri` text NOT NULL,
	`description` text,
	FOREIGN KEY (`entry_id`) REFERENCES `diary_entries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `viagem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`destination` text,
	`picture` text,
	`date` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `users_table` ADD `picture` text;